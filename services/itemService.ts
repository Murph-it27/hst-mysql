
import { request } from './api';

export const CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Groceries & Staples',
  'Snacks & Beverages',
  'Cleaning Supplies',
  'Personal Care',
  'Laundry',
  'Health & First Aid',
  'Pet Supplies',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Item {
  id?: string;
  name: string;
  description: string;
  category: Category;
  quantity: number;
  unit: string;
  minimumStock: number;
  expiryDate: Date | null;
  notes: string;
  imageUrl: string | null;
}

type ApiItem = {
  id: string;
  name: string;
  description?: string;
  category: Category;
  quantity: number;
  unit?: string;
  minimumStock?: number;
  expiryDate?: string | null;
  notes?: string;
  imageUrl?: string | null;
};

// Convert a Date into YYYY-MM-DD without timezone shifting.
const dateToApi = (date: Date | null): string | null => {
  if (!date || Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const toApi = (item: Partial<Omit<Item, 'id'>>) => ({
  ...item,
  expiryDate:
    item.expiryDate === undefined
      ? undefined
      : dateToApi(item.expiryDate),
});

const fromApi = (row: ApiItem): Item => ({
  id: String(row.id),
  name: row.name,
  description: row.description || '',
  category: row.category,
  quantity: Number(row.quantity),
  unit: row.unit || 'pcs',
  minimumStock: Number(row.minimumStock ?? 1),
  expiryDate: row.expiryDate
    ? new Date(`${row.expiryDate.slice(0, 10)}T00:00:00`)
    : null,
  notes: row.notes || '',
  imageUrl: row.imageUrl || null,
});

// Refresh listeners update screens after an item changes.
const refreshListeners = new Set<() => void>();

const notifyChanged = () => {
  refreshListeners.forEach((listener) => listener());
};

const POLL_MS = 10000;

// Read items and refresh when changes are made.
export const readItems = (
  callback: (items: Item[]) => void
): (() => void) => {
  let active = true;

  const load = async () => {
    try {
      const rows = await request<ApiItem[]>('/items');

      if (active) {
        callback(rows.map(fromApi));
      }
    } catch (error) {
      console.warn('Failed to load items:', error);
    }
  };

  load();

  refreshListeners.add(load);

  const timer = setInterval(load, POLL_MS);

  return () => {
    active = false;
    clearInterval(timer);
    refreshListeners.delete(load);
  };
};

// Add an item.
export const createItem = async (
  item: Omit<Item, 'id'>
): Promise<string> => {
  const data = await request<{ id: string }>('/items', {
    method: 'POST',
    body: toApi(item),
  });

  notifyChanged();

  return data.id;
};

// Update an item.
export const updateItem = async (
  id: string,
  item: Partial<Omit<Item, 'id'>>
): Promise<void> => {
  await request(`/items/${id}`, {
    method: 'PUT',
    body: toApi(item),
  });

  notifyChanged();
};

// Delete an item.
export const deleteItem = async (id: string): Promise<void> => {
  await request(`/items/${id}`, {
    method: 'DELETE',
  });

  notifyChanged();
};
