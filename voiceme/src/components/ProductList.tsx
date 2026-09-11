"use client";

import type { AffiliateProduct } from "@/types/domain";
import { track } from "@/lib/store";

export function ProductList({ products }: { products: AffiliateProduct[] }) {
  if (products.length === 0) return null;
  return (
    <div>
      <p className="mb-3 text-xs font-medium text-ink-500">
        おすすめ商品（PR・アフィリエイトを含みます）
      </p>
      <div className="space-y-3">
        {products.map((product) => (
          <a
            key={product.id}
            href={product.affiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => track("product_click", { productId: product.id })}
            className="flex items-center gap-3 rounded-xl2 bg-white p-3 shadow-card transition active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream-100 text-2xl">
              {product.imageEmoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-ink-500">{product.category}</span>
              <span className="block truncate text-sm font-semibold text-ink-900">
                {product.name}
              </span>
              <span className="block truncate text-xs text-ink-500">{product.description}</span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-coral-600">{product.price}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
