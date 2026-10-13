export default {
  locale: "de",
  displayName: "Deutsch",
  pathPrefix: "/de",
  allowPending: true,
  tone: "präzises B2B-Deutsch mit konsequenter Sie-Ansprache; Spezifikation, Freigabe, Liefertermin und Einsatzkontext stehen vor werblicher Übertreibung",
  seoTerms: ["Golf-Headcover personalisieren", "Plüsch-Golf-Headcover", "Maskottchen-Headcover", "individuelles Golfzubehör"],
  terminology: {
    "custom golf headcover": "individuelles Golf-Headcover",
    "plush headcover": "Plüsch-Golf-Headcover",
    "club fit": "Passform für den Schläger",
    "lining": "Schutzfutter",
    "sample approval": "Musterfreigabe",
    "artwork": "Druckdaten",
    "quote request": "Angebotsanfrage",
    "in-hands date": "gewünschter Liefertermin"
  },
  allowedEnglishTerms: ["ZHONI", "MOQ", "B2B", "WhatsApp", "Golf", "Headcover"],
  qualityRules: {
    englishResidue: "off",
    requiredTerms: [
      { term: "Plüsch-Golf-Headcover", minOccurrences: 6 },
      { term: "Musterfreigabe", minOccurrences: 1 },
      { term: "gewünschter Liefertermin", minOccurrences: 1 },
      { term: "Angebotsanfrage", minOccurrences: 1 }
    ],
    requiredTermGroups: [
      { label: "formelle Sie-Ansprache", terms: ["Sie", "Ihnen", "Ihre", "Ihren", "Ihrem"], minOccurrences: 6 }
    ],
    forbiddenTerms: ["garantiert niedrigster Preis", "perfekte Qualität", "100 % garantiert"],
    forbiddenPatterns: [
      { label: "informelle Du-Ansprache", pattern: /(?<!\p{L})(?:du|dein|deine|deinen|deinem|euch|euer|eure)(?!\p{L})/iu },
      { label: "unübersetzte englische Handlungsaufforderung", pattern: /\b(?:request a quote|start your project|shipping destination)\b/iu }
    ]
  },
  requiredAlternatePaths: ["/custom-plush-golf-headcovers/", "/guides/custom-plush-golf-headcover-design-guide/", "/guides/plush-golf-headcover-materials-lining-closures/", "/guides/plush-headcover-embroidery-patches-character-details/", "/guides/custom-plush-headcover-sample-quality-checklist/"]
};
