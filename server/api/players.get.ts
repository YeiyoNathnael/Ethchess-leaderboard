import { getAllPlayers } from '../utils/db';

export default defineEventHandler(async () => {
  const players = await getAllPlayers();
  return {
    success: true,
    count: players.length,
    data: players
  };
});
