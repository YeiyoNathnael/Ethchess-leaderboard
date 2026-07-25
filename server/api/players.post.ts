import { getAllPlayers, addOrUpdatePlayers } from '../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body || !Array.isArray(body.players)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload: expected { players: [...] }' });
  }

  await addOrUpdatePlayers(body.players);
  const updated = await getAllPlayers();

  return {
    success: true,
    message: `Successfully imported ${body.players.length} players`,
    totalRegistered: updated.length
  };
});
