export const FALLBACK_USER_ID = 1;

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function getUserId() {
  return getStoredUser()?.id || FALLBACK_USER_ID;
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("token") && localStorage.getItem("user"));
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
