import { getLeaderboardData } from '../utils/db';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const eventType = (query.type as 'all' | 'tuesday' | 'friday') || 'all';

  const standings = await getLeaderboardData(eventType);
  return {
    success: true,
    eventType,
    count: standings.length,
    data: standings
  };
});
