import { useEffect, useState } from "react";

const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID ?? "G-MDM5K38CXF";
const CONSENT_KEY = "zhoni_analytics_consent";

function hasMeasurementId() {
  return /^G-[A-Z0-9]+$/i.test(MEASUREMENT_ID);
}

export function getAnalyticsConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function installGoogleTag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
}

export function enableAnalytics() {
  if (!hasMeasurementId() || typeof window === "undefined" || window.__zhoniAnalyticsEnabled) return;

  installGoogleTag();
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag("consent", "update", {
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
  });

  const scriptId = "zhoni-ga4-script";
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }
  window.__zhoniAnalyticsEnabled = true;
}

export function trackAnalytics(eventName, details = {}) {
  if (typeof window !== "undefined" && window.__zhoniAnalyticsEnabled && typeof window.gtag === "function") {
    window.gtag("event", eventName, details);
  }
}

export function AnalyticsConsent() {
  const [consent, setConsent] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(getAnalyticsConsent());
    setReady(true);
  }, []);

  useEffect(() => {
    if (consent === "granted") enableAnalytics();
  }, [consent]);

  if (!ready || !hasMeasurementId() || consent) return null;

  const choose = value => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Browsing and enquiries remain available even when storage is unavailable.
    }
    setConsent(value);
  };

  return <aside className="analytics-consent" role="dialog" aria-label="Analytics preference">
    <p><strong>Analytics preference</strong> We use optional analytics to understand which pages and enquiry paths are useful. Essential browsing and enquiries work either way.</p>
    <div>
      <button type="button" className="analytics-consent-secondary" onClick={() => choose("denied")}>USE ESSENTIAL ONLY</button>
      <button type="button" className="analytics-consent-primary" onClick={() => choose("granted")}>ACCEPT ANALYTICS</button>
    </div>
  </aside>;
}
