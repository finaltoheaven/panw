import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SecurityPolicyTable } from './components/SecurityPolicyTable';
import { ObjectsView } from './components/ObjectsView';
import { DashboardView } from './components/DashboardView';
import { AddEditRuleModal } from './components/AddEditRuleModal';
import { ImportPolicyModal } from './components/ImportPolicyModal';

import { SecurityRule, ColumnKey, RuleFilters, AppNotification } from './types';
import { INITIAL_RULES, ALL_COLUMNS } from './data/mockRules';

export default function App() {
  const [activeTab, setActiveTab] = useState<'policies' | 'objects' | 'dashboard'>('policies');
  const [globalSearch, setGlobalSearch] = useState('');
  const [rules, setRules] = useState<SecurityRule[]>(INITIAL_RULES);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'init-1',
      type: 'info',
      title: 'Policy Management Loaded',
      message: 'System ready. Rules import and CSV export notifications will appear here.',
      timestamp: '10:00:00',
      read: false,
    },
  ]);

  const addNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Initialize visible columns mapping
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => {
      initial[col.key] = col.defaultVisible;
    });
    return initial as Record<ColumnKey, boolean>;
  });

  // Filter state
  const [filters, setFilters] = useState<RuleFilters>({
    actions: {
      Allow: false,
      Deny: false,
      Drop: false,
      Khác: false,
    },
    status: {
      Enabled: false,
      Disabled: false,
    },
    trafficZeroHit: false,
    hasSchedule: false,
    timeRange: 'Chọn thời gian',
    fromDate: '',
    toDate: '',
    searchQuery: '',
    sourceZoneFilter: 'Any',
    destinationZoneFilter: 'Any',
    actionFilter: 'Any',
  });

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SecurityRule | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Global search update
  const handleGlobalSearchChange = (q: string) => {
    setGlobalSearch(q);
    setFilters((prev) => ({ ...prev, searchQuery: q }));
    if (activeTab !== 'policies') {
      setActiveTab('policies');
    }
  };

  // Rule Save (Add or Edit)
  const handleSaveRule = (savedRule: SecurityRule) => {
    setRules((prev) => {
      const exists = prev.some((r) => r.id === savedRule.id);
      if (exists) {
        return prev.map((r) => (r.id === savedRule.id ? savedRule : r));
      }
      return [savedRule, ...prev];
    });
  };

  // Bulk / imported rules handler
  const handleImportRules = (newRules: SecurityRule[], replace: boolean) => {
    if (replace) {
      setRules(newRules);
    } else {
      setRules((prev) => [...newRules, ...prev]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (rule: SecurityRule) => {
    setEditingRule(rule);
    setIsAddEditModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen antialiased text-sm bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        globalSearch={globalSearch}
        setGlobalSearch={handleGlobalSearchChange}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearNotifications={handleClearNotifications}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Only visible in Policies tab) */}
        {activeTab === 'policies' && (
          <Sidebar
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            filters={filters}
            setFilters={setFilters}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        )}

        {/* Dynamic Tab Views */}
        {activeTab === 'policies' && (
          <SecurityPolicyTable
            rules={rules}
            setRules={setRules}
            visibleColumns={visibleColumns}
            filters={filters}
            setFilters={setFilters}
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
            onNotify={addNotification}
          />
        )}

        {activeTab === 'objects' && <ObjectsView />}

        {activeTab === 'dashboard' && <DashboardView rules={rules} />}
      </div>

      {/* Modals */}
      <AddEditRuleModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveRule}
        editingRule={editingRule}
      />

      <ImportPolicyModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRules}
        onNotify={addNotification}
      />
    </div>
  );
}

