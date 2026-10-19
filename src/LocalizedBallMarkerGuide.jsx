import { BallMarkerGuideImage, BallMarkerProductPage } from "./BallMarkerProductPage.jsx";
import { ballMarkerLocales } from "./content/ball-marker-locales.js";
import { LocalizedBuyerEvidence } from "./LocalizedBuyerEvidence.jsx";

const Arrow = () => <span aria-hidden="true">↗</span>;

export function LocalizedBallMarkerProductPage(props) {
  return <BallMarkerProductPage {...props} translation={ballMarkerLocales[props.locale]} />;
}

export function LocalizedBallMarkerGuide({ locale, Header, Footer }) {
  const c = ballMarkerLocales[locale];
  const base = `/${locale === "fr-CA" ? "fr-ca" : locale}`;
  const quote = `${base}/request-a-quote/?product=${encodeURIComponent(c.product)}`;
  const links = [
    [c.productLabel, `${base}/custom-golf-ball-markers-divot-tools/`],
    [c.related[0], `${base}/guides/branding-methods-for-premium-golf-merchandise/`],
    [c.related[1], `${base}/guides/prepare-artwork-for-custom-golf-products/`],
    [c.related[2], `${base}/guides/custom-golf-merchandise-quality-checklist/`],
    [c.related[3], `${base}/custom-golf-packaging/`],
    [c.related[4], quote],
  ];
  const table = (rows, firstHeader) => <section className="guide-table"><table><thead><tr>{[firstHeader, c.labels[5], c.labels[6]].map(value => <th key={value}>{value}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></section>;
  return <main className={`zhoni-page guide-page ball-marker-guide-page ${locale === "fr-CA" ? "fr-ca" : locale}-page`}>
    <Header active="guides" />
    <section className="guide-hero"><div><p>{c.labels[0]}</p><h1>{c.title}</h1><p>{c.intro}</p><a href={quote} data-analytics-placement="guide_hero" data-product-interest={c.product}>{c.cta} <Arrow /></a></div><BallMarkerGuideImage name="zhoni-ball-marker-manufacturing-stages-v1" alt={c.alts[0]} eager /></section>
    <section className="guide-intro"><p>{c.labels[1]}</p><h2>{c.shortTitle}</h2><p>{c.shortAnswer}</p></section>
    <section className="headcover-process"><div><p>{c.labels[2]}</p><h2>{c.processTitle}</h2><p>{c.processIntro}</p></div><ol>{c.stages.map(([title, copy], index) => <li key={title}><b>{String(index + 1).padStart(2, "0")}</b><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></section>
    <section className="guide-intro"><p>{c.labels[3]}</p><h2>{c.constructionTitle}</h2></section>
    {table(c.construction, c.labels[4])}
    <section className="guide-intro"><p>{c.labels[7]}</p><h2>{c.finishTitle}</h2></section>
    {table(c.finishes, c.labels[8])}
    <section className="ball-marker-guide-visual"><BallMarkerGuideImage name="zhoni-ball-marker-magnetic-hardware-qc-v1" alt={c.alts[1]} /><div><p>{c.labels[10]}</p><h2>{c.hardwareTitle}</h2><p>{c.hardwareCopy}</p></div></section>
    <section className="guide-decision"><div><p>{c.labels[11]}</p><h2>{c.hardwareTitle}</h2><p>{c.hardwareCopy}</p></div><aside><p>{c.labels[12]}</p><h3>{c.checklistTitle}</h3><ul>{c.checklist.map(item => <li key={item}>{item}</li>)}</ul></aside></section>
    <LocalizedBuyerEvidence locale={locale} context="guide-ball-marker-manufacturing" />
    <section className="headcover-faq"><div><p>{locale === "de" ? "HÄUFIGE FRAGEN VON EINKÄUFERN" : c.labels[13]}</p><h2>{c.faqTitle}</h2></div><div>{c.faqs.map(([question, answer], index) => <article key={question}><b>{String(index + 1).padStart(2, "0")}</b><h3>{question}</h3><p>{answer}</p></article>)}</div></section>
    <section className="guide-products"><p>{c.labels[14]}</p><h2>{c.relatedTitle}</h2><div>{links.map(([title, href]) => <a key={href} href={href}>{title}<Arrow /></a>)}</div></section>
    <section className="guide-close"><div><p>{c.labels[15]}</p><h2>{c.closing}</h2><a href={quote} data-analytics-placement="guide_final_cta" data-product-interest={c.product}>{c.cta} <Arrow /></a></div><BallMarkerGuideImage name="zhoni-ball-marker-magnetic-hardware-qc-v1" alt={c.alts[1]} /></section>
    <Footer />
  </main>;
}
