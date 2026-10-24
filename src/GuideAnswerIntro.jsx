import { currentSiteRoute } from "./locale.jsx";
import { procurementGuideProducts } from "./content/procurement-answers.js";
import { guideAnswerIntros } from "./content/guide-answer-intros.js";

const productPaths = {
  towels: "/custom-golf-towels/", caps: "/custom-golf-caps/",
  plush: "/custom-plush-golf-headcovers/", markers: "/custom-golf-ball-markers-divot-tools/",
};

export function GuideAnswerIntro({ fallback = null }) {
  const route = currentSiteRoute();
  const product = procurementGuideProducts[route?.alternatePath ?? route?.path];
  if (!product) return fallback;
  const locale = route.lang ?? "en";
  const copy = guideAnswerIntros[locale];
  const answer = copy.products[product];
  const prefix = locale === "en" ? "" : `/${locale === "fr-CA" ? "fr-ca" : locale}`;
  return <>
    <section className="guide-intro guide-answer-intro" data-guide-answer={product}>
      <p>{copy.label}</p><h2>{answer.question}</h2><p>{answer.answer}</p>
      <a href={`${prefix}${productPaths[product]}`}>{copy.link} <span aria-hidden="true">↗</span></a>
    </section>
    <section className="guide-table guide-answer-comparison" aria-label={answer.question}>
      <table><thead><tr>{copy.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead>
        <tbody>{answer.rows.map(([option, when, confirm]) => <tr key={option}><th scope="row">{option}</th><td>{when}</td><td>{confirm}</td></tr>)}</tbody>
      </table>
    </section>
  </>;
}
