export const coreProductGuidePaths = {
  "/custom-golf-towels/": ["/guides/custom-golf-towels-procurement-guide/"],
  "/custom-golf-caps/": ["/guides/custom-golf-caps-and-visors/", "/guides/custom-golf-cap-materials/", "/guides/custom-golf-cap-logo-placement/", "/guides/custom-golf-cap-construction-fit-closures/", "/guides/custom-golf-cap-sampling-production-quality/"],
  "/custom-plush-golf-headcovers/": ["/guides/custom-plush-golf-headcover-design-guide/", "/guides/plush-golf-headcover-materials-lining-closures/", "/guides/plush-headcover-embroidery-patches-character-details/", "/guides/custom-plush-headcover-sample-quality-checklist/"],
};

export function canonicalProductPath(path) {
  return path.replace(/^\/(?:ko|fr-ca|ja|de)(?=\/)/, "");
}

export function productEntryDetails(product, { pagePath, language, placement, position }) {
  const canonical = canonicalProductPath(product.href);
  return {
    item_name: product.title, item_url: product.href,
    ...(position === undefined ? {} : { item_position: position }),
    product_group: Object.hasOwn(coreProductGuidePaths, canonical) ? "core" : "supporting",
    product_family: { "/custom-golf-towels/": "towels", "/custom-golf-caps/": "caps", "/custom-plush-golf-headcovers/": "plush" }[canonical] ?? "other",
    page_path: pagePath, page_language: language, placement,
  };
}
