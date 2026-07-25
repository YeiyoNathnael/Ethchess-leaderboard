export interface StandingsRawItem {
  username: string;
  rank: number;
  swissPoints: number;
  roundsPlayed: number;
}

export interface CalculatedScoreItem {
  username: string;
  rank: number;
  swissPoints: number;
  roundsPlayed: number;
  rankPoints: number;
  participationPoints: number;
  totalPoints: number;
}

/**
 * Calculates F1 Rank Points based on official EthChess rules:
 * 1st: 25 pts
 * 2nd: 20 pts
 * 3rd: 16 pts
 * 4th: 13 pts
 * 5th-8th: 10 pts
 * 9th+: 0 pts
 */
export function calculateRankPoints(rank: number): number {
  if (rank === 1) return 25;
  if (rank === 2) return 20;
  if (rank === 3) return 16;
  if (rank === 4) return 13;
  if (rank >= 5 && rank <= 8) return 10;
  return 0;
}

/**
 * Calculates Participation Points based on rounds completed:
 * Finished event with 6 or more rounds played: 5 pts
 * Played 5 rounds or fewer: 2 pts
 */
export function calculateParticipationPoints(roundsPlayed: number): number {
  if (roundsPlayed >= 6) return 5;
  if (roundsPlayed >= 1) return 2;
  return 0;
}

/**
 * Computes scores for a tournament standings list.
 * Only registered, non-banned players receive scores.
 */
export function processTournamentStandings(
  standings: StandingsRawItem[],
  registeredUsernames: Set<string>,
  bannedUsernames: Set<string>
): CalculatedScoreItem[] {
  // Filter out non-registered and banned players
  const eligibleStandings = standings.filter(item => {
    const handle = item.username.toLowerCase();
    return registeredUsernames.has(handle) && !bannedUsernames.has(handle);
  });

  // Re-rank registered participants 1..N based on their Swiss position order
  return eligibleStandings.map((item, index) => {
    const assignedRank = index + 1; // Registered rank order
    const rankPoints = calculateRankPoints(assignedRank);
    const participationPoints = calculateParticipationPoints(item.roundsPlayed);
    const totalPoints = rankPoints + participationPoints;

    return {
      username: item.username,
      rank: assignedRank,
      swissPoints: item.swissPoints,
      roundsPlayed: item.roundsPlayed,
      rankPoints,
      participationPoints,
      totalPoints
    };
  });
}
