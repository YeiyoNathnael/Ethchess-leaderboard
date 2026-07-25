import { getAllPlayers, addOrUpdatePlayers } from '../utils/db';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    const players = await getAllPlayers();
    return {
      success: true,
      count: players.length,
      data: players
    };
  }

  if (method === 'POST') {
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
  }
});
