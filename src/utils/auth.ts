import {jwtDecode} from "jwt-decode";

const TOKEN_KEY = "auth_token";

export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem('token');

export const removeToken = () => localStorage.removeItem('token');

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  // console.log(token);
  
  try {
    const decoded: any = jwtDecode(token);
    // Check expiration (JWT exp is in seconds)
    const now = Date.now() / 1000;
    if (decoded.exp && decoded.exp < now) {
      removeToken();
      return false;
    }
    return true;
  } catch {
    removeToken();
    return false;
  }
};

export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
