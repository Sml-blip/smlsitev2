'use client';
import { create } from 'zustand';

export interface SeoNotification {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  read: boolean;
  chatMessage?: string;
  type: 'keywords' | 'suggestions' | 'audit' | 'ai';
}

const STORAGE_KEY = 'seo_notifications';

function loadFromStorage(): SeoNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveToStorage(notifs: SeoNotification[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 30)));
}

interface SeoNotifStore {
  notifications: SeoNotification[];
  unreadCount: number;
  init: () => void;
  add: (n: Omit<SeoNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useSeoNotifications = create<SeoNotifStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  init: () => {
    const notifs = loadFromStorage();
    set({ notifications: notifs, unreadCount: notifs.filter((n) => !n.read).length });
  },

  add: (n) => {
    const newNotif: SeoNotification = {
      ...n,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false,
    };
    const updated = [newNotif, ...get().notifications].slice(0, 30);
    saveToStorage(updated);
    set({ notifications: updated, unreadCount: updated.filter((x) => !x.read).length });
  },

  markAllRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    saveToStorage(updated);
    set({ notifications: updated, unreadCount: 0 });
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ notifications: [], unreadCount: 0 });
  },
}));
