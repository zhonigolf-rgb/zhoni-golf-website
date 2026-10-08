import { useEffect, useRef, useState } from "react";

const koreanPathByEnglish = {
  "/": "/ko/",
  "/products/": "/ko/products/",
  "/solutions/": "/ko/solutions/",
  "/about/": "/ko/about/",
  "/our-process/": "/ko/our-process/",
  "/faq/": "/ko/faq/",
  "/request-a-quote/": "/ko/request-a-quote/",
};

const englishPathByKorean = Object.fromEntries(Object.entries(koreanPathByEnglish).map(([english, korean]) => [korean, english]));

export function localePath(path, locale = "ko") {
  const normalized = path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;
  if (locale === "ko") return koreanPathByEnglish[normalized] ?? "/ko/";
  return englishPathByKorean[normalized] ?? "/";
}

export function LanguageSwitcher({ variant = "light" }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const korean = currentPath.startsWith("/ko/");
  const englishPath = korean ? localePath(currentPath, "en") : currentPath;
  const koreanPath = korean ? currentPath : localePath(currentPath, "ko");

  useEffect(() => {
    const close = event => { if (root.current && !root.current.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return <div className={`language-switcher language-switcher-${variant}`} ref={root}>
    <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(value => !value)}>
      <span aria-hidden="true">◎</span>{korean ? "KO" : "EN"}<b aria-hidden="true">⌄</b>
    </button>
    {open && <div className="language-menu" role="menu" aria-label="Language">
      <a href={englishPath} hrefLang="en" lang="en" role="menuitem" aria-current={!korean ? "page" : undefined}><span>EN</span><strong>English</strong></a>
      <a href={koreanPath} hrefLang="ko" lang="ko" role="menuitem" aria-current={korean ? "page" : undefined}><span>KO</span><strong>한국어</strong></a>
    </div>}
  </div>;
}

export const localizedAlternates = { koreanPathByEnglish, englishPathByKorean };
