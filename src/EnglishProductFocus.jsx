import { ProductPriorityGateway } from "./ProductPriorityGateway.jsx";
import { trackAnalytics } from "./analytics.jsx";
import { productEntryDetails } from "./product-navigation.js";
import "./english-product-focus.css";

export const englishFocusTitle = "Custom Golf Towels, Caps & Plush Headcovers";
export const englishFocusIntro = "Logo-branded towels and headwear, plus original plush headcovers, for golf clubs, brands and tournaments. Start with one product or coordinate a matching collection.";
export const englishHeroSlides = [
  "/assets/videos/zhoni-custom-golf-collection-showcase.mp4",
  "/assets/videos/zhoni-custom-golf-product-development.mp4",
  "/assets/videos/zhoni-golf-towel-embroidery-detail.mp4",
  "/assets/videos/zhoni-golf-tournament-gift-delivery.mp4",
].map(video => ["THREE CORE PRODUCTS · CUSTOM BRANDING", englishFocusTitle, englishFocusIntro, video]);

export const englishCoreProducts = [
  { title: "Custom Magnetic Golf Towels", copy: "Choose a magnetic or clip attachment, waffle fabric, size and logo placement for your intended use.", image: "/assets/images/zhoni-product-magnetic-towel-v4.png", href: "/custom-golf-towels/" },
  { title: "Custom Golf Caps & Visors", copy: "Develop the crown, fabric, fit, closure and embroidery together—not just a logo on a cap.", image: "/assets/images/zhoni-product-caps-v3.png", href: "/custom-golf-caps/" },
  { title: "Custom Plush Golf Headcovers", copy: "Develop an original or authorised character around recognisable form, lining and target-club fit.", image: "/assets/images/zhoni-plush-novelty-headcovers-v1.jpg", href: "/custom-plush-golf-headcovers/" },
];
export const englishSupportingProducts = [
  { title: "Other Golf Headcovers", copy: "Driver, fairway, hybrid and putter formats beyond the plush range.", href: "/custom-golf-headcovers/" },
  { title: "Ball Markers & Divot Tools", copy: "Metal markers, hat clips and tools to accompany the lead product—or enquire separately.", href: "/custom-golf-ball-markers-divot-tools/" },
  { title: "Golf Accessories", copy: "Pouches, bag tags and small accessories for a coordinated brief.", href: "/custom-golf-accessories/" },
  { title: "Custom Packaging", copy: "Boxes, inserts and protective packing matched to the selected products.", href: "/custom-golf-packaging/" },
];

export function EnglishProductMenu({ active = false }) {
  return <details className="english-product-menu">
    <summary aria-current={active ? "page" : undefined}>PRODUCTS <span aria-hidden="true">⌄</span></summary>
    <div className="english-product-menu-panel">
      <b>CORE PRODUCTS</b>{englishCoreProducts.map(p => <a key={p.href} href={p.href}>{p.title}</a>)}
      <b>SUPPORTING PRODUCTS</b>{englishSupportingProducts.map(p => <a key={p.href} href={p.href}>{p.title}</a>)}
      <a href="/products/">VIEW ALL PRODUCTS ↗</a>
    </div>
  </details>;
}

export function EnglishCoreProducts() {
  return <div id="core-products" data-english-product-focus="core"><ProductPriorityGateway
    eyebrow="OUR CORE PRODUCTS" title="Three product families. A focused starting point."
    intro="Explore towels, caps and plush headcovers first. Each has its own material, construction and sample-review decisions. Images illustrate design directions, not verified stock or completed client projects."
    products={englishCoreProducts} allProducts={{label: "VIEW THE FULL PRODUCT RANGE", href: "/products/"}}
  /></div>;
}

export function EnglishProductExpertise() {
  return <section className="english-product-expertise" data-english-product-focus="expertise">
    <p className="products-kicker">PRODUCT-SPECIFIC DECISIONS</p><h2>Different products need different checks.</h2>
    <div>{[
      ["Towels: attachment & fabric", "Review the contact surface, magnet or clip construction, fabric feel, seams and branding on a physical sample.", "/custom-golf-towels/"],
      ["Caps: shape & wear", "Review crown or band depth, adjustment, brim shape, sweatband and embroidery at the intended logo size.", "/custom-golf-caps/"],
      ["Plush covers: character & fit", "Review original or authorised artwork, multi-angle shape, lining, club insertion and retention—not the render alone.", "/custom-plush-golf-headcovers/"],
    ].map(([title,copy,href]) => <article key={href}><h3>{title}</h3><p>{copy}</p><a href={href}>EXPLORE THE PRODUCT ↗</a></article>)}</div>
    <a href="/our-process/">SEE THE BRIEF, SAMPLE & APPROVAL PROCESS ↗</a>
  </section>;
}

export function EnglishSupportingProducts() {
  return <section className="english-supporting-products" data-english-product-focus="supporting">
    <p className="products-kicker">COMPLETE YOUR COLLECTION</p><h2>Add only what the project needs.</h2>
    <p>These supporting categories remain available for individual enquiries or coordinated sets. Materials, MOQ, availability and timing are confirmed for the selected scope.</p>
    <div>{englishSupportingProducts.map((p,index) => <a href={p.href} key={p.href} onClick={() => trackAnalytics("product_family_click", productEntryDetails(p, {position:index+1,language:"en",pagePath:window.location.pathname,placement:"supporting_products"}))}><h3>{p.title}</h3><p>{p.copy}</p><span aria-hidden="true">↗</span></a>)}</div>
  </section>;
}
