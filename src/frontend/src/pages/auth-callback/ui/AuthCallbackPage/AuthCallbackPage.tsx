import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";

type StoredPkce = {
  codeVerifier: string;
  redirectUri: string;
};

type TokenResponse = {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

export const AuthCallbackPage: React.FC = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");
  const errorDescription = params.get("error_description");

  const [status, setStatus] = useState<string>("Waiting...");
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(null);

  // For local dev. Can be overridden via Vite env:
  // - VITE_AUTHENTIK_BASE_URL=http://auth.dogappa.local:8000
  // - VITE_AUTHENTIK_CLIENT_ID=dogapp
  const authentikBaseUrl = (import.meta as any).env?.VITE_AUTHENTIK_BASE_URL ?? "http://auth.dogappa.local:8000";
  const clientId = (import.meta as any).env?.VITE_AUTHENTIK_CLIENT_ID ?? "dogapp";

  useEffect(() => {
    const run = async () => {
      if (error) {
        setStatus(`Auth error: ${error}${errorDescription ? ` (${errorDescription})` : ""}`);
        return;
      }

      if (!code || !state) {
        setStatus("Missing code/state in callback URL.");
        return;
      }

      const storedRaw = sessionStorage.getItem(`pkce:${state}`);
      if (!storedRaw) {
        setStatus("No PKCE verifier found in sessionStorage for this state. Start flow from /debug/authentik again.");
        return;
      }

      let stored: StoredPkce;
      try {
        stored = JSON.parse(storedRaw) as StoredPkce;
      } catch {
        setStatus("Invalid PKCE data in sessionStorage.");
        return;
      }

      setStatus("Exchanging authorization code for tokens in Authentik...");
      const body = new URLSearchParams();
      body.set("grant_type", "authorization_code");
      body.set("client_id", clientId);
      body.set("code", code);
      body.set("redirect_uri", stored.redirectUri);
      body.set("code_verifier", stored.codeVerifier);

      try {
        const resp = await fetch(`${authentikBaseUrl}/application/o/token/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });

        if (!resp.ok) {
          const text = await resp.text();
          setStatus(`Token exchange failed: ${resp.status} ${resp.statusText}\n${text}`);
          return;
        }

        const json = (await resp.json()) as TokenResponse;
        setTokenResponse(json);
        localStorage.setItem("auth_token", json.access_token);
        setStatus("Success. Tokens received from Authentik and access_token stored to localStorage(auth_token).");
      } catch (e: any) {
        setStatus(`Token exchange error: ${e?.message ?? String(e)}`);
      }
    };

    run();
  }, [code, state, error, errorDescription]);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2>Auth Callback</h2>

          <div style={{ marginTop: 12, padding: 12, background: "#f5f5f5", whiteSpace: "pre-wrap" }}>
            <strong>Status:</strong> {status}
          </div>

          <div style={{ marginTop: 12 }}>
            <div><strong>code:</strong> {code ?? "(none)"}</div>
            <div><strong>state:</strong> {state ?? "(none)"}</div>
          </div>

          {tokenResponse && (
            <div style={{ marginTop: 16 }}>
              <div><strong>Token response:</strong></div>
              <textarea
                style={{ width: "100%", height: 220 }}
                readOnly
                value={JSON.stringify(tokenResponse, null, 2)}
              />
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};


