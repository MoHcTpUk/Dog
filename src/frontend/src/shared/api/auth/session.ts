import Cookies from "js-cookie";

const ACCESS_TOKEN_COOKIE = "auth_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

interface PersistSessionParams {
  accessToken: string;
  expiresIn?: number;
  refreshToken?: string;
}

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_COOKIE) ?? null;

export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_COOKIE) ?? null;

export const hasActiveSession = () => Boolean(getAccessToken());

export const persistSession = ({
  accessToken,
  expiresIn,
  refreshToken,
}: PersistSessionParams) => {
  Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    expires: expiresIn ? expiresIn / 86400 : 7,
    sameSite: "strict",
  });

  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      expires: 30,
      sameSite: "strict",
    });
  }
};

export const clearSession = () => {
  Cookies.remove(ACCESS_TOKEN_COOKIE);
  Cookies.remove(REFRESH_TOKEN_COOKIE);
};
