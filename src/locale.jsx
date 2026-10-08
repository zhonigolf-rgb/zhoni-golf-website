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
  "/custom-golf-gifts/": "/ko/custom-golf-gifts/",
  "/first-order-guide/": "/ko/first-order-guide/",
  "/quality-packaging-export-readiness/": "/ko/quality-packaging-export-readiness/",
  "/guides/branding-methods-for-premium-golf-merchandise/": "/ko/guides/branding-methods-for-premium-golf-merchandise/",
  "/guides/prepare-artwork-for-custom-golf-products/": "/ko/guides/prepare-artwork-for-custom-golf-products/",
  "/guides/custom-golf-merchandise-moq-explained/": "/ko/guides/custom-golf-merchandise-moq-explained/",
  "/guides/what-affects-a-custom-golf-merchandise-quote/": "/ko/guides/what-affects-a-custom-golf-merchandise-quote/",
  "/guides/custom-golf-merchandise-quality-checklist/": "/ko/guides/custom-golf-merchandise-quality-checklist/",
  "/guides/how-to-plan-a-golf-merchandise-delivery-date/": "/ko/guides/how-to-plan-a-golf-merchandise-delivery-date/",
  "/guides/what-happens-after-a-custom-golf-project-brief/": "/ko/guides/what-happens-after-a-custom-golf-project-brief/",
  "/guides/how-to-choose-custom-golf-gifts/": "/ko/guides/how-to-choose-custom-golf-gifts/",
  "/guides/how-to-choose-golf-gifts-by-audience/": "/ko/guides/how-to-choose-golf-gifts-by-audience/",
  "/guides/golf-tournament-player-packs/": "/ko/guides/golf-tournament-player-packs/",
  "/guides/corporate-golf-gifts-procurement-guide/": "/ko/guides/corporate-golf-gifts-procurement-guide/",
  "/guides/custom-golf-headcover-materials/": "/ko/guides/custom-golf-headcover-materials/",
  "/guides/custom-golf-headcover-types/": "/ko/guides/custom-golf-headcover-types/",
  "/guides/custom-golf-product-specification-sheet/": "/ko/guides/custom-golf-product-specification-sheet/",
  "/guides/custom-golf-sample-approval-checklist/": "/ko/guides/custom-golf-sample-approval-checklist/",
  "/guides/coordinated-golf-accessory-collection/": "/ko/guides/coordinated-golf-accessory-collection/",
  "/guides/headcover-logo-methods-and-placement/": "/ko/guides/headcover-logo-methods-and-placement/",
  "/guides/custom-golf-cap-materials/": "/ko/guides/custom-golf-cap-materials/",
  "/guides/custom-golf-cap-logo-placement/": "/ko/guides/custom-golf-cap-logo-placement/",
  "/guides/custom-golf-product-development-brief/": "/ko/guides/custom-golf-product-development-brief/",
  "/guides/golf-tournament-gift-budget-planning/": "/ko/guides/golf-tournament-gift-budget-planning/",
  "/guides/how-to-build-a-golf-player-pack/": "/ko/guides/how-to-build-a-golf-player-pack/",
  "/guides/tournament-gifts-sponsor-gifts-and-winner-prizes/": "/ko/guides/tournament-gifts-sponsor-gifts-and-winner-prizes/",
  "/guides/how-to-build-a-premium-golf-gift-set/": "/ko/guides/how-to-build-a-premium-golf-gift-set/",
  "/guides/what-to-include-in-a-golf-event-brief/": "/ko/guides/what-to-include-in-a-golf-event-brief/",
  "/guides/how-to-compare-custom-golf-product-quotes/": "/ko/guides/how-to-compare-custom-golf-product-quotes/",
  "/capabilities/": "/ko/capabilities/",
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
