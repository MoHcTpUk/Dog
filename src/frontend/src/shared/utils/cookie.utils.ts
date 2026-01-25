import Cookies from "js-cookie";

export const setAuthToken = (token: string, expiresInSeconds?: number) => {
  const options: Cookies.CookieAttributes = {
    path: "/",
    secure: true,
    sameSite: "strict",
  };

  if (expiresInSeconds) {
    options.expires = expiresInSeconds / (60 * 60 * 24);
  }

  Cookies.set("auth_token", token, options);
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get("auth_token");
};

export const removeAuthToken = () => {
  Cookies.remove("auth_token", { path: "/" });
};

export const setRefreshToken = (token: string, expiresInSeconds?: number) => {
  const options: Cookies.CookieAttributes = {
    path: "/",
    secure: true,
    sameSite: "strict",
  };

  if (expiresInSeconds) {
    options.expires = expiresInSeconds / (60 * 60 * 24);
  }

  Cookies.set("refresh_token", token, options);
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get("refresh_token");
};

export const removeRefreshToken = () => {
  Cookies.remove("refresh_token", { path: "/" });
};
