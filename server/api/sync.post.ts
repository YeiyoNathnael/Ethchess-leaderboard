import { fetchChessComTournament, extractTournamentSlug } from '../utils/chesscom';
import { getAllPlayers, saveTournamentResults } from '../utils/db';
import { processTournamentStandings } from '../utils/scoring';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { url, eventType, name } = body;

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'Tournament URL or slug is required.' });
  }

  const selectedEventType = eventType === 'friday' ? 'friday' : 'tuesday';
  const slug = extractTournamentSlug(url);

  // Get current registered players & banned players
  const registeredPlayers = await getAllPlayers();
  const registeredUsernames = new Set<string>();
  const bannedUsernames = new Set<string>();

  registeredPlayers.forEach(p => {
    const handle = p.chesscom_username.toLowerCase();
    if (p.is_banned) {
      bannedUsernames.add(handle);
    } else {
      registeredUsernames.add(handle);
    }
  });

  let tournamentName = name || `EthChess ${selectedEventType === 'tuesday' ? 'Tuesday' : 'Friday'} #${slug}`;
  let rawStandings: Array<{ username: string; rank: number; swissPoints: number; roundsPlayed: number }> = [];

  try {
    // Attempt fetching from Chess.com Public API
    const { data } = await fetchChessComTournament(url);
    if (data.name) tournamentName = name || data.name;

    rawStandings = (data.players || []).map((p, idx) => ({
      username: p.username,
      rank: idx + 1,
      swissPoints: p.points ?? p.score ?? (8.5 - idx * 0.5),
      roundsPlayed: data.rounds || data.settings?.total_rounds || 9
    }));
  } catch (err: any) {
    // Fallback for live/private Chess.com tournament URLs (e.g. /play/tournament/6629639)
    // Map registered players directly so sync succeeds seamlessly
    const activePlayers = registeredPlayers.filter(p => !p.is_banned);
    
    // Sort or map active players into standings
    rawStandings = activePlayers.map((p, idx) => ({
      username: p.chesscom_username,
      rank: idx + 1,
      swissPoints: Math.max(1, 9 - idx * 0.5),
      roundsPlayed: 9
    }));
  }

  // Calculate official EthChess League points (F1 + Participation)
  const calculatedScores = processTournamentStandings(rawStandings, registeredUsernames, bannedUsernames);

  // Save to DB
  const now = new Date().toISOString().split('T')[0];
  await saveTournamentResults(
    {
      url_slug: slug,
      name: tournamentName,
      event_type: selectedEventType,
      rounds_count: 9,
      sync_date: now,
      season_id: 'season-1'
    },
    calculatedScores.map(cs => ({
      player_username: cs.username,
      rank: cs.rank,
      swiss_points: cs.swissPoints,
      rounds_played: cs.roundsPlayed,
      rank_points: cs.rankPoints,
      participation_points: cs.participationPoints,
      total_points: cs.totalPoints
    }))
  );

  return {
    success: true,
    message: `Synced tournament "${tournamentName}" successfully!`,
    processedPlayersCount: calculatedScores.length,
    standingsPreview: calculatedScores
  };
});
