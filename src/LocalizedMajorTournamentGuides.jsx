import { Fragment } from "react";

const Arrow = () => <span aria-hidden="true">↗</span>;

function PlanningTimeline({ labels }) {
  return <section className="tournament-planning-visual" aria-labelledby="localized-tournament-timeline-title">
    <div className="tournament-visual-heading"><p>{labels.kicker}</p><h2 id="localized-tournament-timeline-title">{labels.title}</h2><p>{labels.copy}</p></div>
    <ol>{labels.items.map(([number, title, copy]) => <li key={number}><b>{number}</b><h3>{title}</h3><p>{copy}</p></li>)}</ol>
  </section>;
}

function RecipientTierMap({ labels }) {
  return <section className="recipient-tier-visual" aria-labelledby="localized-recipient-tier-title">
    <div className="tournament-visual-heading"><p>{labels.kicker}</p><h2 id="localized-recipient-tier-title">{labels.title}</h2><p>{labels.copy}</p></div>
    <div>{labels.items.map(([number, title, role, copy]) => <article key={number}><b>{number}</b><span>{role}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
  </section>;
}

export function LocalizedMajorTournamentGuide({ content, topic, Header, Footer, Evidence, pageClass = "" }) {
  const guide = content.guides[topic];
  if (!guide) return null;
  const labels = content.labels;
  return <main className={`zhoni-page guide-page ${pageClass}`.trim()}>
    <Header active="guides" />
    <section className="guide-hero"><div><p>{guide.eyebrow}</p><h1>{guide.title.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</h1><p>{guide.intro}</p><small>{labels.heroMeta}</small></div><img src={guide.image} alt={guide.alt} /></section>
    <section className="guide-intro"><p>{labels.shortAnswer}</p><h2>{labels.shortAnswerTitle}</h2><p>{guide.shortAnswer}</p></section>
    {topic === "calendar2027" && <PlanningTimeline labels={content.timeline} />}
    {topic === "giftTiers" && <RecipientTierMap labels={content.tierMap} />}
    <section className="guide-table"><table><thead><tr>{labels.tableHeaders.map(item => <th key={item}>{item}</th>)}</tr></thead><tbody>{guide.rows.map(row => <tr key={row[0]}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></section>
    {Evidence && <Evidence context={`guide-major-${topic}`} />}
    <section className="guide-decision"><div><p>{labels.preparation}</p><h2>{labels.preparationTitle}</h2><p>{labels.preparationCopy}</p></div><aside><p>{labels.checklist}</p><h3>{labels.checklistTitle}</h3><ul>{guide.checklist.map(item => <li key={item}>{item}</li>)}</ul></aside></section>
    <section className="guide-faq"><p>{labels.faq}</p><h2>{labels.faqTitle}</h2><div>{guide.faqs.map(([question, answer], index) => <article key={question}><b>{String(index + 1).padStart(2, "0")}</b><h3>{question}</h3><p>{answer}</p></article>)}</div></section>
    <section className="guide-products"><p>{labels.related}</p><h2>{labels.relatedTitle}</h2><div>{guide.related.map(([label, href]) => <a href={href} key={href}>{label}<Arrow /></a>)}<a href={content.projectLinks.products}>{content.projectLabels.products}<Arrow /></a><a href={content.projectLinks.solutions}>{content.projectLabels.solutions}<Arrow /></a><a href={content.projectLinks.process}>{content.projectLabels.process}<Arrow /></a></div></section>
    {guide.references && <section className="guide-products"><p>{labels.references}</p><h2>{labels.referencesTitle}</h2><div>{guide.references.map(([label, href]) => <a href={href} target="_blank" rel="noopener noreferrer" key={href}>{label}<Arrow /></a>)}</div></section>}
    <section className="guide-decision tournament-editorial-note"><div><p>{labels.editorial}</p><h2>{labels.editorialTitle}</h2></div><aside><p>{labels.important}</p><h3>{labels.authorisedArtwork}</h3><p>{content.disclaimer}</p></aside></section>
    <section className="guide-close"><div><p>{labels.closeLabel}</p><h2>{labels.closeTitle}</h2><a href={`${content.quoteHref}?source=${encodeURIComponent(guide.source)}`}>{labels.closeCta} <Arrow /></a></div><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt={labels.closeAlt} /></section>
    <Footer />
  </main>;
}
