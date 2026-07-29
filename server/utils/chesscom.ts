export interface ChessComPlayer {
  username: string;
  points?: number;
  score?: number;
  status?: string;
  is_advancing?: boolean;
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
 * - "https://www.chess.com/tournament/ethchess-tuesday-season1-r1" -> "ethchess-tuesday-season1-r1"
 * - "https://www.chess.com/tournament/live/ethchess-tuesdays-6648933" -> "ethchess-tuesdays-6648933"
 * - "https://www.chess.com/play/tournament/6629639" -> "6629639"
 * - "ethchess-tuesday" -> "ethchess-tuesday"
 */
export function extractTournamentSlug(urlOrSlug: string): string {
  let cleaned = urlOrSlug.trim();
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    const urlParts = cleaned.split('/tournament/');
    const afterTournament = urlParts[1];
    if (afterTournament) {
      cleaned = afterTournament.split('?')[0]?.split('#')[0]?.replace(/\/$/, '') ?? '';
    } else {
      const slashParts = cleaned.split('/');
      const lastPart = slashParts[slashParts.length - 1];
      cleaned = lastPart?.split('?')[0]?.split('#')[0]?.replace(/\/$/, '') ?? '';
    }
  }

  // Remove leading "live/" prefix if present
  if (cleaned.startsWith('live/')) {
    cleaned = cleaned.substring(5);
  }

  return cleaned;
}

/**
 * Fetches real tournament data and standings from Chess.com Public API.
 * Correctly iterates across ALL groups and rounds to fetch ALL participants (no pagination limits).
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
    throw new Error(`Chess.com API returned HTTP ${response.status} for "${slug}". Verify the tournament slug/ID exists and is public.`);
  }

  const data: ChessComTournamentResponse = await response.json();
  let rawPlayers: ChessComPlayer[] = data.players || [];

  // Iterate over rounds in reverse to find the final completed round groups
  if (data.rounds && Array.isArray(data.rounds) && data.rounds.length > 0) {
    try {
      const allGroupPlayers: ChessComPlayer[] = [];

      // Fetch groups from the final round
      const lastRoundUrl = data.rounds[data.rounds.length - 1];
      const roundUrlStr = typeof lastRoundUrl === 'string' ? lastRoundUrl : lastRoundUrl?.url;

      if (roundUrlStr) {
        const roundRes = await fetch(roundUrlStr, { headers });
        if (roundRes.ok) {
          const roundData = await roundRes.json();
          if (roundData.groups && Array.isArray(roundData.groups) && roundData.groups.length > 0) {
            // Fetch ALL group URLs in the final round (not just group [0])
            for (const groupItem of roundData.groups) {
              const groupUrlStr = typeof groupItem === 'string' ? groupItem : groupItem?.url;
              if (groupUrlStr) {
                const groupRes = await fetch(groupUrlStr, { headers });
                if (groupRes.ok) {
                  const groupData = await groupRes.json();
                  if (groupData.players && Array.isArray(groupData.players)) {
                    allGroupPlayers.push(...groupData.players);
                  }
                }
              }
            }
          }
        }
      }

      if (allGroupPlayers.length > 0) {
        // Merge group players with any players listed in top-level tournament data
        const playerMap = new Map<string, ChessComPlayer>();

        allGroupPlayers.forEach(p => {
          if (p.username) playerMap.set(p.username.toLowerCase(), p);
        });

        // Add any missing players from top-level array
        rawPlayers.forEach(p => {
          if (p.username && !playerMap.has(p.username.toLowerCase())) {
            playerMap.set(p.username.toLowerCase(), p);
          }
        });

        rawPlayers = Array.from(playerMap.values());
      }
    } catch (err) {
      console.warn('Could not fetch round group sub-details, using top-level players list:', err);
    }
  }

  // Sort players by points descending
  rawPlayers.sort((a, b) => (b.points ?? b.score ?? 0) - (a.points ?? a.score ?? 0));

  data.players = rawPlayers;

  return {
    slug,
    data
  };
}
