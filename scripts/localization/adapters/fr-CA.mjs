export default {
  locale: "fr-CA",
  displayName: "Français (Canada)",
  pathPrefix: "/fr-ca",
  allowPending: true,
  tone: "français commercial canadien clair et concret, avec vouvoiement; privilégier la terminologie utilisée par les acheteurs de clubs, tournois et entreprises au Canada",
  seoTerms: ["couvre-bâton de golf personnalisé", "couvre-bâton en peluche", "couvre-bâton mascotte", "accessoires de golf personnalisés"],
  terminology: {
    "custom golf headcover": "couvre-bâton de golf personnalisé",
    "plush headcover": "couvre-bâton en peluche",
    "club fit": "ajustement au bâton",
    "lining": "doublure protectrice",
    "sample approval": "approbation de l’échantillon",
    "artwork": "fichier graphique",
    "quote request": "demande de prix",
    "in-hands date": "date de réception souhaitée"
  },
  allowedEnglishTerms: ["ZHONI", "MOQ", "B2B", "WhatsApp", "golf"],
  qualityRules: {
    englishResidue: "off",
    requiredTerms: [
      { term: "couvre-bâton en peluche", minOccurrences: 6 },
      { term: "approbation de l’échantillon", minOccurrences: 1 },
      { term: "date de réception souhaitée", minOccurrences: 1 }
    ],
    requiredTermGroups: [
      { label: "vouvoiement canadien-français", terms: ["vous", "votre", "vos"], caseSensitive: false, minOccurrences: 6 }
    ],
    forbiddenTerms: ["prix le plus bas garanti", "qualité parfaite", "garanti à 100 %"],
    forbiddenPatterns: [
      { label: "tutoiement informel", pattern: /(?<!\p{L})(?:tu|ton|ta|tes)(?!\p{L})/iu },
      { label: "anglais non localisé", pattern: /\b(?:custom headcover|request a quote|shipping destination)\b/iu }
    ]
  },
  requiredAlternatePaths: ["/custom-plush-golf-headcovers/", "/guides/custom-plush-golf-headcover-design-guide/", "/guides/plush-golf-headcover-materials-lining-closures/", "/guides/plush-headcover-embroidery-patches-character-details/", "/guides/custom-plush-headcover-sample-quality-checklist/"]
};
