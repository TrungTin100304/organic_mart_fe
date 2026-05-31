import type { Product } from "../types";

export interface HomeProductSections {
  newArrivals: Product[];
  favoriteProducts: Product[];
}

const productDateValue = (product: Product) => {
  const rawDate = product.createdAt || product.updatedAt;
  if (!rawDate) return 0;

  const time = new Date(rawDate).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const compareNewestProducts = (a: Product, b: Product) => {
  const dateDiff = productDateValue(b) - productDateValue(a);
  if (dateDiff !== 0) return dateDiff;
  return b.id.localeCompare(a.id, undefined, { numeric: true });
};

export function getHomeProductSections(products: Product[], sectionSize = 6): HomeProductSections {
  const orderedProducts = products
    .filter((product) => product.isActive !== false)
    .slice()
    .sort(compareNewestProducts);

  return {
    newArrivals: orderedProducts.slice(0, sectionSize),
    favoriteProducts: orderedProducts.slice(sectionSize, sectionSize * 2),
  };
}
