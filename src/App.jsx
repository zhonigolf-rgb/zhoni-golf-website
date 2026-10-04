import { useEffect, useRef, useState } from "react";
import { findRoute, siteRoutes } from "./siteRoutes";
import { trackAnalytics } from "./analytics.jsx";
import { TurnstileField } from "./turnstile.jsx";
import { addInquirySource, applySeo, inquirySourceForLocation } from "./seo.js";
import "./showcase.css";
import "./products.css";
import "./zhoni-pages.css";

const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL ?? "https://wa.me/8617759190848";
const slides = [
  ["CUSTOM GOLF MERCHANDISE FOR CLUBS, EVENTS & BRANDS", "One project. A complete golf collection.", "Custom golf merchandise, tournament gift sets and branded packaging developed for clubs, corporate programs, events and growing golf brands.", "/assets/videos/zhoni-custom-golf-collection-showcase.mp4"],
  ["CUSTOM GOLF PRODUCT DEVELOPMENT", "Where materials become a branded collection.", "Begin with the product direction, materials and brand details that help every selected piece feel considered together.", "/assets/videos/zhoni-custom-golf-product-development.mp4"],
  ["CUSTOM GOLF TOWEL EMBROIDERY", "The details people notice up close.", "A considered brand application can bring texture, colour and a recognisable signature to the collection.", "/assets/videos/zhoni-golf-towel-embroidery-detail.mp4"],
  ["GOLF TOURNAMENT GIFTS", "Made for the moment your guests remember.", "A considered player experience from the first hand-off to the final presentation detail.", "/assets/videos/zhoni-golf-tournament-gift-delivery.mp4"],
];
const products = ["Headcovers", "Golf Towels", "Pouches", "Bag Tags", "Ball Markers", "Divot Tools", "Golf Balls", "Custom Packaging"];
const solutions = [["Tournament Player Pack", "Player-ready essentials built around your event identity."], ["Corporate Golf Gift Set", "A considered golf experience for clients, teams or partners."], ["Club Member Gift", "A coordinated collection for member moments and milestones."], ["VIP Golf Gift Box", "Premium products and presentation for high-value recipients."]];
const faqs = [["What golf products can be customised?", "We can develop coordinated ranges including headcovers, towels, pouches, bag tags, ball markers, divot tools, golf balls, accessories and packaging. Available options depend on the product and project brief."], ["Can you create a complete custom golf gift set?", "Yes. We can help structure a collection around your event, recipient profile, budget direction and branding system—from individual products through to presentation packaging."], ["What is the MOQ for custom golf products?", "Minimums vary by product, construction, material, decoration method and packaging. Share your product direction and estimated quantity for the applicable MOQ."], ["Can different golf products use the same branding?", "Yes. We can coordinate logo use, colours and design details across a group of selected products so the finished collection reads as one system."], ["How do sampling and production timing work?", "Timing depends on the selected products, customisation, quantities, artwork readiness and delivery destination. Include your event date in the enquiry so the project can be assessed properly."]];

const Arrow = () => <span aria-hidden="true">↗</span>;
const Button = ({ children, secondary = false }) => <a className={`button ${secondary ? "button-secondary" : "button-primary"}`} href="/request-a-quote/">{children} <Arrow /></a>;

const productFamilyRoutes = {
  Headcovers: "/custom-golf-headcovers/",
  "Golf Towels": "/custom-golf-towels/",
  Pouches: "/custom-golf-accessories/",
  "Bag Tags": "/custom-golf-accessories/",
  "Ball Markers": "/custom-golf-accessories/",
  "Divot Tools": "/custom-golf-accessories/",
  "Golf Balls": "/custom-golf-accessories/",
  "Custom Packaging": "/custom-golf-packaging/",
  Towels: "/custom-golf-towels/",
  Accessories: "/custom-golf-accessories/",
  "Ball Markers & Tools": "/custom-golf-accessories/",
  "Gift Sets": "/solutions/corporate-golf-gifts/",
  Packaging: "/custom-golf-packaging/",
};

const solutionRoutes = {
  "Tournament Player Pack": "/solutions/golf-tournament-gifts/",
  "Corporate Golf Gift Set": "/solutions/corporate-golf-gifts/",
  "Club Member Gift": "/request-a-quote/?solution=club-member-gifts",
  "VIP Golf Gift Box": "/request-a-quote/?solution=vip-golf-gift-boxes",
};

const productFamilies = [
  ["Headcovers", "Signature protection for clubs, series and occasions.", "/assets/images/zhoni-golf-collection-hero-v2.png", "ZHONI custom golf headcover with gold Z monogram"],
  ["Towels", "Everyday course utility with a more considered finish.", "/assets/images/zhoni-golf-product-development-v2.png", "ZHONI custom golf towel with gold embroidered Z monogram"],
  ["Accessories", "Pouches, bag tags and small pieces that carry the identity.", "/assets/images/zhoni-golf-product-development-v2.png", "ZHONI golf ball marker, divot tool and accessory development"],
  ["Ball Markers & Tools", "Small-format pieces for player packs and club moments.", "/assets/images/zhoni-golf-collection-hero-v2.png", "ZHONI brass golf ball marker and divot tool"],
  ["Gift Sets", "Coordinated pieces planned around the recipient and occasion.", "/assets/images/zhoni-golf-tournament-gift-delivery-v2.png", "ZHONI custom golf gift set presented at a tournament"],
  ["Packaging", "Boxes, inserts and finishing details that complete the hand-off.", "/assets/images/zhoni-custom-golf-packaging-v2.png", "ZHONI custom golf presentation packaging"],
];

function ZhoniPageHeader({ active }) {
  const [menu, setMenu] = useState(false);
  return <header className={`zhoni-header ${menu ? "zhoni-header-open" : ""}`}>
    <a className="zhoni-wordmark" href="/"><strong>ZHONI</strong><small>CUSTOM GOLF MERCHANDISE</small></a>
    <button className="zhoni-menu" onClick={() => setMenu(value => !value)} aria-expanded={menu}>{menu ? "CLOSE" : "MENU"}</button>
    <nav><a className={active === "products" ? "active" : ""} href="/products/">PRODUCTS</a><a className={active === "solutions" ? "active" : ""} href="/solutions/">SOLUTIONS</a><a className={active === "guides" ? "active" : ""} href="/guides/">BUYER GUIDES</a><a className={active === "process" ? "active" : ""} href="/our-process/">OUR PROCESS</a><a className={active === "faq" ? "active" : ""} href="/faq/">FAQ</a><a className={active === "about" ? "active" : ""} href="/about/">ABOUT</a></nav>
    <a className="zhoni-header-cta" href="/request-a-quote/">SHARE YOUR BRIEF <Arrow /></a>
  </header>;
}

function SiteFooter() {
  return <footer className="site-footer"><div className="site-footer-main"><a className="zhoni-wordmark" href="/"><strong>ZHONI</strong><small>CUSTOM GOLF MERCHANDISE</small></a><div className="site-footer-copy"><p>Custom golf merchandise, coordinated gift sets and packaging for clubs, events and brands.</p><span>GIFT SETS · HEADCOVERS · TOWELS · MARKERS · PACKAGING</span><div className="site-footer-contact"><b>DIRECT CONTACT</b><a href="mailto:sales@zhonigolf.com">sales@zhonigolf.com</a><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp +86 177 5919 0848 <Arrow /></a></div></div><nav aria-label="Footer navigation"><a href="/products/">Products</a><a href="/solutions/">Solutions</a><a href="/guides/">Buyer Guides</a><a href="/our-process/">Process</a><a href="/capabilities/">Capabilities</a><a href="/about/">About</a><a href="/request-a-quote/">Contact <Arrow /></a></nav></div><div className="site-footer-base"><span>ZHONI · CUSTOM GOLF MERCHANDISE</span><span>Operated by Xiamen Jindongyu Trading Co., Ltd.</span></div></footer>;
}

function ZhoniPageFooter() {
  return <SiteFooter />;
}

const buyerGuideFilters = [
  ["all", "ALL GUIDES"],
  ["product", "PRODUCT & CUSTOMISATION"],
  ["program", "GIFTS & PROGRAMS"],
  ["procurement", "PROCUREMENT & FIRST ORDER"],
  ["readiness", "PACKAGING, QUALITY & DELIVERY"],
];

const buyerGuideCatalog = [
  { category: "product", label: "PRODUCT & CUSTOMISATION", title: "Custom Golf Headcovers Procurement Guide", copy: "Plan club, tournament or brand headcovers around product direction, artwork, packaging and the intended hand-off.", href: siteRoutes.headcoversGuide.path },
  { category: "product", label: "PRODUCT & CUSTOMISATION", title: "Custom Golf Towels Procurement Guide", copy: "A practical route for planning towel use, branding details and the project context that informs the next discussion.", href: siteRoutes.towelsGuide.path },
  { category: "product", label: "PRODUCT & CUSTOMISATION", title: "Branding Methods for Premium Golf Merchandise", copy: "Compare embroidery, debossing, print and metal finishing against the chosen product and brand expression.", href: siteRoutes.brandingGuide.path },
  { category: "product", label: "PRODUCT & CUSTOMISATION", title: "How to Prepare Artwork for Custom Golf Products", copy: "Prepare logo files, colour direction, placement and reference material for a more useful artwork hand-off.", href: siteRoutes.artworkGuide.path },
  { category: "program", label: "GIFTS & PROGRAMS", title: "How to Choose Custom Golf Gifts", copy: "Choose between gift sets and single products by matching the project to its audience, moment and intended outcome.", href: siteRoutes.golfGiftGuide.path },
  { category: "program", label: "GIFTS & PROGRAMS", title: "How to Choose Golf Gifts for Your Audience", copy: "Compare practical directions for clients, tournament players and club members before selecting products and presentation.", href: siteRoutes.audienceGiftGuide.path },
  { category: "program", label: "GIFTS & PROGRAMS", title: "Golf Tournament Player Packs Guide", copy: "Plan a player-ready collection around the event, participant experience, product mix and branding direction.", href: siteRoutes.tournamentGuide.path },
  { category: "program", label: "GIFTS & PROGRAMS", title: "Corporate Golf Gifts Procurement Guide", copy: "Use recipient, occasion and presentation context to shape a more considered corporate gifting program.", href: siteRoutes.corporateGuide.path },
  { category: "procurement", label: "PROCUREMENT & FIRST ORDER", title: "MOQ, Quote & First Order", copy: "The inputs that make an early product, quantity, branding, packaging and destination conversation more productive.", href: siteRoutes.firstOrder.path },
  { category: "readiness", label: "PACKAGING, QUALITY & DELIVERY", title: "Custom Golf Packaging Procurement Guide", copy: "Bring box structure, inserts, presentation details and protective requirements into the project brief early.", href: siteRoutes.packagingGuide.path },
  { category: "readiness", label: "PACKAGING, QUALITY & DELIVERY", title: "Quality, Packaging & Export Readiness", copy: "Align quality expectations, carton details, packaging and destination considerations before the final hand-off.", href: siteRoutes.exportReadiness.path },
];

function BuyerGuidesPage() {
  const [filter, setFilter] = useState("all");
  const visibleGuides = filter === "all" ? buyerGuideCatalog : buyerGuideCatalog.filter(guide => guide.category === filter);
  return <main className="zhoni-page buyer-guides-page"><ZhoniPageHeader active="guides" />
    <section className="buyer-guides-hero"><div><p>ZHONI BUYER GUIDES</p><h1>Golf merchandise<br />buyer guides.</h1><p>Practical planning guides for buyers working on custom golf products, gift programs, packaging and a more confident first order.</p><a href="/request-a-quote/">START WITH YOUR BRIEF <Arrow /></a></div><img src="/assets/images/zhoni-material-direction-v1.png" alt="Material and finish direction for a custom golf merchandise project" /></section>
    <section className="buyer-guides-index"><div className="buyer-guides-intro"><p>GUIDE LIBRARY</p><h2>Find the next<br />decision you need.</h2><p>Start with the product, project outcome or procurement point that is most relevant now. Every guide leads back to a product route, solution or project brief.</p></div><div className="buyer-guides-filter" aria-label="Filter buyer guides">{buyerGuideFilters.map(([value, label]) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>)}</div><p className="buyer-guides-count">{visibleGuides.length} {visibleGuides.length === 1 ? "GUIDE" : "GUIDES"}</p><div className="buyer-guides-grid">{visibleGuides.map((guide, index) => <a href={guide.href} key={guide.href} className="buyer-guide-card"><b>{String(index + 1).padStart(2, "0")}</b><span>{guide.label}</span><h3>{guide.title}</h3><p>{guide.copy}</p><i>READ GUIDE <Arrow /></i></a>)}</div></section>
    <section className="buyer-guides-path"><div><p>ONE LIBRARY. CLEARER PROJECT PATHS.</p><h2>Use a guide to prepare, then bring the relevant context into your brief.</h2></div><div><a href="/products/"><b>01</b><span>EXPLORE PRODUCT FAMILIES</span><Arrow /></a><a href="/solutions/"><b>02</b><span>CHOOSE A PROJECT OUTCOME</span><Arrow /></a><a href="/request-a-quote/"><b>03</b><span>SHARE YOUR PROJECT BRIEF</span><Arrow /></a></div></section>
    <ZhoniPageFooter />
  </main>;
}

