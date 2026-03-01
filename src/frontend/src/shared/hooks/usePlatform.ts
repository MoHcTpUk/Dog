// src/shared/hooks/usePlatform.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

export type Platform = "ios" | "android" | "telegram" | "web";

interface PlatformInfo {
  platform: Platform;
  isNative: boolean;
  isTelegram: boolean;
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  haptic: {
    impact: (style?: "light" | "medium" | "heavy") => void;
    notification: (type?: "error" | "success" | "warning") => void;
    selection: () => void;
  };
}

interface PickImagesOptions {
  multiple?: boolean;
  maxImages?: number;
}

const isNativePlatform = () => {
  const platform = Capacitor.getPlatform();
  return platform === "ios" || platform === "android";
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }

      reject(new Error("Failed to read image file."));
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read image file."));
    };

    reader.readAsDataURL(file);
  });

const pickImagesFromBrowser = ({
  multiple = false,
  maxImages,
}: PickImagesOptions = {}): Promise<string[]> => {
  if (typeof document === "undefined") {
    return Promise.resolve([]);
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    let isSettled = false;

    input.type = "file";
    input.accept = "image/*";
    input.multiple = multiple;
    input.style.display = "none";

    const cleanup = () => {
      input.removeEventListener("change", handleChange);
      input.removeEventListener("cancel", handleCancel);
      window.removeEventListener("focus", handleWindowFocus);
      input.remove();
    };

    const finalize = (images: string[]) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      cleanup();
      resolve(images);
    };

    const handleCancel = () => {
      finalize([]);
    };

    const handleWindowFocus = () => {
      window.setTimeout(() => {
        if (!isSettled && (!input.files || input.files.length === 0)) {
          finalize([]);
        }
      }, 0);
    };

    const handleChange = async () => {
      const files = Array.from(input.files ?? []);
      const limitedFiles =
        typeof maxImages === "number" ? files.slice(0, maxImages) : files;

      if (limitedFiles.length === 0) {
        finalize([]);
        return;
      }

      try {
        const images = await Promise.all(
          limitedFiles.map((file) => readFileAsDataUrl(file))
        );
        finalize(images);
      } catch (error) {
        console.error("Failed to read selected image files:", error);
        finalize([]);
      }
    };

    input.addEventListener("change", handleChange);
    input.addEventListener("cancel", handleCancel);
    window.addEventListener("focus", handleWindowFocus, { once: true });
    document.body.appendChild(input);
    input.click();
  });
};

const pickImagesForCurrentPlatform = async ({
  multiple = false,
  maxImages,
}: PickImagesOptions = {}): Promise<string[]> => {
  if (isNativePlatform()) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });

      return image.dataUrl ? [image.dataUrl] : [];
    } catch (error) {
      console.error("Native image picker failed:", error);
      return [];
    }
  }

  return pickImagesFromBrowser({
    multiple,
    maxImages,
  });
};

export const usePlatform = (): PlatformInfo => {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    // Initialize Telegram Mini App if available
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready?.();

        // Get safe area insets for Telegram
        const safeAreaInsets = (window.Telegram.WebApp as any).safeAreaInsets;
        if (safeAreaInsets) {
          setSafeAreaInsets({
            top: safeAreaInsets.top,
            bottom: safeAreaInsets.bottom,
            left: safeAreaInsets.left,
            right: safeAreaInsets.right,
          });
        }
      } catch (error) {
        console.error("Failed to initialize Telegram WebApp:", error);
      }
    } else {
      // For web/native, use CSS env variables
      setSafeAreaInsets({
        top: parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "env(safe-area-inset-top)"
          ) || "0"
        ),
        bottom: parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "env(safe-area-inset-bottom)"
          ) || "0"
        ),
        left: parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "env(safe-area-inset-left)"
          ) || "0"
        ),
        right: parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "env(safe-area-inset-right)"
          ) || "0"
        ),
      });
    }
  }, []);

  const getPlatform = (): Platform => {
    if (window.Telegram?.WebApp) {
      return "telegram";
    }

    const platform = Capacitor.getPlatform();
    if (platform === "ios") return "ios";
    if (platform === "android") return "android";

    return "web";
  };

  const platform = getPlatform();

  return {
    platform,
    isNative: platform === "ios" || platform === "android",
    isTelegram: platform === "telegram",
    isWeb: platform === "web",
    isIOS: platform === "ios",
    isAndroid: platform === "android",
    safeAreaInsets,
    haptic: platformUtils.haptic,
  };
};

// Utility functions for platform-specific actions
export const platformUtils = {
  // Close app or go back
  close: () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      window.history.back();
    }
  },

  // Expand to full height (Telegram)
  expand: () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
    }
  },

  // Show confirm dialog
  showConfirm: (message: string): Promise<boolean> => {
    if (window.Telegram?.WebApp) {
      return new Promise((resolve) => {
        window.Telegram?.WebApp?.showConfirm(message, (confirmed) => {
          resolve(confirmed);
        });
      });
    }
    return Promise.resolve(window.confirm(message));
  },

  // Show alert
  showAlert: (message: string): Promise<void> => {
    if (window.Telegram?.WebApp) {
      return new Promise((resolve) => {
        window.Telegram?.WebApp?.showAlert(message, () => {
          resolve();
        });
      });
    }
    window.alert(message);
    return Promise.resolve();
  },

  // Haptic feedback
  haptic: {
    impact: (style: "light" | "medium" | "heavy" = "light") => {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      }
    },
    notification: (type: "error" | "success" | "warning" = "success") => {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      }
    },
    selection: () => {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
      }
    },
  },

  // Open external link
  openLink: (url: string) => {
    window.open(url, "_blank");
  },

  // Share data
  share: async (data: { title?: string; text?: string; url?: string }) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else if (window.Telegram?.WebApp) {
      // postEvent("web_app_share", { text: data.text || data.title || data.url }); // Removed due to type error
      console.warn("Sharing is not supported on this platform.");
    }
  },

  media: {
    pickImage: async () => {
      const [image] = await pickImagesForCurrentPlatform();
      return image ?? null;
    },
    pickImages: (options: PickImagesOptions = {}) =>
      pickImagesForCurrentPlatform(options),
  },
};
