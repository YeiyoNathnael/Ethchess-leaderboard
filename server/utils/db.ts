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

// In-Memory Storage fallback if Turso is not configured or throws table errors
let memoryPlayers: PlayerRow[] = [
  { id: '1', name: 'Abebe Bikila', email: 'abebe@example.com', chesscom_username: 'GrandmasterAbebe', is_verified: 1, is_banned: 0, created_at: '2026-07-01' },
  { id: '2', name: 'Bethlehem Tadese', email: 'beth@example.com', chesscom_username: 'TacticalBeth', is_verified: 1, is_banned: 0, created_at: '2026-07-01' },
  { id: '3', name: 'Dawit Solomon', email: 'dawit@example.com', chesscom_username: 'DawitKnight', is_verified: 1, is_banned: 0, created_at: '2026-07-01' },
  { id: '4', name: 'Elena Rostova', email: 'elena@example.com', chesscom_username: 'ElenaQueen', is_verified: 1, is_banned: 0, created_at: '2026-07-02' },
  { id: '5', name: 'Fikru Wolde', email: 'fikru@example.com', chesscom_username: 'FikruBlitz', is_verified: 1, is_banned: 0, created_at: '2026-07-02' },
  { id: '6', name: 'Girma Assefa', email: 'girma@example.com', chesscom_username: 'GirmaMaster', is_verified: 1, is_banned: 0, created_at: '2026-07-02' },
  { id: '7', name: 'Hanna Yohannes', email: 'hanna@example.com', chesscom_username: 'HannaPawn', is_verified: 1, is_banned: 0, created_at: '2026-07-03' },
  { id: '8', name: 'Iyasu Kifle', email: 'iyasu@example.com', chesscom_username: 'IyasuRook', is_verified: 1, is_banned: 0, created_at: '2026-07-03' }
];

let memorySeasons: SeasonRow[] = [
  { id: 'season-1', name: 'Season 1 (July - Sept 2026)', start_date: '2026-07-01', end_date: '2026-09-30', is_active: 1 }
];

let memoryTournaments: TournamentRow[] = [
  { id: 'tue-r1', url_slug: 'ethchess-tuesday-season1-r1', name: 'EthChess Tuesday #1', event_type: 'tuesday', rounds_count: 9, sync_date: '2026-07-07', season_id: 'season-1' },
  { id: 'tue-r2', url_slug: 'ethchess-tuesday-season1-r2', name: 'EthChess Tuesday #2', event_type: 'tuesday', rounds_count: 9, sync_date: '2026-07-14', season_id: 'season-1' },
  { id: 'fri-r1', url_slug: 'freestyle-friday-season1-r1', name: 'Freestyle Friday #1', event_type: 'friday', rounds_count: 9, sync_date: '2026-07-10', season_id: 'season-1' },
  { id: 'fri-r2', url_slug: 'freestyle-friday-season1-r2', name: 'Freestyle Friday #2', event_type: 'friday', rounds_count: 9, sync_date: '2026-07-17', season_id: 'season-1' }
];

