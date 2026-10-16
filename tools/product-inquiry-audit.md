# Core product inquiry audit

Internal maintenance document. This file is not rendered by the website.

## Scope

The conversion review covers the six product routes that receive priority on the English homepage:

1. `/custom-golf-headcovers/`
2. `/custom-plush-golf-headcovers/`
3. `/custom-golf-caps/`
4. `/custom-golf-towels/`
5. `/custom-golf-ball-markers-divot-tools/`
6. `/custom-golf-packaging/`

## Completion standard

Every priority product route should provide:

- a product-specific H1, description and primary CTA;
- material, construction or format choices;
- logo or branding method guidance;
- project-specific MOQ language without an unsupported universal figure;
- a proof or sample route;
- production and timing inputs;
- relevant quality checkpoints;
- packaging and destination context;
- buyer FAQs;
- a quote link that preselects the correct product category;
- CTA and direct-contact conversion events with product context.

## Audit result

| Product route | Product decisions | MOQ / sample / timing | Quality / packing | FAQ | Quote prefill | Event context | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Headcovers | Complete | Complete | Complete | Complete | `Headcovers` | Product route + CTA | Pass |
| Plush headcovers | Complete | Complete | Complete | Complete | Headcovers + plush type | Product route + CTA | Pass |
| Caps & visors | Complete | Complete | Complete | Complete | Custom golf caps & headwear | Product route + CTA | Pass |
| Magnetic towels | Strengthened | Strengthened | Strengthened | Added | Golf Towels | Product route + CTA | Pass |
| Ball markers & divot tools | Strengthened | Strengthened | Strengthened | Added | Ball markers & divot tools | Product route + CTA | Pass |
| Packaging | Strengthened | Strengthened | Strengthened | Added | Custom Packaging | Product route + CTA | Pass |

## Measurement events

The site records these consent-aware GA4 events:

- `product_page_view`: priority product route and product context;
- `quote_cta_click`: CTA placement, link text, source and product context;
- `whatsapp_click`: placement, page and product context;
- `email_click`: placement, page and product context;
- `form_start`: form, source and preselected product;
- `form_submit_attempt`: form, source and selected product;
- `generate_lead`: successful inquiry and selected product;
- `inquiry_submit_error`: failed form submission.

Analytics remains optional. No analytics event is sent until the visitor grants analytics consent.

## Claims boundary

No universal MOQ or production-time promise is introduced. Commercial requirements, sample path and timing remain dependent on construction, material, branding, quantity, packaging, destination and approval status.
