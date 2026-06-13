import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/contexts/CartContext';

const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;

describe('CartContext stock limits', () => {
  it('caps quantity at the available stock', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        id: 'item-1',
        name: 'Latte',
        price: 200,
        image: 'latte.jpg',
        category: 'Coffee',
        stock: 3,
      });
      result.current.addItem({
        id: 'item-1',
        name: 'Latte',
        price: 200,
        image: 'latte.jpg',
        category: 'Coffee',
        stock: 3,
      });
      result.current.addItem({
        id: 'item-1',
        name: 'Latte',
        price: 200,
        image: 'latte.jpg',
        category: 'Coffee',
        stock: 3,
      });
      result.current.addItem({
        id: 'item-1',
        name: 'Latte',
        price: 200,
        image: 'latte.jpg',
        category: 'Coffee',
        stock: 3,
      });
    });

    expect(result.current.items[0]?.quantity).toBe(3);
  });

  it('prevents increasing quantity above available stock', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        id: 'item-2',
        name: 'Tea',
        price: 100,
        image: 'tea.jpg',
        category: 'Drinks',
        stock: 2,
      });
      result.current.addItem({
        id: 'item-2',
        name: 'Tea',
        price: 100,
        image: 'tea.jpg',
        category: 'Drinks',
        stock: 2,
      });
      result.current.updateQuantity('item-2', 3);
    });

    expect(result.current.items[0]?.quantity).toBe(2);
  });
});
