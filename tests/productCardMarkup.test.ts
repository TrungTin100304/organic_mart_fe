import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

import ProductCard from "../src/components/ProductCard.tsx";
import type { Product } from "../src/types/index.ts";

const product: Product = {
  id: "p1",
  name: "Nam huong kho huu co 100g",
  slug: "nam-huong-kho-huu-co-100g",
  price: 85000,
  image: "/broken-product.png",
  category: "Nam",
  description: "",
  organic: true,
  unit: "100g",
};

test("ProductCard keeps the add-to-cart action as a compact icon button", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ProductCard, { product }),
    ),
  );

  assert.match(markup, /aria-label="Thêm vào giỏ hàng"/);
  assert.match(markup, /(?:size-11|w-11 h-11)/);
  assert.doesNotMatch(markup, />Thêm vào giỏ hàng</);
});
