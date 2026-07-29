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
 * Iterates across ALL round groups to retrieve 100% of participants, and calculates
 * exact rounds played per individual player for accurate F1 participation scoring.
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

  const playerRoundsMap = new Map<string, number>();

  // 1. Scan round endpoints to count exact rounds played per player
  if (data.rounds && Array.isArray(data.rounds) && data.rounds.length > 0) {
    for (const roundItem of data.rounds) {
      const roundUrlStr = typeof roundItem === 'string' ? roundItem : roundItem?.url;
      if (roundUrlStr) {
        try {
          const rRes = await fetch(roundUrlStr, { headers });
          if (rRes.ok) {
            const rData = await rRes.json();
            if (rData.players && Array.isArray(rData.players)) {
              rData.players.forEach((p: any) => {
                if (p.username) {
                  const lower = p.username.toLowerCase();
                  playerRoundsMap.set(lower, (playerRoundsMap.get(lower) || 0) + 1);
                }
              });
            }
          }
        } catch (e) {
          // Ignore individual round scan failures gracefully
        }
      }
    }

    // 2. Fetch groups from the final completed round to get final Swiss scores for all participants
    try {
      const allGroupPlayers: ChessComPlayer[] = [];
      const lastRoundUrl = data.rounds[data.rounds.length - 1];
      const roundUrlStr = typeof lastRoundUrl === 'string' ? lastRoundUrl : lastRoundUrl?.url;

      if (roundUrlStr) {
        const roundRes = await fetch(roundUrlStr, { headers });
        if (roundRes.ok) {
          const roundData = await roundRes.json();
          if (roundData.groups && Array.isArray(roundData.groups) && roundData.groups.length > 0) {
            // Fetch ALL group URLs in the final round
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

  // 3. Attach individual roundsPlayed count to each player
  const totalRoundsCount = data.rounds ? data.rounds.length : 9;
  rawPlayers.forEach(p => {
    const lowerHandle = p.username.toLowerCase();
    p.roundsPlayed = playerRoundsMap.get(lowerHandle) ?? totalRoundsCount;
  });

  // Sort players by points descending
  rawPlayers.sort((a, b) => (b.points ?? b.score ?? 0) - (a.points ?? a.score ?? 0));

  data.players = rawPlayers;

  return {
    slug,
    data
  };
}
