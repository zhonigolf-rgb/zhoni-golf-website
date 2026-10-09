import { useState } from "react";
import { LanguageSwitcher } from "./locale.jsx";
import { LocalizedBuyerEvidence } from "./LocalizedBuyerEvidence.jsx";
import { JapaneseProcurement } from "./JapaneseProcurement.jsx";

const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL ?? "https://wa.me/8617759190848";
const Arrow = () => <span aria-hidden="true">↗</span>;

function Header({ active }) {
  const [menu, setMenu] = useState(false);
  return <header className={`zhoni-header ja-header ${menu ? "zhoni-header-open" : ""}`}><a className="zhoni-wordmark" href="/ja/"><strong>ZHONI</strong><small>CUSTOM GOLF MERCHANDISE</small></a><button className="zhoni-menu" onClick={() => setMenu(value => !value)} aria-expanded={menu}>{menu ? "閉じる" : "メニュー"}</button><nav aria-label="メインナビゲーション"><a className={active === "products" ? "active" : ""} href="/ja/products/">製品</a><a className={active === "solutions" ? "active" : ""} href="/ja/solutions/">ソリューション</a><a className={active === "guides" ? "active" : ""} href="/ja/guides/">購入ガイド</a><a href="/ja/our-process/">進め方</a><a href="/ja/faq/">FAQ</a><a href="/ja/about/">会社情報</a></nav><LanguageSwitcher /><a className="zhoni-header-cta" href="/ja/request-a-quote/">プロジェクト相談 <Arrow /></a></header>;
}

function Footer() {
  return <footer className="site-footer"><div className="site-footer-main"><a className="zhoni-wordmark" href="/ja/"><strong>ZHONI</strong><small>CUSTOM GOLF MERCHANDISE</small></a><div className="site-footer-copy"><p>クラブ、大会、企業、ブランド向けのカスタムゴルフ用品。</p><span>製品 · ロゴ · サンプル · 品質 · パッケージ · 納品</span><div className="site-footer-contact"><b>直接のお問い合わせ</b><a href="mailto:sales@zhonigolf.com">sales@zhonigolf.com</a><a href={WHATSAPP_URL}>WhatsApp +86 177 5919 0848 <Arrow /></a></div></div><nav><a href="/ja/products/">製品</a><a href="/ja/solutions/">ソリューション</a><a href="/ja/guides/">購入ガイド</a><a href="/ja/our-process/">進め方</a><a href="/ja/faq/">FAQ</a><a href="/ja/request-a-quote/">お問い合わせ <Arrow /></a></nav></div><div className="site-footer-base"><span>ZHONI · CUSTOM GOLF MERCHANDISE</span><span>運営法人: Xiamen Jindongyu Trading Co., Ltd.</span></div></footer>;
}

