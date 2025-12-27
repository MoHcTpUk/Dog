// Minimal PKCE helper for SPA flows (S256).
// No external dependencies.

function base64UrlEncode(bytes: ArrayBuffer): string {
  const uint8 = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function randomString(length = 64): string {
  if (!crypto || !crypto.getRandomValues) {
    throw new Error(
      "Web Crypto API (crypto.getRandomValues) is not available. " +
      "This feature requires a secure context (HTTPS or localhost). " +
      "Please ensure your app is running over HTTPS or on localhost."
    );
  }
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  let result = "";
  for (let i = 0; i < values.length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
}

export async function pkceChallengeFromVerifier(verifier: string): Promise<string> {
  if (!crypto || !crypto.subtle) {
    throw new Error(
      "Web Crypto API (crypto.subtle) is not available. " +
      "This feature requires a secure context (HTTPS or localhost). " +
      "Please ensure your app is running over HTTPS or on localhost."
    );
  }
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}


