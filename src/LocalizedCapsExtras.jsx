const Arrow = () => <span aria-hidden="true">↗</span>;

const copy = {
  ko: {
    label:"제품 구조", title:"스타일 이름보다 완성된 착용 사양을 확인하세요.", intro:"캡, 바이저와 퍼포먼스 헤드웨어는 형태, 원단, 부품과 브랜딩이 함께 작동합니다.",
    formats:[["구조형 캡","보강된 전면과 선명한 실루엣"],["비구조형 캡","부드러운 크라운과 편안한 일상 착용"],["퍼포먼스 캡","경량, 속건과 통기성을 고려한 라운드용"],["바이저·메시","햇빛 차단 또는 후면 통기성을 우선한 방향"]],
    detailLabel:"사양 프레임워크", detailTitle:"크라운 바깥과 착용 안쪽을 함께 봅니다.", detailCopy:"제품 이미지만으로는 깊이, 땀받이, 잠금 범위와 내부 봉제를 판단하기 어렵습니다.",
    details:[["크라운과 패널","높이, 구조, 봉제선과 로고 면적"],["챙과 핏","곡률, 길이, 깊이와 사이즈 범위"],["내부 구조","땀받이, 테이프, 라벨과 착용감"],["잠금 부품","조절 범위, 고정력, 무게와 외관"]],
    processLabel:"개발 경로", processTitle:"브리프에서 승인된 생산 기준까지.", process:[["01","사용 조건","착용자, 기후, 행사와 수량을 정리합니다."],["02","구조와 소재","형태, 원단, 색상, 잠금 방식과 사이즈를 정합니다."],["03","로고 설계","위치, 크기, 방식과 최소 디테일을 확인합니다."],["04","샘플 승인","핏, 형태, 로고, 부품과 포장을 기록합니다."],["05","생산 준비","승인 사양, 수량 분할, 검사와 납품 정보를 맞춥니다."]],
    guidesLabel:"골프 모자 구매 가이드", guidesTitle:"제품 선택부터 샘플 승인까지 이어서 확인하세요.", guides:[["스타일 선택","/ko/guides/custom-golf-caps-and-visors/"],["원단 선택","/ko/guides/custom-golf-cap-materials/"],["로고와 자수","/ko/guides/custom-golf-cap-logo-placement/"],["구조·핏·잠금","/ko/guides/custom-golf-cap-construction-fit-closures/"],["샘플·생산·품질","/ko/guides/custom-golf-cap-sampling-production-quality/"]]
  },
  "fr-CA": {
    label:"ARCHITECTURE DU PRODUIT", title:"Valider une spécification portée, pas seulement un nom de style.", intro:"Casquette, visière et modèle performance réunissent forme, tissu, composants et marquage.",
    formats:[["Casquette structurée","Devant renforcé et silhouette définie"],["Casquette souple","Couronne flexible et port quotidien"],["Casquette performance","Légèreté, séchage et ventilation pour le parcours"],["Visière ou filet","Protection solaire ou aération arrière prioritaire"]],
    detailLabel:"CADRE DE SPÉCIFICATION", detailTitle:"Examiner la couronne extérieure et le confort intérieur.", detailCopy:"Une image ne confirme pas la profondeur, le bandeau, la plage de réglage ni les coutures intérieures.",
    details:[["Couronne et panneaux","Hauteur, renfort, coutures et surface de logo"],["Visière et ajustement","Courbure, longueur, profondeur et tailles"],["Construction intérieure","Bandeau, rubans, étiquette et confort"],["Fermeture","Réglage, maintien, poids et apparence"]],
    processLabel:"PARCOURS DE DÉVELOPPEMENT", processTitle:"Du cahier des charges à la référence approuvée.", process:[["01","Contexte d'usage","Définir destinataires, climat, occasion et quantité."],["02","Construction et tissu","Choisir forme, matière, couleur, fermeture et tailles."],["03","Plan de marquage","Confirmer positions, dimensions, méthodes et détails minimaux."],["04","Approbation de l'échantillon","Documenter ajustement, forme, logo, composants et emballage."],["05","Préparation de la série","Aligner spécification, répartition, inspection et remise."]],
    guidesLabel:"GUIDES SUR LES CASQUETTES", guidesTitle:"Poursuivre du choix du produit à l'approbation.", guides:[["Styles et visières","/fr-ca/guides/custom-golf-caps-and-visors/"],["Choix des tissus","/fr-ca/guides/custom-golf-cap-materials/"],["Logo et broderie","/fr-ca/guides/custom-golf-cap-logo-placement/"],["Construction et ajustement","/fr-ca/guides/custom-golf-cap-construction-fit-closures/"],["Échantillon et qualité","/fr-ca/guides/custom-golf-cap-sampling-production-quality/"]]
  },
  ja: {
    label:"製品構造", title:"スタイル名ではなく、完成した着用仕様を確認する。", intro:"キャップ、バイザー、パフォーマンスモデルは、形状、生地、部品、ロゴが一体で機能します。",
    formats:[["構造入りキャップ","補強した前面と明確なシルエット"],["アンストラクチャード","柔らかなクラウンと日常的な着用感"],["パフォーマンスキャップ","軽量、速乾、通気性を重視"],["バイザー・メッシュ","日差し対策または背面の通気性を優先"]],
    detailLabel:"仕様フレームワーク", detailTitle:"外側の形状と内側の着用感を同時に確認する。", detailCopy:"画像だけでは、深さ、汗止め、調整幅、内側の縫製までは判断できません。",
    details:[["クラウンとパネル","高さ、構造、縫い目、ロゴ面積"],["つばとフィット","カーブ、長さ、深さ、サイズ範囲"],["内側構造","汗止め、テープ、ラベル、着用感"],["アジャスター","調整幅、保持力、重量、外観"]],
    processLabel:"開発経路", processTitle:"ブリーフから承認済みの生産基準へ。", process:[["01","使用条件","着用者、気候、イベント、数量を整理します。"],["02","構造と素材","形状、生地、色、アジャスター、サイズを決めます。"],["03","ロゴ設計","位置、寸法、方法、最小ディテールを確認します。"],["04","サンプル承認","フィット、形状、ロゴ、部品、包装を記録します。"],["05","量産準備","承認仕様、数量内訳、検品、納品情報を合わせます。"]],
    guidesLabel:"ゴルフ帽子購入ガイド", guidesTitle:"製品選びからサンプル承認まで続けて確認する。", guides:[["スタイルとバイザー","/ja/guides/custom-golf-caps-and-visors/"],["生地の選び方","/ja/guides/custom-golf-cap-materials/"],["ロゴと刺繍","/ja/guides/custom-golf-cap-logo-placement/"],["構造・フィット・アジャスター","/ja/guides/custom-golf-cap-construction-fit-closures/"],["サンプル・生産・品質","/ja/guides/custom-golf-cap-sampling-production-quality/"]]
  },
  de: {
    label:"PRODUKTAUFBAU", title:"Nicht nur einen Stilnamen, sondern die getragene Spezifikation freigeben.", intro:"Cap, Visor und Performance-Modell verbinden Form, Gewebe, Komponenten und Branding.",
    formats:[["Strukturierte Cap","Verstärkte Front und klare Silhouette"],["Unstrukturierte Cap","Weiche Krone und komfortabler Alltagscharakter"],["Performance-Cap","Leicht, schnell trocknend und belüftet für die Runde"],["Visor oder Mesh","Sonnenschutz oder rückseitige Belüftung im Vordergrund"]],
    detailLabel:"SPEZIFIKATIONSRAHMEN", detailTitle:"Außenform und Tragekomfort innen gemeinsam prüfen.", detailCopy:"Ein Bild bestätigt weder Kronentiefe noch Schweißband, Verstellbereich oder Innenverarbeitung.",
    details:[["Krone und Paneele","Höhe, Verstärkung, Nähte und Logofläche"],["Schirm und Passform","Krümmung, Länge, Tiefe und Größenbereich"],["Innenaufbau","Schweißband, Bänder, Label und Tragegefühl"],["Verschluss","Verstellung, Halt, Gewicht und Erscheinung"]],
    processLabel:"ENTWICKLUNGSWEG", processTitle:"Vom Briefing zur freigegebenen Produktionsreferenz.", process:[["01","Einsatzkontext","Träger, Klima, Anlass und Menge definieren."],["02","Konstruktion und Gewebe","Form, Material, Farbe, Verschluss und Größen festlegen."],["03","Brandingplan","Positionen, Maße, Methoden und Mindestdetails bestätigen."],["04","Musterfreigabe","Passform, Form, Logo, Komponenten und Verpackung dokumentieren."],["05","Serienvorbereitung","Spezifikation, Varianten, Prüfung und Übergabe abstimmen."]],
    guidesLabel:"RATGEBER FÜR GOLFCAPS", guidesTitle:"Von der Produktauswahl bis zur Musterfreigabe weiterarbeiten.", guides:[["Caps und Visoren","/de/guides/custom-golf-caps-and-visors/"],["Gewebe auswählen","/de/guides/custom-golf-cap-materials/"],["Logo und Stickerei","/de/guides/custom-golf-cap-logo-placement/"],["Konstruktion und Passform","/de/guides/custom-golf-cap-construction-fit-closures/"],["Muster und Qualität","/de/guides/custom-golf-cap-sampling-production-quality/"]]
  }
};