let memoryStandings: StandingRow[] = [
  // Tuesday #1
  { id: 'st-1', tournament_id: 'tue-r1', player_username: 'GrandmasterAbebe', rank: 1, swiss_points: 8.5, rounds_played: 9, rank_points: 25, participation_points: 5, total_points: 30 },
  { id: 'st-2', tournament_id: 'tue-r1', player_username: 'TacticalBeth', rank: 2, swiss_points: 7.0, rounds_played: 9, rank_points: 20, participation_points: 5, total_points: 25 },
  { id: 'st-3', tournament_id: 'tue-r1', player_username: 'DawitKnight', rank: 3, swiss_points: 6.5, rounds_played: 9, rank_points: 16, participation_points: 5, total_points: 21 },
  { id: 'st-4', tournament_id: 'tue-r1', player_username: 'ElenaQueen', rank: 4, swiss_points: 6.0, rounds_played: 9, rank_points: 13, participation_points: 5, total_points: 18 },
  { id: 'st-5', tournament_id: 'tue-r1', player_username: 'FikruBlitz', rank: 5, swiss_points: 5.5, rounds_played: 7, rank_points: 10, participation_points: 5, total_points: 15 },
  { id: 'st-6', tournament_id: 'tue-r1', player_username: 'GirmaMaster', rank: 6, swiss_points: 5.0, rounds_played: 5, rank_points: 10, participation_points: 2, total_points: 12 },
  { id: 'st-7', tournament_id: 'tue-r1', player_username: 'HannaPawn', rank: 7, swiss_points: 4.5, rounds_played: 8, rank_points: 10, participation_points: 5, total_points: 15 },
  { id: 'st-8', tournament_id: 'tue-r1', player_username: 'IyasuRook', rank: 8, swiss_points: 4.0, rounds_played: 6, rank_points: 10, participation_points: 5, total_points: 15 },

  // Tuesday #2
  { id: 'st-9', tournament_id: 'tue-r2', player_username: 'TacticalBeth', rank: 1, swiss_points: 8.0, rounds_played: 9, rank_points: 25, participation_points: 5, total_points: 30 },
  { id: 'st-10', tournament_id: 'tue-r2', player_username: 'GrandmasterAbebe', rank: 2, swiss_points: 7.5, rounds_played: 9, rank_points: 20, participation_points: 5, total_points: 25 },
  { id: 'st-11', tournament_id: 'tue-r2', player_username: 'ElenaQueen', rank: 3, swiss_points: 6.5, rounds_played: 9, rank_points: 16, participation_points: 5, total_points: 21 },
  { id: 'st-12', tournament_id: 'tue-r2', player_username: 'DawitKnight', rank: 4, swiss_points: 6.0, rounds_played: 8, rank_points: 13, participation_points: 5, total_points: 18 },

  // Friday #1
  { id: 'st-13', tournament_id: 'fri-r1', player_username: 'DawitKnight', rank: 1, swiss_points: 8.5, rounds_played: 9, rank_points: 25, participation_points: 5, total_points: 30 },
  { id: 'st-14', tournament_id: 'fri-r1', player_username: 'GrandmasterAbebe', rank: 2, swiss_points: 7.0, rounds_played: 9, rank_points: 20, participation_points: 5, total_points: 25 },
  { id: 'st-15', tournament_id: 'fri-r1', player_username: 'TacticalBeth', rank: 3, swiss_points: 6.5, rounds_played: 9, rank_points: 16, participation_points: 5, total_points: 21 },

  // Friday #2
  { id: 'st-16', tournament_id: 'fri-r2', player_username: 'ElenaQueen', rank: 1, swiss_points: 9.0, rounds_played: 9, rank_points: 25, participation_points: 5, total_points: 30 },
  { id: 'st-17', tournament_id: 'fri-r2', player_username: 'TacticalBeth', rank: 2, swiss_points: 7.5, rounds_played: 9, rank_points: 20, participation_points: 5, total_points: 25 }
];

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

  for (const p of newPlayers) {
    const cleanHandle = p.chesscom_username.trim();
    if (!cleanHandle) continue;

    let successInDb = false;
    if (client) {
      try {
        await client.execute({
          sql: `INSERT INTO players (id, name, email, chesscom_username, is_verified, is_banned, created_at)
                VALUES (?, ?, ?, ?, 1, 0, ?)
                ON CONFLICT(chesscom_username) DO UPDATE SET name = excluded.name, email = excluded.email`,
          args: [Date.now().toString() + Math.random().toString(36).substring(2, 5), p.name, p.email, cleanHandle, now]
        });
        successInDb = true;
      } catch (err) {
        console.warn(`Could not insert player ${cleanHandle} to Turso DB:`, err);
      }
    }

    // Always keep memory store updated as fallback
    const existing = memoryPlayers.find(mp => mp.chesscom_username.toLowerCase() === cleanHandle.toLowerCase());
    if (existing) {
      existing.name = p.name;
      existing.email = p.email;
    } else {
      memoryPlayers.push({
        id: Date.now().toString(),
        name: p.name,
        email: p.email,
        chesscom_username: cleanHandle,
        is_verified: 1,
        is_banned: 0,
        created_at: now
      });
    }
  }
}

export async function saveTournamentResults(
  tournament: Omit<TournamentRow, 'id'>,
  standings: Omit<StandingRow, 'id' | 'tournament_id'>[]
) {
  const client = await getDbClient();
  const tourneyId = 'tourney-' + Date.now();

  if (client) {
    try {
      await client.execute({
        sql: `INSERT INTO tournaments (id, url_slug, name, event_type, rounds_count, sync_date, season_id)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [tourneyId, tournament.url_slug, tournament.name, tournament.event_type, tournament.rounds_count, tournament.sync_date, tournament.season_id]
      });

      for (const st of standings) {
        await client.execute({
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
        });
      }
    } catch (err) {
      console.warn('Could not save tournament results to Turso DB:', err);
    }
  }

  // Update memory store as fallback
  memoryTournaments.push({ ...tournament, id: tourneyId });
  standings.forEach(st => {
    memoryStandings.push({
      ...st,
      id: 'st-' + Math.random().toString(36).substring(2, 9),
      tournament_id: tourneyId
    });
  });
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
