import { useEffect, useState } from "react";

/** Persistent collections provided by the RapidApps platform (localStorage in
 * preview; swap for the generated REST API in production via data/store.ts). */
export interface Entity {
  id: string;
}

const listeners = new Map<string, Set<() => void>>();

function read<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem("ra:" + key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    /* storage unavailable */
  }
  return seed;
}

function write<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem("ra:" + key, JSON.stringify(items));
  } catch {
    /* storage unavailable */
  }
  listeners.get(key)?.forEach((fn) => fn());
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function useCollection<T extends Entity>(key: string, seed: T[]) {
  const [items, setItems] = useState<T[]>(() => read(key, seed));
  useEffect(() => {
    const fn = () => setItems(read(key, seed));
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(fn);
    return () => {
      listeners.get(key)!.delete(fn);
    };
  }, [key]);

  return {
    items,
    get: (id: string) => items.find((i) => i.id === id),
    create: (data: Omit<T, "id">) => {
      const item = { ...(data as object), id: newId() } as T;
      write(key, [item, ...read(key, seed)]);
      return item;
    },
    update: (id: string, patch: Partial<T>) => {
      write(key, read(key, seed).map((i) => (i.id === id ? { ...i, ...patch } : i)));
    },
    remove: (id: string) => {
      write(key, read(key, seed).filter((i) => i.id !== id));
    },
    reset: () => write(key, seed),
  };
}
