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
 * - "https://www.chess.com/play/tournament/6629639" -> "6629639"
 * - "ethchess-tuesday" -> "ethchess-tuesday"
 */
export function extractTournamentSlug(urlOrSlug: string): string {
  let cleaned = urlOrSlug.trim();
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    const urlParts = cleaned.split('/tournament/');
    if (urlParts.length > 1) {
      cleaned = urlParts[1].split('?')[0].split('#')[0].replace(/\/$/, '');
    } else {
      const slashParts = cleaned.split('/');
      cleaned = slashParts[slashParts.length - 1].split('?')[0].split('#')[0];
    }
  }
  return cleaned;
}

/**
 * Fetches real tournament data and standings from Chess.com Public API
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

  // If tournament has round details, fetch the latest round group data to get final points & standings
  if (data.rounds && Array.isArray(data.rounds) && data.rounds.length > 0) {
    try {
      const lastRoundUrl = data.rounds[data.rounds.length - 1];
      const roundUrlStr = typeof lastRoundUrl === 'string' ? lastRoundUrl : lastRoundUrl.url;

      if (roundUrlStr) {
        const roundRes = await fetch(roundUrlStr, { headers });
        if (roundRes.ok) {
          const roundData = await roundRes.json();
          if (roundData.groups && Array.isArray(roundData.groups) && roundData.groups.length > 0) {
            const groupUrlStr = typeof roundData.groups[0] === 'string' ? roundData.groups[0] : roundData.groups[0].url;
            if (groupUrlStr) {
              const groupRes = await fetch(groupUrlStr, { headers });
              if (groupRes.ok) {
                const groupData = await groupRes.json();
                if (groupData.players && Array.isArray(groupData.players) && groupData.players.length > 0) {
                  rawPlayers = groupData.players;
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch round group sub-details, falling back to top-level players:', err);
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
