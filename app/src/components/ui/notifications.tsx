'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNotificationStore, getExplorerUrl } from '@/hooks/useNotifications';
import { Button } from './button';
import { Card } from './card';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'text-green-400 bg-green-400/10 border-green-400/20',
  error: 'text-red-400 bg-red-400/10 border-red-400/20',
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
};

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationStore();
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type];
          const colorClass = colorMap[notification.type];
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
              className="relative"
            >
              <Card className={`p-4 ${colorClass} glass-strong`}>
                <div className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    
                    {notification.txHash && (
                      <a
                        href={getExplorerUrl(notification.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-brand-mint hover:text-brand-mint/80 mt-2"
                      >
                        <span>View Transaction</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotification(notification.id)}
                    className="h-6 w-6 p-0 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Hook to show notifications for common scenarios
export function useTransactionNotifications() {
  const { addNotification } = useNotificationStore();
  
  const notifyTransactionPending = (message: string) => {
    addNotification({
      type: 'info',
      title: 'Transaction Pending',
      message: `${message} Please wait for confirmation...`,
      duration: 0, // Don't auto-dismiss
    });
  };
  
  const notifyTransactionSuccess = (message: string, txHash: string) => {
    addNotification({
      type: 'success',
      title: 'Transaction Successful',
      message,
      txHash,
    });
  };
  
  const notifyTransactionError = (message: string, error?: Error) => {
    addNotification({
      type: 'error',
      title: 'Transaction Failed',
      message: error ? `${message}: ${error.message}` : message,
    });
  };
  
  return {
    notifyTransactionPending,
    notifyTransactionSuccess,
    notifyTransactionError,
  };
}