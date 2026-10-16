export const inquiryProjectOptions = [
  "Individual custom golf product",
  "Custom golf headcovers",
  "Custom golf caps & headwear",
  "Custom golf towels",
  "Ball markers & divot tools",
  "Golf accessories",
  "Golf gift set",
  "Tournament merchandise",
  "Corporate golf gifts",
  "Club member program",
  "Private label collection",
  "Custom packaging",
];

const productAliases = {
  Headcovers: "Custom golf headcovers",
  "Custom plush golf headcovers": "Custom golf headcovers",
  "Custom Golf Caps & Headwear": "Custom golf caps & headwear",
  "Golf Towels": "Custom golf towels",
  "Ball markers & divot tools": "Ball markers & divot tools",
  "Golf Accessories": "Golf accessories",
  "Custom Packaging": "Custom packaging",
};

const solutionAliases = {
  "club-member-programs": "Club member program",
  "private-label-collections": "Private label collection",
  "golf-tournament-gifts": "Tournament merchandise",
  "corporate-golf-gifts": "Corporate golf gifts",
};

export function resolveInquiryProject(queryParams) {
  const directProduct = queryParams.get("product") ?? "";
  const selected = productAliases[directProduct] ?? solutionAliases[queryParams.get("solution")] ?? directProduct;
  return inquiryProjectOptions.includes(selected) ? selected : "";
}
