import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/shared/Button";
import { useLanguage } from "../../contexts/LanguageContext";
import { m } from "../../paraglide/messages";
import { loadClarity } from "../clarity";

const CONSENT_KEY = "hot-marketplace-clarity-consent";

function readConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function saveConsent(value: "granted" | "denied") {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage unavailable (private mode, blocked cookies): keep the in-memory decision only
  }
}

export default function MarketplaceConsentBanner() {
  const { currentLanguage } = useLanguage();
  const [consent] = useState(readConsent);
  const [isVisible, setIsVisible] = useState(
    consent !== "granted" && consent !== "denied",
  );

  useEffect(() => {
    if (consent === "granted") loadClarity();
  }, [consent]);

  if (!isVisible) return null;

  function accept() {
    saveConsent("granted");
    loadClarity();
    setIsVisible(false);
  }

  function decline() {
    saveConsent("denied");
    setIsVisible(false);
  }

  return (
    <div
      role="region"
      aria-label={m.marketplace_consent_label()}
      className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-solid border-[var(--hot-color-blue-50)]"
    >
      <div className="container flex flex-col gap-md py-lg md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-hot-gray-800">
          {m.marketplace_consent_text()}{" "}
          <Link
            to={`/${currentLanguage}/privacy-policy#microsoft-clarity`}
            className="underline"
          >
            {m.marketplace_consent_privacy_link()}
          </Link>
        </p>
        <div className="flex gap-md">
          <Button variant="neutral" appearance="accent" onClick={decline}>
            {m.marketplace_consent_decline()}
          </Button>
          <Button variant="danger" onClick={accept}>
            {m.marketplace_consent_accept()}
          </Button>
        </div>
      </div>
    </div>
  );
}