const categoryContent = {
  jaHeadcovers: { eyebrow:"カスタムゴルフヘッドカバー", brief:"カスタムゴルフヘッドカバー", title:"クラブを守り、\nブランドを印象に残す。", intro:"ドライバー、フェアウェイ、ハイブリッド、パター用を、フィット、素材、ロゴ表現、セット構成に合わせて企画します。", image:"/assets/images/zhoni-product-headcovers-v3.png", alt:"ゴールドのZロゴを施したカスタムゴルフヘッドカバー", rows:[["製品タイプ","ドライバー · フェアウェイ · ハイブリッド · ブレード／マレットパター"],["素材","PU、合成皮革、織物、ニット、複合構造"],["ロゴ表現","刺繍、アップリケ、型押し、パッチ、ラベル"],["確認項目","クラブのフィット、開口部、裏地、縫製、ロゴ位置、番手表示"]], checklist:["必要なクラブタイプと数量内訳","希望する素材と手触りの参考","ベクターロゴとブランドカラー","個装またはセット用パッケージ","希望受取日と納品先"] },
  jaCaps: { eyebrow:"カスタムゴルフキャップ＆バイザー", brief:"カスタムゴルフキャップ＆バイザー", title:"コースの外まで続く、\nブランドアイデンティティ。", intro:"大会、クラブ会員プログラム、企業イベント向けのキャップとバイザーを、フィット、気候、生地、ロゴ方法に合わせて検討します。", image:"/assets/images/zhoni-product-caps-v3.png", alt:"ゴールドのZ刺繍を施したカスタムゴルフキャップとバイザー", rows:[["スタイル","構造／非構造キャップ · パフォーマンス · バイザー · メッシュ"],["生地","コットンツイル、ポリエステル、機能素材、メッシュ"],["ロゴ表現","平面／3D刺繍、織り／ラバーパッチ、サイド・バックロゴ"],["確認項目","クラウン、つば、汗止め、アジャスター、サイズ範囲"]], checklist:["着用者と使用シーズン","キャップまたはバイザーの形状","生地性能と色","前面・側面・背面のロゴ位置","数量、希望日、納品先"] },
  jaTowels: { eyebrow:"カスタムゴルフタオル", brief:"カスタムゴルフタオル", title:"実用性に、\n適切なブランドディテールを。", intro:"ワッフル生地、刺繍、カラビナ、マグネット構造を、コースでの使用とギフト構成に合わせて計画します。", image:"/assets/images/zhoni-product-magnetic-towel-v4.png", alt:"ゴールド刺繍とマグネット構造のカスタムゴルフタオル", rows:[["タイプ","ワッフル · マグネット · カラビナ · ギフトセット用"],["素材","マイクロファイバーワッフル、コットン、案件別の代替素材"],["ロゴ表現","刺繍、織りラベル、プリント、パッケージカード"],["確認項目","サイズ、目付、縁処理、マグネット／カラビナ、洗濯後の形状"]], checklist:["使用目的と希望サイズ","生地・色の参考","刺繍サイズと位置","マグネットまたはカラビナの要否","個装またはセット構成"] },
  jaAccessories: { eyebrow:"カスタムゴルフアクセサリー", brief:"カスタムゴルフアクセサリー", title:"小さな製品にも、\n明確なブランド体験を。", intro:"ボールマーカー、グリーンフォーク、バッグタグ、ポーチを、大会パック、企業ギフト、会員プログラムでの役割に合わせて構成します。", image:"/assets/images/zhoni-product-accessories-v3.png", alt:"ゴールドのZロゴを施したゴルフポーチとバッグタグ", rows:[["製品","ボールマーカー · グリーンフォーク · ハットクリップ · バッグタグ · ポーチ"],["素材","金属、PU、織物、製品別の複合素材"],["ロゴ表現","刻印、エナメル、型押し、刺繍、プリント"],["確認項目","サイズ、メッキ色、端部、部品の組み合わせ、個装"]], checklist:["対象と使用目的","製品構成と数量","金属仕上げまたは素材方向","ロゴの線幅と色","セット用パッケージの要否"] },
  jaPackaging: { eyebrow:"カスタムゴルフパッケージ", brief:"カスタムゴルフパッケージ", title:"製品だけでなく、\n手渡す瞬間まで整える。", intro:"ギフトボックス、インサート、スリーブ、カード、輸送保護を、製品構成、ブランド体験、実際の出荷条件に合わせて設計します。", image:"/assets/images/zhoni-product-packaging-v3.png", alt:"インサートとゴールドZロゴを施したカスタムギフトボックス", rows:[["構造","折り箱 · 貼り箱 · スリーブ · インサート"],["表面仕上げ","印刷、箔押し、エンボス／デボス、ラベル"],["内部","EVA、紙ボード、布、緩衝材、製品固定"],["確認項目","製品寸法、開封順序、保護、カートン効率、配送方法"]], checklist:["箱に入れる最終製品一覧","製品寸法と配置優先順位","ブランドカラーとロゴ","カード・スリーブ・ラベル要件","納品先と外装カートン条件"] },
};

