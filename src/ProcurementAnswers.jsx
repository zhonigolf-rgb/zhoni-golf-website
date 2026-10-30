import { currentSiteRoute } from "./locale.jsx";
import { procurementAnswers, procurementGuideProducts } from "./content/procurement-answers.js";
import { CoreProductResearch } from "./CoreProductResearch.jsx";

export function ProcurementAnswers() {
  const route = currentSiteRoute();
  const product = procurementGuideProducts[route?.alternatePath ?? route?.path];
  if (!product) return <CoreProductResearch />;
  const copy = procurementAnswers[route.lang ?? "en"];
  return <><section className="headcover-faq procurement-answers" data-procurement-product={product}>
    <div><p>{copy.label}</p><h2>{copy.title}</h2><p className="procurement-answers-boundary">{copy.boundary}</p></div>
    <div>{copy.questions.map((question, index) => <article key={question}>
      <b>{String(index + 1).padStart(2, "0")}</b><h3>{question}</h3><p>{copy.products[product][index]}</p>
    </article>)}</div>
  </section><CoreProductResearch /></>;
}
