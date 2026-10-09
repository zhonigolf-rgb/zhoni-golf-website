import { useEffect, useRef, useState } from "react";
import { findRoute, normalizePath, siteRoutes } from "./siteRoutes.js";

let serverPathname = "/";

export function setServerPathname(pathname) {
  serverPathname = pathname || "/";
}

const localeOptions = [
  { code: "en", label: "English", short: "EN", home: "/" },
  { code: "fr-CA", label: "Français (Canada)", short: "FR", home: "/fr-ca/" },
  { code: "ko", label: "한국어", short: "KO", home: "/ko/" },
  { code: "ja", label: "日本語", short: "JA", home: "/ja/" },
];

function englishPathFor(path) {
  const route = findRoute(normalizePath(path));
  return route?.lang ? route.alternatePath : route?.path ?? "/";
}

export function localePath(path, locale = "ko") {
  const englishPath = englishPathFor(path);
  if (locale === "en") return englishPath;
  return Object.values(siteRoutes).find(route => route.lang === locale && route.alternatePath === englishPath)?.path
    ?? localeOptions.find(option => option.code === locale)?.home
    ?? "/";
}

export function LanguageSwitcher({ variant = "light" }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const currentPath = typeof window === "undefined" ? serverPathname : window.location.pathname;
  const currentRoute = findRoute(currentPath);
  const currentLocale = currentRoute?.lang ?? "en";
  const activeOption = localeOptions.find(option => option.code === currentLocale) ?? localeOptions[0];

  useEffect(() => {
    const close = event => { if (root.current && !root.current.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return <div className={`language-switcher language-switcher-${variant}`} ref={root}>
    <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(value => !value)}>
      <span aria-hidden="true">◎</span>{activeOption.short}<b aria-hidden="true">⌄</b>
    </button>
    {open && <div className="language-menu" role="menu" aria-label="Language">
      {localeOptions.map(option => <a key={option.code} href={localePath(currentPath, option.code)} hrefLang={option.code} lang={option.code} role="menuitem" aria-current={currentLocale === option.code ? "page" : undefined}><span>{option.short}</span><strong>{option.label}</strong></a>)}
    </div>}
  </div>;
}

export const localizedAlternates = { localeOptions, localePath };
