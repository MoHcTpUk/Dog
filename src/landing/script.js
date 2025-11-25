document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll(".subscribe-form");
  const navLinks = document.querySelectorAll(".nav-link, .footer-link");
  const partnershipBtn = document.querySelector(
    ".partnership-section .btn-dark"
  );
  const privacyLinks = document.querySelectorAll(".privacy-link");
  const modal = document.getElementById("privacy-modal");
  const modalClose = modal?.querySelector(".modal-close");
  const modalOverlay = modal?.querySelector(".modal-overlay");

  forms.forEach((form) => {
    const input = form.querySelector(".subscribe-input");
    const privacyNote = form.nextElementSibling;

    if (
      input &&
      privacyNote &&
      privacyNote.classList.contains("privacy-note")
    ) {
      const updatePrivacyNote = () => {
        const isFocused = document.activeElement === input;

        if (isFocused) {
          privacyNote.classList.add("show");
        } else {
          privacyNote.classList.remove("show");
        }
      };

      input.addEventListener("focus", updatePrivacyNote);
      input.addEventListener("blur", (e) => {
        setTimeout(updatePrivacyNote, 100);
      });

      const privacyLink = privacyNote.querySelector("a");
      if (privacyLink) {
        privacyLink.addEventListener("mousedown", (e) => {
          e.preventDefault();
        });

        privacyLink.addEventListener("click", (e) => {
          e.preventDefault();
          modal?.classList.add("active");
          document.body.style.overflow = "hidden";
        });
      }
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const value = input.value.trim();

      if (!value) {
        alert("Пожалуйста, введите контактные данные");
        return;
      }

      if (!validateContact(value)) {
        alert("Пожалуйста, введите корректный email или телеграм");
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.querySelector("span").textContent;
      submitButton.disabled = true;
      submitButton.querySelector("span").textContent = "Отправка...";

      try {
        await fetch("https://dogappa.com/v1/data/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contact: value,
          }),
        });

        showSuccessAlert();
        input.value = "";
        if (privacyNote && privacyNote.classList.contains("privacy-note")) {
          privacyNote.classList.remove("show");
        }
      } catch (error) {
        showSuccessAlert();
        input.value = "";
      } finally {
        submitButton.disabled = false;
        submitButton.querySelector("span").textContent = originalText;
      }
    });
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const targetPosition = rect.top + scrollTop - 40;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  });

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(
    ".feature-card, .feature-box, .cta-section"
  );
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

  if (partnershipBtn) {
    partnershipBtn.addEventListener("click", function () {
      window.location.href =
        "mailto:hi@dogappa.com?subject=Сотрудничество с Dog Appa";
    });
  }

  const headerCtaButton = document.querySelector(".header .btn-primary");
  if (headerCtaButton) {
    headerCtaButton.addEventListener("click", function () {
      const ctaSection = document.getElementById("cta");
      if (ctaSection) {
        const rect = ctaSection.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop - 40;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
        setTimeout(() => {
          const input = ctaSection.querySelector(".subscribe-input");
          input?.focus();
        }, 500);
      }
    });
  }

  const footerCtaButton = document.querySelector(".footer .btn-primary");
  if (footerCtaButton) {
    footerCtaButton.addEventListener("click", function () {
      const ctaSection = document.getElementById("cta");
      if (ctaSection) {
        const rect = ctaSection.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop - 40;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
        setTimeout(() => {
          const input = ctaSection.querySelector(".subscribe-input");
          input?.focus();
        }, 500);
      }
    });
  }

  privacyLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      modal?.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  function closeModal() {
    modal?.classList.remove("active");
    document.body.style.overflow = "";
  }

  modalClose?.addEventListener("click", closeModal);
  modalOverlay?.addEventListener("click", closeModal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal?.classList.contains("active")) {
      closeModal();
    }
  });
});

function validateContact(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telegramRegex = /^@?[a-zA-Z0-9_]{3,}$/;
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;

  return (
    emailRegex.test(value) ||
    telegramRegex.test(value) ||
    phoneRegex.test(value)
  );
}

function showSuccessAlert() {
  const alert = document.getElementById("success-alert");
  if (!alert) return;

  alert.classList.add("show");

  setTimeout(() => {
    alert.classList.remove("show");
  }, 4000);
}
