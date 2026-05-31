import type { Product } from "../types";

export type ProductAllergen = NonNullable<Product["allergens"]>[number] | string;

export const getAllergenDisplayName = (allergen: ProductAllergen) =>
  typeof allergen === "string" ? allergen : allergen.name;

export const getAllergenKey = (allergen: ProductAllergen) =>
  typeof allergen === "string" ? allergen : String(allergen.id);

