const Arrow = () => <span aria-hidden="true">↗</span>;

export function ProductPriorityGateway({ eyebrow, title, intro, products, allProducts, bridge }) {
  return <>
    <section className="family-index home-product-priority" aria-labelledby={`product-priority-${allProducts.href.replace(/\W/g, "")}`}>
      <div className="family-heading">
        <p className="products-kicker">{eyebrow}</p>
        <h2 id={`product-priority-${allProducts.href.replace(/\W/g, "")}`}>{title}</h2>
        <p>{intro}</p>
        <a className="home-product-all" href={allProducts.href}>{allProducts.label} <Arrow /></a>
      </div>
      <div className="family-grid">{products.map(product => <a className="family-card" href={product.href} key={product.href}><img src={product.image} alt={product.alt || product.title} /><h3>{product.title}</h3><p>{product.copy}</p><span>— &nbsp; <Arrow /></span></a>)}</div>
    </section>
    <section className="products-intro home-product-bridge"><p className="products-kicker">{bridge.eyebrow}</p><h2>{bridge.title}</h2><p>{bridge.copy}</p><a href={bridge.href}>{bridge.label} <Arrow /></a></section>
  </>;
}
