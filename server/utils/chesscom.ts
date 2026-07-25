export interface ChessComPlayer {
  username: string;
  points?: number;
  score?: number;
  status?: string;
}

export interface ChessComTournamentResponse {
  name: string;
  url: string;
  status: string;
  rounds: number;
  settings?: {
    total_rounds?: number;
    type?: string;
  };
  players?: ChessComPlayer[];
}

/**
 * Extracts tournament ID or slug from a standard Chess.com tournament URL.
 * e.g., "https://www.chess.com/tournament/ethchess-tuesday-season1-r1" -> "ethchess-tuesday-season1-r1"
 */
export function extractTournamentSlug(urlOrSlug: string): string {
  let cleaned = urlOrSlug.trim();
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    const urlParts = cleaned.split('/tournament/');
    if (urlParts.length > 1) {
      cleaned = urlParts[1].split('?')[0].split('#')[0].replace(/\/$/, '');
    }
  }
  return cleaned;
}

/**
 * Fetches tournament data from Chess.com Public API
 */
export async function fetchChessComTournament(urlOrSlug: string) {
  const slug = extractTournamentSlug(urlOrSlug);
  const apiUrl = `https://api.chess.com/pub/tournament/${slug}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'EthChess-Leaderboard/1.0 (contact: admin@ethchess.org)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Chess.com API HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data: ChessComTournamentResponse = await response.json();
    return {
      slug,
      data
    };
  } catch (err: any) {
    throw new Error(`Failed to fetch Chess.com tournament data: ${err.message}`);
  }
}
