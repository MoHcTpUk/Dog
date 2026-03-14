import React, { useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useIonRouter } from "@ionic/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Text } from "@shared/ui";
import { BackIcon } from "@shared/ui/icons";
import { useAuth } from "@features/auth";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const { sendVerificationCode, isLoading } = useAuth();
  const [apiError, setApiError] = useState<string>("");

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch("email");

  const handleBack = () => {
    router.goBack();
  };

  const onSubmit = async (data: LoginFormData) => {
    setApiError("");

    try {
      const response = await sendVerificationCode(data.email);


      // TEMPORARY: Using sessionStorage because Ionic router doesn't pass state properly
      // TODO: Remove when backend sends code via email/phone instead of response
      sessionStorage.setItem("verification_email", response.email);
      sessionStorage.setItem("verification_registrationId", response.id);
      sessionStorage.setItem("verification_verificationCode", response.verificationCode);
      sessionStorage.setItem("verification_isRegistration", "false");

      router.push("/verification", "forward", "push");
    } catch {
      setApiError(t("Failed to send verification code. Please try again."));
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <div className="bg-[#F3F3F3] flex flex-col min-h-screen">
          <div className="flex-1 px-5 pt-16 pb-10 flex flex-col justify-between items-center">
            <div className="self-stretch flex flex-col justify-start items-start gap-10">
              {/* Header with back button */}
              <div className="self-stretch h-14 inline-flex justify-start items-center gap-3.5">
                <BackIcon onClick={handleBack} />
              </div>

              {/* Welcome title */}
              <Text
                variant="extra-bold-28"
                color="primary"
                tag="h1"
                className="self-stretch text-center text-gray-700 leading-relaxed"
              >
                {t("Welcome back!")}
              </Text>

              {/* Email input */}
              <div className="self-stretch flex flex-col justify-start items-center gap-1">
                <Input
                  placeholder={t("E-mail")}
                  type="email"
                  value={emailValue || ""}
                  onInput={(value) => {
                    setValue("email", value);
                    setApiError("");
                  }}
                  error={errors.email?.message ? t(errors.email.message) : apiError || undefined}
                />
              </div>

              {/* Action buttons */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
                <Button
                  variant="primary"
                  size="L"
                  fullWidth
                  className="bg-gray-700 text-white"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  {isLoading ? t("Sending...") : t("Get email code")}
                </Button>
                <Button
                  variant="secondary"
                  size="L"
                  fullWidth
                  className="bg-white text-gray-700"
                >
                  {t("Login with Telegram")}
                </Button>
              </div>
            </div>

            {/* Bottom terms */}
            <div className="self-stretch text-center">
              <Text variant="medium-small-12" className="text-slate-500 leading-none">
                {t("By continuing, you agree to the ")}
              </Text>
              <Text variant="medium-small-12" className="text-gray-700 leading-none">
                {t("terms of use")}
              </Text>
              <Text variant="medium-small-12" className="text-slate-500 leading-none">
                {t(" and ")}
              </Text>
              <Text variant="medium-small-12" className="text-gray-700 leading-none">
                {t("privacy policy")}
              </Text>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
