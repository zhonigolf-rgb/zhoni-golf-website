import { useEffect, useRef, useState } from "react";
import { trackAnalytics } from "./analytics.jsx";
import { TurnstileField } from "./turnstile.jsx";
import { EnglishCoreProducts, EnglishSupportingProducts, EnglishProductExpertise, EnglishProductMenu, englishHeroSlides as slides } from "./EnglishProductFocus.jsx";
import "./showcase.css";
import "./products.css";
import "./locale.css";

const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL ?? "https://wa.me/8617759190848";
const solutions = [["Tournament Player Pack", "Player-ready essentials built around your event identity.", "/solutions/golf-tournament-gifts/"], ["Corporate Golf Gift Set", "A considered golf experience for clients, teams or partners.", "/solutions/corporate-golf-gifts/"], ["Club Member Gift", "A coordinated collection for member moments and milestones.", "/solutions/golf-club-member-programs/"], ["Private-Label Collection", "A product system for branded golf merchandise programs.", "/solutions/private-label-golf-collections/"]];
const faqs = [["What golf products can be customised?", "Our core range is custom golf towels, caps and visors, and plush headcovers. Other headcovers, ball markers, divot tools, accessories and packaging remain available as supporting products or separate enquiries. Options are confirmed for the selected brief."], ["Can you create a complete custom golf gift set?", "Yes. We can help structure a collection around your event, recipient profile, budget direction and branding system—from individual products through to presentation packaging."], ["What is the MOQ for custom golf products?", "Minimums vary by product, construction, material, decoration method and packaging. Share your product direction and estimated quantity for the applicable MOQ."], ["Can different golf products use the same branding?", "Yes. We can coordinate logo use, colours and design details across a group of selected products so the finished collection reads as one system."], ["How do sampling and production timing work?", "Timing depends on the selected products, customisation, quantities, artwork readiness and delivery destination. Include your event date in the enquiry so the project can be assessed properly."]];

const Arrow = () => <span aria-hidden="true">↗</span>;
const Button = ({ children }) => <a className="button button-primary" href="/request-a-quote/">{children} <Arrow /></a>;
const InquiryDirectContact = ({ whatsappLink }) => <div className="inquiry-submit-contact"><b>DIRECT CONTACT</b><a href="mailto:sales@zhonigolf.com"><span>EMAIL</span><strong>sales@zhonigolf.com</strong></a><a href={whatsappLink} target="_blank" rel="noopener noreferrer"><span>WHATSAPP</span><strong>+86 177 5919 0848</strong><Arrow /></a></div>;

function createWhatsAppLink() {
  const message = `Hello, I would like to discuss a custom golf merchandise project.\n\nPage: ${document.title || "Custom golf merchandise project"}\nURL: ${window.location.href}\n\nQuantity: \nDestination country: \nProduct reference: `;
  return `${WHATSAPP_URL.replace(/\/$/, "")}?text=${encodeURIComponent(message)}`;
}

function inquirySource() {
  const explicit = new URLSearchParams(window.location.search).get("source")?.toLowerCase();
  return explicit && /^[a-z0-9][a-z0-9-]{0,79}$/.test(explicit) ? explicit : "homepage";
}

function HomeLanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  useEffect(() => {
    const close = event => { if (root.current && !root.current.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const locales = [["EN", "English", "/", "en"], ["FR", "Français (Canada)", "/fr-ca/", "fr-CA"], ["KO", "한국어", "/ko/", "ko"], ["JA", "日本語", "/ja/", "ja"], ["DE", "Deutsch", "/de/", "de"]];
  return <div className="language-switcher language-switcher-dark" ref={root}><button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(value => !value)}><span aria-hidden="true">◎</span>EN<b aria-hidden="true">⌄</b></button>{open && <div className="language-menu" role="menu" aria-label="Language">{locales.map(([short, label, href, lang]) => <a key={lang} href={href} hrefLang={lang} lang={lang} role="menuitem" aria-current={lang === "en" ? "page" : undefined}><span>{short}</span><strong>{label}</strong></a>)}</div>}</div>;
}

function SiteFooter() {
  return <footer className="site-footer"><div className="site-footer-main"><a className="zhoni-wordmark" href="/"><strong>ZHONI</strong><small>CUSTOM GOLF MERCHANDISE</small></a><div className="site-footer-copy"><p>Custom golf towels, caps and plush headcovers, with supporting accessories and packaging for clubs, brands and events.</p><span>TOWELS · CAPS & VISORS · PLUSH HEADCOVERS</span><div className="site-footer-contact"><b>DIRECT CONTACT</b><a href="mailto:sales@zhonigolf.com">sales@zhonigolf.com</a><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp +86 177 5919 0848 <Arrow /></a></div></div><nav aria-label="Footer navigation"><a href="/products/">Products</a><a href="/solutions/">Solutions</a><a href="/guides/">Buyer Guides</a><a href="/our-process/">Process</a><a href="/capabilities/">Capabilities</a><a href="/about/">About</a><a href="/request-a-quote/">Contact <Arrow /></a></nav></div><div className="site-footer-base"><span>ZHONI · CUSTOM GOLF MERCHANDISE</span><span>Operated by Xiamen Jindongyu Trading Co., Ltd.</span></div></footer>;
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
  return <aside className={`float ${open ? "float-open" : ""} ${isHidden ? "float-hidden" : ""}`} aria-label="Project contact actions" aria-hidden={isHidden}><div className="float-panel" id="project-contact-menu"><a href="/request-a-quote/" tabIndex={isHidden || !open ? -1 : 0} onClick={() => setOpen(false)}><img src="/assets/quote-brief-icon.png" alt="" aria-hidden="true" loading="lazy" decoding="async" fetchPriority="low" /><strong>GET A QUOTE</strong><Arrow /></a><a href={whatsappLink} target="_blank" rel="noopener noreferrer" tabIndex={isHidden || !open ? -1 : 0}><img src="/assets/whatsapp-contact-icon.png" alt="" aria-hidden="true" loading="lazy" decoding="async" fetchPriority="low" /><strong>WHATSAPP</strong><Arrow /></a></div><button className="golf-flag-mark" type="button" aria-label={open ? "Hide project contact options" : "Show project contact options"} aria-expanded={open} aria-controls="project-contact-menu" tabIndex={isHidden ? -1 : 0} onClick={() => setOpen(value => !value)}><img src="/assets/golf-flag-marker-v2.png" alt="" loading="lazy" decoding="async" fetchPriority="low" /></button></aside>;
}

export function HomePage() {
  const [slide, setSlide] = useState(0);
  const [menu, setMenu] = useState(false);
  const [faq, setFaq] = useState(0);
  const [floatHidden, setFloatHidden] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [heroVideoEnabled, setHeroVideoEnabled] = useState(false);
  const [formStatus, setFormStatus] = useState("idle");
  const [formMessage, setFormMessage] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const quoteRef = useRef(null);
  const heroRef = useRef(null);
  const heroVideoRef = useRef(null);
  useEffect(() => {
    if (!heroVideoEnabled || !heroVisible) return undefined;
    const timer = setInterval(() => setSlide(index => (index + 1) % slides.length), 8500);
    return () => clearInterval(timer);
  }, [heroVideoEnabled, heroVisible]);
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactOrTouch = window.matchMedia("(max-width: 900px), (pointer: coarse)");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const update = () => setHeroVideoEnabled(!reducedMotion.matches && !compactOrTouch.matches && !connection?.saveData && !["slow-2g", "2g", "3g"].includes(connection?.effectiveType));
    update();
    reducedMotion.addEventListener?.("change", update);
    compactOrTouch.addEventListener?.("change", update);
    connection?.addEventListener?.("change", update);
    return () => { reducedMotion.removeEventListener?.("change", update); compactOrTouch.removeEventListener?.("change", update); connection?.removeEventListener?.("change", update); };
  }, []);
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video || !heroVideoEnabled) return;
    if (heroVisible) video.play().catch(() => {}); else video.pause();
  }, [heroVideoEnabled, heroVisible, slide]);
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
    const update = () => setScrolled(window.scrollY > 64);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const handleClick = event => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!link) return;
      const url = new URL(link.href, window.location.origin);
      const details = { page_path: "/", page_location: window.location.href, page_language: "en", form_source: inquirySource(), placement: link.dataset.analyticsPlacement || "site_link" };
      if (url.hostname === "wa.me") trackAnalytics("whatsapp_click", details);
      if (url.protocol === "mailto:") trackAnalytics("email_click", details);
      if (url.origin === window.location.origin && /^\/request-a-quote(?:\/|$)/.test(url.pathname)) {
        if (!url.searchParams.get("source")) url.searchParams.set("source", "homepage");
        link.href = url.href;
        trackAnalytics("quote_cta_click", details);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
  const active = slides[slide];
  const whatsappLink = typeof window === "undefined" ? WHATSAPP_URL : createWhatsAppLink();
  const submitInquiry = async event => {
    event.preventDefault();
    if (formStatus === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("source", inquirySource()); data.set("page_language", "en"); data.set("page_path", "/"); data.set("page_url", window.location.href); data.set("referrer", document.referrer);
    if (data.get("company_website")) { form.reset(); setFormStatus("success"); setFormMessage("Thank you—your project brief has been received."); return; }
    trackAnalytics("form_submit_attempt", { form_name: "homepage_custom_project", form_source: inquirySource(), page_path: "/", page_language: "en", product_interest: data.get("project_type") || "Not selected" });
    setFormStatus("submitting"); setFormMessage("Sending your project brief…");
    const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(import.meta.env.VITE_INQUIRY_ENDPOINT ?? "/api/inquiry", { method: "POST", body: data, headers: { Accept: "application/json" }, signal: controller.signal });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "We could not send your project brief.");
      form.reset(); setFormStatus("success"); setFormMessage("Thank you—your project brief has been received. Our team will review the details and reply with the appropriate next step.");
      trackAnalytics("generate_lead", { form_name: "homepage_custom_project", form_source: inquirySource(), page_path: "/", page_location: window.location.href, page_language: "en", lead_type: "inquiry" });
    } catch (error) {
      setFormStatus("error"); setFormMessage(error.message || "Your brief was not sent. Please try again, or use WhatsApp for a direct project conversation.");
      trackAnalytics("inquiry_submit_error", { form_name: "homepage_custom_project", form_source: inquirySource(), page_path: "/", page_language: "en" });
    } finally { window.clearTimeout(timeout); }
  };
  return <main>
    <header className={`header ${scrolled ? "header-scrolled" : ""} ${menu ? "header-open" : ""}`}><a className="brand" href="/"><strong>ZHONI</strong><small>CUSTOM GOLF MERCHANDISE</small></a><button className="menu" onClick={() => setMenu(!menu)} aria-expanded={menu}>{menu ? "CLOSE" : "MENU"}</button><nav className={menu ? "nav nav-open" : "nav"}><EnglishProductMenu /><a href="/solutions/">Solutions</a><a href="/guides/">Buyer Guides</a><a href="/our-process/">Our Process</a><a href="/about/">About</a><a href="/faq/">FAQ</a></nav><HomeLanguageSwitcher /><Button>GET A QUOTE</Button></header>
    <section className="hero" id="top" ref={heroRef}><div className="hero-image"><picture><source type="image/avif" srcSet="/assets/images/responsive/zhoni-golf-collection-hero-v2-640.avif 640w, /assets/images/responsive/zhoni-golf-collection-hero-v2-1024.avif 1024w, /assets/images/responsive/zhoni-golf-collection-hero-v2-1672.avif 1672w" sizes="100vw" /><source type="image/webp" srcSet="/assets/images/responsive/zhoni-golf-collection-hero-v2-640.webp 640w, /assets/images/responsive/zhoni-golf-collection-hero-v2-1024.webp 1024w, /assets/images/responsive/zhoni-golf-collection-hero-v2-1672.webp 1672w" sizes="100vw" /><img src="/assets/images/zhoni-golf-collection-hero-v2.png" width="1672" height="941" alt="" loading="eager" decoding="async" fetchPriority="high" /></picture>{heroVideoEnabled && <video ref={heroVideoRef} key={active[3]} autoPlay muted loop playsInline preload="metadata" poster="/assets/images/responsive/zhoni-golf-collection-hero-v2-1672.webp" aria-hidden="true" onError={() => setHeroVideoEnabled(false)}><source src={active[3]} type="video/mp4" /></video>}</div><div className="shade" /><div className="shell hero-copy"><p className="eyebrow">{active[0]}</p><h1>{active[1]}</h1><p className="lead">{active[2]}</p><div className="actions"><a className="button button-primary" href="#core-products">EXPLORE CORE PRODUCTS <Arrow /></a><a className="button button-secondary" href="/request-a-quote/">START A CUSTOM PROJECT <Arrow /></a></div></div></section>
    <EnglishCoreProducts /><EnglishProductExpertise />

    <section className="process shell" id="process"><p className="eyebrow green">HOW IT WORKS</p><h2>From product brief to sample approval.</h2><div className="steps">{[["Tell us the brief", "Product interest, quantity, event date, audience and any packaging needs."], ["Define the product", "Review materials, construction, fit or attachment, and logo placement."], ["Review the sample", "Check a physical sample against the agreed specification before production."], ["Produce & deliver", "Confirm delivery requirements as part of the project scope."]].map(([title, copy], index) => <div key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{copy}</p></div>)}</div></section>
    <EnglishSupportingProducts />
    <section className="solutions shell" id="solutions"><div className="section-head"><div><p className="eyebrow green">WHEN PRODUCTS BECOME A PROGRAM</p><h2>Use the products in a club, brand or event program.</h2></div><p>Start with a core product. Add related pieces and packaging only where they serve your audience.</p></div><div className="solution-grid">{solutions.map(([title, copy, href], index) => <a className="solution" href={href} key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p><b>START A PROJECT <Arrow /></b></a>)}</div></section>
    <section className="showcase shell"><div className="section-head"><div><p className="eyebrow green">PROJECT DIRECTION IN PRACTICE</p><h2>See the decisions behind a coordinated collection.</h2></div><p>These representative visuals illustrate the product, branding, hand-off and packaging directions that should be defined in a real project brief.</p></div><div className="showcase-grid"><figure><img src="/assets/images/zhoni-golf-product-development-v2.png" alt="Illustrative material and logo direction for a custom golf collection" loading="lazy" decoding="async" fetchPriority="low" /><figcaption><b>01</b><span>Material, colour and brand direction to review</span></figcaption></figure><figure><img src="/assets/images/zhoni-golf-collection-hero-v2.png" alt="Illustrative coordinated golf towel and accessory collection" loading="lazy" decoding="async" fetchPriority="low" /><figcaption><b>02</b><span>Logo execution and collection consistency</span></figcaption></figure><figure><img src="/assets/images/zhoni-golf-tournament-gift-delivery-v2.png" alt="Illustrative tournament gift-set hand-off setting" loading="lazy" decoding="async" fetchPriority="low" /><figcaption><b>03</b><span>Recipient and event hand-off context</span></figcaption></figure><figure><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="Illustrative custom golf presentation packaging direction" loading="lazy" decoding="async" fetchPriority="low" /><figcaption><b>04</b><span>Packaging and presentation direction</span></figcaption></figure></div></section>
    <section className="evidence" id="craft"><img src="/assets/images/zhoni-golf-product-development-v2.png" alt="ZHONI custom golf material and monogram development" loading="lazy" decoding="async" fetchPriority="low" /><article className="dark"><p className="eyebrow">CUSTOM GOLF MERCHANDISE</p><h2>Material choices that make a stronger impression.</h2><p>Choose a product direction, then align material, colour, logo application and finishing details across the collection.</p><a className="link light" href="/request-a-quote/">EXPLORE CUSTOMISATION <Arrow /></a></article><article className="cream"><p className="eyebrow green">FROM CONCEPT TO DELIVERY</p><h2>A project path built for confident approval.</h2><ol><li>Share product direction, estimated quantity and event date.</li><li>Align the collection, branding and packaging requirements.</li><li>Review the relevant design and proof process.</li></ol><a className="link" href="/request-a-quote/">START YOUR PROJECT <Arrow /></a></article><img src="/assets/images/zhoni-custom-golf-packaging-v2.png" alt="A ZHONI custom golf gift set in coordinated presentation packaging" loading="lazy" decoding="async" fetchPriority="low" /></section>

    <section className="faq shell" id="faq"><div><p className="eyebrow green">PURCHASING QUESTIONS</p><h2>Answers for the project you are planning.</h2><p>Specific, project-relevant answers make it easier to evaluate the next step.</p></div><div className="faq-list">{faqs.map(([question, answer], index) => <article key={question}><button onClick={() => setFaq(faq === index ? -1 : index)} aria-expanded={faq === index}><span>{question}</span><b>{faq === index ? "−" : "+"}</b></button><p hidden={faq !== index}>{answer}</p></article>)}</div></section>
    <section className="quote shell" id="quote" ref={quoteRef}><div><p className="eyebrow green">START A CUSTOM PROJECT</p><h2>Tell us what you are building.</h2><p>Whether you need one custom product or a complete gifting solution, share the direction, expected quantity and event date. We will guide the appropriate next step.</p></div><form onSubmit={submitInquiry} onFocus={event => { if (!event.currentTarget.dataset.started) { event.currentTarget.dataset.started = "true"; trackAnalytics("form_start", { form_name: "homepage_custom_project", form_source: inquirySource(), page_path: "/", page_language: "en" }); } }}><label>Name<input required name="name" autoComplete="name" /></label><label>Business email<input required type="email" name="email" autoComplete="email" /></label><label>Project type<input type="text" name="project_type" maxLength={140} placeholder="Optional — product or project" /></label><label>Quantity requirement<input name="quantity_range" placeholder="e.g. 200 pieces" /></label><label>Tell us about the project<textarea required name="message" rows="3" placeholder="Product, quantity, customization ideas, event date or packaging needs…" /></label><label className="honeypot" aria-hidden="true">Website<input name="company_website" tabIndex="-1" autoComplete="off" /></label><TurnstileField /><button className="button button-primary" type="submit" disabled={formStatus === "submitting"}>{formStatus === "submitting" ? "SENDING PROJECT BRIEF…" : "SEND PROJECT BRIEF"} <Arrow /></button><InquiryDirectContact whatsappLink={whatsappLink} /><div className={`form-status ${formStatus}`} role="status" aria-live="polite">{formMessage}{formStatus === "error" && <> <a href="mailto:sales@zhonigolf.com">EMAIL SALES</a><a href={whatsappLink} target="_blank" rel="noopener noreferrer">OPEN WHATSAPP <Arrow /></a></>}</div><small>Your details are used only to review this project request.</small></form></section>
    <SiteFooter /><FloatingContactActions hidden={floatHidden || heroVisible} />
  </main>;
}
