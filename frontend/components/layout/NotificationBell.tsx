'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Notification } from '@/lib/types';
import { BellIcon } from '@/components/ui/Icons';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { count } = await api.notifications.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Fetch notifications when dropdown opens
  const fetchNotifications = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.notifications.list({ page_size: '10' });
      setNotifications(response.results);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await api.notifications.markAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BADGE_EARNED':
        return '🏅';
      case 'REPUTATION_MILESTONE':
        return '⭐';
      case 'DIFF_CONSENSUS':
        return '✓';
      case 'COMMENT_REPLY':
        return '💬';
      case 'COMMENT_HELPFUL':
        return '👍';
      case 'DIFF_VALIDATED':
        return '✅';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-surface2 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-surface border border-border rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-link hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-secondary">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-secondary">
                <div className="mb-2">🔔</div>
                <div>No notifications yet</div>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-border hover:bg-surface2 transition-colors ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {notification.action_url ? (
                          <Link
                            href={notification.action_url}
                            onClick={() => {
                              if (!notification.is_read) {
                                markAsRead(notification.id);
                              }
                              setIsOpen(false);
                            }}
                            className="block"
                          >
                            <div className="font-medium text-foreground mb-1">
                              {notification.title}
                            </div>
                            <div className="text-sm text-secondary line-clamp-2">
                              {notification.message}
                            </div>
                            <div className="text-xs text-muted mt-1">
                              {timeAgo(notification.created_at)}
                            </div>
                          </Link>
                        ) : (
                          <>
                            <div className="font-medium text-foreground mb-1">
                              {notification.title}
                            </div>
                            <div className="text-sm text-secondary line-clamp-2">
                              {notification.message}
                            </div>
                            <div className="text-xs text-muted mt-1">
                              {timeAgo(notification.created_at)}
                            </div>
                          </>
                        )}
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-link hover:underline mt-1"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
