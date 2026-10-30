import { ProductPriorityGateway } from "./ProductPriorityGateway.jsx";
import { trackAnalytics } from "./analytics.jsx";
import { productEntryDetails } from "./product-navigation.js";
import { productFocusLocales, localizedFocusProducts } from "./content/product-focus-locales.js";
import "./english-product-focus.css";
import "./localized-product-focus.css";

export function LocalizedProductMenu({ locale, active = false }) {
  const c = productFocusLocales[locale];
  return <details className="english-product-menu" data-product-menu-locale={locale}>
    <summary aria-current={active ? "page" : undefined}>{c.nav} <span aria-hidden="true">⌄</span></summary>
    <div className="english-product-menu-panel">
      <b>{c.coreLabel}</b>{localizedFocusProducts(locale).map(p => <a key={p.href} href={p.href}>{p.title}</a>)}
      <b>{c.supportLabel}</b>{localizedFocusProducts(locale,true).map(p => <a key={p.href} href={p.href}>{p.title}</a>)}
      <a href={`${c.prefix}/products/`}>{c.all} ↗</a>
    </div>
  </details>;
}

function Core({ locale }) {
  const c = productFocusLocales[locale];
  return <div id="core-products" data-product-focus="core"><ProductPriorityGateway eyebrow={c.coreLabel} title={c.coreTitle} intro={c.coreIntro} products={localizedFocusProducts(locale)} allProducts={{label:c.all,href:`${c.prefix}/products/`}} /></div>;
}

function Supporting({ locale }) {
  const c = productFocusLocales[locale];
  return <section className="english-supporting-products" data-product-focus="supporting"><p className="products-kicker">{c.supportLabel}</p><h2>{c.supportTitle}</h2><p>{c.supportIntro}</p><div>{localizedFocusProducts(locale,true).map((p,index) => <a key={p.href} href={p.href} onClick={() => trackAnalytics("product_family_click", productEntryDetails(p, {position:index+1,language:locale,pagePath:window.location.pathname,placement:"supporting_products"}))}><h3>{p.title}</h3><p>{p.copy}</p><span aria-hidden="true">↗</span></a>)}</div></section>;
}

function Hero({ locale }) {
  const c = productFocusLocales[locale];
  return <section className="focus-locale-hero"><div><p className="products-kicker">{c.coreLabel} · B2B</p><h1>{c.title}</h1><p>{c.intro}</p><div className="focus-locale-actions"><a href="#core-products">{c.explore} ↗</a><a href={`${c.prefix}/request-a-quote/`}>{c.enquire} ↗</a></div></div><picture>
    <source type="image/avif" srcSet="/assets/images/responsive/zhoni-golf-collection-hero-v2-640.avif 640w, /assets/images/responsive/zhoni-golf-collection-hero-v2-1024.avif 1024w, /assets/images/responsive/zhoni-golf-collection-hero-v2-1672.avif 1672w" sizes="(max-width: 800px) 100vw, 52vw" />
    <source type="image/webp" srcSet="/assets/images/responsive/zhoni-golf-collection-hero-v2-640.webp 640w, /assets/images/responsive/zhoni-golf-collection-hero-v2-1024.webp 1024w, /assets/images/responsive/zhoni-golf-collection-hero-v2-1672.webp 1672w" sizes="(max-width: 800px) 100vw, 52vw" />
    <img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt={c.title} width="1672" height="941" loading="eager" fetchPriority="high" />
  </picture></section>;
}

export function LocalizedFocusHome({ locale, Header, Footer, children }) {
  const c = productFocusLocales[locale];
  return <main className={`zhoni-page ${c.prefix.slice(1)}-page`} data-product-focus-locale={locale}><Header /><Hero locale={locale} /><Core locale={locale} />
    <section className="english-product-expertise" data-product-focus="expertise"><h2>{c.checkTitle}</h2><div>{localizedFocusProducts(locale).map((p,i)=><article key={p.href}><h3>{p.title}</h3><p>{c.checks[i]}</p><a href={p.href}>{p.title} ↗</a></article>)}</div></section>
    <section className="english-product-expertise focus-locale-process" data-product-focus="process"><h2>{c.flowTitle}</h2><div>{c.steps.map(([title,description])=><article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div><a href={`${c.prefix}/our-process/`}>{c.process} ↗</a></section>
    <Supporting locale={locale} /><section className="english-product-expertise" data-product-focus="program"><h2>{c.programTitle}</h2><p>{c.programIntro}</p><a href={`${c.prefix}/solutions/`}>{c.solutions} ↗</a><a className="focus-locale-final" href={`${c.prefix}/request-a-quote/`}>{c.enquire} ↗</a></section>{children}<Footer /></main>;
}

export function LocalizedFocusProducts({ locale, Header, Footer, children }) {
  const c = productFocusLocales[locale];
  return <main className={`products-hub ${c.prefix.slice(1)}-page`} data-product-focus-locale={locale}><Header active="products" /><Hero locale={locale} /><Core locale={locale} /><Supporting locale={locale} />{children}<section className="english-product-expertise"><h2>{c.programTitle}</h2><p>{c.programIntro}</p><a href={`${c.prefix}/solutions/`}>{c.solutions} ↗</a><a className="focus-locale-final" href={`${c.prefix}/request-a-quote/`}>{c.enquire} ↗</a></section><Footer /></main>;
}