export function LocalizedCapsExtras({ locale }) {
  const c = copy[locale];
  if (!c) return null;
  return <>
    <section className="plush-format-section"><div><p>{c.label}</p><h2>{c.title}</h2><p>{c.intro}</p></div><div>{c.formats.map(([title,body],index)=><article key={title}><b>{String(index+1).padStart(2,"0")}</b><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="plush-detail-visual"><figure><img src="/assets/images/zhoni-cap-guide-construction-v1.png" alt={c.detailTitle}/><figcaption>ZHONI · CUSTOM GOLF HEADWEAR</figcaption></figure><div><p>{c.detailLabel}</p><h2>{c.detailTitle}</h2><p>{c.detailCopy}</p><ul>{c.details.map(([title,body])=><li key={title}><b>{title}</b><span>{body}</span></li>)}</ul></div></section>
    <section className="headcover-process"><div><p>{c.processLabel}</p><h2>{c.processTitle}</h2></div><ol>{c.process.map(([number,title,body])=><li key={number}><b>{number}</b><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>
    <section className="category-guides"><p>{c.guidesLabel}</p><h2>{c.guidesTitle}</h2><div>{c.guides.map(([label,href],index)=><a href={href} key={href}><b>{String(index+1).padStart(2,"0")}</b><span>{label}</span><Arrow/></a>)}</div></section>
  </>;
}
