export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { password } = body || {};

  const adminPassword = process.env.ADMIN_PASSWORD || 'ethchess2026';

  if (password !== adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid admin credentials. Please enter the correct admin password.'
    });
  }

  // Set HTTP-only cookie for session
  setCookie(event, 'ethchess_admin_session', 'authenticated_admin', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });

  return {
    success: true,
    message: 'Admin authenticated successfully.'
  };
});
