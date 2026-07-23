import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SecurityPolicyTable } from './components/SecurityPolicyTable';
import { ObjectsView } from './components/ObjectsView';
import { DashboardView } from './components/DashboardView';
import { AddEditRuleModal } from './components/AddEditRuleModal';
import { ImportPolicyModal } from './components/ImportPolicyModal';

import { SecurityRule, ColumnKey, RuleFilters } from './types';
import { INITIAL_RULES, ALL_COLUMNS } from './data/mockRules';

export default function App() {
  const [activeTab, setActiveTab] = useState<'policies' | 'objects' | 'dashboard'>('policies');
  const [globalSearch, setGlobalSearch] = useState('');
  const [rules, setRules] = useState<SecurityRule[]>(INITIAL_RULES);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      />
    </div>
  );
}
