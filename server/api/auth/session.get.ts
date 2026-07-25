export default defineEventHandler((event) => {
  const cookie = getCookie(event, 'ethchess_admin_session');
  const isAuthenticated = cookie === 'authenticated_admin';

  return {
    authenticated: isAuthenticated
  };
});
