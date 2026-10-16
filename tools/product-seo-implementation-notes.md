# Product-page SEO implementation notes

Internal maintenance document. This file is not rendered as a public page.

## Search intent boundary

The six priority URLs are B2B custom-product category pages. Each page owns one primary commercial query family and supports related variants in its visible specification, process and FAQ content. Buyer guides retain informational queries so that the product and guide URLs do not compete for the same main intent.

## Structured data decision

The product routes use `Service`, `BreadcrumbList` and visible-page-derived `FAQPage` structured data. Each priority service entity includes its product-specific service type, categories and representative image.

`Product` rich-result markup is intentionally not added at this stage. Google requires a product snippet to include a real `Offer`, `Review` or `AggregateRating`, and recommends product markup for a page focused on one product or variants of that product. These ZHONI routes are configurable B2B product families with project-specific quotation, not directly purchasable single-SKU offers. Price, stock, rating and review data must not be invented merely to satisfy rich-result fields.

References:

- https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- https://developers.google.com/search/docs/appearance/structured-data/product
- https://developers.google.com/search/docs/appearance/google-images
- https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites

## Technical checks

- Self-canonical URL on every product route.
- Reciprocal `hreflang` for English, Korean, Canadian French, Japanese and German versions.
- Product-family parent in breadcrumb structured data.
- Visible FAQs reflected in `FAQPage` structured data.
- Product-specific Open Graph and Twitter image metadata.
- Representative images included in the XML image sitemap.
- Direct homepage, products-hub, buyer-guide, related-product and quote paths.
