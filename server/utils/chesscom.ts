export interface ChessComPlayer {
  username: string;
  points?: number;
  score?: number;
  status?: string;
  is_advancing?: boolean;
  roundsPlayed?: number;
}

export interface ChessComTournamentResponse {
  name: string;
  url: string;
  status: string;
  rounds: any[];
  settings?: {
    total_rounds?: number;
    type?: string;
  };
  players?: ChessComPlayer[];
}

/**
 * Extracts tournament ID or slug from any Chess.com tournament URL format.
 * Examples:
 * - "www.chess.com/tournament/ethchess-tuesday-6629639" -> "ethchess-tuesday-6629639"
 * - "https://www.chess.com/tournament/live/ethchess-tuesdays-6648933" -> "ethchess-tuesdays-6648933"
 * - "ethchess-tuesday-6629639" -> "ethchess-tuesday-6629639"
 */
export function extractTournamentSlug(urlOrSlug: string): string {
  let cleaned = urlOrSlug.trim();
  
  // Strip protocol and domain if present
  cleaned = cleaned
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^chess\.com\//i, '');

  // Handle /tournament/ or /tournament/live/
  if (cleaned.includes('tournament/')) {
    cleaned = cleaned.split('tournament/')[1] || cleaned;
  }

  // Remove leading "live/" prefix if present
  if (cleaned.startsWith('live/')) {
    cleaned = cleaned.substring(5);
  }

  // Strip query parameters and trailing slashes
  cleaned = cleaned.split('?')[0].split('#')[0].replace(/\/$/, '');

  return cleaned;
}

/**
 * Fetches real tournament data and standings from Chess.com Public API.
 * Iterates backwards from final round down to round 1 to harvest 100% of participants,
 * capture exact accumulated Swiss scores at their last played round, and calculate roundsPlayed.
 */
export async function fetchChessComTournament(urlOrSlug: string) {
  const slug = extractTournamentSlug(urlOrSlug);
  const apiUrl = `https://api.chess.com/pub/tournament/${slug}`;

  const headers = {
    'User-Agent': 'EthChess-Leaderboard/1.0 (contact: admin@ethchess.org)',
    'Accept': 'application/json'
  };

  const response = await fetch(apiUrl, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Chess.com Public API returned HTTP 404 for "${slug}". Note: Live club tournaments (/play/tournament/) are private live play rooms. Use the 'LIVE / OFFLINE INPUT' or 'UPLOAD CHESS.COM CSV' tab!`);
    }
    throw new Error(`Chess.com API returned HTTP ${response.status} for "${slug}".`);
  }

  const data: ChessComTournamentResponse = await response.json();
  const playerRoundsMap = new Map<string, number>();
  const playerMap = new Map<string, ChessComPlayer>();

  const totalRounds = data.rounds ? data.rounds.length : (data.settings?.total_rounds || 9);

  // 1. Scan round appearance endpoints to count exact rounds played per player
  if (data.rounds && Array.isArray(data.rounds) && data.rounds.length > 0) {
    for (const roundItem of data.rounds) {
      const roundUrlStr = typeof roundItem === 'string' ? roundItem : roundItem?.url;
      if (!roundUrlStr) continue;

      try {
        const rRes = await fetch(roundUrlStr, { headers });
        if (!rRes.ok) continue;
        const rData = await rRes.json();

        if (rData.players && Array.isArray(rData.players)) {
          rData.players.forEach((p: any) => {
            if (p.username) {
              const lower = p.username.toLowerCase();
              playerRoundsMap.set(lower, (playerRoundsMap.get(lower) || 0) + 1);
            }
          });
        }
      } catch (e) {}
    }
  }

  // 2. Backward round iteration: process final round down to round 1
  // First time a player is seen in the backwards walk corresponds to their last played round!
  if (data.rounds && Array.isArray(data.rounds) && data.rounds.length > 0) {
    for (let rIdx = data.rounds.length - 1; rIdx >= 0; rIdx--) {
      const roundItem = data.rounds[rIdx];
      const roundUrlStr = typeof roundItem === 'string' ? roundItem : roundItem?.url;
      if (!roundUrlStr) continue;

      try {
        const rRes = await fetch(roundUrlStr, { headers });
        if (!rRes.ok) continue;
        const rData = await rRes.json();

        if (rData.groups && Array.isArray(rData.groups) && rData.groups.length > 0) {
          for (const groupItem of rData.groups) {
            const groupUrlStr = typeof groupItem === 'string' ? groupItem : groupItem?.url;
            if (!groupUrlStr) continue;

            try {
              const groupRes = await fetch(groupUrlStr, { headers });
              if (!groupRes.ok) continue;
              const groupData = await groupRes.json();

              if (groupData.players && Array.isArray(groupData.players)) {
                groupData.players.forEach((p: ChessComPlayer) => {
                  if (!p.username) return;
                  const lower = p.username.toLowerCase();
                  const pt = p.points ?? p.score ?? 0;

                  const existing = playerMap.get(lower);
                  if (existing) {
                    existing.points = Math.max(existing.points ?? 0, pt);
                    existing.username = p.username;
                    if (p.status) existing.status = p.status;
                  } else {
                    // First time seen in backwards walk!
                    playerMap.set(lower, {
                      username: p.username,
                      points: pt,
                      status: p.status
                    });
                  }
                });
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
    }
  }

  // 3. Fallback: Seed any extra players from top-level data.players
  if (data.players && Array.isArray(data.players)) {
    data.players.forEach(p => {
      if (p.username) {
        const lower = p.username.toLowerCase();
        if (!playerMap.has(lower)) {
          playerMap.set(lower, {
            username: p.username,
            points: p.points ?? p.score ?? 0,
            status: p.status
          });
        }
      }
    });
  }

  // 4. Construct final rawPlayers array
  const rawPlayers: ChessComPlayer[] = Array.from(playerMap.values()).map(p => {
    const lower = p.username.toLowerCase();
    return {
      ...p,
      roundsPlayed: playerRoundsMap.get(lower) ?? (p.points && p.points > 0 ? totalRounds : 1)
    };
  });

  // Sort players by Swiss points descending
  rawPlayers.sort((a, b) => (b.points ?? b.score ?? 0) - (a.points ?? a.score ?? 0));

  data.players = rawPlayers;

  return {
    slug,
    data
  };
}
