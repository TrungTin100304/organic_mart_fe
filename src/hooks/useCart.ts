import { useState, useCallback } from 'react';
import { addCartItem, getMyCart, updateCartItem, removeCartItem } from '@/services/cartService';
import type { Cart } from '@/types/cart';

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setIsLoadingCart(true);
    setError(null);
    try {
      const data = await getMyCart();
      setCart(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Khong the lay thong tin gio hang';
      setError(message);
    } finally {
      setIsLoadingCart(false);
    }
  }, []);

  const addItem = async (productId: number, quantity: number): Promise<Cart | null> => {
    if (!Number.isFinite(productId) || productId <= 0) {
      setError('San pham khong hop le');
      return null;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError('So luong khong hop le');
      return null;
    }

    setIsAdding(true);
    setError(null);

    try {
      const data = await addCartItem({ productId, quantity });
      setCart(data); // Update cart state with newest cart data
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Them vao gio hang that bai';
      setError(message);
      return null;
    } finally {
      setIsAdding(false);
    }
  };

  const updateItem = async (itemId: number, quantity: number): Promise<Cart | null> => {
    if (quantity <= 0) {
      setError('So luong phai lon hon 0');
      return null;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const data = await updateCartItem(itemId, quantity);
      setCart(data);
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Cap nhat that bai';
      setError(message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (itemId: number): Promise<Cart | null> => {
    setIsRemoving(true);
    setError(null);

    try {
      const data = await removeCartItem(itemId);
      setCart(data);
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Xoa that bai';
      setError(message);
      return null;
    } finally {
      setIsRemoving(false);
    }
  };

  return { cart, isLoadingCart, fetchCart, addItem, updateItem, removeItem, isAdding, isUpdating, isRemoving, error, clearError: () => setError(null) };
};
