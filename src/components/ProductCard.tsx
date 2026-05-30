import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "../types";
import { addCartItem } from "../services/cartService";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

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
      alert(error?.message || "Khong the them san pham vao gio hang.");
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
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="relative aspect-[4/3] overflow-hidden bg-surface-container-low block group/image">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-10 backdrop-blur-[2px]">
          <span className="bg-white text-primary px-4 py-2 rounded-full font-bold text-xs shadow-lg transform translate-y-4 group-hover/image:translate-y-0 transition-transform duration-300">
            Xem chi tiet san pham
          </span>
        </div>
        {(product.isNew || product.organic) && (
          <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded z-20 shadow-sm">
            {product.isNew ? "MOI" : "HUU CO"}
          </span>
        )}
      </Link>

      <div className="p-stack-md text-center flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">
          <h3 className="text-body-lg font-bold mb-1 line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-primary font-bold text-price-display mb-stack-md">
          {product.price.toLocaleString()}d
          <span className="text-[10px] text-on-surface-variant/60 ml-1 font-medium">/ {product.unit || "kg"}</span>
        </p>
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 py-2 border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 text-xs truncate px-1 disabled:opacity-50"
          >
            {isAdding ? "Dang them" : "Them gio"}
          </button>
          <button onClick={handleBuyNow} className="flex-1 py-2 bg-primary text-white font-bold rounded-lg hover:brightness-110 transition-colors duration-300 text-xs truncate px-1 flex items-center justify-center">
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}
