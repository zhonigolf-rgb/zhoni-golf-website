export default {
  locale: "ko",
  displayName: "한국어",
  pathPrefix: "/ko",
  allowPending: false,
  tone: "한국 B2B 구매 담당자를 위한 정중하고 구체적인 실무 문체",
  seoTerms: ["맞춤 골프 헤드커버", "플러시 헤드커버", "캐릭터 골프 헤드커버", "마스코트 헤드커버"],
  terminology: {
    "custom golf headcover": "맞춤 골프 헤드커버",
    "plush headcover": "플러시 헤드커버",
    "club fit": "클럽 핏",
    "lining": "안감",
    "sample approval": "샘플 승인",
    "in-hands date": "희망 수령일"
  },
  allowedEnglishTerms: ["ZHONI", "MOQ", "B2B", "WhatsApp"],
  qualityRules: {
    englishResidue: "error",
    requiredTerms: [
      { term: "플러시 헤드커버", minOccurrences: 8 },
      { term: "클럽 핏", minOccurrences: 4 },
      { term: "샘플 승인", minOccurrences: 1 }
    ],
    forbiddenTerms: ["무조건 최저가", "완벽한 품질", "100% 보장"],
    formalTone: {
      minChars: 40,
      minRatio: 0.85,
      endings: ["니다", "주세요", "하세요", "인가요", "한가요", "되나요", "있나요", "없나요", "나요", "까요"]
    }
  },
  requiredAlternatePaths: [
    "/custom-plush-golf-headcovers/",
    "/guides/custom-plush-golf-headcover-design-guide/",
    "/guides/plush-golf-headcover-materials-lining-closures/",
    "/guides/plush-headcover-embroidery-patches-character-details/",
    "/guides/custom-plush-headcover-sample-quality-checklist/"
  ]
};
