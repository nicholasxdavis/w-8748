
import { useState } from 'react';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  user: string;
  article?: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: 'john_doe',
    article: 'Quantum Physics',
    time: '2m',
    read: false
  },
  {
    id: '2',
    type: 'comment',
    user: 'sarah_wilson',
    article: 'Ancient Rome',
    time: '5m',
    read: false
  },
  {
    id: '3',
    type: 'follow',
    user: 'alex_smith',
    time: '1h',
    read: true
  }
];

const NotificationsPopover = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 hover:bg-gray-800 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium text-[10px]">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-gray-900 border border-gray-700 shadow-xl rounded-lg" align="end">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-gray-800/50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      {notification.type === 'like' && <Heart className="w-4 h-4 text-red-400" />}
                      {notification.type === 'comment' && <MessageCircle className="w-4 h-4 text-blue-400" />}
                      {notification.type === 'follow' && <UserPlus className="w-4 h-4 text-green-400" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium text-white">{notification.user}</span>
                      <span className="text-gray-300 ml-1">
                        {notification.type === 'like' && `liked your article "${notification.article}"`}
                        {notification.type === 'comment' && `commented on "${notification.article}"`}
                        {notification.type === 'follow' && 'started following you'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
