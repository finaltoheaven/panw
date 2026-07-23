import React, { useState, useRef, useEffect } from 'react';
import { AppNotification } from '../types';

interface HeaderProps {
  activeTab: 'policies' | 'objects' | 'dashboard';
  setActiveTab: (tab: 'policies' | 'objects' | 'dashboard') => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  globalSearch,
  setGlobalSearch,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const helpPopoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const logoUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDQp134-ILPokqrJV7RWH6tAiDTALxB-ZRRktrfUJn98K1WgZ6PAa3EjuemZzDk8qpt-tqH7z68SxirxQyHYzpHBYrX4XF-PI3OiP4MwEMkHEd_NK6zN-8o8LJ_93yZduMfmU6HFLpmb8H9zrrI6EX0dM6a0JMzN6W7INvKCyB5PwG9dMv4hIG7PKjgY5xWOtBX06DReofem_F8egSLjxI-nRESzC22tujnBpYL8-EBE9fDjLNHvT8dvKQC7YV1KuG2-TYyKvEfzDA';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (helpPopoverRef.current && !helpPopoverRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    };
    if (isOpen || isHelpOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isHelpOpen]);

  return (
    <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200 shrink-0 z-20 shadow-xs">
      <div className="flex items-center space-x-6">
        <div className="flex items-center h-8">
          <img
            src={logoUrl}
            alt="Palo Alto Networks"
            className="h-full w-auto object-contain cursor-pointer"
            onClick={() => setActiveTab('policies')}
            referrerPolicy="no-referrer"
          />
        </div>
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'policies'
                ? 'text-brand border-b-2 border-brand font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Policies
          </button>
          <button
            onClick={() => setActiveTab('objects')}
            className={`px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'objects'
                ? 'text-brand border-b-2 border-brand font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Objects
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-brand border-b-2 border-brand font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative hidden lg:block w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </span>
          <input
            className="w-full py-1.5 pl-9 pr-3 bg-slate-50 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
            placeholder="Global Search"
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3 text-slate-500 relative">
          {/* Help & Info Popover */}
          <div className="relative" ref={helpPopoverRef}>
            <button
              title="Help & Documentation"
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="hover:text-slate-800 transition-colors p-1 cursor-pointer rounded hover:bg-slate-100"
            >
              <i className="fa-regular fa-circle-question text-lg"></i>
            </button>

            {isHelpOpen && (
              <div className="absolute right-0 top-10 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="fa-solid fa-circle-info text-brand text-sm"></i>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">About & System Info</h3>
                  </div>
                  <button
                    onClick={() => setIsHelpOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs p-0.5 rounded cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                <div className="p-4 space-y-3.5 text-xs">
                  <div className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-md border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-brand flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      D
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Author</span>
                      <span className="text-sm font-bold text-slate-800">Danny</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-md border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">AI Platform</span>
                      <span className="text-sm font-bold text-slate-800">AI Studio from Google</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Application:</span>
                      <span className="font-semibold text-slate-700">Security Policy Manager</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Version:</span>
                      <span className="font-mono font-medium text-slate-600">v1.2.0-panos</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={popoverRef}>
            <button
              title="Notifications"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:text-slate-800 transition-colors p-1 relative cursor-pointer rounded hover:bg-slate-100"
            >
              <i className="fa-regular fa-bell text-lg"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {isOpen && (
              <div className="absolute right-0 top-10 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllAsRead}
                        className="text-brand hover:underline font-medium text-[11px] cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className="text-slate-400 hover:text-slate-600 font-medium text-[11px] cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <i className="fa-regular fa-bell-slash text-2xl mb-2 block text-slate-300"></i>
                      <p className="text-xs font-medium">No notifications yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Notifications for imports and CSV exports will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => !item.read && onMarkAsRead(item.id)}
                        className={`p-3 flex items-start space-x-3 transition-colors cursor-pointer ${
                          !item.read ? 'bg-orange-50/40 hover:bg-orange-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.type === 'success' ? (
                            <i className="fa-solid fa-circle-check text-green-500 text-base"></i>
                          ) : item.type === 'error' ? (
                            <i className="fa-solid fa-circle-xmark text-red-500 text-base"></i>
                          ) : (
                            <i className="fa-solid fa-circle-info text-blue-500 text-base"></i>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <p className={`text-xs ${!item.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {item.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2 font-mono">{item.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 break-words leading-relaxed">{item.message}</p>
                        </div>
                        {!item.read && (
                          <span className="w-2 h-2 bg-brand rounded-full shrink-0 self-center" title="Unread"></span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            title="System Settings"
            className="hover:text-slate-800 transition-colors p-1 cursor-pointer rounded hover:bg-slate-100"
          >
            <i className="fa-solid fa-gear text-lg"></i>
          </button>
        </div>

        <div
          title="User Profile (Admin)"
          className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors"
        >
          <i className="fa-solid fa-user text-slate-500 text-sm"></i>
        </div>
      </div>
    </header>
  );
};