function CategoryPage({ pageKey }) {
  const content = categoryContent[pageKey];
  return <main className="zhoni-page category-page ja-page"><Header active="products" /><section className="category-hero"><aside className="category-rail" aria-hidden="true"><strong>Z</strong><span>CUSTOM GOLF PRODUCTS</span></aside><div className="category-intro"><p>{content.eyebrow}</p><h1>{content.title.split("\n").map((line,index) => <span key={line}>{line}{index === 0 && <br />}</span>)}</h1><p>{content.intro}</p><a href={`/ja/request-a-quote/?product=${encodeURIComponent(content.brief)}`}>この製品を相談する <Arrow /></a><small>クラブ · 大会 · 企業 · ブランド</small></div><img src={content.image} alt={content.alt} /></section><section className="guide-table"><table><thead><tr><th>検討項目</th><th>実務上の方向</th></tr></thead><tbody>{content.rows.map(row => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td></tr>)}</tbody></table></section><LocalizedBuyerEvidence locale="ja" context={`product-${pageKey.replace("ja", "").toLowerCase()}`} /><section className="guide-decision"><div><p>プロジェクト準備</p><h2>価格を比べる前に、仕様の基準を揃える。</h2><p>MOQ、価格、サンプル、納期は、構造、カスタム範囲、数量、パッケージ、納品先によって変わります。</p></div><aside><p>購入担当者チェックリスト</p><h3>概要に含める内容</h3><ul>{content.checklist.map(item => <li key={item}>{item}</li>)}</ul></aside></section><section className="guide-products"><p>関連するプロジェクト経路</p><h2>製品検討から具体的な相談へ。</h2><div><a href="/ja/products/">すべての製品<Arrow /></a><a href="/ja/solutions/">用途別ソリューション<Arrow /></a><a href="/ja/our-process/">進め方<Arrow /></a><a href={`/ja/request-a-quote/?product=${encodeURIComponent(content.brief)}`}>見積もり相談<Arrow /></a></div></section><section className="guide-close"><div><p>READY TO REVIEW THE PROJECT?</p><h2>製品、数量、希望日を共有してください。</h2><a href={`/ja/request-a-quote/?product=${encodeURIComponent(content.brief)}`}>概要を送る <Arrow /></a></div><img src={content.image} alt={content.alt} /></section><Footer /></main>;
}

