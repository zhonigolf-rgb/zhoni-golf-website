import { currentSiteRoute } from "./locale.jsx";
import { productPlanGroups, productPlanCopy, planCategoryIndex } from "./content/product-plans.js";
import { procurementChecklists } from "./content/procurement-checklists.js";
import { CoreProductResearch } from "./CoreProductResearch.jsx";

export function ProductPlanOptions() {
  const route = currentSiteRoute();
  const ids = productPlanGroups[route?.alternatePath ?? route?.path];
  if (!ids) return null;
  const locale = route.lang ?? "en";
  const copy = productPlanCopy[locale];
  const checklist = procurementChecklists[locale];
  const family = ids[0][0];
  const prefix = locale === "en" ? "" : `/${locale === "fr-CA" ? "fr-ca" : locale}`;
  return <section className="product-plan-options" data-product-plan-options={ids[0][0]}>
    <div className="product-plan-heading"><p>{copy.label}</p><h2>{copy.title}</h2><p>{copy.note}</p></div>
    <div className="product-plan-grid">{ids.map(id => {
      const [title, purpose, confirm] = copy.plans[id];
      const query = new URLSearchParams({ product: copy.category[planCategoryIndex(id)], plan: id, source: `product-plan-${id.toLowerCase()}` });
      if (id.startsWith("P") && locale === "en") query.set("headcover_type", "Plush / novelty character");
      return <article key={id}><span className="product-plan-id">{id}</span><h3>{title}</h3><p>{purpose}</p><dl><dt>{copy.details}</dt><dd>{confirm}</dd></dl><a href={`${prefix}/request-a-quote/?${query}`} data-analytics-placement="product_plan" data-product-interest={`${id}: ${title}`}>{copy.cta} <span aria-hidden="true">↗</span></a></article>;
    })}</div>
    <section className="procurement-checklist" data-procurement-checklist={family}>
      <h3>{checklist.title}</h3>
      <p>{checklist.intro}</p>
      {[...checklist.families[family], checklist.confirmation].map((text, index) => <details key={index} open={index === 0}>
        <summary>{checklist.labels[index]}</summary><p>{text}</p>
      </details>)}
      <p className="procurement-evidence-note">{checklist.evidence}</p>
    </section>
    <CoreProductResearch />
  </section>;
}
