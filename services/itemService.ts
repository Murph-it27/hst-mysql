import { request } from './api';

export interface Item {
  id?: string;
  name: string;
  description: string;
  category: 'grocery' | 'cleaning';
  expiryDate: Date;
  quantity: number;
  notes: string;
}

const toApi = (item: Partial<Omit<Item, 'id'>>) => ({
  ...item,
  ...(item.expiryDate && { expiryDate: item.expiryDate.toISOString().split('T')[0] }),
});

const fromApi = (row: any): Item => ({
  ...row,
  expiryDate: new Date(row.expiryDate),
});

// Screens are told to re-fetch right after any change made from this device
const refreshListeners = new Set<() => void>();
const notifyChanged = () => refreshListeners.forEach((fn) => fn());

const POLL_MS = 10000; // also re-fetch every 10s so changes from other devices show up

// Same signature as the old Firestore version: returns an "unsubscribe" function.
export const readItems = (callback: (items: Item[]) => void): (() => void) => {
  let active = true;

  const load = async () => {
    try {
      const rows = await request<any[]>('/items');
      if (active) callback(rows.map(fromApi));
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

export const createItem = async (item: Omit<Item, 'id'>): Promise<string> => {
  const data = await request<{ id: string }>('/items', { method: 'POST', body: toApi(item) });
  notifyChanged();
  return data.id;
};

export const updateItem = async (id: string, item: Partial<Omit<Item, 'id'>>): Promise<void> => {
  await request(`/items/${id}`, { method: 'PUT', body: toApi(item) });
  notifyChanged();
};

export const deleteItem = async (id: string): Promise<void> => {
  await request(`/items/${id}`, { method: 'DELETE' });
  notifyChanged();
};
