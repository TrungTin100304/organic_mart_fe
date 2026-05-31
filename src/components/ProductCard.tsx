import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Leaf, ShoppingBag, ShoppingCart } from "lucide-react";
import { Product } from "../types";
import { addCartItem } from "../services/cartService";

interface ProductCardProps {
  product: Product;
}

const fallbackImage = "/assets/hero.png";

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.image || product.imageUrl || fallbackImage);

  const handleAddToCart = async () => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return false;
    }

    setIsAdding(true);
    try {
      await addCartItem(product.id, 1);
      return true;
    } catch (error: any) {
      alert(error?.message || "Không thể thêm sản phẩm vào giỏ hàng.");
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }
    const added = await handleAddToCart();
    if (added) navigate("/checkout");
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant/70 bg-white shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-surface-container-low"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        <img
          src={imageSrc}
          alt={product.name}
          onError={() => setImageSrc(fallbackImage)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-primary/15 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-primary shadow-lg ring-1 ring-primary/10">
            <Eye className="size-4" />
            <span className="hidden sm:inline">Xem chi tiết</span>
          </span>
        </div>
        {(product.isNew || product.organic) && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary shadow-sm ring-1 ring-primary/10">
            <Leaf className="size-3" />
            {product.isNew ? "Mới" : "Hữu cơ"}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <Link to={`/product/${product.id}`} className="transition-colors hover:text-primary">
          <h3 className="min-h-[40px] text-sm font-bold leading-5 text-on-surface line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-end gap-1">
          <span className="text-lg font-extrabold leading-none text-primary">
            {product.price.toLocaleString()}đ
          </span>
          <span className="text-[11px] font-semibold text-on-surface-variant/65">
            / {product.unit || "kg"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-[44px_minmax(0,1fr)] items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="size-11 shrink-0 rounded-xl border border-primary/40 bg-primary/5 text-primary transition-all duration-300 hover:bg-primary hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
            title={isAdding ? "Đang thêm vào giỏ hàng..." : "Thêm vào giỏ hàng"}
            aria-label={isAdding ? "Đang thêm vào giỏ hàng..." : "Thêm vào giỏ hàng"}
          >
            {isAdding ? (
              <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              <ShoppingCart className="size-5" />
            )}
          </button>

          <button
            onClick={handleBuyNow}
            className="flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-bold text-white shadow-sm shadow-primary/20 transition-all duration-300 hover:brightness-110 active:scale-95"
            title="Mua ngay"
            aria-label="Mua ngay"
          >
            <ShoppingBag className="size-4 shrink-0" />
            <span className="truncate">Mua ngay</span>
          </button>
        </div>
      </div>
    </article>
  );
}
