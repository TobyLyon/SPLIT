import { create } from 'zustand';
import { RPC_ENDPOINT } from '@/config/constants';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  txHash?: string;
  timestamp: number;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? 5000,
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 5), // Keep max 5 notifications
    }));
    
    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, newNotification.duration);
    }
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ notifications: [] });
  },
}));

export function useNotifications() {
  const { addNotification, removeNotification, clearAll } = useNotificationStore();
  
  const addSuccessNotification = (title: string, message: string, txHash?: string) => {
    addNotification({ type: 'success', title, message, txHash });
  };
  
  const addErrorNotification = (title: string, message: string) => {
    addNotification({ type: 'error', title, message });
  };
  
  const addInfoNotification = (title: string, message: string) => {
    addNotification({ type: 'info', title, message });
  };
  
  const addWarningNotification = (title: string, message: string) => {
    addNotification({ type: 'warning', title, message });
  };
  
  return {
    addNotification,
    addSuccessNotification,
    addErrorNotification,
    addInfoNotification,
    addWarningNotification,
    removeNotification,
    clearAll,
  };
}

export function getExplorerUrl(txHash: string, cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet') {
  return `https://explorer.solana.com/tx/${txHash}?cluster=${cluster}`;
}