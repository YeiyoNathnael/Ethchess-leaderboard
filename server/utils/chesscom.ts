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
  rounds: (string | { url: string })[];
  settings?: {
    total_rounds?: number;
    type?: string;
  };
  players?: ChessComPlayer[];
}

export interface FetchTournamentResult {
  slug: string;
  data: ChessComTournamentResponse;
}

/**
 * Extracts tournament ID or slug from any Chess.com tournament URL format.
 * Robustly handles trailing slashes, hash anchors, and query parameters.
 * Examples:
 * - "https://www.chess.com/tournament/ethchess-tuesday-season1-r1/" -> "ethchess-tuesday-season1-r1"
 * - "https://www.chess.com/play/tournament/6629639?ref=1#" -> "6629639"
 * - "ethchess-tuesday" -> "ethchess-tuesday"
 */
export function extractTournamentSlug(urlOrSlug: string): string {
  if (!urlOrSlug) return '';
  let cleaned = urlOrSlug.trim();

  // Strip query strings, hash fragments, and trailing slashes first
  cleaned = cleaned.split('?')[0].split('#')[0].replace(/\/+$/, '');

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    const urlParts = cleaned.split('/tournament/');
    if (urlParts.length > 1 && urlParts[1].trim()) {
      cleaned = urlParts[1].replace(/\/+$/, '');
    } else {
      const slashParts = cleaned.split('/').filter(Boolean);
      if (slashParts.length > 0) {
        cleaned = slashParts[slashParts.length - 1];
      }
    }
  }

  return cleaned.trim();
}

/**
 * Fetches real tournament data and standings from Chess.com Public API
 */
export async function fetchChessComTournament(urlOrSlug: string): Promise<FetchTournamentResult> {
  const slug = extractTournamentSlug(urlOrSlug);
  if (!slug) {
    throw new Error('Invalid tournament link or slug provided.');
  }

  const apiUrl = `https://api.chess.com/pub/tournament/${slug}`;

  const headers = {
    'User-Agent': 'EthChess-Leaderboard/1.0 (contact: admin@ethchess.org)',
    'Accept': 'application/json'
  };

  const response = await fetch(apiUrl, { headers });

  if (!response.ok) {
    throw new Error(`Chess.com API returned HTTP ${response.status} for "${slug}". Verify the tournament slug/ID exists and is public.`);
  }

  const data = (await response.json()) as ChessComTournamentResponse;
  let rawPlayers: ChessComPlayer[] = data.players || [];

  // If tournament has round details, fetch the latest round group data to get final points & standings
  if (data.rounds && Array.isArray(data.rounds) && data.rounds.length > 0) {
    try {
      const lastRoundUrl = data.rounds[data.rounds.length - 1];
      const roundUrlStr = typeof lastRoundUrl === 'string' ? lastRoundUrl : lastRoundUrl?.url;

      if (roundUrlStr) {
        const roundRes = await fetch(roundUrlStr, { headers });
        if (roundRes.ok) {
          const roundData = (await roundRes.json()) as { groups?: (string | { url: string })[] };
          if (roundData.groups && Array.isArray(roundData.groups) && roundData.groups.length > 0) {
            const firstGroup = roundData.groups[0];
            const groupUrlStr = typeof firstGroup === 'string' ? firstGroup : firstGroup?.url;
            if (groupUrlStr) {
              const groupRes = await fetch(groupUrlStr, { headers });
              if (groupRes.ok) {
                const groupData = (await groupRes.json()) as { players?: ChessComPlayer[] };
                if (groupData.players && Array.isArray(groupData.players) && groupData.players.length > 0) {
                  rawPlayers = groupData.players;
                }
              }
            }
          }
        }
      }
    } catch (err: unknown) {
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
