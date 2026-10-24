import { GuideAnswerIntro } from "./GuideAnswerIntro.jsx";
import { ProcurementAnswers } from "./ProcurementAnswers.jsx";
const Arrow = () => <span aria-hidden="true">↗</span>;

function TextWithBreaks({ value }) {
  return String(value).split("\n").map((line, index, lines) => (
    <span key={`${line}-${index}`}>{line}{index < lines.length - 1 && <br />}</span>
  ));
}

export function LocalizedPlushHeadcoverGuidePage({ content, topic, Header, Footer, Evidence, pageClass = "" }) {
  const shared = content.guides.shared;
  const guide = content.guides.topics[topic];
  if (!guide) return null;

  return <main className={`zhoni-page guide-page plush-guide-page ${pageClass}`.trim()}>
    <Header active="guides" />
    <section className="guide-hero">
      <aside className="category-rail" aria-hidden="true"><strong>Z</strong><span>{shared.rail}</span></aside>
      <div><p>{guide.eyebrow}</p><h1>{guide.title}</h1><p>{guide.intro}</p><small>{shared.heroMeta}</small></div>
      <img src={content.images.hero} alt={shared.heroAlt} />
    </section>
    <GuideAnswerIntro fallback={<section className="guide-intro"><p>{shared.shortAnswerLabel}</p><h2>{shared.shortAnswerTitle}</h2><p>{shared.shortAnswerCopy}</p></section>} />
    <section className="guide-table"><table><thead><tr>{shared.tableHeaders.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{guide.rows.map(row => <tr key={row[0]}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></section>
    {Evidence && <Evidence context={`guide-plush-${topic}`} />}
    <section className="guide-decision"><div><p>{shared.preparationLabel}</p><h2>{shared.preparationTitle}</h2><p>{shared.preparationCopy}</p></div><aside><p>{shared.checklistLabel}</p><h3>{shared.checklistTitle}</h3><ul>{guide.checklist.map(item => <li key={item}>{item}</li>)}</ul></aside></section>
    <section className="guide-faq"><p>{shared.faqLabel}</p><h2>{shared.faqTitle}</h2><div>{guide.faqs.map(([question, answer], index) => <article key={question}><b>{String(index + 1).padStart(2, "0")}</b><h3>{question}</h3><p>{answer}</p></article>)}</div></section>
    <ProcurementAnswers /><section className="guide-products"><p>{shared.relatedLabel}</p><h2>{shared.relatedTitle}</h2><div>{content.guides.related.map(({ label, href }) => <a href={href} key={label}>{label}<Arrow /></a>)}</div></section>
    <section className="guide-close"><div><p>{shared.closeLabel}</p><h2>{shared.closeTitle}</h2><a href={content.quoteHref}>{shared.closeCta} <Arrow /></a></div><img src={content.images.hero} alt={shared.closeAlt} /></section>
    <Footer />
  </main>;
}

export function LocalizedPlushHeadcoverProductPage({ content, Header, Footer, Evidence, pageClass = "" }) {
  const product = content.product;
  const productTitle = content.locale === "en" ? "Custom plush golf\nheadcovers, built\nas characters." : product.title;
  const productIntro = content.locale === "en"
    ? "Custom mascot, animal, object and novelty golf headcovers developed around recognisable form, protective lining, club fit, embroidery, sample approval and packaging."
    : product.intro;
  return <main className={`zhoni-page category-page plush-product-page ${pageClass}`.trim()}>
    <Header active="products" />
    <section className="category-hero">
      <aside className="category-rail" aria-hidden="true"><strong>Z</strong><span>{product.rail}</span></aside>
      <div className="category-intro"><p>{product.eyebrow}</p><h1><TextWithBreaks value={productTitle} /></h1><p>{productIntro}</p><a href={content.quoteHref} data-analytics-placement="product_hero" data-product-interest="Custom plush golf headcovers">{product.heroCta} <Arrow /></a><small>{product.heroMeta}</small></div>
      <img src={content.images.hero} alt={product.heroAlt} />
    </section>
    <section className="plush-format-section"><div><p>{product.formats.label}</p><h2>{product.formats.title}</h2><p>{product.formats.copy}</p></div><div>{product.formats.items.map(([title, copy], index) => <article key={title}><b>{String(index + 1).padStart(2, "0")}</b><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="headcover-specs"><div><p>{product.specs.label}</p><h2>{product.specs.title}</h2><p>{product.specs.copy}</p></div><dl>{product.specs.items.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}</dl></section>
    <section className="plush-detail-visual"><figure><img src={content.images.construction} alt={product.detail.imageAlt} /><figcaption>{product.detail.caption}</figcaption></figure><div><p>{product.detail.label}</p><h2>{product.detail.title}</h2><p>{product.detail.copy}</p><ul>{product.detail.items.map(([title, copy]) => <li key={title}><b>{title}</b><span>{copy}</span></li>)}</ul></div></section>
    <section className="headcover-process"><div><p>{product.process.label}</p><h2>{product.process.title}</h2></div><ol>{product.process.items.map(([number, title, copy]) => <li key={number}><b>{number}</b><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></section>
    <aside className="plush-mid-cta"><div><p>{product.midCta.label}</p><h2>{product.midCta.title}</h2></div><a href={content.quoteHref} data-analytics-placement="product_mid_cta" data-product-interest="Custom plush golf headcovers">{product.midCta.cta} <Arrow /></a></aside>
    {Evidence && <Evidence context="product-plush-headcovers" />}
    <section className="headcover-faq"><div><p>{product.faq.label}</p><h2>{product.faq.title}</h2></div><div>{product.faq.items.map(([question, answer], index) => <article key={question}><b>{String(index + 1).padStart(2, "0")}</b><h3>{question}</h3><p>{answer}</p></article>)}</div></section>
    <section className="category-guides"><p>{product.guides.label}</p><h2>{product.guides.title}</h2><div>{product.guides.items.map(({ label, href }, index) => <a href={href} key={href}><b>{String(index + 1).padStart(2, "0")}</b><span>{label}</span><Arrow /></a>)}</div></section>
    {content.locale === "en" && <section className="category-guides product-related-routes"><p>RELATED CUSTOM GOLF PRODUCTS</p><h2>Continue from the character to the wider product range.</h2><div><a href="/custom-golf-headcovers/"><b>01</b><span>ALL CUSTOM GOLF HEADCOVERS</span><Arrow /></a><a href="/custom-golf-caps/"><b>02</b><span>CUSTOM GOLF CAPS &amp; VISORS</span><Arrow /></a><a href="/custom-golf-packaging/"><b>03</b><span>CUSTOM GOLF PACKAGING</span><Arrow /></a><a href="/products/"><b>+</b><span>VIEW ALL CUSTOM GOLF PRODUCTS</span><Arrow /></a></div></section>}
    <section className="headcover-brief-cta"><div><p>{product.close.label}</p><h2>{product.close.title}</h2><p>{product.close.copy}</p></div><a href={content.quoteHref} data-analytics-placement="product_final_cta" data-product-interest="Custom plush golf headcovers">{product.close.cta} <Arrow /></a></section>
    <Footer />
  </main>;
}