const solutionContent = {
  jaTournamentGifts: { label:"ゴルフ大会ギフト＆プレーヤーパック", title:"受け取る役割ごとに、適切なギフトを。", intro:"参加者、スポンサー、VIP、運営スタッフ、受賞者は、同じ大会でも必要な製品と見せ方が異なります。", image:"/assets/images/zhoni-golf-tournament-gift-delivery-v2.png", solution:"golf-tournament-gifts", steps:[["01","対象グループを分ける","参加者、スポンサー、VIP、運営、受賞者を区分します。"],["02","製品を構成する","使用場面、予算方向、配布しやすさから製品を選びます。"],["03","ロゴとパッケージを調整","大会ロゴ、スポンサー表示、現地配布を一緒に確認します。"],["04","大会日から逆算","承認、サンプル、生産、梱包、配送に必要な時間を逆算します。"]], products:"マグネットタオル、キャップ、ボールマーカー、グリーンフォーク、ポーチ、ギフトボックスを対象別に構成できます。", faqs:[["全参加者に同じギフトが必要ですか？","必ずしも同じである必要はありません。大会の共通性を保ちながら、VIPや受賞者は製品またはパッケージで区分できます。"],["プレーヤーパックは何点が適切ですか？","点数より役割が重要です。主製品一つと実用的な補助製品で、十分にまとまりのある構成が可能です。"],["大会日に直接納品できますか？","納品先、受取担当者、保管、配布時間、予備数量を早い段階で確認する必要があります。"]] },
  jaCorporateGifts: { label:"企業向けゴルフギフト", title:"関係性と贈る場面に合わせた企業ギフト。", intro:"顧客への感謝、社員表彰、パートナーイベント、ブランド施策では、受取人とプレゼンテーションレベルを先に定めます。", image:"/assets/images/zhoni-custom-golf-packaging-v2.png", solution:"corporate-golf-gifts", steps:[["01","受取人を定義","顧客、役員、社員、パートナー、イベント参加者を区分します。"],["02","ギフトレベルを決定","実用的な単品か、上質なセットかを選びます。"],["03","ブランド表現を調整","関係性と製品に合わせてロゴの大きさと見せ方を決めます。"],["04","贈呈方法を準備","メッセージカード、個装、納品先、希望受取日を確認します。"]], products:"ヘッドカバー、キャップ、タオル、金属アクセサリー、カスタムボックスを一つの企業ギフト体験にまとめられます。", faqs:[["企業ロゴは大きく入れるべきですか？","高級感を重視する場合は、小さく精度の高い表現が適することがあります。関係性と使用場面から判断します。"],["複数住所への配送は可能ですか？","宛先数、個装、住所データ形式、対象国をプロジェクト範囲として事前に確認します。"],["ゴルフをしない受取人にも対応できますか？","日常でも使いやすいキャップ、ポーチ、タオル、プレゼンテーション重視の小物を検討できます。"]] },
  jaClubMemberPrograms: { label:"ゴルフクラブ会員プログラム", title:"単発の記念品ではなく、継続できる会員体験へ。", intro:"入会、更新、記念日、会員大会、シーズン企画を、共通の製品・ブランド体系でつなげます。", image:"/assets/images/zhoni-golf-product-development-v2.png", solution:"club-member-programs", steps:[["01","会員の節目を分ける","入会、更新、記念日、会員大会、特別ステータスを区分します。"],["02","会員グループと数量","新規、継続、ジュニア、イベント参加者の数量を整理します。"],["03","製品体系を作る","主製品と補助製品を決め、再利用できる共通ルールを作ります。"],["04","継続情報を残す","ロゴ、色、仕様、パッケージ、承認記録を次回運営に活用します。"]], products:"キャップ、バイザー、ヘッドカバー、マグネットタオル、バッグタグ、ポーチ、会員向けパッケージを節目ごとに構成できます。", faqs:[["一つのプログラムで複数の会員向け場面に対応できますか？","可能です。共通のブランド体系を保ち、製品、カード、パッケージレベルで入会、記念日、イベントを区分します。"],["毎年同じ製品を再注文する必要がありますか？","必要ありません。主製品の仕様とブランドルールを維持しながら、季節や会員段階に合わせて拡張できます。"],["プロショップ販売用も一緒に企画できますか？","販売用と会員配布用の数量、ラベル、パッケージ、商業条件を分けて記載すれば検討できます。"]] },
  jaPrivateLabelCollections: { label:"プライベートブランド・ゴルフ用品", title:"ロゴ入り単品ではなく、拡張できる商品体系へ。", intro:"製品構成、仕様、ブランド適用、パッケージ、承認記録をつなぎ、追加商品と再注文に対応できる基盤を作ります。", image:"/assets/images/zhoni-golf-collection-hero-v2.png", solution:"private-label-collections", steps:[["01","商品構成を設計","主力商品、継続商品、補助アクセサリーの役割を定めます。"],["02","仕様基準を作る","素材、寸法、部品、色、品質確認項目を製品ごとに記録します。"],["03","ブランド適用ルール","ロゴ位置、サイズ、ラベル、金属仕上げ、パッケージを揃えます。"],["04","承認と拡張を管理","最終ファイル、サンプルコメント、承認版を追加商品と再注文に活用します。"]], products:"ヘッドカバー、キャップ、タオル、ポーチ、金属アクセサリー、パッケージを同じブランド体系で段階的に開発できます。", faqs:[["一つの主力商品から始められますか？","可能です。最初の製品で素材、色、ロゴ、パッケージの規則を定めると、後の拡張が容易になります。"],["すべて同じ素材にする必要がありますか？","ありません。各製品に適した素材を使い、色、ロゴ階層、ラベル、仕上げで一貫性を作れます。"],["再注文のために何を保存すべきですか？","承認仕様、最終アートワーク、色基準、部品情報、パッケージファイル、変更履歴を製品ごとに管理します。"]] },
};

function SolutionPage({ pageKey }) {
  const content = solutionContent[pageKey];
  return <main className="zhoni-page corporate-page ja-page"><Header active="solutions" /><section className="corporate-hero"><aside className="corporate-rail" aria-hidden="true"><strong>Z</strong><span>GOLF GIFT SOLUTIONS</span></aside><div><p>{content.label}</p><h1>{content.title}</h1><p>{content.intro}</p><a href={`/ja/request-a-quote/?solution=${content.solution}&source=${content.solution}`}>プロジェクト相談 <Arrow /></a></div><img src={content.image} alt={content.label} /></section><section className="corporate-ledger"><div><p>企画の進め方</p>{content.steps.map(([number,title,copy]) => <article key={number}><b>{number}</b><h2>{title}</h2><p>{copy}</p><span>→</span></article>)}</div><aside><p>最初に必要な情報</p><ul><li><b>対象</b><span>誰が、何人受け取るか</span></li><li><b>希望日</b><span>イベント日または受取希望日</span></li><li><b>納品先</b><span>国、都市、配布拠点</span></li><li><b>ブランド資料</b><span>ロゴ、色、参考画像</span></li><li><b>パッケージ</b><span>個装またはセット構成</span></li></ul></aside></section><LocalizedBuyerEvidence locale="ja" context={content.solution} /><section className="corporate-closing"><img src="/assets/images/zhoni-golf-product-development-v2.png" alt="カスタムゴルフ用品のブランド確認" /><div><p>COORDINATED GOLF MERCHANDISE</p><h2>製品を選ぶ前に、役割を定める。</h2><p>{content.products}</p><a href="/ja/products/">製品を見る <Arrow /></a></div></section><section className="guide-faq"><p>購入担当者からのよくある質問</p><h2>次の判断を具体的にする回答。</h2><div>{content.faqs.map(([question,answer],index) => <article key={question}><b>{String(index + 1).padStart(2,"0")}</b><h3>{question}</h3><p>{answer}</p></article>)}</div></section><section className="guide-products"><p>関連ページ</p><h2>具体的なプロジェクトへ進む。</h2><div><a href="/ja/products/">カスタム製品<Arrow /></a><a href="/ja/custom-golf-packaging/">パッケージ<Arrow /></a><a href="/ja/our-process/">進め方<Arrow /></a><a href={`/ja/request-a-quote/?solution=${content.solution}&source=${content.solution}`}>見積もり相談<Arrow /></a></div></section><Footer /></main>;
}

