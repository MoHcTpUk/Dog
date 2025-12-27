import React, { useMemo, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { AXIOS_INSTANCE } from "@shared/api/client";
import { pkceChallengeFromVerifier, randomString } from "@shared/utils/pkce";

type VerifyRequestPayload = {
  id: string;
  verificationCode: string;
  codeChallenge: string;
  redirectUri?: string;
  state?: string;
};

type VerifyResponse = {
  loginUrl: string;
  redirectUrl: string;
};

type CreateRegistrationRequestPayload = {
  email: string;
};

type CreateRegistrationResponse = {
  email: string;
  id: string;
  activationCode: string;
};

export const DebugAuthentikFlowPage: React.FC = () => {
  const defaultRedirectUri = useMemo(() => `${window.location.origin}/auth/callback`, []);

  const [registrationId, setRegistrationId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [redirectUri, setRedirectUri] = useState(defaultRedirectUri);

  // Adjust if your gateway exposes a different path.
  const [verifyPath, setVerifyPath] = useState("/Users/VerifyRegistrationRequest");

  const [status, setStatus] = useState<string>("");
  const [lastAuthorizeUrl, setLastAuthorizeUrl] = useState<string>("");
  const [generatedEmail, setGeneratedEmail] = useState<string>("");

  const generateRandomEmail = (): string => {
    const randomPart = randomString(16).toLowerCase();
    return `${randomPart}@${randomString(8).toLowerCase()}.com`;
  };

  const createRegistrationRequest = async () => {
    setStatus("");
    setLastAuthorizeUrl("");

    const email = generateRandomEmail();
    setGeneratedEmail(email);

    const payload: CreateRegistrationRequestPayload = {
      email,
    };

    try {
      setStatus(`Creating registration request with email: ${email}...`);
      const res = await AXIOS_INSTANCE.post<CreateRegistrationResponse>(
        "https://api.dogappa.local:8443/Users/CreateRegistrationRequest",
        payload,
        { withCredentials: true }
      );

      setRegistrationId(res.data.id);
      setVerificationCode(res.data.activationCode);
      setStatus(
        `Registration request created! ID: ${res.data.id}, Activation Code: ${res.data.activationCode}`
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setStatus(`Failed to create registration request: ${message}`);
    }
  };

  const start = async () => {
    setStatus("");
    setLastAuthorizeUrl("");

    if (!registrationId || !verificationCode) {
      setStatus("Provide registrationId and verificationCode.");
      return;
    }

    const state = randomString(32);
    const codeVerifier = randomString(64);
    const codeChallenge = await pkceChallengeFromVerifier(codeVerifier);

    sessionStorage.setItem(`pkce:${state}`, JSON.stringify({ codeVerifier, redirectUri }));

    const payload: VerifyRequestPayload = {
      id: registrationId,
      verificationCode,
      codeChallenge,
      redirectUri,
      state,
    };

    try {
      setStatus("Calling backend to get Authentik authorize URL...");
      // Нужно, чтобы браузер принял `Set-Cookie` от API (если сервер его выставляет).
      // В JS нельзя надежно "вытащить" Set-Cookie из response headers и вручную поставить HttpOnly cookie.
      const res = await AXIOS_INSTANCE.post<VerifyResponse>(verifyPath, payload, { withCredentials: true });
      const authorizeUrl = res.data.redirectUrl || res.data.loginUrl;
      console.warn(authorizeUrl);
      if (!authorizeUrl) {
        setStatus("Backend returned empty redirectUrl. Check verification code, redirectUri whitelist, and Authentik config.");
        return;
      }

      setLastAuthorizeUrl(authorizeUrl);
      setStatus("Redirecting to Authentik...");

      window.location.href = authorizeUrl;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setStatus(`Backend call failed: ${message}`);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2>Debug: Authentik one-time login + PKCE</h2>
          <p>
            This page calls backend verify endpoint, receives authorize URL with <code>login_token</code>, then redirects
            to Authentik. Callback page exchanges code for tokens directly with Authentik.
          </p>

          <div style={{ display: "grid", gap: 12 }}>
            <button
              style={{ padding: 10, background: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}
              onClick={createRegistrationRequest}
            >
              Create Registration Request (with random email)
            </button>

            {generatedEmail && (
              <div style={{ padding: 8, background: "#e8f5e9", borderRadius: 4 }}>
                <strong>Generated Email:</strong> {generatedEmail}
              </div>
            )}

            <label>
              Registration request id (Guid)
              <input
                style={{ width: "100%", padding: 8 }}
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
                placeholder="e.g. 3f1b3b6e-...."
              />
            </label>

            <label>
              Verification code
              <input
                style={{ width: "100%", padding: 8 }}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="e.g. 1234"
              />
            </label>

            <label>
              Redirect URI (must be in Authentik provider redirect URIs)
              <input
                style={{ width: "100%", padding: 8 }}
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
              />
            </label>

            <label>
              Backend verify path (relative to API baseURL)
              <input
                style={{ width: "100%", padding: 8 }}
                value={verifyPath}
                onChange={(e) => setVerifyPath(e.target.value)}
              />
              <small>Default API baseURL: http://localhost/api (see shared/api/client.ts)</small>
            </label>

            <button style={{ padding: 10 }} onClick={start}>
              Start flow
            </button>
          </div>

          {status && (
            <div style={{ marginTop: 16, padding: 12, background: "#f5f5f5" }}>
              <strong>Status:</strong> {status}
            </div>
          )}

          {lastAuthorizeUrl && (
            <div style={{ marginTop: 16 }}>
              <div><strong>Authorize URL:</strong></div>
              <textarea style={{ width: "100%", height: 120 }} readOnly value={lastAuthorizeUrl} />
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};


