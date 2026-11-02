import { currentSiteRoute, localePath } from "./locale.jsx";
import { procurementArticleKey, procurementArticleRoutes } from "./content/procurement-article-meta.js";
import { CoreProductResearch } from "./CoreProductResearch.jsx";
import "./procurement-article.css";

const Arrow = () => <span aria-hidden="true">↗</span>;

// Complete articles replace the previous stacked answer modules on these routes.
// Each locale supplies its own copy; navigation, schema extraction and tracking stay shared.
export function ProcurementArticlePage({ content, Header, Footer, route = currentSiteRoute() }) {
  const key = procurementArticleKey(route);
  const article = content.articles[key];
  if (!article) return null;
  const config = procurementArticleRoutes[key];
  const locale = content.locale;
  const link = path => localePath(path, locale);
  const query = new URLSearchParams({ product: content.products[key], source: route.source });
  if (key === "plush") query.set("headcover_type", content.plushType);
  const quoteHref = `${link("/request-a-quote/")}?${query}`;
  return <main className={`zhoni-page guide-page procurement-article ${locale === "en" ? "" : `${locale === "fr-CA" ? "fr-ca" : locale}-page`}`} data-procurement-article={key}>
    <Header active="guides" />
    <section className="guide-hero"><div><p>{content.labels.guide}</p><h1>{article.title}</h1><p>{article.intro[0]}</p></div><img src={config.image} alt={article.imageAlt} fetchPriority="high" /></section>
    <article className="procurement-article-body" aria-label={article.title}>
      <div className="procurement-article-lead" data-guide-answer={key}>{article.intro.slice(1).map(p => <p key={p}>{p}</p>)}</div>
      {article.sections.map(section => <section className="procurement-article-section" key={section.title}>
        <h2>{section.title}</h2>
        {section.paragraphs?.map(p => <p key={p}>{p}</p>)}
        {section.table && <div className="procurement-article-table" tabIndex={0} role="region" aria-label={section.title}><table><thead><tr>{section.table.headers.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{section.table.rows.map(row => <tr key={row[0]}>{row.map((cell, i) => i === 0 ? <th scope="row" key={i}>{cell}</th> : <td key={i}>{cell}</td>)}</tr>)}</tbody></table></div>}
        {section.after?.map(p => <p key={p}>{p}</p>)}
        {section.link && <a className="procurement-article-link" href={link(section.link[1])}>{section.link[0]} <Arrow /></a>}
      </section>)}
    </article>
    <section className="guide-faq"><p>{content.labels.faq}</p><h2>{content.labels.faqTitle}</h2><div>{article.faqs.map(([question, answer], i) => <article key={question}><b>{String(i + 1).padStart(2, "0")}</b><h3>{question}</h3><p>{answer}</p></article>)}</div></section>
    <section className="guide-products"><p>{content.labels.related}</p><h2>{content.labels.relatedTitle}</h2><div>{article.related.map(([label, path]) => <a key={path} href={link(path)}>{label}<Arrow /></a>)}</div></section>
    <CoreProductResearch />
    <section className="guide-close"><div><p>{content.labels.start}</p><h2>{article.close.title}</h2>{article.close.paragraphs.map(p => <p key={p}>{p}</p>)}<a href={quoteHref} data-analytics-placement="guide_final_cta" data-product-interest={content.products[key]}>{article.close.cta} <Arrow /></a></div><img src={config.image} alt={article.imageAlt} loading="lazy" decoding="async" /></section>
    <Footer />
  </main>;
}
