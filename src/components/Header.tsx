import React from 'react';

interface HeaderProps {
  activeTab: 'policies' | 'objects' | 'dashboard';
  setActiveTab: (tab: 'policies' | 'objects' | 'dashboard') => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  globalSearch,
  setGlobalSearch,
}) => {
  const logoUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDQp134-ILPokqrJV7RWH6tAiDTALxB-ZRRktrfUJn98K1WgZ6PAa3EjuemZzDk8qpt-tqH7z68SxirxQyHYzpHBYrX4XF-PI3OiP4MwEMkHEd_NK6zN-8o8LJ_93yZduMfmU6HFLpmb8H9zrrI6EX0dM6a0JMzN6W7INvKCyB5PwG9dMv4hIG7PKjgY5xWOtBX06DReofem_F8egSLjxI-nRESzC22tujnBpYL8-EBE9fDjLNHvT8dvKQC7YV1KuG2-TYyKvEfzDA';

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

        <div className="flex items-center space-x-3 text-slate-500">
          <button
            title="Help & Documentation"
            className="hover:text-slate-800 transition-colors p-1"
          >
            <i className="fa-regular fa-circle-question text-lg"></i>
          </button>
          <button
            title="Notifications"
            className="hover:text-slate-800 transition-colors p-1 relative"
          >
            <i className="fa-regular fa-bell text-lg"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full"></span>
          </button>
          <button
            title="System Settings"
            className="hover:text-slate-800 transition-colors p-1"
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
