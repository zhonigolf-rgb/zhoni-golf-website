const evidenceCopy = {
  ja: {
    eyebrow: "バイヤー向け確認情報",
    title: "何を確認し、どの記録を承認の根拠にするかを明確に。",
    intro: "信頼できるカスタムプロジェクトは、追跡できる意思決定によって進みます。書類の形式は製品と合意範囲により異なりますが、購入担当者が確認すべき基本記録は共通しています。",
    items: [
      ["01", "書面化された範囲", "製品、素材、構造、ロゴ、パッケージ、未決事項を一つのプロジェクト基準として整理します。"],
      ["02", "承認履歴", "アートワーク、校正、サンプルへのコメントを最新の合意内容に集約してから生産準備へ進みます。"],
      ["03", "品質確認項目", "一般的なチェックリストではなく、承認済み仕様に基づいて外観、機能、ロゴ、梱包の確認項目を定めます。"],
      ["04", "梱包と引き渡し", "最終引き渡し前に、個装、外装カートン、納品先、合意した配送責任を確認します。"],
    ],
    boundary: "書類の適用範囲",
    boundaryCopy: "形式と提供可否は、製品、生産経路、プロジェクト段階により異なります。検査、試験、規制対応、輸送書類が必要な場合は、契約前に明示し合意する必要があります。この案内は、すべての製品に共通する認証を示すものではありません。",
    link: "プロジェクトの進め方を見る",
    href: "/ja/our-process/",
  },
  ko: {
    eyebrow: "구매자 검증 정보",
    title: "무엇을 검토하고, 어떤 기록으로 승인하는지 확인하세요.",
    intro: "신뢰할 수 있는 맞춤 프로젝트는 추적 가능한 결정으로 진행됩니다. 실제 문서 형식은 제품과 합의된 범위에 따라 달라지지만, 구매자가 확인해야 할 핵심 기록은 같습니다.",
    items: [
      ["01", "서면 범위", "선택한 제품, 소재, 구조, 로고, 패키징과 미결정 사항을 하나의 프로젝트 기준으로 정리합니다."],
      ["02", "승인 기록", "아트워크, 시안 또는 샘플 의견을 최신 합의 방향에 맞춰 통합한 뒤 생산 준비로 이동합니다."],
      ["03", "품질 확인 항목", "일반적인 체크리스트가 아니라 승인된 제품 범위에 맞춰 외관, 기능, 로고와 포장 확인 항목을 정의합니다."],
      ["04", "포장과 인도", "최종 인도 전에 포장 방식, 외부 카톤, 목적지와 합의된 배송 책임을 확인합니다."],
    ],
    boundary: "문서 범위",
    boundaryCopy: "형식과 제공 가능 여부는 제품, 생산 경로와 프로젝트 단계에 따라 달라집니다. 검사, 시험, 규정 준수 또는 운송 문서가 필요하면 계약 전에 명시하고 합의해야 합니다. 이 안내는 모든 제품에 대한 보편적 인증을 의미하지 않습니다.",
    link: "프로젝트 진행 과정 보기",
    href: "/ko/our-process/",
  },
  "fr-CA": {
    eyebrow: "PREUVES POUR L’ACHETEUR",
    title: "Savoir ce qui est vérifié et ce qui appuie l’approbation.",
    intro: "Un projet personnalisé crédible repose sur des décisions traçables. Les documents exacts varient selon le produit et la portée convenue, mais voici les éléments que l’acheteur devrait pouvoir examiner.",
    items: [
      ["01", "Portée écrite", "Le produit, les matières, la construction, le marquage, l’emballage et les décisions ouvertes sont réunis dans une référence de projet."],
      ["02", "Historique d’approbation", "Les commentaires sur les fichiers, maquettes ou échantillons sont consolidés selon la dernière orientation convenue avant la préparation de la production."],
      ["03", "Points de contrôle", "Les contrôles d’apparence, de fonction, de logo et d’emballage sont définis selon la portée approuvée plutôt qu’une liste générique."],
      ["04", "Emballage et remise", "La méthode d’emballage, les cartons, la destination et les responsabilités de livraison convenues sont vérifiés avant la remise finale."],
    ],
    boundary: "LIMITES DOCUMENTAIRES",
    boundaryCopy: "Les formats et la disponibilité varient selon le produit, le parcours de production et l’étape du projet. Tout document d’inspection, d’essai, de conformité ou d’expédition doit être demandé et convenu avant l’engagement; cette section ne constitue pas une déclaration de certification universelle.",
    link: "VOIR NOTRE PROCESSUS",
    href: "/fr-ca/our-process/",
  },
};

export function LocalizedBuyerEvidence({ locale, context = "project" }) {
  const copy = evidenceCopy[locale];
  if (!copy) return null;
  return <section className="buyer-evidence-layer" data-buyer-evidence={`${locale.toLowerCase()}-${context}`}>
    <div className="buyer-evidence-heading"><p>{copy.eyebrow}</p><h2>{copy.title}</h2><p>{copy.intro}</p></div>
    <div className="buyer-evidence-grid">{copy.items.map(([number, title, description]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{description}</p></article>)}</div>
    <aside><div><b>{copy.boundary}</b><p>{copy.boundaryCopy}</p></div><a href={copy.href}>{copy.link} <span aria-hidden="true">↗</span></a></aside>
  </section>;
}
