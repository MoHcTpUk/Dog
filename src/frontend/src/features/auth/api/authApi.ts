import Cookies from "js-cookie";
import {
  postUsersCreateRegistrationRequest,
  postConnectToken,
} from "@shared/api/generated";
import { PostConnectTokenBodyGrantType } from "@shared/api/generated/types";

export interface SendVerificationCodeResponse {
  email: string;
  id: string;
  activationCode: string;
}

export interface VerifyCodeResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export const authApi = {
  async sendVerificationCode(email: string): Promise<SendVerificationCodeResponse> {
    const response = await postUsersCreateRegistrationRequest({ email });
    return {
      email: response.email,
      id: response.id,
      activationCode: response.activationCode,
    };
  },

  async verifyCode(
    code: string,
    registrationId: string
  ): Promise<VerifyCodeResponse> {
    console.log("🔥 Verifying code:", code);
    console.log("🔥 Registration ID:", registrationId);

    const payload = {
      grant_type: PostConnectTokenBodyGrantType.password,
      verificationCode: code,
      id: registrationId,
      client_id: "dog-app",
      scope: "openid profile email offline_access",
    };

    console.log("🔥 Sending payload:", payload);

    const response = await postConnectToken(payload);

    const accessToken = response.access_token || "";
    const refreshToken = response.refresh_token;

    if (accessToken) {
      Cookies.set("auth_token", accessToken, {
        expires: response.expires_in ? response.expires_in / 86400 : 7,
        sameSite: "strict",
      });

      if (refreshToken) {
        Cookies.set("refresh_token", refreshToken, {
          expires: 30,
          sameSite: "strict",
        });
      }
    }

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

    if (accessToken) {
      Cookies.set("auth_token", accessToken, {
        expires: response.expires_in ? response.expires_in / 86400 : 7,
        sameSite: "strict",
      });
    }

    return {
      accessToken,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      tokenType: response.token_type,
    };
  },

  logout() {
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
  },
};
