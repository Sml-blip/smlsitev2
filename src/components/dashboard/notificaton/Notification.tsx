'use client';

import React, { useEffect, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, Sparkles } from 'lucide-react';
import { useSeoNotifications } from '@/store/seoNotifications';
import { cn } from '@/lib/utils';

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'à l\'instant';
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

function typeIcon(type: string): string {
  if (type === 'keywords') return '🔑';
  if (type === 'audit') return '🔍';
  if (type === 'ai') return '✨';
  return '📈';
}

interface NotificationProps {
  onOpenChat?: (msg?: string) => void;
}

const Notification = ({ onOpenChat }: NotificationProps) => {
  const { notifications, unreadCount, init, markAllRead, clear } = useSeoNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  const handleOpen = (val: boolean) => {
    setOpen(val);
    if (val && unreadCount > 0) markAllRead();
  };

  const handleNotifClick = (chatMessage?: string) => {
    setOpen(false);
    onOpenChat?.(chatMessage);
  };

  // Fallback static notifications when store is empty
  const staticNotifications = [
    { id: 's1', message: 'New order received from John Doe', time: '10:00 AM' },
    { id: 's2', message: 'Payment processed for order #123456', time: '10:30 AM' },
    { id: 's3', message: 'Low stock alert: Item XYZ', time: '11:00 AM' },
    { id: 's4', message: 'Shipment for order #123457 delayed', time: '11:30 AM' },
    { id: 's5', message: 'New review submitted for product ABC', time: '12:00 PM' },
  ];

  const hasSeoNotifs = notifications.length > 0;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger className="relative p-2 rounded-md hover:bg-gray-200 duration-200">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#FFCC00] text-black text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            {hasSeoNotifs ? (
              <Sparkles size={16} className="text-[#FFCC00]" />
            ) : (
              <Bell size={16} />
            )}
            <h2 className="font-semibold text-sm">
              {hasSeoNotifs ? 'Notifications SEO' : 'Notifications'}
            </h2>
          </div>
          {hasSeoNotifs && (
            <button
              onClick={clear}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Effacer
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y">
          {hasSeoNotifs ? (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotifClick(n.chatMessage)}
                className={cn(
                  'w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors',
                  !n.read && 'bg-[#FFCC00]/5'
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg leading-none mt-0.5">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', !n.read && 'text-foreground')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {n.description}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {timeAgo(n.timestamp)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 bg-[#FFCC00] rounded-full mt-1.5 shrink-0" />
                  )}
                </div>
              </button>
            ))
          ) : (
            staticNotifications.map((notification) => (
              <div key={notification.id} className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 ml-2 shrink-0">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notification;
