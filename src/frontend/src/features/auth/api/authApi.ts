import {
  postUsersCreateAuthRequest,
  postConnectToken,
} from "@shared/api/generated";
import { PostConnectTokenBodyGrantType } from "@shared/api/generated/types";
import {
  clearSession,
  persistSession,
} from "@shared/api/auth/session";
import { logVerificationCode } from "../lib/pendingVerification";

export interface SendVerificationCodeResponse {
  email: string;
  id: string;
  verificationCode: string;
}

export interface VerifyCodeResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export const authApi = {
  async sendVerificationCode(email: string): Promise<SendVerificationCodeResponse> {
    const response = await postUsersCreateAuthRequest({ email });
    logVerificationCode(response.email, response.verificationCode);

    return {
      email: response.email,
      id: response.id,
      verificationCode: response.verificationCode,
    };
  },

  async verifyCode(
    code: string,
    registrationId: string
  ): Promise<VerifyCodeResponse> {
    const payload = {
      grant_type: PostConnectTokenBodyGrantType.password,
      verificationCode: code,
      id: registrationId,
      client_id: "dog-app",
      scope: "openid profile email offline_access",
    };

    const response = await postConnectToken(payload);

    const accessToken = response.access_token || "";
    const refreshToken = response.refresh_token;

    if (!accessToken) {
      throw new Error("Access token was not returned by the backend");
    }

    persistSession({
      accessToken,
      expiresIn: response.expires_in,
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: response.expires_in,
      tokenType: response.token_type,
    };
  },

  async refreshToken(refreshToken: string): Promise<VerifyCodeResponse> {
    const response = await postConnectToken({
      grant_type: PostConnectTokenBodyGrantType.refresh_token,
      refresh_token: refreshToken,
    });

    const accessToken = response.access_token || "";

    if (!accessToken) {
      throw new Error("Access token was not returned by the backend");
    }

    persistSession({
      accessToken,
      expiresIn: response.expires_in,
      refreshToken: response.refresh_token,
    });

    return {
      accessToken,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      tokenType: response.token_type,
    };
  },

  logout() {
    clearSession();
  },
};
