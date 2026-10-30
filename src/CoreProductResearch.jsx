import { currentSiteRoute } from "./locale.jsx";
import { findRoute } from "./siteRoutes.js";
import { coreProductGuidePaths } from "./product-navigation.js";
import { trackAnalytics } from "./analytics.jsx";

const labels = {
  en: ["PRODUCT BUYER GUIDES", "CONTINUE WITH THIS PRODUCT"],
  ko: ["제품별 구매 가이드", "이 제품 자세히 보기"],
  "fr-CA": ["GUIDES D’ACHAT DU PRODUIT", "EXPLORER CE PRODUIT"],
  ja: ["製品別の購入ガイド", "この製品を詳しく見る"],
  de: ["EINKAUFSRATGEBER ZUM PRODUKT", "DIESES PRODUKT ANSEHEN"],
};

export function CoreProductResearch() {
  const route = currentSiteRoute();
  if (!route) return null;
  const canonical = route.alternatePath ?? route.path;
  const productPath = Object.keys(coreProductGuidePaths).find(path => path === canonical || coreProductGuidePaths[path].includes(canonical));
  if (!productPath) return null;
  const locale = route.lang ?? "en";
  const prefix = locale === "en" ? "" : `/${locale === "fr-CA" ? "fr-ca" : locale}`;
  const isProduct = canonical === productPath;
  const direction = isProduct ? "product_to_guide" : "guide_to_product";
  const targets = (isProduct ? coreProductGuidePaths[productPath] : [productPath]).map(path => findRoute(`${prefix}${path}`));
  const links = <nav aria-label={labels[locale][isProduct ? 0 : 1]}>{targets.map(target => <a key={target.path} href={target.path} onClick={() => trackAnalytics("product_research_click", {page_path:route.path,page_language:locale,item_url:target.path,product_path:`${prefix}${productPath}`,direction})}>{target.title.split(" | ")[0]} <span aria-hidden="true">↗</span></a>)}</nav>;
  return <div className="core-product-research" data-core-research={direction} data-core-product={`${prefix}${productPath}`}>
    {isProduct ? <details><summary>{labels[locale][0]}</summary>{links}</details> : <><p>{labels[locale][1]}</p>{links}</>}
  </div>;
}
