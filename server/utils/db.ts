import { createClient } from '@libsql/client';

export interface PlayerRow {
  id: string;
  name: string;
  email: string;
  chesscom_username: string;
  is_verified: number;
  is_banned: number;
  created_at: string;
}

export interface SeasonRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: number;
}

export interface TournamentRow {
  id: string;
  url_slug: string;
  name: string;
  event_type: 'tuesday' | 'friday';
  rounds_count: number;
  sync_date: string;
  season_id: string;
}

export interface StandingRow {
  id: string;
  tournament_id: string;
  player_username: string;
  rank: number;
  swiss_points: number;
  rounds_played: number;
  rank_points: number;
  participation_points: number;
  total_points: number;
}

// Clean in-memory storage (fallback if Turso is empty or unreachable)
let memoryPlayers: PlayerRow[] = [];
let memorySeasons: SeasonRow[] = [
  { id: 'season-1', name: 'Season 1 (2026)', start_date: '2026-07-01', end_date: '2026-09-30', is_active: 1 }
];
let memoryTournaments: TournamentRow[] = [];
let memoryStandings: StandingRow[] = [];

let isDbInitialized = false;

export async function getDbClient() {
  const config = useRuntimeConfig();
  if (config.tursoUrl && config.tursoAuthToken) {
    try {
      const client = createClient({
        url: config.tursoUrl,
        authToken: config.tursoAuthToken,
      });

      if (!isDbInitialized) {
        await initDbTables(client);
        isDbInitialized = true;
      }
      return client;
    } catch (err) {
      console.warn('Failed to connect to Turso DB, falling back to memory store:', err);
      return null;
    }
  }
  return null;
}

