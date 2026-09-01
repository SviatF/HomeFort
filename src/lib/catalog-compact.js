export function compactCatalogProduct(product = {}) {
  return {
    id: product.id,
    itemGroupId: product.itemGroupId,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    category: product.category,
    productType: product.productType,
    brand: product.brand,
    price: Number(product.price || product.price_current || 0),
    price_current: Number(product.price_current || product.price || 0),
    oldPrice: Number(product.oldPrice || product.price_old || 0) || null,
    price_old: Number(product.price_old || product.oldPrice || 0) || null,
    discountPercent: Number(product.discountPercent || product.salePercent || 0) || 0,
    salePercent: Number(product.salePercent || product.discountPercent || 0) || 0,
    discount_label: product.discount_label || null,
    priceFrom: Boolean(product.priceFrom),
    currency: product.currency || 'UAH',
    availability: product.availability,
    productionTime: product.productionTime || null,
    images: (product.images || []).filter(Boolean).slice(0, 5),
    imageAlt: product.imageAlt || product.name || '',
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    material: product.material || null,
    colors: Array.isArray(product.colors) ? product.colors.slice(0, 12) : [],
    fabrics: Array.isArray(product.fabrics) ? product.fabrics.slice(0, 12) : [],
    liftingMechanism: Boolean(product.liftingMechanism),
    rating: Number(product.rating || 0) || 0,
    reviewsCount: Number(product.reviewsCount || product.reviews_count || 0) || 0,
    featured: Boolean(product.featured),
    created_date: product.created_date || null,
    indexable: product.indexable !== false,
  };
}

export function compactCatalogProducts(products = []) {
  return (products || []).map(compactCatalogProduct);
}
