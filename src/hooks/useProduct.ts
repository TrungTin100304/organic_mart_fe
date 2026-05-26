import { useEffect, useState } from 'react';
import type { Product } from '@/types/product';
import { getProductById } from '@/services/productService';

export const useProduct = (id?: string | null) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const p = await getProductById(id);
        if (!mounted) return;
        setProduct(p);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load product');
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  return { product, isLoading, error, refetch: (newId?: string | number) => void getProductById(newId ?? id!).then(setProduct).catch((e) => setError(String(e)))};
};