const guides = [
  { key:"gifts", group:"event", label:"ギフト・イベント", title:"カスタムゴルフギフト・プロジェクト", copy:"受取人から製品、ブランド表現、パッケージ、納品まで全体経路を整理します。", href:"/ja/custom-golf-gifts/" },
  { key:"headcovers", group:"product", label:"製品・カスタマイズ", title:"カスタムゴルフヘッドカバー購入ガイド", copy:"クラブタイプ、フィット、素材、ロゴ、サンプル、パッケージの確認事項を整理します。", href:"/ja/guides/custom-golf-headcovers-procurement-guide/" },
  { key:"caps", group:"product", label:"製品・カスタマイズ", title:"カスタムゴルフキャップ＆バイザー購入ガイド", copy:"形状、生地、フィット、アジャスター、刺繍位置を使用環境から比較します。", href:"/ja/guides/custom-golf-caps-and-visors/" },
  { key:"towels", group:"product", label:"製品・カスタマイズ", title:"カスタム・マグネットゴルフタオル購入ガイド", copy:"ワッフル生地、サイズ、マグネット構造、刺繍、セット構成を検討します。", href:"/ja/guides/custom-golf-towels-procurement-guide/" },
  { key:"branding", group:"product", label:"製品・カスタマイズ", title:"ロゴ・ブランド表現方法", copy:"刺繍、型押し、印刷、パッチ、金属仕上げを素材とロゴから比較します。", href:"/ja/guides/branding-methods-for-premium-golf-merchandise/" },
  { key:"artwork", group:"product", label:"製品・カスタマイズ", title:"ロゴとアートワークの準備", copy:"ベクターデータ、色、位置、サイズ、参考画像、パッケージファイルを整理します。", href:"/ja/guides/prepare-artwork-for-custom-golf-products/" },
  { key:"moq", group:"procurement", label:"MOQ・初回注文", title:"MOQ・最小注文数量を理解する", copy:"製品、素材、色、ロゴ、数量配分、パッケージによってMOQが変わる理由を説明します。", href:"/ja/guides/custom-golf-merchandise-moq-explained/" },
  { key:"firstorder", group:"procurement", label:"MOQ・初回注文", title:"MOQ・見積もり・初回注文の準備", copy:"初回案件に必要な仕様、数量、承認方法、日程、納品条件を整理します。", href:"/ja/first-order-guide/" },
  { key:"quote", group:"procurement", label:"MOQ・初回注文", title:"見積もりに影響する要因", copy:"製品仕様からサンプル、包装、納品条件まで、含まれる範囲を比較します。", href:"/ja/guides/what-affects-a-custom-golf-merchandise-quote/" },
  { key:"packaging", group:"readiness", label:"品質・納品", title:"カスタムゴルフパッケージ購入ガイド", copy:"箱、インサート、印刷、輸送保護、外装カートンまで一つの条件で確認します。", href:"/ja/guides/custom-golf-packaging-procurement-guide/" },
  { key:"export", group:"readiness", label:"品質・納品", title:"品質・包装・輸出準備", copy:"製品確認、個装、外装カートン、納品先、引き渡し条件をつなげます。", href:"/ja/quality-packaging-export-readiness/" },
  { key:"quality", group:"readiness", label:"品質・納品", title:"カスタムゴルフ用品品質チェックリスト", copy:"素材、寸法、ロゴ、機能、包装、カートンを承認仕様に基づいて確認します。", href:"/ja/guides/custom-golf-merchandise-quality-checklist/" },
  { key:"delivery", group:"readiness", label:"品質・納品", title:"納期とイベント日を計画する", copy:"アートワーク、サンプル、生産、包装、国際配送を希望受取日から逆算します。", href:"/ja/guides/how-to-plan-a-golf-merchandise-delivery-date/" },
  { key:"postbrief", group:"procurement", label:"MOQ・初回注文", title:"プロジェクト相談後の進行", copy:"ブリーフ受付、適合性確認、追加質問、次の段階までをご案内します。", href:"/ja/guides/what-happens-after-a-custom-golf-project-brief/" },
];

