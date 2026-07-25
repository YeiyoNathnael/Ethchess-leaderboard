import { fetchChessComTournament } from '../utils/chesscom';
import { getAllPlayers, saveTournamentResults } from '../utils/db';
import { processTournamentStandings } from '../utils/scoring';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { url, eventType, name } = body;

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'Tournament URL or slug is required.' });
  }

  const selectedEventType = eventType === 'friday' ? 'friday' : 'tuesday';

  try {
    const { slug, data } = await fetchChessComTournament(url);
    const tournamentName = name || data.name || `EthChess ${selectedEventType === 'tuesday' ? 'Tuesday' : 'Friday'}`;

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

    // Parse players from Chess.com payload
    const rawStandings = (data.players || []).map((p, idx) => ({
      username: p.username,
      rank: idx + 1,
      swissPoints: p.points ?? p.score ?? 0,
      roundsPlayed: data.rounds || data.settings?.total_rounds || 9
    }));

    // Calculate official EthChess League points
    const calculatedScores = processTournamentStandings(rawStandings, registeredUsernames, bannedUsernames);

    // Save to DB
    const now = new Date().toISOString().split('T')[0];
    await saveTournamentResults(
      {
        url_slug: slug,
        name: tournamentName,
        event_type: selectedEventType,
        rounds_count: data.rounds || 9,
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
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to sync tournament.'
    });
  }
});
