const PENDING_VERIFICATION_KEYS = {
  email: "verification_email",
  registrationId: "verification_registrationId",
  isRegistration: "verification_isRegistration",
  verificationCode: "verification_verificationCode",
} as const;

export interface PendingVerificationSession {
  email: string;
  registrationId: string;
  isRegistration: boolean;
  verificationCode: string;
}

interface PersistPendingVerificationParams {
  email: string;
  registrationId: string;
  isRegistration: boolean;
  verificationCode: string;
}

export const persistPendingVerification = ({
  email,
  registrationId,
  isRegistration,
  verificationCode,
}: PersistPendingVerificationParams) => {
  sessionStorage.setItem(PENDING_VERIFICATION_KEYS.email, email);
  sessionStorage.setItem(
    PENDING_VERIFICATION_KEYS.registrationId,
    registrationId
  );
  sessionStorage.setItem(
    PENDING_VERIFICATION_KEYS.isRegistration,
    String(isRegistration)
  );
  sessionStorage.setItem(
    PENDING_VERIFICATION_KEYS.verificationCode,
    verificationCode
  );
};

export const readPendingVerification =
  (): PendingVerificationSession | null => {
    const email = sessionStorage.getItem(PENDING_VERIFICATION_KEYS.email);
    const registrationId = sessionStorage.getItem(
      PENDING_VERIFICATION_KEYS.registrationId
    );

    if (!email || !registrationId) {
      return null;
    }

    return {
      email,
      registrationId,
      isRegistration:
        sessionStorage.getItem(PENDING_VERIFICATION_KEYS.isRegistration) ===
        "true",
      verificationCode:
        sessionStorage.getItem(PENDING_VERIFICATION_KEYS.verificationCode) ??
        "",
    };
  };

export const updatePendingVerificationRegistrationId = (
  registrationId: string
) => {
  sessionStorage.setItem(
    PENDING_VERIFICATION_KEYS.registrationId,
    registrationId
  );
};

export const updatePendingVerificationCode = (verificationCode: string) => {
  sessionStorage.setItem(
    PENDING_VERIFICATION_KEYS.verificationCode,
    verificationCode
  );
};

export const clearPendingVerification = () => {
  sessionStorage.removeItem(PENDING_VERIFICATION_KEYS.email);
  sessionStorage.removeItem(PENDING_VERIFICATION_KEYS.registrationId);
  sessionStorage.removeItem(PENDING_VERIFICATION_KEYS.isRegistration);
  sessionStorage.removeItem(PENDING_VERIFICATION_KEYS.verificationCode);
};

export const logVerificationCode = (email: string, verificationCode: string) => {
  if (!import.meta.env.DEV) {
    return;
  }

  console.info(`[auth] Verification code for ${email}: ${verificationCode}`);
};
