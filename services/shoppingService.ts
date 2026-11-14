
import { request } from './api';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  isPurchased: boolean;
}

export interface ShoppingItemInput {
  name: string;
  quantity: number;
  unit: string;
  isPurchased?: boolean;
}

export const getShoppingItems = async (): Promise<ShoppingItem[]> => {
  return request<ShoppingItem[]>('/shopping-list');
};

export const createShoppingItem = async (
  item: ShoppingItemInput
): Promise<{ id: string }> => {
  return request<{ id: string }>('/shopping-list', {
    method: 'POST',
    body: item,
  });
};

export const updateShoppingItem = async (
  id: string,
  item: ShoppingItemInput
): Promise<{ ok: boolean }> => {
  return request<{ ok: boolean }>(`/shopping-list/${id}`, {
    method: 'PUT',
    body: item,
  });
};

export const deleteShoppingItem = async (
  id: string
): Promise<{ ok: boolean }> => {
  return request<{ ok: boolean }>(`/shopping-list/${id}`, {
    method: 'DELETE',
  });
};