async function initDbTables(client: ReturnType<typeof createClient>) {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        chesscom_username TEXT UNIQUE NOT NULL,
        is_verified INTEGER DEFAULT 1,
        is_banned INTEGER DEFAULT 0,
        created_at TEXT
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS seasons (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        is_active INTEGER DEFAULT 1
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        url_slug TEXT NOT NULL,
        name TEXT NOT NULL,
        event_type TEXT NOT NULL,
        rounds_count INTEGER DEFAULT 9,
        sync_date TEXT,
        season_id TEXT
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS standings (
        id TEXT PRIMARY KEY,
        tournament_id TEXT NOT NULL,
        player_username TEXT NOT NULL,
        rank INTEGER NOT NULL,
        swiss_points REAL NOT NULL,
        rounds_played INTEGER NOT NULL,
        rank_points INTEGER NOT NULL,
        participation_points INTEGER NOT NULL,
        total_points INTEGER NOT NULL
      )
    `);
  } catch (err) {
    console.warn('Could not auto-create Turso tables:', err);
  }
}

export async function getAllPlayers(): Promise<PlayerRow[]> {
  try {
    const client = await getDbClient();
    if (client) {
      const rs = await client.execute('SELECT * FROM players ORDER BY name ASC');
      if (rs.rows && rs.rows.length > 0) {
        return rs.rows as unknown as PlayerRow[];
      }
    }
  } catch (err) {
    console.warn('Failed querying players from Turso:', err);
  }
  return memoryPlayers;
}

export async function addOrUpdatePlayers(newPlayers: { name: string; email: string; chesscom_username: string }[]) {
  const client = await getDbClient();
  const now = new Date().toISOString().split('T')[0];

  // 1. Always update memory store first so roster is instantly available
  for (const p of newPlayers) {
    const cleanHandle = p.chesscom_username.trim();
    if (!cleanHandle) continue;

    const existing = memoryPlayers.find(mp => mp.chesscom_username.toLowerCase() === cleanHandle.toLowerCase());
    if (existing) {
      existing.name = p.name;
      existing.email = p.email;
    } else {
      memoryPlayers.push({
        id: 'usr-' + Math.random().toString(36).substring(2, 10),
        name: p.name,
        email: p.email,
        chesscom_username: cleanHandle,
        is_verified: 1,
        is_banned: 0,
        created_at: now
      });
    }
  }

  // 2. Batch insert/upsert into Turso DB in a single HTTP request
  if (client && memoryPlayers.length > 0) {
    try {
      const statements = memoryPlayers.map(p => ({
        sql: `INSERT INTO players (id, name, email, chesscom_username, is_verified, is_banned, created_at)
              VALUES (?, ?, ?, ?, 1, 0, ?)
              ON CONFLICT(chesscom_username) DO UPDATE SET name = excluded.name, email = excluded.email`,
        args: [p.id, p.name, p.email, p.chesscom_username, now]
      }));

      await client.batch(statements, 'write');
    } catch (err) {
      console.warn('Batch inserting players to Turso DB failed:', err);
    }
  }
}

export async function saveTournamentResults(
  tournament: Omit<TournamentRow, 'id'>,
  standings: Omit<StandingRow, 'id' | 'tournament_id'>[]
) {
  const client = await getDbClient();
  const tourneyId = 'tourney-' + Date.now();

  // Always update memory store first
  memoryTournaments.push({ ...tournament, id: tourneyId });
  standings.forEach(st => {
    memoryStandings.push({
      ...st,
      id: 'st-' + Math.random().toString(36).substring(2, 9),
      tournament_id: tourneyId
    });
  });

  if (client) {
    try {
      const tourneyStmt = {
        sql: `INSERT INTO tournaments (id, url_slug, name, event_type, rounds_count, sync_date, season_id)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [tourneyId, tournament.url_slug, tournament.name, tournament.event_type, tournament.rounds_count, tournament.sync_date, tournament.season_id]
      };

      const standingStmts = standings.map(st => ({
        sql: `INSERT INTO standings (id, tournament_id, player_username, rank, swiss_points, rounds_played, rank_points, participation_points, total_points)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'st-' + Math.random().toString(36).substring(2, 9),
          tourneyId,
          st.player_username,
          st.rank,
          st.swiss_points,
          st.rounds_played,
          st.rank_points,
          st.participation_points,
          st.total_points
        ]
      }));

      await client.batch([tourneyStmt, ...standingStmts], 'write');
    } catch (err) {
      console.warn('Could not save tournament results to Turso DB:', err);
    }
  }
}

export async function getLeaderboardData(eventType: 'all' | 'tuesday' | 'friday' = 'all') {
  const players = await getAllPlayers();
  const registeredMap = new Map<string, PlayerRow>();
  players.forEach(p => registeredMap.set(p.chesscom_username.toLowerCase(), p));

  let tournaments = memoryTournaments;
  let standings = memoryStandings;

  try {
    const client = await getDbClient();
    if (client) {
      const tRes = await client.execute('SELECT * FROM tournaments');
      const sRes = await client.execute('SELECT * FROM standings');
      if (tRes.rows && tRes.rows.length > 0) {
        tournaments = tRes.rows as unknown as TournamentRow[];
      }
      if (sRes.rows && sRes.rows.length > 0) {
        standings = sRes.rows as unknown as StandingRow[];
      }
    }
  } catch (err) {
    console.warn('Failed querying leaderboard from Turso DB:', err);
  }

  // Filter tournaments by eventType if requested
  const filteredTourneys = eventType === 'all'
    ? tournaments
    : tournaments.filter(t => t.event_type === eventType);

  const validTourneyIds = new Set(filteredTourneys.map(t => t.id));

  // Aggregate stats per player
  const playerStats = new Map<string, {
    username: string;
    name: string;
    totalPoints: number;
    rankPoints: number;
    participationPoints: number;
    eventsPlayed: number;
    firstCount: number;
    secondCount: number;
    thirdCount: number;
    bestRank: number;
    totalSwissPoints: number;
    history: Array<{
      tournamentName: string;
      eventType: string;
      rank: number;
      swissPoints: number;
      roundsPlayed: number;
      totalPoints: number;
    }>;
  }>();

  standings.forEach(st => {
    if (!validTourneyIds.has(st.tournament_id)) return;

    const lowerHandle = st.player_username.toLowerCase();
    const playerInfo = registeredMap.get(lowerHandle);
    if (!playerInfo || playerInfo.is_banned) return; // Skip non-registered or banned players

    const tourneyInfo = filteredTourneys.find(t => t.id === st.tournament_id);
    const eventName = tourneyInfo ? tourneyInfo.name : 'Tournament';
    const eType = tourneyInfo ? tourneyInfo.event_type : 'tuesday';

    if (!playerStats.has(lowerHandle)) {
      playerStats.set(lowerHandle, {
        username: playerInfo.chesscom_username,
        name: playerInfo.name,
        totalPoints: 0,
        rankPoints: 0,
        participationPoints: 0,
        eventsPlayed: 0,
        firstCount: 0,
        secondCount: 0,
        thirdCount: 0,
        bestRank: 999,
        totalSwissPoints: 0,
        history: []
      });
    }

    const stats = playerStats.get(lowerHandle)!;
    stats.totalPoints += st.total_points;
    stats.rankPoints += st.rank_points;
    stats.participationPoints += st.participation_points;
    stats.eventsPlayed += 1;
    stats.totalSwissPoints += st.swiss_points;

    if (st.rank === 1) stats.firstCount += 1;
    if (st.rank === 2) stats.secondCount += 1;
    if (st.rank === 3) stats.thirdCount += 1;
    if (st.rank < stats.bestRank) stats.bestRank = st.rank;

    stats.history.push({
      tournamentName: eventName,
      eventType: eType,
      rank: st.rank,
      swissPoints: st.swiss_points,
      roundsPlayed: st.rounds_played,
      totalPoints: st.total_points
    });
  });

  // Convert map to sorted array
  const leaderboardList = Array.from(playerStats.values());

  // Tie-breaker sorting
  leaderboardList.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.firstCount !== a.firstCount) return b.firstCount - a.firstCount;
    if (b.secondCount !== a.secondCount) return b.secondCount - a.secondCount;
    if (b.eventsPlayed !== a.eventsPlayed) return b.eventsPlayed - a.eventsPlayed;
    return b.totalSwissPoints - a.totalSwissPoints;
  });

  return leaderboardList.map((item, idx) => ({
    rank: idx + 1,
    ...item,
    bestRank: item.bestRank === 999 ? '-' : item.bestRank
  }));
}