const guideGroups = [
  ["all", "すべて"],
  ["product", "製品・カスタマイズ"],
  ["event", "ギフト・イベント"],
  ["procurement", "MOQ・初回注文"],
  ["readiness", "品質・納品"],
];

function GuidesHub() {
  const [filter, setFilter] = useState("all");
  const visibleGroups = guideGroups.filter(([key]) => key === "all" || guides.some(guide => guide.group === key));
  return <main className="zhoni-page guides-page ja-page"><Header active="guides" /><section className="guides-hero"><div><p>GOLF MERCHANDISE BUYER GUIDES</p><h1>カスタムゴルフ用品の<br />購入判断を、より明確に。</h1><p>製品選びから仕様、MOQ、サンプル、パッケージ、納品準備まで、実際のプロジェクトで必要な判断材料を整理します。</p></div><aside><b>最初に確認すること</b><p>何を作るかだけでなく、誰が、いつ、どの場面で受け取るかを定めると、製品と仕様を選びやすくなります。</p><a href="/ja/request-a-quote/">プロジェクトを相談する <Arrow /></a></aside></section><section className="guide-filter" aria-label="購入ガイドの絞り込み">{visibleGroups.map(([key,label]) => <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{label}</button>)}</section><section className="guide-catalog">{guides.filter(guide => filter === "all" || guide.group === filter).map((guide,index) => <a href={guide.href} key={guide.key}><b>{String(index + 1).padStart(2,"0")}</b><span>{guide.label}</span><h2>{guide.title}</h2><p>{guide.copy}</p><em>ガイドを読む <Arrow /></em></a>)}</section><LocalizedBuyerEvidence locale="ja" context="guides" /><section className="guide-decision"><div><p>購入準備</p><h2>一般的な情報を、案件固有の条件につなげる。</h2><p>製品方向、予定数量、ブランド資料、希望受取日、納品先が揃うと、MOQ、サンプル、見積もりの前提をより現実的に確認できます。</p></div><aside><p>共通ブリーフ項目</p><ul>{["受取人と使用目的","製品または参考画像","予定数量","希望受取日と納品先","ロゴとパッケージ要件"].map(item => <li key={item}>{item}</li>)}</ul></aside></section><Footer /></main>;
}