function FloatingContactActions({ hidden = false }) {
  const [open, setOpen] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const whatsappLink = typeof window === "undefined" ? WHATSAPP_URL : createWhatsAppLink();
  useEffect(() => {
    const footer = document.querySelector(".site-footer");
    if (!footer || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  const isHidden = hidden || footerVisible;
  return <aside className={`float ${open ? "float-open" : ""} ${isHidden ? "float-hidden" : ""}`} aria-label="Project contact actions" aria-hidden={isHidden}><div className="float-panel" id="project-contact-menu"><a href="/request-a-quote/" tabIndex={isHidden || !open ? -1 : 0} onClick={() => setOpen(false)}><img src="/assets/quote-brief-icon.png" alt="" aria-hidden="true" /><strong>GET A QUOTE</strong><Arrow /></a><a href={whatsappLink} target="_blank" rel="noopener noreferrer" tabIndex={isHidden || !open ? -1 : 0}><img src="/assets/whatsapp-contact-icon.png" alt="" aria-hidden="true" /><strong>WHATSAPP</strong><Arrow /></a></div><button className="golf-flag-mark" type="button" aria-label={open ? "Hide project contact options" : "Show project contact options"} aria-expanded={open} aria-controls="project-contact-menu" tabIndex={isHidden ? -1 : 0} onClick={() => setOpen(value => !value)}><img src="/assets/golf-flag-marker-v2.png" alt="" /></button></aside>;
}

function AboutPage() {
  return <main className="zhoni-page about-page"><ZhoniPageHeader active="about" />
    <section className="zhoni-about-hero"><img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="ZHONI custom golf gift box, golf ball and coordinated accessories" /><div><p>ABOUT ZHONI</p><h1>Built for considered<br />golf projects.</h1><p>ZHONI works with clubs, tournaments, brands and business teams on custom golf merchandise, gift sets and packaging.</p><a href="/request-a-quote/">START A PROJECT <Arrow /></a></div></section>
    <section className="relationship"><div><p>OUR BRAND RELATIONSHIP</p><h2>A clear structure.<br />A stronger partnership.</h2></div><div className="relationship-copy"><p>ZHONI is the custom golf merchandise practice operated by Xiamen Jindongyu Trading Co., Ltd. We use a project-led approach to coordinate product direction, customization, packaging and commercial readiness.</p><p>We do not assume a single standard answer for every brief. Product scope, timing, MOQ and applicable requirements are reviewed around the project you are planning.</p></div><div className="relationship-map"><article><b>ZHONI</b><span>Custom golf merchandise practice</span><small>Product direction · Customization · Client projects</small></article><i>Dedicated practice of</i><article><b>Xiamen Jindongyu<br />Trading Co., Ltd.</b><span>Legal operating entity</span><small>Commercial, contractual and operational framework</small></article></div></section>
    <section className="coordinate"><div><p>WHAT WE COORDINATE</p><h2>From idea to<br />on-course impact.</h2></div><p>We bring together product choices, brand application, packaging and project planning so the final collection feels coherent to the people receiving it.</p><div className="coordinate-grid">{[["01","Product direction","Select products, materials and finishes around the outcome you need."],["02","Customization","Apply logos, graphics, colour and details across the selected collection."],["03","Packaging","Plan gift sets and presentation packaging around the hand-off moment."],["04","Project readiness","Review quantities, dates, destinations and specifications before commercial commitments."]].map(([number,title,copy]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="zhoni-closing"><img src="/assets/images/zhoni-golf-tournament-gift-delivery-v2.png" alt="ZHONI custom golf merchandise presented as a coordinated tournament gift" /><div><p>THOUGHTFUL PRODUCTS FOR MEANINGFUL MOMENTS</p><h2>Golf merchandise<br />that carries further.</h2><p>For club events, corporate programs and private-label projects, start by sharing the occasion and the people you are designing for.</p><a href="/request-a-quote/">TELL US ABOUT YOUR PROJECT <Arrow /></a></div></section><ZhoniPageFooter />
  </main>;
}

function ProcessPage() {
  const steps = [
    ["01", "Brief", "Tell us about your goal, audience, approximate quantity and target date.", "/assets/images/zhoni-material-direction-v1.png", "Material, colour and finish direction for a custom golf merchandise project"],
    ["02", "Direction", "We review relevant product, branding and packaging directions around the brief.", "/assets/images/zhoni-embroidery-sample-v1.png", "Embroidery and product sampling detail for custom golf merchandise"],
    ["03", "Confirmation", "Refine the selected scope, artwork, samples or specifications as applicable.", "/assets/images/zhoni-gift-packaging-process-v1.png", "Presentation packaging preparation for a custom golf gift set"],
    ["04", "Production planning", "Confirm the practical requirements that influence production and presentation.", "/assets/images/zhoni-quality-inspection-v1.png", "Quality inspection detail for a custom golf headcover"],
    ["05", "Delivery coordination", "Review destination and hand-off requirements for the agreed project scope.", "/assets/images/zhoni-carton-packing-v1.png", "Carton packing and dispatch preparation for golf gift packaging"],
  ];
  return <main className="zhoni-page process-page"><ZhoniPageHeader active="process" /><section className="process-hero"><div><p>HOW WE WORK</p><h1>A clear path<br />from brief to delivery.</h1><p>Custom golf merchandise, coordinated gift sets, packaging and project planning—designed around what the final experience needs to achieve.</p><a href="/request-a-quote/">SHARE YOUR BRIEF <Arrow /></a></div><img src="/assets/images/zhoni-material-direction-v1.png" alt="Material, colour and finish direction for a custom golf merchandise project" /></section><section className="process-ledger"><p>THE PROCESS</p><span>FIVE STEPS. A CLEARER JOURNEY.</span><div>{steps.map(([number, title, copy, image, alt]) => <article key={number}><b>{number}</b><h2>{title}</h2><p>{copy}</p><img src={image} alt={alt} /></article>)}</div></section><section className="project-input"><div><p>WHAT WE NEED FROM YOU</p><h2>A useful brief<br />starts with context.</h2><p>The more relevant detail you can share, the more accurately we can assess the appropriate direction.</p></div><ul><li><b>USE CASE</b><span>Club program, tournament, corporate gifting or private-label collection</span></li><li><b>QUANTITY RANGE</b><span>An approximate volume is enough to start</span></li><li><b>DATE &amp; DESTINATION</b><span>When and where the project is needed</span></li><li><b>BRAND ASSETS</b><span>Logo, visual guidelines or reference materials</span></li><li><b>PACKAGING &amp; REQUIREMENTS</b><span>Any presentation, market or practical considerations</span></li></ul><aside>MOQ, timing, specifications and applicable requirements are reviewed per project.</aside></section><section className="process-final"><img src="/assets/images/zhoni-gift-packaging-process-v1.png" alt="Presentation packaging preparation for a custom golf gift set" /><div><p>A THOUGHTFUL APPROACH</p><h2>More than merchandise.<br />A stronger connection.</h2><p>Share your project brief and we will use it to guide the appropriate next conversation.</p><a href="/request-a-quote/">SHARE YOUR BRIEF <Arrow /></a></div></section><ZhoniPageFooter /></main>;
}

function ExportReadinessHub(){const steps=[["01","Quality checkpoints","Review relevant material, workmanship, logo application, finish and packaging expectations against the agreed project scope."],["02","Packaging confirmation","Confirm gift box, inserts, logo placement, print details and protective materials before production commitments."],["03","Carton & hand-off","Review outer-carton requirements, marking, packing method and agreed hand-off details for the project."],["04","Destination & delivery terms","Discuss destination, preferred route and delivery terms per project; import clearance, duties and taxes depend on the agreed route."]];return <main className="zhoni-page guide-page"><ZhoniPageHeader active="solutions"/><section className="guide-hero"><div><p>QUALITY, PACKAGING &amp; EXPORT READINESS</p><h1>Quality, Packaging<br/>&amp; Export Readiness</h1><p>Prepare custom golf gifts for a confident hand-off—from product and packaging checks to carton and destination considerations reviewed per project.</p><a href="/request-a-quote/">SHARE YOUR PROJECT BRIEF <Arrow/></a></div><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI golf gift set packaging"/></section><section className="guide-intro"><p>PROJECT READINESS LEDGER</p><h2>Four areas to align before hand-off.</h2></section><section className="guide-products"><div>{steps.map(([n,t,d])=><article key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></article>)}</div></section><section className="guide-decision"><div><p>BUYER CHECKLIST</p><h2>Details that help align the next step.</h2><p>Product scope, branding details, packaging, carton expectations, destination, target date and relevant requirements create a clearer review path.</p></div><aside><p>IMPORTANT BOUNDARY</p><h3>Delivery terms are not one-size-fits-all.</h3><ul>{["DDP may be evaluated by destination and route.","DAP may require the buyer to manage import clearance, duties and taxes.","Timing, documentation and hand-off needs are reviewed per agreed scope."].map(v=><li key={v}>{v}</li>)}</ul></aside></section><section className="guide-products"><p>RELATED PROCUREMENT PATHS</p><h2>Continue with the right detail.</h2><div>{[["Custom Packaging","/custom-golf-packaging/"],["First Order Guide","/first-order-guide/"],["Artwork Preparation","/guides/prepare-artwork-for-custom-golf-products/"],["Branding Methods","/guides/branding-methods-for-premium-golf-merchandise/"],["Project FAQ","/faq/"],["Request a Quote","/request-a-quote/"]].map(([t,h])=><a href={h} key={t}>{t}<Arrow/></a>)}</div></section><section className="guide-close"><div><p>READY TO ALIGN THE HAND-OFF?</p><h2>Share the product, packaging and destination context.</h2><a href="/request-a-quote/">START YOUR PROJECT <Arrow/></a></div><img src="/assets/images/zhoni-golf-tournament-gift-delivery-v2.png" alt="ZHONI golf gift delivery"/></section><ZhoniPageFooter/></main>}
function FirstOrderHub(){const steps=[["01","Define product route","Choose a gift set, headcovers, towels, accessories, packaging or a coordinated collection."],["02","Prepare quantity & customisation inputs","Share estimated quantity, branding direction, materials, colours and useful references."],["03","Review quote & confirmation path","Commercial requirements, MOQ and timing are reviewed around the selected project scope."],["04","Align packaging & destination","Confirm presentation, destination and relevant delivery considerations before commitments."]];return <main className="zhoni-page guide-page"><ZhoniPageHeader active="solutions"/><section className="guide-hero"><div><p>PROCUREMENT HUB</p><h1>MOQ, Quote &amp;<br/>First Order</h1><p>A clearer first order starts with the right inputs. MOQ, timing and commercial requirements are reviewed per project, based on product selection, customisation, packaging and destination.</p><a href="/request-a-quote/">START WITH YOUR BRIEF <Arrow/></a></div><img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="ZHONI custom golf collection"/></section><section className="guide-intro"><p>FIRST-ORDER PROCUREMENT PROCESS</p><h2>From concept to a clearer next step.</h2></section><section className="guide-products"><div>{steps.map(([n,t,d])=><article key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></article>)}</div></section><section className="guide-decision"><div><p>BUYER CHECKLIST</p><h2>Key inputs for a smoother first order.</h2><p>Product categories, estimated quantity, logo artwork, customisation direction, material preferences, packaging, destination and target date make a more relevant review possible.</p></div><aside><p>PROJECT-SPECIFIC REVIEW</p><h3>What is confirmed around your brief.</h3><ul>{["Applicable product route and customisation direction.","Project-specific MOQ and commercial requirements.","Relevant proof, sample or confirmation path.","Packaging, destination and delivery considerations."].map(v=><li key={v}>{v}</li>)}</ul></aside></section><section className="guide-products"><p>RELATED PROJECT ROUTES</p><h2>Continue with the right starting point.</h2><div>{[["Custom Golf Gifts","/custom-golf-gifts/"],["Branding Methods","/guides/branding-methods-for-premium-golf-merchandise/"],["Artwork Preparation","/guides/prepare-artwork-for-custom-golf-products/"],["Custom Packaging","/custom-golf-packaging/"],["Project FAQ","/faq/"],["Request a Quote","/request-a-quote/"]].map(([t,h])=><a href={h} key={t}>{t}<Arrow/></a>)}</div></section><section className="guide-close"><div><p>READY TO PLAN THE FIRST ORDER?</p><h2>Share the context behind the project.</h2><a href="/request-a-quote/">REQUEST A QUOTE <Arrow/></a></div><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI custom golf packaging"/></section><ZhoniPageFooter/></main>}
function ArtworkGuidePage(){const items=[["Logo files","AI, EPS, PDF or SVG are useful when available; high-resolution raster files can also support early review."],["Colour direction","Share Pantone, CMYK, RGB, HEX or physical references where relevant."],["Placement & size","Indicate product, position, orientation, approximate dimensions and any spacing expectations."],["Reference images","Show the finish, material, embroidery, printing or packaging direction you are aiming for."],["Packaging artwork","Include box, sleeve, insert, card or label details when presentation packaging is part of the brief."]];return <main className="zhoni-page guide-page"><ZhoniPageHeader active="solutions"/><section className="guide-hero"><div><p>BRANDING, SAMPLING &amp; PACKAGING · ARTWORK GUIDE</p><h1>How to Prepare<br/>Artwork and Brand Files<br/>for Custom Golf Products</h1><p>A clear artwork handoff helps us review relevant branding routes for golf gift sets, headcovers, towels, ball markers, accessories and packaging.</p><small>ARTWORK HANDOFF · LOGO FILES · SAMPLE CONFIRMATION</small></div><img src="/assets/images/zhoni-golf-product-development-v2.png" alt="ZHONI golf product development and brand detail"/></section><section className="guide-intro"><p>ARTWORK HANDOFF LEDGER</p><h2>Prepare the details that make a project easier to assess.</h2><p>Not every project needs every file on day one. Share what is available, then confirm the appropriate artwork, proof or sample path around the selected product and finish.</p></section><section className="guide-table"><table><thead><tr><th>WHAT TO SHARE</th><th>WHY IT HELPS</th></tr></thead><tbody>{items.map(row=><tr key={row[0]}>{row.map(cell=><td key={cell}>{cell}</td>)}</tr>)}</tbody></table></section><section className="guide-decision"><div><p>SAMPLE CONFIRMATION RAIL</p><h2>From artwork to appropriate approval.</h2><p>Confirmation steps depend on the product, material, customisation, quantity and packaging. Review details before production commitments are made.</p></div><aside><p>PROJECT PATH</p><h3>Four practical stages.</h3><ul>{["Share available files, references and product direction.","Review the relevant branding and placement approach.","Confirm the appropriate visual, proof or sample requirements.","Align approved scope before production planning."].map(v=><li key={v}>{v}</li>)}</ul></aside></section><section className="guide-products"><p>CONTINUE THE PROJECT</p><h2>Keep branding consistent across the collection.</h2><div>{[["Branding Methods Guide","/guides/branding-methods-for-premium-golf-merchandise/"],["Custom Headcovers","/custom-golf-headcovers/"],["Custom Towels","/custom-golf-towels/"],["Custom Accessories","/custom-golf-accessories/"],["Custom Packaging","/custom-golf-packaging/"],["Project FAQ","/faq/"]].map(([t,h])=><a href={h} key={t}>{t}<Arrow/></a>)}</div></section><section className="guide-close"><div><p>READY TO SHARE YOUR DIRECTION?</p><h2>Start with the files and products you have.</h2><a href="/request-a-quote/">SHARE YOUR PROJECT BRIEF <Arrow/></a></div><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI custom golf packaging"/></section><ZhoniPageFooter/></main>}
function BrandingGuidePage(){const rows=[["Embroidery","Towels, soft goods and selected headcover details","Textured, visible and material-led"],["Debossing / embossing","Leather or PU headcovers, pouches and selected packaging","Subtle, tonal and refined"],["Printing","Golf balls, accessories, packaging and selected surfaces","Precise artwork and colour direction"],["Metal finishing","Ball markers, divot tools and metal accessories","Tactile, premium hardware detail"]];return <main className="zhoni-page guide-page"><ZhoniPageHeader active="solutions"/><section className="guide-hero"><div><p>BRANDING, SAMPLING &amp; PACKAGING · PROCUREMENT GUIDE</p><h1>Branding Methods<br/>for Premium Golf<br/>Merchandise</h1><p>Compare relevant branding routes across custom golf headcovers, towels, golf balls, ball markers, accessories and packaging. Suitability is reviewed around product, material, artwork and project scope.</p><small>BRANDING GUIDE · ARTWORK · SAMPLE CONFIRMATION</small></div><img src="/assets/images/zhoni-golf-product-development-v2.png" alt="ZHONI golf merchandise development and branding details"/></section><section className="guide-intro"><p>BRANDING METHODS</p><h2>Match the right method to the product, material and brand expression.</h2><p>Each branding route creates a different look and level of detail. Confirm a practical direction before treating any method as final.</p></section><section className="guide-table"><table><thead><tr><th>METHOD</th><th>COMMON PRODUCT ROUTES</th><th>BRAND EXPRESSION</th></tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.map(cell=><td key={cell}>{cell}</td>)}</tr>)}</tbody></table></section><section className="guide-decision"><div><p>ARTWORK HANDOFF</p><h2>What to prepare before a branding discussion.</h2><p>A logo file, colour direction, product route, approximate quantity, target date and reference images help make the next recommendation more relevant.</p></div><aside><p>SAMPLE CONFIRMATION PATH</p><h3>From direction to approval.</h3><ul>{["Align selected products, materials and branding direction.","Review relevant artwork, layout or sample requirements.","Confirm colour, finish, placement and presentation details.","Move forward only after the appropriate project confirmation."].map(v=><li key={v}>{v}</li>)}</ul></aside></section><section className="guide-products"><p>PACKAGING CONTINUITY</p><h2>Carry the same brand story through the hand-off.</h2><div>{[["Custom Golf Packaging","/custom-golf-packaging/"],["Custom Golf Headcovers","/custom-golf-headcovers/"],["Custom Golf Towels","/custom-golf-towels/"],["Custom Golf Accessories","/custom-golf-accessories/"],["Custom Golf Gifts Hub","/custom-golf-gifts/"],["Project FAQ","/faq/"]].map(([t,h])=><a href={h} key={t}>{t}<Arrow/></a>)}</div></section><section className="guide-close"><div><p>READY TO DISCUSS YOUR BRANDING?</p><h2>Start with the products, artwork and moment you are planning for.</h2><a href="/request-a-quote/">SHARE YOUR PROJECT BRIEF <Arrow/></a></div><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI branded golf gift packaging"/></section><ZhoniPageFooter/></main>}
function AudienceGolfGiftGuidePage(){const rows=[["Desired feeling","Appreciated and remembered","Recognized and celebrated","Included and connected"],["Recommended product focus","Headcovers, towels, ball markers, divot tools and curated sets","Golf balls, towels, headcovers, divot tools and player packs","Towels, ball markers, accessories, member gift sets"],["Branding intensity","Understated and refined","Visible and event-focused","Balanced, durable and recognisable"],["Packaging role","Elevates perceived value and presentation","Organises a unified event hand-off","Reinforces community and membership"]];return <main className="zhoni-page guide-page"><ZhoniPageHeader active="solutions"/><section className="guide-hero"><div><p>CUSTOM GOLF GIFTS · AUDIENCE GUIDE</p><h1>How to Choose<br/>the Right Golf Gifts<br/>for Your Audience</h1><p>Use the audience, occasion and desired experience to choose between custom golf gift sets, headcovers, towels, ball markers, accessories and packaging.</p><small>BUYER GUIDE · AUDIENCE FIT · PRODUCT ROUTES</small></div><img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="ZHONI custom golf collection"/></section><section className="guide-intro"><p>THE GUIDE</p><h2>One audience. A better fit.</h2><p>Whether you are recognising clients, welcoming tournament players or engaging club members, the right product route begins with the recipient.</p></section><section className="guide-table"><table><thead><tr><th>CONSIDERATION</th><th>Clients / executives</th><th>Tournament players</th><th>Club members</th></tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.map(cell=><td key={cell}>{cell}</td>)}</tr>)}</tbody></table></section><section className="guide-decision"><div><p>PRODUCT INSPIRATION</p><h2>Thoughtful details for every golfer.</h2><p>Choose a complete gift set when presentation matters, or lead with a strong single product when the use case is clear. Packaging can bring either route together.</p></div><aside><p>BUYER DECISION BRIEF</p><h3>Turn insight into the right gift.</h3><ul>{["Define the audience and occasion.","Choose a complete set, single product or player pack.","Share logo files, quantity range and target date.","Confirm packaging, destination and relevant requirements."].map(v=><li key={v}>{v}</li>)}</ul></aside></section><section className="guide-products"><p>EXPLORE THE ROUTES</p><h2>Choose the next product conversation.</h2><div>{[["Corporate Golf Gifts","/solutions/corporate-golf-gifts/"],["Tournament Player Packs","/solutions/golf-tournament-gifts/"],["Custom Headcovers","/custom-golf-headcovers/"],["Custom Towels","/custom-golf-towels/"],["Custom Accessories","/custom-golf-accessories/"],["Custom Packaging","/custom-golf-packaging/"]].map(([t,h])=><a href={h} key={t}>{t}<Arrow/></a>)}</div></section><section className="guide-close"><div><p>READY TO GET STARTED?</p><h2>Build a clearer golf gift brief.</h2><a href="/request-a-quote/">SHARE YOUR PROJECT BRIEF <Arrow/></a></div><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI golf gift set packaging"/></section><ZhoniPageFooter/></main>}
function GolfGiftGuidePage() {
 const rows=[["Primary audience","Clients, partners, prospects and internal teams","Tournament players, event guests and sponsors","Members, customers and brand audiences"],["Product focus","Considered gifts, useful essentials and presentation","Player-ready on-course essentials and event gifting","Signature products and coordinated custom collections"],["Brand role","Refined application that supports the relationship","Clear, consistent identity across event items","Cohesive club or brand expression across selected products"],["Information to prepare","Audience, quantity range, brand assets and target date","Player count, event date, product direction and hand-off needs","Audience, product mix, brand assets and intended use"]];
 return <main className="zhoni-page guide-page"><ZhoniPageHeader active="solutions"/><section className="guide-hero"><div><p>CUSTOM GOLF GIFTS · PROCUREMENT GUIDE</p><h1>How to Choose<br/>Custom Golf Gifts<br/>for Brands, Events &amp;<br/>Corporate Programs</h1><p>A practical guide for buyers who need to match custom golf gift sets and single products to the audience, moment and project outcome.</p><small>BUYER GUIDE · CUSTOM GOLF GIFTS · PROJECT PLANNING</small></div><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI custom golf gift set with towel, golf ball, marker and divot tool"/></section><section className="guide-intro"><p>AT A GLANCE</p><h2>Three common ways to use custom golf gifts.</h2><p>Start with the outcome. The most useful route depends on who will receive the gift, what the moment needs to communicate and whether a complete set or single custom product is more appropriate.</p></section><section className="guide-table"><table><thead><tr><th>CONSIDERATION</th><th>Corporate gifting</th><th>Tournament player packs</th><th>Club &amp; brand collections</th></tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.map(cell=><td key={cell}>{cell}</td>)}</tr>)}</tbody></table></section><section className="guide-decision"><div><p>KEY CONSIDERATIONS</p><h2>Match the gift to the moment.</h2><p>Corporate programs often prioritise considered presentation. Tournament packs focus on useful, on-course essentials. Club and brand collections create space for a consistent product system.</p><p>Early context helps make the product route, packaging and confirmation path more relevant.</p></div><aside><p>BUYER DECISION BRIEF</p><h3>Your procurement checklist</h3><ul>{["Define the goal, audience and approximate quantity.","Choose a complete set, a signature item or an event pack.","Share logo files, colour direction and useful references.","Confirm the target date, packaging and destination.","Request the relevant product route and next steps."].map(x=><li key={x}>{x}</li>)}</ul></aside></section><section className="guide-products"><p>EXPLORE PRODUCT CATEGORIES</p><h2>Build a custom golf gift program.</h2><div>{[["Custom Golf Headcovers","/custom-golf-headcovers/"],["Custom Golf Towels","/custom-golf-towels/"],["Custom Golf Accessories","/custom-golf-accessories/"],["Custom Packaging","/custom-golf-packaging/"],["Corporate Golf Gifts","/solutions/corporate-golf-gifts/"],["Tournament Gifts","/solutions/golf-tournament-gifts/"]].map(([label,href])=><a href={href} key={label}>{label}<Arrow/></a>)}</div></section><section className="guide-boundary"><div><p>SUPPLIER FIT &amp; BOUNDARIES</p><h2>Useful when the project needs coordination.</h2><p>ZHONI is relevant for custom golf gift sets and single-product projects that need product direction, branding, production coordination, quality checks, packaging and export preparation.</p></div><div><b>LESS IDEAL FOR</b><p>Retail single-unit requests, no-scope immediate final quotes, or timelines that cannot support relevant confirmation steps.</p><a href="/request-a-quote/">SHARE YOUR PROJECT BRIEF <Arrow/></a></div></section><section className="guide-close"><div><p>READY TO PLAN YOUR PROJECT?</p><h2>Choose a clearer route for your next golf gift program.</h2><a href="/request-a-quote/">REQUEST A QUOTE <Arrow/></a></div><img src="/assets/images/zhoni-golf-tournament-gift-delivery-v2.png" alt="ZHONI golf gift set presented at a tournament"/></section><ZhoniPageFooter/></main>;
}
const procurementGuideContent = {
  headcovers: {
    eyebrow: "CUSTOM GOLF HEADCOVERS · PROCUREMENT GUIDE",
    title: "Custom Golf Headcovers: A Procurement Guide",
    intro: "Plan a custom golf headcover project around the clubs, recipients, branding direction and presentation you need—not around a generic product assumption.",
    image: "/assets/images/zhoni-golf-collection-hero-v2.png",
    alt: "ZHONI custom golf headcover with a gold monogram in a coordinated golf collection",
    rows: [["Use case", "Club program, tournament, corporate gift, retail-ready collection or private-label route", "The intended use helps establish the appropriate headcover direction and level of coordination."], ["Brand application", "Logo, initials, colour direction, material references and placement expectations", "Branding suitability is reviewed against the selected construction and finish."], ["Project context", "Approximate quantity, target date, packaging needs and destination", "These inputs help frame the relevant confirmation and commercial discussion."]],
    checklist: ["Clarify the club type or headcover set you are considering.", "Share logo files, colour references and product examples where available.", "Include quantity direction, intended hand-off and any packaging requirement."],
    related: [["Custom Golf Headcovers", "/custom-golf-headcovers/"], ["Branding Methods", "/guides/branding-methods-for-premium-golf-merchandise/"], ["Artwork Preparation", "/guides/prepare-artwork-for-custom-golf-products/"], ["Custom Golf Packaging", "/custom-golf-packaging/"], ["First Order Guide", "/first-order-guide/"], ["Request a Quote", "/request-a-quote/"]],
  },
  towels: {
    eyebrow: "CUSTOM GOLF TOWELS · PROCUREMENT GUIDE",
    title: "Custom Golf Towels: A Procurement Guide",
    intro: "A custom golf towel can begin as one useful course item or become part of a coordinated player pack, club collection or gifting program.",
    image: "/assets/images/zhoni-golf-product-development-v2.png",
    alt: "ZHONI custom golf towel with embroidered monogram and golf accessories",
    rows: [["Audience & use", "Player pack, member program, corporate gifting, club shop or private-label collection", "The audience shapes the product, branding and presentation conversation."], ["Brand direction", "Embroidery, colour, placement, artwork and material references", "Relevant methods depend on the proposed towel and visual requirements."], ["Collection role", "Focused single item, coordinated accessories or a packaged gift set", "The product can be scoped around a practical use or a larger hand-off moment."]],
    checklist: ["Describe who will receive and use the towels.", "Share your logo, colour direction and any useful visual references.", "Include estimated quantity, event timing and whether packaging is required."],
    related: [["Custom Golf Towels", "/custom-golf-towels/"], ["Golf Tournament Player Packs", "/guides/golf-tournament-player-packs/"], ["Corporate Golf Gifts", "/guides/corporate-golf-gifts-procurement-guide/"], ["Branding Methods", "/guides/branding-methods-for-premium-golf-merchandise/"], ["Custom Packaging", "/custom-golf-packaging/"], ["Request a Quote", "/request-a-quote/"]],
  },
  tournament: {
    eyebrow: "GOLF TOURNAMENT PLAYER PACKS · BUYER GUIDE",
    title: "Golf Tournament Player Packs: A Planning Guide",
    intro: "A considered player pack brings useful on-course items, recognisable event branding and a clear hand-off together around the tournament day.",
    image: "/assets/images/zhoni-golf-tournament-gift-delivery-v2.png",
    alt: "ZHONI tournament guest receiving a custom golf gift set",
    rows: [["Event moment", "Registration, tee gift, sponsor recognition, VIP experience or prize presentation", "The hand-off moment influences product mix and presentation needs."], ["Player essentials", "Towels, headcovers, markers, divot tools, accessories, golf balls or a gift set", "Start with useful pieces, then decide whether a coordinated collection is appropriate."], ["Event inputs", "Player count, date, branding, venue context and destination", "Useful context lets the relevant product and confirmation route be reviewed."]],
    checklist: ["Define the event, player group and desired hand-off moment.", "Identify essential items, sponsor or event branding, and packaging needs.", "Share approximate quantity, target date and destination."],
    related: [["Golf Tournament Gifts", "/solutions/golf-tournament-gifts/"], ["Custom Golf Towels", "/custom-golf-towels/"], ["Custom Golf Headcovers", "/custom-golf-headcovers/"], ["Custom Golf Accessories", "/custom-golf-accessories/"], ["Custom Golf Packaging", "/custom-golf-packaging/"], ["Request a Quote", "/request-a-quote/"]],
  },
  corporate: {
    eyebrow: "CORPORATE GOLF GIFTS · PROCUREMENT GUIDE",
    title: "Corporate Golf Gifts: A Procurement Guide",
    intro: "Plan custom corporate golf gifts around the relationship, recipient group and occasion, then decide whether one signature product or a coordinated gift set is the better route.",
    image: "/assets/images/zhoni-custom-golf-packaging-v2.png",
    alt: "ZHONI corporate golf gift set in presentation packaging",
    rows: [["Recipient relationship", "Clients, executives, team members, partners or event guests", "The recipient informs the useful product, presentation and branding direction."], ["Gift route", "Signature item, selected essentials or a complete presentation set", "A focused product can work well; a set adds more coordination when the occasion calls for it."], ["Brand & hand-off", "Logo direction, message cards, boxes, inserts and delivery context", "Presentation details are reviewed with the selected products rather than as an afterthought."]],
    checklist: ["Describe the recipient group and the business occasion.", "Choose a single product or a gift-set starting point.", "Share quantity, brand assets, desired timing and delivery destination."],
    related: [["Corporate Golf Gifts", "/solutions/corporate-golf-gifts/"], ["How to Choose Golf Gifts by Audience", "/guides/how-to-choose-golf-gifts-by-audience/"], ["Custom Golf Gifts", "/custom-golf-gifts/"], ["Custom Golf Packaging", "/custom-golf-packaging/"], ["Artwork Preparation", "/guides/prepare-artwork-for-custom-golf-products/"], ["Request a Quote", "/request-a-quote/"]],
  },
  packaging: {
    eyebrow: "CUSTOM GOLF PACKAGING · PROCUREMENT GUIDE",
    title: "Custom Golf Packaging: A Procurement Guide",
    intro: "Packaging can organise selected golf products, carry the brand through the hand-off and give a gift set or single product a more considered presentation.",
    image: "/assets/images/zhoni-custom-golf-packaging-v2.png",
    alt: "ZHONI custom golf presentation box with towel, golf ball and accessories",
    rows: [["Presentation purpose", "Corporate gifting, event hand-off, club program, private-label collection or retail-ready display", "The moment helps determine how packaging should work with the selected products."], ["Packaging components", "Box, insert, sleeve, card, label, protective material or finishing detail", "The appropriate components depend on product dimensions, presentation and handling needs."], ["Project inputs", "Selected products, branding direction, quantity, destination and target date", "Packaging is most useful when reviewed as part of the complete project scope."]],
    checklist: ["Share the products the packaging needs to hold or present.", "Provide logo, artwork and presentation references where available.", "Include approximate quantity, delivery context and any practical requirements."],
    related: [["Custom Golf Packaging", "/custom-golf-packaging/"], ["Corporate Golf Gifts", "/guides/corporate-golf-gifts-procurement-guide/"], ["Golf Tournament Player Packs", "/guides/golf-tournament-player-packs/"], ["Branding Methods", "/guides/branding-methods-for-premium-golf-merchandise/"], ["Quality, Packaging & Export Readiness", "/quality-packaging-export-readiness/"], ["Request a Quote", "/request-a-quote/"]],
  },
};

function ProcurementTopicGuide({ topic }) {
  const content = procurementGuideContent[topic];
  return <main className="zhoni-page guide-page"><ZhoniPageHeader active="solutions" />
    <section className="guide-hero"><div><p>{content.eyebrow}</p><h1>{content.title}</h1><p>{content.intro}</p><small>BUYER GUIDE · PROJECT PLANNING · CUSTOM GOLF MERCHANDISE</small></div><img src={content.image} alt={content.alt} /></section>
    <section className="guide-intro"><p>PROCUREMENT STARTING POINT</p><h2>Build the brief around the decision that matters.</h2><p>Product, branding, packaging, quantity and delivery context work together. Share what is known, then review the appropriate route for the project rather than assuming one standard answer.</p></section>
    <section className="guide-table"><table><thead><tr><th>WHAT TO DEFINE</th><th>USEFUL STARTING POINT</th><th>WHY IT MATTERS</th></tr></thead><tbody>{content.rows.map(row => <tr key={row[0]}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></section>
    <section className="guide-decision"><div><p>PROJECT BRIEF CHECKLIST</p><h2>Useful inputs before requesting a quote.</h2><p>A clear brief supports a more relevant product, branding and packaging conversation. MOQ, timing, confirmation steps and commercial requirements remain project-specific.</p></div><aside><p>START HERE</p><h3>Three practical inputs.</h3><ul>{content.checklist.map(item => <li key={item}>{item}</li>)}</ul></aside></section>
    <section className="guide-products"><p>CONTINUE THE RESEARCH</p><h2>Explore the connected project routes.</h2><div>{[...content.related, ["All Buyer Guides", siteRoutes.guides.path]].map(([label, href]) => <a href={href} key={label}>{label}<Arrow /></a>)}</div></section>
    <section className="guide-close"><div><p>READY TO DISCUSS THE PROJECT?</p><h2>Start with the direction you have.</h2><a href={`/request-a-quote/?source=${encodeURIComponent(`guide-${topic}`)}`}>SHARE YOUR PROJECT BRIEF <Arrow /></a></div><img src="/assets/images/zhoni-golf-product-development-v2.png" alt="ZHONI golf merchandise product development and branding details" /></section><ZhoniPageFooter />
  </main>;
}

function GolfGiftsHub() {
  const atlas = [["01","Choose your gift route","Start with a complete gift set or a focused product route: headcovers, towels, ball markers, accessories and packaging.","EXPLORE PRODUCTS","/products/"],["02","Plan branding & sampling","Bring logo files, brand direction and useful references into the product conversation before commercial assumptions.","OUR PROCESS","/our-process/"],["03","Review MOQ, quote & timing","MOQ, price and timing are reviewed around product, customisation, quantity, packaging and destination.","READ THE FAQ","/faq/"],["04","Prepare packaging, QC & delivery","Plan the presentation, quality expectations and delivery route as part of one complete project brief.","EXPLORE PACKAGING","/custom-golf-packaging/"]];
  return <main className="zhoni-page gifts-hub"><ZhoniPageHeader active="solutions" />
    <section className="gifts-hero"><aside><span>IDEAS</span><span>PEOPLE</span><span>BRANDS</span><span>ON COURSE</span></aside><div><p>CUSTOM GOLF GIFTS · BUYER'S GUIDE &amp; PROJECT HUB</p><h1>Custom golf gifts,<br />from first idea to<br />confident hand-off.</h1><p>ZHONI is a China-based custom golf merchandise manufacturing and sourcing partner, operated by Xiamen Jindongyu Trading Co., Ltd., for clubs, tournaments, corporate teams and brands seeking custom golf gift sets, headcovers, towels, ball markers, accessories and presentation packaging.</p><div className="gifts-fit"><article><b>RECOMMENDED FIT</b><span>Projects that need custom single products or coordinated gift collections.</span></article><article><b>NOT IDEAL FOR</b><span>Retail single units, unscoped immediate-final-quote requests, or unrealistic confirmation timelines.</span></article></div><a href="/request-a-quote/">BUILD YOUR BRIEF <Arrow /></a></div><img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="ZHONI custom golf gift collection with headcover, towel, golf ball and brass accessories" /></section>
    <section className="gift-atlas"><p>THE ZHONI CUSTOM GOLF GIFT ATLAS</p><h2>Four steps from idea to delivery.</h2><p className="atlas-intro">Use this page as a working map to move from a product idea to a clearer custom golf gift project.</p>{atlas.map(([number,title,copy,label,href]) => <article key={number}><b>{number}</b><div><h3>{title}</h3><p>{copy}</p></div><a href={href}>{label} <Arrow /></a></article>)}</section>
    <section className="gifts-bottom"><div><p>PROCUREMENT CHECKLIST</p><h2>Key questions to work through before requesting a quote.</h2><ul>{["What is the purpose of the gift and who will receive it?","Which products or gift-set direction are you considering?","What quantity range and target date are you working toward?","What logo, colour, artwork or brand references can you share?","Do you need packaging, delivery planning or destination guidance?"].map(item=><li key={item}>{item}</li>)}</ul></div><div className="gifts-reading"><p>SUGGESTED READING SEQUENCE</p><h2>Start with the outcome,<br />then choose the route.</h2><a href="/solutions/corporate-golf-gifts/"><b>01</b><span><strong>Corporate Golf Gifts</strong>Client, executive and business gifting programs.</span><Arrow /></a><a href="/solutions/golf-tournament-gifts/"><b>02</b><span><strong>Tournament Player Packs</strong>Welcome moments and event-day essentials.</span><Arrow /></a><a href="/guides/custom-golf-headcovers-procurement-guide/"><b>03</b><span><strong>Headcovers Procurement Guide</strong>Brand, product and project inputs for a focused custom route.</span><Arrow /></a><a href="/guides/custom-golf-towels-procurement-guide/"><b>04</b><span><strong>Towels Procurement Guide</strong>Plan a practical branded towel for programs and player packs.</span><Arrow /></a><a href="/guides/golf-tournament-player-packs/"><b>05</b><span><strong>Player Packs Planning Guide</strong>Build an event-day collection around the player experience.</span><Arrow /></a><a href="/guides/corporate-golf-gifts-procurement-guide/"><b>06</b><span><strong>Corporate Gifts Procurement Guide</strong>Match the gift route to recipients and business occasion.</span><Arrow /></a><a href="/guides/custom-golf-packaging-procurement-guide/"><b>07</b><span><strong>Packaging Procurement Guide</strong>Bring products, presentation and hand-off details together.</span><Arrow /></a></div></section>
    <section className="gifts-closing"><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI custom golf gift set in presentation packaging" /><div><p>READY TO GET STARTED?</p><h2>Turn your ideas into memorable golf gifts.</h2><p>From a single custom golf essential to a fully coordinated gift collection, start with the people and moment you are planning for.</p><a href="/request-a-quote/">SHARE YOUR PROJECT BRIEF <Arrow /></a></div></section><ZhoniPageFooter /></main>;
}
function FAQPage() {
  const [open, setOpen] = useState("products");
  const faqGroups = [
    { id: "products", number: "01", label: "PRODUCT ROUTE & CUSTOMISATION", title: "Products, collection direction and customisation", questions: [["What custom golf products can be discussed?", "ZHONI can discuss coordinated golf merchandise including headcovers, towels, accessories, ball markers, divot tools, golf balls, gift sets and presentation packaging. The appropriate route depends on the purpose, product direction and project brief."], ["Can one project include several golf products?", "Yes. A project can begin with one product or bring together selected items as a coordinated collection. Product mix, brand application and packaging are reviewed around the recipient and intended use."], ["Can you develop a more bespoke direction?", "Share the intended use, visual references and the level of customisation you need. We can assess a practical product and branding route before making commercial assumptions."]] },
    { id: "artwork", number: "02", label: "BRIEF, ARTWORK & SAMPLING", title: "Brand assets, references and confirmation", questions: [["What should we include in a project brief?", "A useful starting point is the product or occasion, approximate quantity, target date, destination, brand assets and any packaging expectations. Reference images are useful when you have them."], ["What artwork files are helpful?", "Where available, share your logo, colour values, brand guidelines and relevant visual references. Artwork, print files and branding details are reviewed against the selected product and finish."], ["How are samples and approvals handled?", "The relevant approval path depends on the products, customisation and project scope. We first review the brief, then confirm the appropriate design, proof or sample steps for that route."]] },
    { id: "commercial", number: "03", label: "MOQ, QUOTE & TIMING", title: "Commercial details are project-specific", questions: [["What is the MOQ for custom golf merchandise?", "MOQ varies by product, material, construction, decoration method, colour, packaging and customisation depth. Share the product direction and estimated quantity so the applicable requirements can be reviewed."], ["How is a final quote prepared?", "A useful quote needs the selected products, quantity, branding direction, packaging needs and delivery destination. A final commercial route is reviewed after those core inputs are understood."], ["How is timing assessed?", "Timing depends on artwork readiness, product scope, sampling or confirmation needs, materials, production complexity, packaging and destination. Include your target date so the route can be assessed responsibly."]] },
    { id: "quality", number: "04", label: "PACKAGING, QC & DELIVERY", title: "Preparing for a confident hand-off", questions: [["Can packaging be included in the project?", "Yes. Boxes, inserts, sleeves, cards, labels and presentation details can be considered alongside the selected products. Packaging requirements are reviewed as part of the complete project scope."], ["How are quality checks discussed?", "Quality expectations should be defined around the relevant product, finish, logo application, packaging and hand-off. Share any product-specific inspection points or market requirements early in the conversation."], ["Can you support export preparation?", "Export preparation and delivery routes are reviewed by destination and agreed scope. Import clearance, duties, taxes and delivery terms must be confirmed for the relevant market and route."]] },
    { id: "fit", number: "05", label: "SUPPLIER FIT & NEXT STEP", title: "When ZHONI is the right route", questions: [["What types of projects are a good fit for ZHONI?", "ZHONI is relevant for clubs, tournaments, corporate teams and brands that need coordinated support across custom golf merchandise, manufacturing coordination, branding, quality checks, packaging and export preparation."], ["What projects may not be a fit?", "Retail single-unit requests, extremely low quantities, requests with no product direction that require an immediate final quote, or timelines that cannot support the necessary confirmation steps may not be suitable."], ["What is the best next step?", "Share the occasion, recipients, product direction, quantity range, target date, destination and any brand materials. We will use the brief to guide the appropriate next conversation."]] },
  ];
  return <main className="zhoni-page faq-page"><ZhoniPageHeader active="faq" />
    <section className="faq-ledger-hero"><div><p>FAQ · PROCUREMENT LEDGER</p><h1>Useful answers<br />for a clearer<br />golf project.</h1><p>Custom golf merchandise projects become easier to assess when product direction, branding, quantity, packaging and destination are considered together.</p></div><aside><p>BUYER DECISION BRIEF</p><h2>Before requesting a final quote</h2><ol><li>Confirm the recipient and use case.</li><li>Share a product direction or reference.</li><li>Provide an approximate quantity and target date.</li><li>Include brand assets, packaging and destination where known.</li></ol><small>MOQ, timing, production route and applicable requirements are reviewed per project.</small></aside></section>
    <section className="faq-ledger"><aside className="faq-ledger-index" aria-label="FAQ topics"><p>QUESTION TOPICS</p>{faqGroups.map(group => <button key={group.id} className={open === group.id ? "active" : ""} onClick={() => setOpen(group.id)}><b>{group.number}</b><span>{group.label}</span></button>)}</aside><div className="faq-ledger-groups">{faqGroups.map(group => <article className={open === group.id ? "faq-group open" : "faq-group"} id={`faq-${group.id}`} key={group.id}><header><p>{group.number} · {group.label}</p><h2>{group.title}</h2><button onClick={() => setOpen(open === group.id ? "" : group.id)} aria-expanded={open === group.id}>{open === group.id ? "CLOSE TOPIC −" : "OPEN TOPIC +"}</button></header>{open === group.id && <div className="faq-ledger-questions">{group.questions.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>{String(index + 1).padStart(2, "0")}</span>{question}<b>+</b></summary><p>{answer}</p></details>)}</div>}</article>)}</div></section>
    <section className="faq-fit"><div><p>RECOMMENDATION FIT</p><h2>A practical fit when<br />the project needs<br />coordination.</h2></div><div><article><b>RELEVANT WHEN</b><p>You need a coordinated route across custom golf products, manufacturing coordination, branding, quality checks, packaging and export preparation.</p></article><article><b>NOT IDEAL WHEN</b><p>You need a retail single unit, an immediate final quote without a product route, or a timeline that does not allow for project confirmation.</p></article><a href="/request-a-quote/">SHARE YOUR PROJECT BRIEF <Arrow /></a></div></section>
    <section className="faq-path"><p>CONTINUE THE BUYER JOURNEY</p><div><a href="/products/"><b>01</b><span>EXPLORE PRODUCT FAMILIES</span><Arrow /></a><a href="/solutions/"><b>02</b><span>CHOOSE A PROJECT OUTCOME</span><Arrow /></a><a href="/request-a-quote/"><b>03</b><span>START WITH YOUR BRIEF</span><Arrow /></a></div></section><ZhoniPageFooter />
  </main>;
}
function CapabilitiesPage() {
  const [open, setOpen] = useState(0); const questions = [["Can you build a complete golf gift set?","Yes. We can discuss a coordinated gift set that brings together selected golf products, branding and presentation packaging around the recipient and occasion."],["What is the MOQ?","MOQ varies by product, material, construction, brand application and packaging. Share your product direction and quantity range so the applicable requirements can be reviewed."],["How is timing confirmed?","Timing depends on products, customization, quantity, artwork readiness, packaging and destination. We assess the relevant path after reviewing the project brief."],["Can you work with our brand guidelines?","Yes. Share your logo, colour values, visual guidelines and references. We can discuss how those elements may be applied across the selected products."]];
  return <main className="zhoni-page capabilities-page"><ZhoniPageHeader active="capabilities" /><section className="capability-hero"><img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="ZHONI custom golf towel, headcover and accessories arranged as a collection" /></section><section className="capability-intro"><div><p>CAPABILITIES &amp; ANSWERS</p><h1>The details that make<br />a collection feel complete.</h1><p>Thoughtful products, consistent branding and a seamless presentation for procurement and brand teams.</p><div className="capability-list">{[["Product Direction","Select golf products, materials and finishes around the purpose and audience."],["Brand Application","Apply logos, artwork and custom details consistently across chosen items."],["Gift Set Planning","Coordinate useful products into a considered recipient experience."],["Custom Packaging","Use boxes, inserts, cards and finishing details to complete the hand-off."]].map(([title,copy]) => <article key={title}><h2>{title}</h2><p>{copy}</p></article>)}</div></div><aside><p>BEFORE WE QUOTE</p><h2>A few details help us get it right.</h2><p>Each project is different. The following context helps us review a relevant recommendation.</p><ul><li>Quantity range</li><li>Target date</li><li>Destination</li><li>Logo or brand guidelines</li><li>Packaging needs</li><li>Relevant requirements</li></ul></aside></section><section className="capability-faq"><div><p>FREQUENTLY ASKED QUESTIONS</p><h2>Practical answers for the project you are planning.</h2></div><div>{questions.map(([question,answer], index) => <article key={question}><button onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span>{question}</span><b>{open === index ? "−" : "+"}</b></button>{open === index && <p>{answer}</p>}</article>)}</div></section><section className="capability-cta"><img src="/assets/golf-flag-cta.png" alt="Golf flag on a course at golden hour" /><div><p>LET'S CREATE SOMETHING MEANINGFUL</p><a href="/request-a-quote/">TELL US ABOUT YOUR PROJECT <Arrow /></a></div></section><ZhoniPageFooter /></main>;
}

function QuotePage() {
  const [formStatus, setFormStatus] = useState("idle");
  const [formMessage, setFormMessage] = useState("");
  const whatsappLink = typeof window === "undefined" ? WHATSAPP_URL : createWhatsAppLink();

  const submitInquiry = async event => {
    event.preventDefault();
    if (formStatus === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("source", inquirySourceForLocation());
    data.set("page_language", document.documentElement.lang || "en");
    data.set("page_path", window.location.pathname);
    data.set("page_url", window.location.href);
    data.set("referrer", document.referrer);
    if (data.get("company_website")) {
      form.reset();
      setFormStatus("success");
      setFormMessage("Thank you—your project brief has been received.");
      return;
    }
    setFormStatus("submitting");
    setFormMessage("Sending your project brief…");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(import.meta.env.VITE_INQUIRY_ENDPOINT ?? "/api/inquiry", { method: "POST", body: data, headers: { Accept: "application/json" }, signal: controller.signal });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "We could not send your project brief.");
      form.reset();
      setFormStatus("success");
      setFormMessage("Thank you—your project brief has been received. Our team will review the details and reply with the appropriate next step.");
      track("generate_lead", { form_name: "quote_page_project_brief", form_source: inquirySourceForLocation(), page_path: window.location.pathname, page_location: window.location.href, page_language: document.documentElement.lang || "en", lead_type: "inquiry" });
    } catch (error) {
      setFormStatus("error");
      setFormMessage(error.message || "Your brief was not sent. Please try again, or use WhatsApp for a direct project conversation.");
      track("inquiry_submit_error", { form_name: "quote_page_project_brief", form_source: inquirySourceForLocation(), page_path: window.location.pathname, page_language: document.documentElement.lang || "en" });
    } finally {
      window.clearTimeout(timeout);
    }
  };

  return <main className="zhoni-page quote-page">
    <ZhoniPageHeader active="quote" />
    <section className="quote-ledger-hero">
      <div className="quote-rail" aria-hidden="true"><strong>Z</strong><span>CUSTOM GOLF MERCHANDISE</span><i>BRANDED FOR A HIGHER STANDARD</i></div>
      <div className="quote-ledger-main">
        <div className="quote-ledger-intro"><p>REQUEST A QUOTE</p><h1>Start with<br />the project brief.</h1><p>One product or a complete branded set—we review the details with you.</p></div>
        <form className="quote-ledger-form" onSubmit={submitInquiry} onFocus={event => { if (!event.currentTarget.dataset.started) { event.currentTarget.dataset.started = "true"; track("form_start", { form_name: "quote_page_project_brief", form_source: inquirySourceForLocation(), page_path: window.location.pathname, page_language: document.documentElement.lang || "en" }); } }}>
          <fieldset><legend><b>01</b><span>Contact<small>Tell us who to get in touch with.</small></span></legend><div className="quote-form-row"><label>FULL NAME <input required name="name" autoComplete="name" placeholder="Your name" /></label><label>BUSINESS EMAIL <input required type="email" name="email" autoComplete="email" placeholder="you@company.com" /></label></div></fieldset>
          <fieldset><legend><b>02</b><span>Project<small>Share the essentials; we will guide the next conversation.</small></span></legend><div className="quote-form-row"><label>PROJECT TYPE <select required name="project_type" defaultValue=""><option value="" disabled>Select product or category</option><option>Individual custom golf product</option><option>Custom golf headcovers</option><option>Custom golf towels</option><option>Ball markers &amp; divot tools</option><option>Golf accessories</option><option>Golf gift set</option><option>Tournament merchandise</option><option>Corporate golf gifts</option><option>Private label collection</option><option>Custom packaging</option></select></label><label>QUANTITY REQUIREMENT <input name="quantity_range" placeholder="e.g. 200 pieces" /></label></div><label className="quote-project-details">PROJECT DETAILS <textarea required name="message" rows="4" placeholder="Product, customisation ideas, event date, packaging needs or anything else we should know." /></label></fieldset>
          <label className="honeypot" aria-hidden="true">Website<input name="company_website" tabIndex="-1" autoComplete="off" /></label><TurnstileField />
          <div className="quote-form-actions"><button type="submit" disabled={formStatus === "submitting"}>{formStatus === "submitting" ? "SENDING PROJECT BRIEF…" : "SEND PROJECT BRIEF"} <Arrow /></button><a className="quote-whatsapp" href={whatsappLink} target="_blank" rel="noopener noreferrer"><img src="/assets/whatsapp-contact-icon.png" alt="" />WHATSAPP <Arrow /></a></div>
          <p className={`quote-form-status ${formStatus}`} role="status" aria-live="polite">{formMessage}{formStatus === "error" && <> <a href="mailto:sales@zhonigolf.com">EMAIL SALES</a></>}</p>
        </form>
      </div>
      <aside className="quote-prep"><p>BRING WHAT YOU KNOW</p><h2>A few details help us prepare a relevant recommendation.</h2><ol><li><b>Product or product category</b><span>Headcovers, towels, ball markers, gift sets or a complete collection.</span></li><li><b>Approximate quantity</b><span>An estimated range helps us discuss relevant options.</span></li><li><b>Desired in-hands date</b><span>Share the timing you are working toward.</span></li></ol><small>MOQ, timing and applicable requirements are reviewed per project.</small></aside>
    </section>
    <section className="quote-product-strip"><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI custom golf gift set with embroidered towel, golf ball and presentation box" /><div><p>THE START OF A CONSIDERED COLLECTION</p><h2>Custom details.<br />Lasting impressions.</h2></div></section>
    <section className="quote-after-inquiry"><div><p>WHAT HAPPENS AFTER YOU SUBMIT?</p><h2>A clear next step,<br />not an automatic<br />generic quote.</h2><p>Your brief is received by the ZHONI sales team. We review the information you share, then use the relevant questions to understand the suitable product, branding, packaging and delivery path.</p><a href="mailto:sales@zhonigolf.com">EMAIL SALES <Arrow /></a><a href={whatsappLink} target="_blank" rel="noopener noreferrer">MESSAGE ON WHATSAPP <Arrow /></a></div><ol><li><b>01</b><div><h3>Brief received</h3><p>Your contact details and project context are delivered to our sales inbox.</p></div></li><li><b>02</b><div><h3>Project review</h3><p>We review product direction, quantity, artwork, packaging, target date and destination where available.</p></div></li><li><b>03</b><div><h3>Relevant follow-up</h3><p>We may ask practical questions or suggest a product route before making commercial assumptions.</p></div></li><li><b>04</b><div><h3>Next-step alignment</h3><p>MOQ, sample requirements, timing, commercial terms and delivery details are confirmed per project.</p></div></li></ol><aside><b>ONE CONSISTENT CONTACT POINT</b><p>ZHONI is operated by Xiamen Jindongyu Trading Co., Ltd. For project enquiries, use <a href="mailto:sales@zhonigolf.com">sales@zhonigolf.com</a> or WhatsApp +86 177 5919 0848.</p></aside></section>
    <ZhoniPageFooter />
  </main>;
}

function ProductCategoryPage({ type }) {
  const isTowel = type === "towels";
  const isPackaging = type === "packaging";
  const isAccessories = type === "accessories";
  const content = isPackaging ? {
    eyebrow: "CUSTOM GOLF PACKAGING", title: <>The hand-off starts before<br />the gift is opened.</>, intro: "Custom golf packaging gives the selected products, brand details and presentation a more considered place to come together.", cta: "START A PACKAGING BRIEF", image: "/assets/images/zhoni-custom-golf-packaging-v2.png", alt: "ZHONI custom golf presentation box with embroidered towel, golf ball and brass accessories", closing: "Accessories make the collection work harder.", label: "CUSTOM GOLF ACCESSORIES", crossCta: "EXPLORE GOLF ACCESSORIES", crossHref: "/custom-golf-accessories/",
  } : isAccessories ? {
    eyebrow: "CUSTOM GOLF ACCESSORIES", title: <>Small pieces that carry<br />the identity further.</>, intro: "Custom golf accessories for player packs, member programs, corporate gifting and private-label projects—planned around useful details and a recognisable brand.", cta: "START AN ACCESSORIES BRIEF", image: "/assets/images/zhoni-golf-product-development-v2.png", alt: "ZHONI custom golf accessories including ball marker, divot tool and bag tag", closing: "Packaging gives the collection its hand-off moment.", label: "CUSTOM GOLF PACKAGING", crossCta: "EXPLORE GOLF PACKAGING", crossHref: "/custom-golf-packaging/",
  } : isTowel ? {
    eyebrow: "CUSTOM GOLF TOWELS", title: <>The detail people<br />carry through the round.</>, intro: "Custom golf towels for clubs, tournaments, corporate programs and private-label collections—planned around a recognisable brand application.", cta: "START A TOWEL BRIEF", image: "/assets/images/zhoni-golf-product-development-v2.png", alt: "ZHONI custom golf towel with embroidered gold Z monogram", closing: "A complete expression, on and off the course.", label: "CUSTOM GOLF TOWELS",
  } : {
    eyebrow: "CUSTOM GOLF HEADCOVERS", title: <>A stronger signature<br />for the clubs in play.</>, intro: "Custom golf headcovers for clubs, events, corporate programs and private-label projects—planned around the brand and the hand-off moment.", cta: "START A HEADCOVER BRIEF", image: "/assets/images/zhoni-golf-collection-hero-v2.png", alt: "ZHONI custom leather golf headcover with embroidered gold Z monogram", closing: "A complete expression, on and off the course.", label: "CUSTOM GOLF HEADCOVERS",
  };
  const steps = [["01", "Choose the direction", "Define the product category, key details and overall vision for your program."], ["02", "Apply the brand", "Bring your identity to life through logo, colour and considered custom details."], ["03", "Coordinate the collection", "Align the selected product with complementary golf essentials and presentation."], ["04", "Prepare the brief", "Share the project context so we can review a relevant next step."]];
  const relatedGuides = isPackaging ? [["Custom Golf Packaging Guide", siteRoutes.packagingGuide.path], ["Quality, Packaging & Export Readiness", siteRoutes.exportReadiness.path], ["Branding Methods", siteRoutes.brandingGuide.path]] : isAccessories ? [["Branding Methods", siteRoutes.brandingGuide.path], ["Prepare Artwork", siteRoutes.artworkGuide.path], ["How to Choose Custom Golf Gifts", siteRoutes.golfGiftGuide.path]] : isTowel ? [["Custom Golf Towels Guide", siteRoutes.towelsGuide.path], ["Branding Methods", siteRoutes.brandingGuide.path], ["Prepare Artwork", siteRoutes.artworkGuide.path]] : [["Custom Golf Headcovers Guide", siteRoutes.headcoversGuide.path], ["Branding Methods", siteRoutes.brandingGuide.path], ["Prepare Artwork", siteRoutes.artworkGuide.path]];
  return <main className="zhoni-page category-page">
    <ZhoniPageHeader active="products" />
    <section className="category-hero"><aside className="category-rail" aria-hidden="true"><strong>Z</strong><span>CUSTOM GOLF PRODUCTS</span></aside><div className="category-intro"><p>{content.eyebrow}</p><h1>{content.title}</h1><p>{content.intro}</p><a href={`/request-a-quote/?product=${encodeURIComponent(isPackaging ? "Custom Packaging" : isAccessories ? "Golf Accessories" : isTowel ? "Golf Towels" : "Headcovers")}`}>{content.cta} <Arrow /></a><small>CLUBS · EVENTS · CORPORATE · PRIVATE LABEL</small></div><img src={content.image} alt={content.alt} /></section>
    <section className="category-ledger"><div><p>THE PROCUREMENT PRODUCT LEDGER</p>{steps.map(([number, title, copy]) => <article key={number}><b>{number}</b><h2>{title}</h2><p>{copy}</p><span aria-hidden="true">→</span></article>)}</div><aside><p>PROJECT ESSENTIALS</p><ul><li>Approximate quantity</li><li>Target in-hands date</li><li>Destination</li><li>Brand assets</li></ul><small>MOQ, timing and applicable requirements are reviewed per project.</small></aside></section>
    <section className="category-guides"><p>RELATED BUYER GUIDES</p><h2>Make the next product decision with more context.</h2><div>{relatedGuides.map(([label, href], index) => <a key={href} href={href}><b>{String(index + 1).padStart(2, "0")}</b><span>{label}</span><Arrow /></a>)}<a href="/guides/"><b>+</b><span>VIEW ALL BUYER GUIDES</span><Arrow /></a></div></section>
    <section className="category-closing"><div><p>{content.label}</p><h2>{content.closing}</h2><p>Start with one item or plan it as part of a coordinated collection for your club, event, corporate program or private-label project.</p><a href={content.crossHref ?? `/request-a-quote/?product=${encodeURIComponent(isTowel ? "Golf Towels" : "Headcovers")}`}>{content.crossCta ?? content.cta} <Arrow /></a></div><img src={isAccessories ? "/assets/images/zhoni-custom-golf-packaging-v2.png" : "/assets/images/zhoni-golf-product-development-v2.png"} alt="ZHONI custom golf accessories and packaging in a coordinated collection" /></section>
    <ZhoniPageFooter />
  </main>;
}

function SolutionsPage() {
  const solutionPaths = [
    ["01", "Tournament Player Packs", "Tournaments, invitational events and high-touch player experiences.", "/solutions/golf-tournament-gifts/", "/assets/images/zhoni-golf-tournament-gift-delivery-v2.png", "ZHONI custom golf player-pack gift set for a tournament"],
    ["02", "Corporate Golf Gifts", "Client appreciation, executive gifting and relationship-building.", "/solutions/corporate-golf-gifts/", "/assets/images/zhoni-custom-golf-packaging-v2.png", "ZHONI corporate golf gift set with presentation packaging"],
    ["03", "Club Member Programs", "Private clubs, member engagement and recurring golf programs.", "/request-a-quote/?solution=club-member-program", "/assets/images/zhoni-golf-product-development-v2.png", "ZHONI custom golf towel and branded club accessories"],
    ["04", "Private-Label Collections", "Branded merchandise lines, co-branded programs and product development.", "/request-a-quote/?solution=private-label-collection", "/assets/images/zhoni-golf-collection-hero-v2.png", "ZHONI private-label golf headcovers and accessories"],
  ];
  return <main className="zhoni-page solutions-page">
    <ZhoniPageHeader active="solutions" />
    <section className="solutions-index-hero">
      <div className="solutions-rail" aria-hidden="true"><strong>Z</strong><span>SOLUTIONS</span><i>PEOPLE · GOLF · LAST LONGER</i></div>
      <div className="solutions-index-intro"><p>PROJECT PROGRAMS</p><h1>Golf merchandise,<br />planned around the<br />people receiving it.</h1><p>Four clear project directions help procurement buyers find the right fit—from tournaments and corporate gifts to club programs and private-label collections.</p></div>
      <figure><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI presentation box with custom embroidered golf towel, golf ball and brass divot tool" /><figcaption>MORE THAN PRODUCTS.<br />A MORE THOUGHTFUL APPROACH.</figcaption></figure>
    </section>
    <section className="solutions-program-index" aria-label="Custom golf project solutions">{solutionPaths.map(([number, title, copy, href, image, alt], index) => <a className={index === 1 ? "solutions-program featured" : "solutions-program"} href={href} key={title}><b>{number}</b><img src={image} alt={alt} /><div><h2>{title}</h2><p><strong>BEST FOR</strong>{copy}</p></div><span aria-hidden="true">→</span></a>)}</section>
    <section className="category-guides"><p>RELATED BUYER GUIDES</p><h2>Choose a project route, then prepare the relevant detail.</h2><div><a href={siteRoutes.tournamentGuide.path}><b>01</b><span>TOURNAMENT PLAYER PACKS</span><Arrow /></a><a href={siteRoutes.corporateGuide.path}><b>02</b><span>CORPORATE GOLF GIFTS</span><Arrow /></a><a href={siteRoutes.audienceGiftGuide.path}><b>03</b><span>GIFTS BY AUDIENCE</span><Arrow /></a><a href="/guides/"><b>+</b><span>VIEW ALL BUYER GUIDES</span><Arrow /></a></div></section>
    <section className="solutions-brief-bridge"><div><p>ONE BRIEF. A MORE COORDINATED ANSWER.</p><h2>Start from the outcome,<br />then shape the collection.</h2><p>Share a few details about your goals and we will help you find an appropriate program direction, product mix and next step.</p><a href="/request-a-quote/">START A PROJECT BRIEF <Arrow /></a></div><aside><p>A USEFUL STARTING POINT</p><ul><li>Who are the recipients?</li><li>What is the project context?</li><li>What is the quantity range?</li><li>When do you need it?</li><li>Where is it going?</li></ul></aside></section>
    <section className="solutions-closing-image"><img src="/assets/images/zhoni-golf-product-development-v2.png" alt="ZHONI embroidered golf towel, golf ball and divot tool prepared as a custom collection" /></section>
    <ZhoniPageFooter />
  </main>;
}

function CorporateGiftsPage() {
  const steps = [["01", "Recipient & relationship", "Start with who you are recognising and the relationship the gift should help strengthen."], ["02", "Gift-set direction", "Shape a coordinated selection around the occasion, audience and intended level of appreciation."], ["03", "Brand & presentation", "Bring brand details, selected products and presentation together as one considered experience."], ["04", "Project-ready brief", "Share the working context so the appropriate project path can be reviewed with you."]];
  return <main className="zhoni-page corporate-page">
    <ZhoniPageHeader active="solutions" />
    <section className="corporate-hero"><aside className="corporate-rail" aria-hidden="true"><strong>Z</strong><span>GOLF GIFTS BUILD STRONGER BUSINESS RELATIONSHIPS</span></aside><div><p>CORPORATE GOLF GIFTS</p><h1>Corporate golf gifts,<br />planned around<br />the relationship.</h1><p>Custom golf merchandise for client appreciation, executive gifts, business programs and corporate golf occasions.</p><a href="/request-a-quote/?solution=corporate-golf-gifts">START A CORPORATE GIFT BRIEF <Arrow /></a></div><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI corporate golf gift set with towel, golf ball, ball marker and divot tool in presentation box" /></section>
    <section className="corporate-ledger"><div><p>THE CORPORATE GIFT PROGRAM LEDGER</p>{steps.map(([number, title, copy]) => <article key={number}><b>{number}</b><h2>{title}</h2><p>{copy}</p><span aria-hidden="true">→</span></article>)}</div><aside><p>PROJECT ESSENTIALS</p><ul><li><b>Recipient group</b><span>Clients, executives, teams or event guests</span></li><li><b>Approximate quantity</b><span>An estimated range is enough to start</span></li><li><b>Target date</b><span>Event date or desired in-hands date</span></li><li><b>Destination</b><span>One location or multiple hand-off points</span></li><li><b>Brand assets</b><span>Logo files, guidelines and useful references</span></li></ul><small>MOQ, timing and applicable requirements are reviewed per project.</small></aside></section>
    <section className="category-guides"><p>RELATED BUYER GUIDES</p><h2>Plan the gift around the recipient and the hand-off.</h2><div><a href={siteRoutes.corporateGuide.path}><b>01</b><span>CORPORATE GOLF GIFTS</span><Arrow /></a><a href={siteRoutes.audienceGiftGuide.path}><b>02</b><span>GIFTS BY AUDIENCE</span><Arrow /></a><a href={siteRoutes.packagingGuide.path}><b>03</b><span>PACKAGING PROCUREMENT</span><Arrow /></a><a href="/guides/"><b>+</b><span>VIEW ALL BUYER GUIDES</span><Arrow /></a></div></section>
    <section className="corporate-closing"><img src="/assets/images/zhoni-golf-product-development-v2.png" alt="ZHONI embroidered golf towel, ball marker and divot tool as a corporate golf gift detail" /><div><p>CORPORATE GOLF GIFTING</p><h2>A considered gift says more than a logo can.</h2><p>Share the people, occasion and direction behind your corporate gifting program. We will use the brief to guide the appropriate next conversation.</p><a href="/request-a-quote/?solution=corporate-golf-gifts">SHARE YOUR PROJECT BRIEF <Arrow /></a></div></section>
    <ZhoniPageFooter />
  </main>;
}

function ProductsHub() {
  const [menu, setMenu] = useState(false);
  return <main className="products-hub">
    <header className="products-header">
      <a className="products-brand" href="/"><strong>ZHONI</strong><small>CUSTOM GOLF MERCHANDISE</small></a>
      <button className="products-menu" onClick={() => setMenu(!menu)} aria-expanded={menu}>MENU</button>
      <nav className={menu ? "products-nav products-nav-open" : "products-nav"}>
        <a aria-current="page" href="/products/">Products</a><a href="/solutions/">Solutions</a><a href="/guides/">Buyer Guides</a><a href="/our-process/">Our Approach</a><a href="/faq/">FAQ</a><a href="/request-a-quote/">Contact</a>
      </nav>
      <a className="products-quote" href="/request-a-quote/">REQUEST A QUOTE <Arrow /></a>
    </header>

    <section className="products-hero">
      <img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="A coordinated ZHONI custom golf merchandise collection with headcover, towel, ball markers and presentation box" />
      <div className="products-hero-copy"><p className="products-kicker">CUSTOM GOLF MERCHANDISE</p><h1>The golf collection<br />designed beyond<br />the clubhouse.</h1><p>Considered merchandise for clubs, tournaments, corporate programs and private-label brands.</p><a href="/request-a-quote/">START A PROJECT <Arrow /></a></div>
      <p className="products-hero-note">MORE THAN MERCHANDISE.<br />A MORE MEANINGFUL GAME.</p>
    </section>

    <section className="family-index" aria-label="Golf merchandise product families">
      <div className="family-heading"><p className="products-kicker">OUR RANGE</p><h2>Product Families</h2><p>Different purposes.<br />A more remarkable whole.</p></div>
      <div className="family-grid">
        {productFamilies.map(([title, copy, image, alt]) => <a className="family-card" href={productFamilyRoutes[title]} key={title}>
          <img src={image} alt={alt} />
          <h3>{title}</h3><p>{copy}</p><span aria-hidden="true">— &nbsp; <Arrow /></span>
        </a>)}
      </div>
    </section>

    <section className="program-bridge">
      <div><p className="products-kicker">CLUBS · TOURNAMENTS · CORPORATE · PRIVATE LABEL</p><h2>For club, tournament,<br />corporate and private-label programs.</h2></div>
      <a href="/solutions/">EXPLORE PROJECT TYPES <Arrow /></a>
    </section>

    <section className="products-intro">
      <p className="products-kicker">A COORDINATED APPROACH</p><h2>One collection. A clearer story.</h2>
      <p>Start with a single product or bring together useful pieces, coherent branding and presentation packaging. The appropriate direction depends on who will receive it, where it will be used and what the moment needs to communicate.</p>
      <a href="/our-process/">HOW THE PROJECT PROCESS WORKS <Arrow /></a>
    </section>
    <SiteFooter />
  </main>;
}

function TournamentGiftsPage() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 64);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const headerClass = `solution-header ${scrolled ? "solution-header-scrolled" : ""} ${menu ? "solution-header-open" : ""}`;
  return <main className="tournament-page">
    <header className={headerClass}>
      <a className="solution-brand" href="/"><strong>ZHONI</strong><small>CUSTOM GOLF MERCHANDISE</small></a>
      <button className="solution-menu" onClick={() => setMenu(open => !open)} aria-expanded={menu}>{menu ? "CLOSE" : "MENU"}</button>
      <nav className="solution-nav"><a href="/products/">Products</a><a href="/solutions/">Solutions</a><a href="/guides/">Buyer Guides</a><a href="/our-process/">Our Process</a><a href="/custom-golf-packaging/">Craft &amp; Packaging</a><a href="/faq/">FAQ</a></nav>
      <a className="solution-quote" href="/request-a-quote/">GET A QUOTE <Arrow /></a>
    </header>
    <section className="tournament-hero">
      <img src="/assets/images/zhoni-golf-tournament-gift-delivery-v2.png" alt="Golf tournament guest receiving a ZHONI custom golf gift set at an event" />
      <div className="tournament-copy"><p>GOLF TOURNAMENT GIFTS</p><h1>Made for<br />the moment.</h1><em>Thoughtfully coordinated player packs for event days that welcome, unite and leave a lasting impression.</em><a href="/request-a-quote/">PLAN A PLAYER PACK <Arrow /></a></div>
    </section>
    <section className="planning-ledger">
      <p>THE TOURNAMENT GIFT PLANNING PATH</p><div>{[["01", "Your audience", "Share the event, recipient group, quantity direction and the moment you want to create."], ["02", "Your collection", "Coordinate relevant golf essentials, custom details and presentation around the event."], ["03", "The hand-off", "Plan packaging and on-site distribution so the player experience arrives intact."]].map(([n, title, copy]) => <article key={n}><b>{n}</b><div><h2>{title}</h2><p>{copy}</p></div></article>)}</div>
    </section>
    <section className="category-guides"><p>RELATED BUYER GUIDES</p><h2>Plan the player experience with practical context.</h2><div><a href={siteRoutes.tournamentGuide.path}><b>01</b><span>TOURNAMENT PLAYER PACKS</span><Arrow /></a><a href={siteRoutes.audienceGiftGuide.path}><b>02</b><span>GIFTS BY AUDIENCE</span><Arrow /></a><a href={siteRoutes.packagingGuide.path}><b>03</b><span>PACKAGING PROCUREMENT</span><Arrow /></a><a href="/guides/"><b>+</b><span>VIEW ALL BUYER GUIDES</span><Arrow /></a></div></section>
    <section className="tournament-still"><img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="ZHONI custom golf player-pack components arranged as a coordinated collection" /><div><p>ONE EVENT. A COORDINATED PROGRAM.</p><h2>Build around the people receiving it.</h2><p>A useful player pack can start with one product—or bring together headcovers, towels, accessories, ball markers and presentation packaging as one considered event experience.</p><a href="/request-a-quote/">START WITH YOUR EVENT BRIEF <Arrow /></a></div></section>
    <section className="tournament-cta"><p>READY TO PLAN THE NEXT EVENT?</p><h2>Tell us the date, audience and direction.</h2><a href="/request-a-quote/">START A TOURNAMENT GIFT PROJECT <Arrow /></a></section>
    <SiteFooter />
  </main>;
}

function createWhatsAppLink() {
  const pageUrl = window.location.href;
  const pageTitle = document.title || "Custom golf merchandise project";
  const message = `Hello, I would like to discuss a custom golf merchandise project.\n\nPage: ${pageTitle}\nURL: ${pageUrl}\n\nQuantity: \nDestination country: \nProduct reference: `;
  const base = WHATSAPP_URL.replace(/\/$/, "");
  return `${base}?text=${encodeURIComponent(message)}`;
}

function track(eventName, details = {}) {
  trackAnalytics(eventName, details);
}

export function App() {
  const [slide, setSlide] = useState(0);
  const [menu, setMenu] = useState(false);
  const [faq, setFaq] = useState(0);
  const [floatHidden, setFloatHidden] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [formStatus, setFormStatus] = useState("idle");
  const [formMessage, setFormMessage] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const quoteRef = useRef(null);
  const heroRef = useRef(null);
  const route = typeof window === "undefined" ? siteRoutes.home : findRoute(window.location.pathname) ?? siteRoutes.home;
  useEffect(() => { const timer = setInterval(() => setSlide(i => (i + 1) % slides.length), 8500); return () => clearInterval(timer); }, []);
  useEffect(() => {
    const quote = quoteRef.current;
    if (!quote || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setFloatHidden(entry.isIntersecting), { threshold: 0.18 });
    observer.observe(quote);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 64);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);
  useEffect(() => {
    const trackContactClick = event => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!link) return;
      let url = new URL(link.href, window.location.origin);
      const details = { page_path: window.location.pathname, page_location: window.location.href, page_language: document.documentElement.lang || "en", form_source: inquirySourceForLocation(), placement: link.dataset.analyticsPlacement || "site_link" };
      if (url.hostname === "wa.me") track("whatsapp_click", details);
      if (url.origin === window.location.origin && url.pathname.startsWith("/request-a-quote")) {
        url = addInquirySource(url.href, route);
        link.href = url.href;
        track("quote_cta_click", { ...details, form_source: url.searchParams.get("source") });
      }
    };
    document.addEventListener("click", trackContactClick);
    return () => document.removeEventListener("click", trackContactClick);
  }, []);
  useEffect(() => {
    applySeo(route);
  }, [route]);
  if (route === siteRoutes.products) return <><ProductsHub /><FloatingContactActions /></>;
  if (route === siteRoutes.headcovers) return <><ProductCategoryPage type="headcovers" /><FloatingContactActions /></>;
  if (route === siteRoutes.towels) return <><ProductCategoryPage type="towels" /><FloatingContactActions /></>;
  if (route === siteRoutes.accessories) return <><ProductCategoryPage type="accessories" /><FloatingContactActions /></>;
  if (route === siteRoutes.packaging) return <><ProductCategoryPage type="packaging" /><FloatingContactActions /></>;
  if (route === siteRoutes.solutions) return <><SolutionsPage /><FloatingContactActions /></>;
  if (route === siteRoutes.golfGifts) return <><GolfGiftsHub /><FloatingContactActions /></>;
  if (route === siteRoutes.guides) return <><BuyerGuidesPage /><FloatingContactActions /></>;
  if (route === siteRoutes.golfGiftGuide) return <><GolfGiftGuidePage /><FloatingContactActions /></>;
  if (route === siteRoutes.audienceGiftGuide) return <><AudienceGolfGiftGuidePage /><FloatingContactActions /></>;
  if (route === siteRoutes.brandingGuide) return <><BrandingGuidePage /><FloatingContactActions /></>;
  if (route === siteRoutes.artworkGuide) return <><ArtworkGuidePage /><FloatingContactActions /></>;
  if (route === siteRoutes.headcoversGuide) return <><ProcurementTopicGuide topic="headcovers" /><FloatingContactActions /></>;
  if (route === siteRoutes.towelsGuide) return <><ProcurementTopicGuide topic="towels" /><FloatingContactActions /></>;
  if (route === siteRoutes.tournamentGuide) return <><ProcurementTopicGuide topic="tournament" /><FloatingContactActions /></>;
  if (route === siteRoutes.corporateGuide) return <><ProcurementTopicGuide topic="corporate" /><FloatingContactActions /></>;
  if (route === siteRoutes.packagingGuide) return <><ProcurementTopicGuide topic="packaging" /><FloatingContactActions /></>;
  if (route === siteRoutes.firstOrder) return <><FirstOrderHub /><FloatingContactActions /></>;
  if (route === siteRoutes.exportReadiness) return <><ExportReadinessHub /><FloatingContactActions /></>;
  if (route === siteRoutes.corporateGifts) return <><CorporateGiftsPage /><FloatingContactActions /></>;
  if (route === siteRoutes.tournamentGifts) return <><TournamentGiftsPage /><FloatingContactActions /></>;
  if (route === siteRoutes.about) return <><AboutPage /><FloatingContactActions /></>;
  if (route === siteRoutes.process) return <><ProcessPage /><FloatingContactActions /></>;
  if (route === siteRoutes.capabilities) return <><CapabilitiesPage /><FloatingContactActions /></>;
  if (route === siteRoutes.faq) return <><FAQPage /><FloatingContactActions /></>;
  if (route === siteRoutes.quote) return <><QuotePage /><FloatingContactActions /></>;
  const active = slides[slide];
  const whatsappLink = typeof window === "undefined" ? WHATSAPP_URL : createWhatsAppLink();
  const submitInquiry = async event => {
    event.preventDefault();
    if (formStatus === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("source", inquirySourceForLocation());
    data.set("page_language", document.documentElement.lang || "en");
    data.set("page_path", window.location.pathname);
    data.set("page_url", window.location.href);
    data.set("referrer", document.referrer);
    if (data.get("company_website")) {
      form.reset();
      setFormStatus("success");
      setFormMessage("Thank you—your project brief has been received.");
      return;
    }
    setFormStatus("submitting");
    setFormMessage("Sending your project brief…");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(import.meta.env.VITE_INQUIRY_ENDPOINT ?? "/api/inquiry", { method: "POST", body: data, headers: { Accept: "application/json" }, signal: controller.signal });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "We could not send your project brief.");
      form.reset();
      setFormStatus("success");
      setFormMessage("Thank you—your project brief has been received. Our team will review the details and reply with the appropriate next step.");
      track("generate_lead", { form_name: "homepage_custom_project", form_source: inquirySourceForLocation(), page_path: window.location.pathname, page_location: window.location.href, page_language: document.documentElement.lang || "en", lead_type: "inquiry" });
    } catch (error) {
      setFormStatus("error");
      setFormMessage(error.message || "Your brief was not sent. Please try again, or use WhatsApp for a direct project conversation.");
      track("inquiry_submit_error", { form_name: "homepage_custom_project", form_source: inquirySourceForLocation(), page_path: window.location.pathname, page_language: document.documentElement.lang || "en" });
    } finally {
      window.clearTimeout(timeout);
    }
  };
  return <main>
    <header className={`header ${scrolled ? "header-scrolled" : ""} ${menu ? "header-open" : ""}`}>
      <a className="brand" href="/"><strong>ZHONI</strong><small>CUSTOM GOLF MERCHANDISE</small></a>
      <button className="menu" onClick={() => setMenu(!menu)} aria-expanded={menu}>{menu ? "CLOSE" : "MENU"}</button>
      <nav className={menu ? "nav nav-open" : "nav"}><a href="/products/">Products</a><a href="/solutions/">Solutions</a><a href="/guides/">Buyer Guides</a><a href="/our-process/">Our Process</a><a href="/custom-golf-packaging/">Craft &amp; Packaging</a><a href="/faq/">FAQ</a></nav>
      <Button>GET A QUOTE</Button>
    </header>

    <section className="hero" id="top" ref={heroRef}>
      <div className="hero-image"><img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="" /><video key={active[3]} autoPlay muted loop playsInline poster="/assets/images/zhoni-golf-collection-hero-v2.png"><source src={active[3]} type="video/mp4" /></video></div>
      <div className="shade" />
      <div className="shell hero-copy"><p className="eyebrow">{active[0]}</p><h1>{active[1]}</h1><p className="lead">{active[2]}</p><div className="actions"><Button>START A CUSTOM PROJECT</Button><a className="button button-secondary" href="/products/">EXPLORE PRODUCTS <Arrow /></a></div></div>
    </section>

    <section className="intro shell"><p className="eyebrow green">MORE THAN PRODUCTS. A STRONGER CONNECTION.</p><div className="two-col"><h2>A coordinated golf collection tells your story long after the round.</h2><div><p>We help clubs, events and brands create custom golf merchandise that people are proud to use—on the course and beyond it.</p><a className="link" href="/our-process/">OUR APPROACH <Arrow /></a></div></div></section>

    <section className="collection" id="products"><div className="shell section-head"><div><p className="eyebrow green">BUILD YOUR GOLF COLLECTION</p><h2>From individual pieces to complete gifting solutions.</h2></div><p>Start with the essentials. Create a coordinated collection. Deliver an unforgettable experience.</p></div><div className="shell collection-photo"><img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="ZHONI custom golf accessories arranged as one cohesive collection" /></div><div className="shell rail">{products.map((item, i) => <a href={productFamilyRoutes[item] || "/products/"} key={item}><b>{String(i + 1).padStart(2, "0")}</b><span>{item}</span></a>)}</div></section>

    <section className="solutions shell" id="solutions"><div className="section-head"><div><p className="eyebrow green">PROJECT-LED SOLUTIONS</p><h2>Choose a purchasing outcome, not just a product.</h2></div><p>Each route can combine product selection, branding direction and packaging into one clear project.</p></div><div className="solution-grid">{solutions.map(([title, copy], i) => <a className="solution" href={solutionRoutes[title] || "/solutions/"} key={title}><span>{String(i + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p><b>START A PROJECT <Arrow /></b></a>)}</div></section>

    <section className="showcase shell"><div className="section-head"><div><p className="eyebrow green">PROJECT EVIDENCE</p><h2>Designed as a collection. Delivered in the real world.</h2></div><p>From development and production to event-day gifting, each image connects a product decision to a procurement outcome.</p></div><div className="showcase-grid"><figure><img src="/assets/images/zhoni-golf-product-development-v2.png" alt="ZHONI golf collection product development with material and logo direction" /><figcaption><b>01</b><span>Product development &amp; coordinated brand direction</span></figcaption></figure><figure><img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="ZHONI custom golf towel and accessories with gold Z monogram" /><figcaption><b>02</b><span>Embroidery and branded golf collection details</span></figcaption></figure><figure><img src="/assets/images/zhoni-golf-tournament-gift-delivery-v2.png" alt="ZHONI golf tournament gift set being presented at an event" /><figcaption><b>03</b><span>Tournament gift-set hand-off and guest experience</span></figcaption></figure><figure><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="ZHONI custom golf presentation packaging" /><figcaption><b>04</b><span>Golf gift-set packaging and presentation</span></figcaption></figure></div></section>

    <section className="evidence" id="craft"><img src="/assets/images/zhoni-golf-product-development-v2.png" alt="ZHONI custom golf material and monogram development" /><article className="dark"><p className="eyebrow">CUSTOM GOLF MERCHANDISE</p><h2>Material choices that make a stronger impression.</h2><p>Choose a product direction, then align material, colour, logo application and finishing details across the collection.</p><a className="link light" href="/request-a-quote/">EXPLORE CUSTOMISATION <Arrow /></a></article><article className="cream"><p className="eyebrow green">FROM CONCEPT TO DELIVERY</p><h2>A project path built for confident approval.</h2><ol><li>Share product direction, estimated quantity and event date.</li><li>Align the collection, branding and packaging requirements.</li><li>Review the relevant design and proof process.</li></ol><a className="link" href="/request-a-quote/">START YOUR PROJECT <Arrow /></a></article><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="A ZHONI custom golf gift set in coordinated presentation packaging" /></section>

    <section className="packaging"><div className="shell"><p className="eyebrow">CUSTOM PACKAGING</p><h2>Packaging is part of the gift—not an afterthought.</h2><p>Boxes, sleeves, inserts, cards and labels can bring the collection together into a distinct presentation moment.</p><a className="button ivory" href="/request-a-quote/">EXPLORE PACKAGING <Arrow /></a></div></section>

    <section className="process shell" id="process"><p className="eyebrow green">HOW IT WORKS</p><h2>Clear steps for a more considered project.</h2><div className="steps">{[["Tell us the brief", "Product interest, quantity, event date, audience and any packaging needs."], ["Shape the collection", "Coordinate the product mix, branding direction and presentation."], ["Approve the direction", "Move forward after the relevant design and proof stages are aligned."], ["Produce & deliver", "Confirm delivery requirements as part of the project scope."]].map(([title, copy], i) => <div key={title}><b>0{i + 1}</b><h3>{title}</h3><p>{copy}</p></div>)}</div></section>

    <section className="faq shell" id="faq"><div><p className="eyebrow green">PURCHASING QUESTIONS</p><h2>Answers for the project you are planning.</h2><p>Specific, project-relevant answers make it easier to evaluate the next step.</p></div><div className="faq-list">{faqs.map(([question, answer], i) => <article key={question}><button onClick={() => setFaq(faq === i ? -1 : i)} aria-expanded={faq === i}><span>{question}</span><b>{faq === i ? "−" : "+"}</b></button>{faq === i && <p>{answer}</p>}</article>)}</div></section>

    <section className="quote shell" id="quote" ref={quoteRef}><div><p className="eyebrow green">START A CUSTOM PROJECT</p><h2>Tell us what you are building.</h2><p>Whether you need one custom product or a complete gifting solution, share the direction, expected quantity and event date. We will guide the appropriate next step.</p><div className="quote-direct-contact"><b>DIRECT CONTACT</b><a href="mailto:sales@zhonigolf.com">sales@zhonigolf.com</a><a href={whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp +86 177 5919 0848 <Arrow /></a></div></div><form onSubmit={submitInquiry} onFocus={event => { if (!event.currentTarget.dataset.started) { event.currentTarget.dataset.started = "true"; track("form_start", { form_name: "homepage_custom_project", form_source: inquirySourceForLocation(), page_path: window.location.pathname, page_language: document.documentElement.lang || "en" }); } }}><label>Name<input required name="name" autoComplete="name" /></label><label>Business email<input required type="email" name="email" autoComplete="email" /></label><label>Project type<select name="project_type"><option>Individual custom golf product</option><option>Custom golf headcovers</option><option>Custom golf towels</option><option>Ball markers &amp; divot tools</option><option>Golf accessories</option><option>Golf gift set</option><option>Tournament merchandise</option><option>Corporate golf gifts</option><option>Private label collection</option><option>Custom packaging</option></select></label><label>Quantity requirement<input name="quantity_range" placeholder="e.g. 200 pieces" /></label><label>Tell us about the project<textarea required name="message" rows="3" placeholder="Product, quantity, customization ideas, event date or packaging needs…" /></label><label className="honeypot" aria-hidden="true">Website<input name="company_website" tabIndex="-1" autoComplete="off" /></label><TurnstileField /><button className="button button-primary" type="submit" disabled={formStatus === "submitting"}>{formStatus === "submitting" ? "SENDING PROJECT BRIEF…" : "SEND PROJECT BRIEF"} <Arrow /></button><div className={`form-status ${formStatus}`} role="status" aria-live="polite">{formMessage}{formStatus === "error" && <> <a href="mailto:sales@zhonigolf.com">EMAIL SALES</a><a href={whatsappLink} target="_blank" rel="noopener noreferrer" >OPEN WHATSAPP <Arrow /></a></>}</div><small>Your details are used only to review this project request.</small></form></section>

    <SiteFooter />
    <FloatingContactActions hidden={floatHidden || heroVisible} />
  </main>;
}
