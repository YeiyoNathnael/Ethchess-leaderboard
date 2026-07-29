import { fetchChessComTournament, extractTournamentSlug } from '../utils/chesscom';
import { getAllPlayers, saveTournamentResults } from '../utils/db';
import { processTournamentStandings } from '../utils/scoring';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { url, eventType, name, manualHandles, roundsPlayed } = body;

  const selectedEventType = eventType === 'friday' ? 'friday' : 'tuesday';

  // 1. Get current registered players from Database
  const registeredPlayers = await getAllPlayers();
  if (registeredPlayers.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No registered players found in roster database. Please upload your Google Form responses spreadsheet in the Roster Importer first!'
    });
  }

  const registeredUsernames = new Set<string>();
  const bannedUsernames = new Set<string>();

  registeredPlayers.forEach(p => {
    const handle = p.chesscom_username.trim().toLowerCase();
    if (p.is_banned) {
      bannedUsernames.add(handle);
    } else {
      registeredUsernames.add(handle);
    }
  });

  let tournamentName = name || `EthChess ${selectedEventType === 'tuesday' ? 'Tuesday' : 'Friday'}`;
  let slug = 'live-event-' + Date.now();
  let rawStandings: Array<{ username: string; rank: number; swissPoints: number; roundsPlayed: number }> = [];

  // Mode 2: Live Club Event Manual Handles Input (for /play/tournament/ live events)
  if (Array.isArray(manualHandles) && manualHandles.length > 0) {
    tournamentName = name || `EthChess Live ${selectedEventType === 'tuesday' ? 'Tuesday' : 'Friday'}`;
    const totalRounds = roundsPlayed || 9;

    rawStandings = manualHandles.map((handle, idx) => ({
      username: String(handle).trim(),
      rank: idx + 1,
      swissPoints: Math.max(1, totalRounds - idx * 0.5),
      roundsPlayed: totalRounds
    }));
  } 
  // Mode 1: Public Chess.com URL Sync
  else if (url) {
    slug = extractTournamentSlug(url);
    let slugResult;
    try {
      slugResult = await fetchChessComTournament(url);
    } catch (err: any) {
      throw createError({
        statusCode: 404,
        statusMessage: err.message || `Chess.com Public API returned an error for "${slug}".`
      });
    }

    const { data } = slugResult;
    tournamentName = name || data.name || tournamentName;
    const rawPlayers = data.players || [];

    if (rawPlayers.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Chess.com API returned 0 participants for tournament "${tournamentName}". Make sure the tournament has completed rounds.`
      });
    }

    rawStandings = rawPlayers.map((p, idx) => ({
      username: p.username,
      rank: idx + 1,
      swissPoints: p.points ?? p.score ?? 0,
      roundsPlayed: p.roundsPlayed ?? (data.rounds ? data.rounds.length : (data.settings?.total_rounds || 9))
    }));
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Either a Tournament URL or Live Event Handles list is required.' });
  }

  // Calculate official EthChess League points (filtering registered roster only)
  const calculatedScores = processTournamentStandings(rawStandings, registeredUsernames, bannedUsernames);

  if (calculatedScores.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Processed ${rawStandings.length} participant handles for "${tournamentName}", but NONE matched your ${registeredPlayers.length} registered Google Form players. Check that Chess.com handles in your spreadsheet match player usernames exactly.`
    });
  }

  // Save tournament standings to DB
  const now = new Date().toISOString().split('T')[0];
  await saveTournamentResults(
    {
      url_slug: slug,
      name: tournamentName,
      event_type: selectedEventType,
      rounds_count: roundsPlayed || 9,
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
    message: `Successfully calculated & saved "${tournamentName}"! Processed ${calculatedScores.length} registered players out of ${rawStandings.length} submitted entries.`,
    processedPlayersCount: calculatedScores.length,
    standingsPreview: calculatedScores
  };
});