const articleContent = {
  jaHeadcoversGuide: {
    label:"カスタムゴルフヘッドカバー", brief:"カスタムゴルフヘッドカバー", title:"購入前に決めておきたい6つの項目", intro:"外観だけでなく、クラブタイプ、フィット、素材、ロゴ、番手表示、パッケージを一つの仕様として整理します。", image:"/assets/images/zhoni-product-headcovers-v3.png", product:"/ja/custom-golf-headcovers/",
    rows:[["クラブ構成","ドライバー、フェアウェイ、ハイブリッド、ブレード／マレットパターの数量内訳"],["形状とフィット","クラブ寸法、開口部、全長、伸縮またはマグネットによる保持"],["素材","PU、織物、ニットの触感、耐久性、ロゴ方法との相性"],["ブランド表現","刺繍、アップリケ、型押し、パッチとロゴ位置"],["内部と仕上げ","裏地、縫製、縁処理、番手表示、着脱性"],["パッケージ","個装、セット箱、ラベル、他製品との組み合わせ"]],
    checklist:["クラブタイプ別の予定数量","正面・側面・背面の参考画像","ベクターロゴと色指定","希望する素材または触感の参考","希望受取日と納品国"],
    faqs:[["ヘッドカバーのMOQはすべて同じですか？","いいえ。形状、素材、色数、ロゴ方法、タイプ別の数量配分によって適用条件が変わります。"],["実物サンプルは必要ですか？","新しい構造や正確なフィットが重要な場合は有効です。案件に応じて校正、既存サンプル、新規サンプルの経路を選びます。"],["ドライバーとパターで同じデザインを使えますか？","統一したデザインは可能ですが、パネル構造と使用できる面積が異なるため、単純縮小ではなく形状ごとの調整が必要です。"]],
  },
  jaTowelsGuide: {
    label:"カスタムゴルフタオル", brief:"カスタムゴルフタオル", title:"生地、サイズ、取り付け方法を一緒に選ぶ", intro:"ゴルフタオルはラウンド中に繰り返し使う道具です。吸水性、乾きやすさ、取り付け方法、ロゴの見え方を同じ基準で確認します。", image:"/assets/images/zhoni-product-magnetic-towel-v4.png", product:"/ja/custom-golf-towels/",
    rows:[["使用場面","ゴルフバッグ、カート、プレーヤーパック、ギフトセット"],["生地","ワッフル構造、目付、触感、吸水性、乾燥特性"],["サイズ","折りたたんだときの体積と実際に使える面積"],["取り付け","マグネット、カラビナ、ハトメ、独立クリップ"],["ロゴ","刺繍サイズ、位置、糸色、裏面への影響"],["パッケージ","帯、保護袋、カード、ギフトボックス"]],
    checklist:["希望する縦横サイズ","生地色と参考タオル","マグネットまたは金具の仕様","刺繍用ロゴの元データ","セットに含める他の製品"],
    faqs:[["マグネットタオルでは何を確認すべきですか？","マグネットの位置と固定方法、金属接点、タオル重量、カートやクラブ周辺での実際の使い方を確認します。"],["刺繍は大きいほど良いですか？","必ずしもそうではありません。大きな刺繍は柔軟性や乾燥に影響するため、視認性と実用性のバランスが必要です。"],["一つの注文を複数色に分けられますか？","生地、染色または既製色、総数量、色別配分によって条件が変わるため、見積もり前に内訳を共有してください。"]],
  },
  jaCapsStyleGuide: {
    label:"カスタムゴルフキャップ＆バイザー", brief:"カスタムゴルフキャップ＆バイザー", title:"スタイルより先に、着用環境を決める", intro:"クラウン構造、生地、通気性、アジャスター、ロゴ位置が、着用感と仕上がりを一緒に決定します。", image:"/assets/images/zhoni-product-caps-v3.png", product:"/ja/custom-golf-caps/",
    rows:[["着用者","成人／ジュニア、グループ構成、必要なサイズ範囲"],["形状","構造／非構造、ロー／ミッドプロファイル、キャップ／バイザー"],["使用環境","暑い気候、長時間のラウンド、イベント、日常使用"],["生地","コットンツイル、ポリエステル、機能素材、メッシュ"],["アジャスター","スナップ、バックル、面ファスナー、ストレッチフィット"],["ブランド表現","正面刺繍、パッチ、側面・背面ロゴ"]],
    checklist:["キャップまたはバイザーの参考形状","使用地域とシーズン","必要なサイズ範囲","各ロゴ位置のデータ","イベント日と予定数量"],
    faqs:[["ゴルフ用には必ず機能素材が必要ですか？","暑い地域や長時間着用では軽さ、速乾性、通気性を優先できます。ギフトとしての触感や外観を重視する場合はツイルも適します。"],["3D刺繍はすべてのロゴに適していますか？","いいえ。細い線、小さな文字、複雑なディテールは平面刺繍やパッチの方が明瞭になる場合があります。"],["フリーサイズだけで十分ですか？","受取人の構成とアジャスターによります。表記だけでなく、実際の調整範囲とクラウンの深さを確認してください。"]],
  },
  jaPackagingGuide: {
    label:"カスタムゴルフパッケージ", brief:"カスタムゴルフパッケージ", title:"箱を設計する前に、製品と渡し方を確定する", intro:"良いパッケージは製品を見せるだけでなく、固定し、輸送中に保護し、現場で配布しやすいことが必要です。", image:"/assets/images/zhoni-product-packaging-v3.png", product:"/ja/custom-golf-packaging/",
    rows:[["製品一覧","最終構成、数量、実寸、重量、接触しやすい部品"],["箱の構造","貼り箱、折り箱、スリーブ、開封方法"],["インサート","製品固定、取り出す順番、素材、交換可能性"],["ブランド表現","印刷、箔押し、エンボス／デボス、ラベル、カード"],["輸送保護","擦れ、圧縮、湿気、金属部品同士の接触への対策"],["出荷条件","外装カートン、入数、納品先、引き渡し条件"]],
    checklist:["最終製品と実際の寸法","希望する開封体験","箱とインサートの参考画像","印刷データとブランドカラー","納品国と現地での配布方法"],
    faqs:[["製品完成前に箱を確定できますか？","推奨しません。製品寸法や配置が変わると、インサートと箱全体の構造を変更する必要があります。"],["高級な貼り箱は常に必要ですか？","いいえ。イベント配布、国際輸送、保管スペース、予算によっては折り箱やスリーブの方が適切です。"],["パッケージのMOQは製品と同じですか？","必ずしも同じではありません。箱の構造、印刷、インサート、素材には別の生産条件が適用される場合があります。"]],
  },
};

