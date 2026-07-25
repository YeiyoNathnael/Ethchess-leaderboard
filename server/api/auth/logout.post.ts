export default defineEventHandler((event) => {
  deleteCookie(event, 'ethchess_admin_session', { path: '/' });
  return {
    success: true,
    message: 'Logged out successfully.'
  };
});
