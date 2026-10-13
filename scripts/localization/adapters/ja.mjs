export default {
  locale: "ja",
  displayName: "日本語",
  pathPrefix: "/ja",
  allowPending: true,
  tone: "法人購買・OEM担当者向けの簡潔で信頼感のある「です・ます」調。過度なセールス表現を避け、仕様・承認・納期を具体的に説明する",
  seoTerms: ["オリジナル ゴルフ ヘッドカバー", "ぬいぐるみ ヘッドカバー", "キャラクター ヘッドカバー", "ゴルフ用品 OEM"],
  terminology: {
    "custom golf headcover": "オリジナルゴルフヘッドカバー",
    "plush headcover": "ぬいぐるみヘッドカバー",
    "club fit": "クラブへのフィット",
    "lining": "保護用裏地",
    "sample approval": "サンプル承認",
    "artwork": "入稿データ",
    "quote request": "見積もり依頼",
    "in-hands date": "希望納品日"
  },
  allowedEnglishTerms: ["ZHONI", "MOQ", "B2B", "OEM", "WhatsApp", "DHL", "FedEx"],
  qualityRules: {
    englishResidue: "error",
    requiredTerms: [
      { term: "ぬいぐるみヘッドカバー", minOccurrences: 6 },
      { term: "サンプル承認", minOccurrences: 1 },
      { term: "希望納品日", minOccurrences: 1 },
      { term: "入稿データ", minOccurrences: 1 }
    ],
    forbiddenTerms: ["激安", "絶対に", "最高品質", "100％保証", "100%保証", "あなた"],
    formalTone: {
      minChars: 35,
      minRatio: 0.85,
      endings: ["です", "ます", "ください", "でしょうか", "ですか", "ますか"]
    }
  },
  requiredAlternatePaths: ["/custom-plush-golf-headcovers/", "/guides/custom-plush-golf-headcover-design-guide/", "/guides/plush-golf-headcover-materials-lining-closures/", "/guides/plush-headcover-embroidery-patches-character-details/", "/guides/custom-plush-headcover-sample-quality-checklist/"]
};
