import { trackAnalytics } from "./analytics.jsx";
import { productEntryDetails } from "./product-navigation.js";

const Arrow = () => <span aria-hidden="true">↗</span>;

const productImageWidths = [360, 720, 1122];

function responsiveImagePath(src, width, format) {
  const filename = src.split("/").pop() ?? "";
  const stem = filename.replace(/\.[^.]+$/, "");
  return `/assets/images/responsive/${stem}-${width}.${format}`;
}

function ProductFamilyImage({ product }) {
  const sizes = "(max-width: 640px) calc(100vw - 48px), (max-width: 1080px) calc((100vw - 96px) / 2), calc((100vw - 160px) / 3)";
  const sourceSet = format => productImageWidths.map(width => `${responsiveImagePath(product.image, width, format)} ${width}w`).join(", ");
  return <picture>
    <source type="image/avif" srcSet={sourceSet("avif")} sizes={sizes} />
    <source type="image/webp" srcSet={sourceSet("webp")} sizes={sizes} />
    <img src={product.image} alt={product.alt || product.title} loading="lazy" decoding="async" fetchPriority="low" />
  </picture>;
}

function trackProductEntry(product, position) {
  trackAnalytics("product_family_click", productEntryDetails(product, {
    position: position + 1, language: document.documentElement.lang || "en",
    pagePath: window.location.pathname,
    placement: window.location.pathname.endsWith("/products/") ? "product_hub_core" : "homepage_core",
  }));
}

export function ProductPriorityGateway({ eyebrow, title, intro, products, allProducts, bridge }) {
  return <>
    <section className="family-index home-product-priority" aria-labelledby={`product-priority-${allProducts.href.replace(/\W/g, "")}`}>
      <div className="family-heading">
        <p className="products-kicker">{eyebrow}</p>
        <h2 id={`product-priority-${allProducts.href.replace(/\W/g, "")}`}>{title}</h2>
        <p>{intro}</p>
        <a className="home-product-all" href={allProducts.href}>{allProducts.label} <Arrow /></a>
      </div>
      <div className="family-grid">{products.map((product, index) => <a className="family-card" href={product.href} key={product.href} onClick={() => trackProductEntry(product, index)}><ProductFamilyImage product={product} /><h3>{product.title}</h3><p>{product.copy}</p><span>— &nbsp; <Arrow /></span></a>)}</div>
    </section>
    {bridge && <section className="products-intro home-product-bridge"><p className="products-kicker">{bridge.eyebrow}</p><h2>{bridge.title}</h2><p>{bridge.copy}</p><a href={bridge.href}>{bridge.label} <Arrow /></a></section>}
  </>;
}
