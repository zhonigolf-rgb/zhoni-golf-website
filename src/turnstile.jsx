import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
let loader;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    const existing = document.getElementById("zhoni-turnstile-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.turnstile), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "zhoni-turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error("Turnstile could not load."));
    document.head.appendChild(script);
  });
  return loader;
}

export function TurnstileField() {
  const container = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    if (!SITE_KEY || !container.current) return undefined;
    let active = true;
    loadTurnstile().then(turnstile => {
      if (!active || !turnstile || !container.current) return;
      widgetId.current = turnstile.render(container.current, {
        sitekey: SITE_KEY,
        theme: "light",
        size: "normal",
      });
    }).catch(() => {
      // The server still rejects requests without a valid Turnstile token.
    });
    return () => {
      active = false;
      if (widgetId.current !== null && window.turnstile) window.turnstile.remove(widgetId.current);
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div className="turnstile-field" ref={container} aria-label="Spam protection" />;
}