function GuideArticle({ pageKey }) {
  const content = articleContent[pageKey];
  return <main className="zhoni-page guide-page ja-page"><Header active="guides" /><section className="guide-hero"><div><p>{content.label} · 購入ガイド</p><h1>{content.title}</h1><p>{content.intro}</p><small>製品選定 · 仕様準備 · サンプル確認 · 見積もり</small></div><img src={content.image} alt={content.label} /></section><section className="guide-intro"><p>PRACTICAL BUYER REVIEW</p><h2>価格を依頼する前に決めておきたい実務項目。</h2><p>最初からすべてを確定する必要はありません。現在分かっている条件と参考資料を整理することで、適切な製品、MOQ、サンプル方法、スケジュールをより正確に検討できます。</p></section><section className="guide-table"><table><thead><tr><th>確認項目</th><th>購入担当者が準備する情報</th></tr></thead><tbody>{content.rows.map(row => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td></tr>)}</tbody></table></section><LocalizedBuyerEvidence locale="ja" context={`guide-${pageKey.replace("ja", "").replace("Guide", "").toLowerCase()}`} /><section className="guide-decision"><div><p>ブリーフ準備</p><h2>同じ条件で提案と見積もりを比較する。</h2><p>製品仕様、ロゴ、数量、希望日、パッケージ、納品先を一緒に伝えることで、単価だけでなく実際のプロジェクト範囲を比較できます。</p></div><aside><p>チェックリスト</p><h3>お問い合わせ前に準備する資料</h3><ul>{content.checklist.map(item => <li key={item}>{item}</li>)}</ul></aside></section><section className="guide-faq"><p>購入担当者からのよくある質問</p><h2>次の判断に使える具体的な回答。</h2><div>{content.faqs.map(([question,answer],index) => <article key={question}><b>{String(index + 1).padStart(2,"0")}</b><h3>{question}</h3><p>{answer}</p></article>)}</div></section><section className="guide-products"><p>関連ページ</p><h2>ガイドから具体的なプロジェクトへ。</h2><div><a href={content.product}>関連製品ページ<Arrow /></a><a href="/ja/solutions/">Solutions<Arrow /></a><a href="/ja/our-process/">進め方<Arrow /></a><a href={`/ja/request-a-quote/?product=${encodeURIComponent(content.brief)}`}>見積もり相談<Arrow /></a></div></section><section className="guide-close"><div><p>READY TO PREPARE THE BRIEF?</p><h2>製品、数量、希望受取日を共有してください。</h2><a href={`/ja/request-a-quote/?product=${encodeURIComponent(content.brief)}`}>プロジェクト概要を送る <Arrow /></a></div><img src={content.image} alt={content.label} /></section><Footer /></main>;
}

export function JapaneseExpansion({ routeKey }) {
  if (categoryContent[routeKey]) return <CategoryPage pageKey={routeKey} />;
  if (solutionContent[routeKey]) return <SolutionPage pageKey={routeKey} />;
  if (articleContent[routeKey]) return <GuideArticle pageKey={routeKey} />;
  if (routeKey === "jaGuides") return <GuidesHub />;
  return <JapaneseProcurement routeKey={routeKey} />;
}
