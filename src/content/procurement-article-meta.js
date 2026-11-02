export const procurementArticleRoutes = {
  towels: { path: "/guides/custom-golf-towels-procurement-guide/", product: "/custom-golf-towels/", image: "/assets/images/zhoni-golf-product-development-v2.png" },
  caps: { path: "/guides/custom-golf-caps-and-visors/", product: "/custom-golf-caps/", image: "/assets/images/zhoni-cap-guide-styles-v1.png" },
  plush: { path: "/guides/custom-plush-golf-headcover-design-guide/", product: "/custom-plush-golf-headcovers/", image: "/assets/images/zhoni-plush-novelty-headcovers-v1.jpg" },
};

export function procurementArticleKey(route) {
  return Object.keys(procurementArticleRoutes).find(key => procurementArticleRoutes[key].path === (route?.alternatePath ?? route?.path));
}

// Small SEO registry only: article bodies stay in their existing language chunks.
export const procurementArticleMeta = {
  en: {
    towels: ["Custom Golf Towels: Materials, Magnets & Buying Guide | ZHONI", "Plan custom golf towels around fabric, magnetic or clip attachment, logo placement, sample checks and packing. Learn what makes quotations comparable."],
    caps: ["Custom Golf Caps & Visors: Style, Fit & Buying Guide | ZHONI", "Compare custom golf cap and visor styles, crown structure, fabrics and branding. Plan a useful brief, sample review and comparable quotation."],
    plush: ["Custom Plush Golf Headcover Design Guide | ZHONI", "Turn an authorised character into a custom plush golf headcover brief. Balance recognition, club fit, materials, sample decisions and packed form."],
  },
  ko: {
    towels: ["맞춤 골프 타월 구매 가이드: 소재·자석·포장 | ZHONI", "맞춤 골프 타월의 소재, 자석·클립 부착, 로고 위치, 샘플과 포장을 검토하고 같은 조건으로 견적을 비교하는 방법을 안내합니다."],
    caps: ["맞춤 골프 모자·바이저: 형태·핏·구매 가이드 | ZHONI", "맞춤 골프 모자와 바이저의 크라운 구조, 소재와 로고를 비교하고 브리프, 착용 샘플, 포장과 견적 조건을 준비합니다."],
    plush: ["맞춤 플러시 골프 헤드커버 디자인 가이드 | ZHONI", "사용 권한이 있는 캐릭터로 맞춤 플러시 헤드커버를 기획합니다. 캐릭터 인지성, 클럽 핏, 소재, 샘플 승인과 포장 형태를 검토합니다."],
  },
  "fr-CA": {
    towels: ["Serviettes de golf personnalisées : guide d’achat | ZHONI", "Comparez tissu, fixation magnétique ou mousqueton, emplacement du logo, échantillons et emballage pour obtenir des soumissions comparables."],
    caps: ["Casquettes et visières de golf : guide d’achat | ZHONI", "Comparez formes, ajustement, tissus et marquage des casquettes de golf personnalisées. Préparez votre demande, l’échantillon et la soumission."],
    plush: ["Conception de couvre-bâtons en peluche personnalisés | ZHONI", "Préparez un couvre-bâton en peluche à partir d’un personnage autorisé : identité, ajustement au bâton, matières, échantillon et emballage."],
  },
  ja: {
    towels: ["オリジナルゴルフタオルの調達ガイド｜ZHONI", "ゴルフタオルの素材、マグネット・クリップ、ロゴ位置、サンプル、梱包を整理し、同じ条件で見積もりを比較する方法を解説します。"],
    caps: ["オリジナルゴルフキャップ・バイザー購入ガイド｜ZHONI", "ゴルフキャップとバイザーの形状、フィット、素材、ロゴを比較。仕様相談からサンプル確認、梱包、見積もりまでを整理します。"],
    plush: ["オリジナルぬいぐるみヘッドカバー設計ガイド｜ZHONI", "使用許諾のあるキャラクターからゴルフ用ぬいぐるみヘッドカバーを企画。特徴、クラブへのフィット、素材、サンプル承認、梱包を検討します。"],
  },
  de: {
    towels: ["Golfhandtücher personalisieren: Einkaufsratgeber | ZHONI", "Gewebe, Magnet oder Karabiner, Logoposition, Muster und Verpackung für individuelle Golfhandtücher planen und Angebote vergleichbar machen."],
    caps: ["Golfcaps und Visoren: Form, Passform & Einkauf | ZHONI", "Formen, Kronenaufbau, Gewebe und Branding für individuelle Golfcaps vergleichen. Briefing, Musterprüfung und vergleichbare Angebote vorbereiten."],
    plush: ["Individuelle Plüsch-Golf-Headcover gestalten | ZHONI", "Autorisierte Figuren als Plüsch-Golf-Headcover planen: Wiedererkennung, Schlägerpassform, Materialien, Musterfreigabe und verpackte Form abstimmen."],
  },
};
