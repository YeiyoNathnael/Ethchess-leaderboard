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

  // 2. Fetch real tournament data from Chess.com Public API
  let slugResult;
  try {
    slugResult = await fetchChessComTournament(url);
  } catch (err: any) {
    throw createError({
      statusCode: 404,
      statusMessage: err.message || `Could not fetch tournament data for "${slug}". Verify the link/slug is public on Chess.com.`
    });
  }

  const { data } = slugResult;
  const tournamentName = name || data.name || `EthChess ${selectedEventType === 'tuesday' ? 'Tuesday' : 'Friday'} #${slug}`;
  const rawPlayers = data.players || [];

  if (rawPlayers.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Chess.com API returned 0 participants for tournament "${tournamentName}". Make sure the tournament has completed rounds.`
    });
  }

  // 3. Map raw players into standard standing inputs
  const rawStandings = rawPlayers.map((p, idx) => ({
    username: p.username,
    rank: idx + 1,
    swissPoints: p.points ?? p.score ?? 0,
    roundsPlayed: data.rounds ? data.rounds.length : (data.settings?.total_rounds || 9)
  }));

  // 4. Calculate official EthChess League points (filtering registered roster only)
  const calculatedScores = processTournamentStandings(rawStandings, registeredUsernames, bannedUsernames);

  if (calculatedScores.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Fetched ${rawPlayers.length} Chess.com participants for "${tournamentName}", but NONE matched your ${registeredPlayers.length} registered Google Form players. Check that Chess.com handles in your spreadsheet match player usernames exactly.`
    });
  }

  // 5. Save real tournament standings to DB
  const now = new Date().toISOString().split('T')[0];
  await saveTournamentResults(
    {
      url_slug: slug,
      name: tournamentName,
      event_type: selectedEventType,
      rounds_count: data.rounds ? data.rounds.length : 9,
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
    message: `Successfully synced tournament "${tournamentName}"! Processed ${calculatedScores.length} registered players out of ${rawPlayers.length} total participants.`,
    processedPlayersCount: calculatedScores.length,
    standingsPreview: calculatedScores
  };
});
