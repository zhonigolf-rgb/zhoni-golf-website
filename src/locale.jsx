import { useEffect, useRef, useState } from "react";

const koreanPathByEnglish = {
  "/": "/ko/",
  "/products/": "/ko/products/",
  "/solutions/": "/ko/solutions/",
  "/about/": "/ko/about/",
  "/our-process/": "/ko/our-process/",
  "/faq/": "/ko/faq/",
  "/request-a-quote/": "/ko/request-a-quote/",
  "/custom-golf-headcovers/": "/ko/custom-golf-headcovers/",
  "/custom-golf-caps/": "/ko/custom-golf-caps/",
  "/custom-golf-towels/": "/ko/custom-golf-towels/",
  "/custom-golf-accessories/": "/ko/custom-golf-accessories/",
  "/custom-golf-packaging/": "/ko/custom-golf-packaging/",
  "/solutions/golf-tournament-gifts/": "/ko/solutions/golf-tournament-gifts/",
  "/solutions/corporate-golf-gifts/": "/ko/solutions/corporate-golf-gifts/",
  "/guides/": "/ko/guides/",
  "/guides/custom-golf-headcovers-procurement-guide/": "/ko/guides/custom-golf-headcovers-procurement-guide/",
  "/guides/custom-golf-towels-procurement-guide/": "/ko/guides/custom-golf-towels-procurement-guide/",
  "/guides/custom-golf-caps-and-visors/": "/ko/guides/custom-golf-caps-and-visors/",
  "/guides/custom-golf-packaging-procurement-guide/": "/ko/guides/custom-golf-packaging-procurement-guide/",
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
