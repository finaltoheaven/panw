import React, { useState, useMemo } from 'react';
import { SecurityRule, ColumnKey, RuleFilters } from '../types';
import { ALL_COLUMNS } from '../data/mockRules';

interface SecurityPolicyTableProps {
  rules: SecurityRule[];
  setRules: React.Dispatch<React.SetStateAction<SecurityRule[]>>;
  visibleColumns: Record<ColumnKey, boolean>;
  filters: RuleFilters;
  setFilters: React.Dispatch<React.SetStateAction<RuleFilters>>;
  onOpenAddModal: () => void;
  onOpenEditModal: (rule: SecurityRule) => void;
  onNotify?: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

export const SecurityPolicyTable: React.FC<SecurityPolicyTableProps> = ({
  rules,
  setRules,
  visibleColumns,
  filters,
  setFilters,
  onOpenAddModal,
  onOpenEditModal,
  onNotify,
}) => {
  const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Active columns based on visibility
  const activeColumns = useMemo(() => {
    return ALL_COLUMNS.filter((col) => visibleColumns[col.key]);
  }, [visibleColumns]);

  // Unique zones for dropdowns
  const sourceZones = useMemo(() => {
    const zones = new Set<string>();
    zones.add('Any');
    rules.forEach((r) => {
      if (r.sourceZone) zones.add(r.sourceZone);
    });
    return Array.from(zones);
  }, [rules]);

  const destinationZones = useMemo(() => {
    const zones = new Set<string>();
    zones.add('Any');
    rules.forEach((r) => {
      if (r.destinationZone) zones.add(r.destinationZone);
    });
    return Array.from(zones);
  }, [rules]);

  // Filter rules based on search, dropdowns, and sidebar filters
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      // Global / toolbar search
      const query = filters.searchQuery.toLowerCase();
      if (query) {
        const matchesName = rule.name.toLowerCase().includes(query);
        const matchesSource = rule.sourceAddress.toLowerCase().includes(query) || rule.sourceZone.toLowerCase().includes(query);
        const matchesApps = rule.application.some((app) => app.toLowerCase().includes(query));
        const matchesGroup = rule.group.toLowerCase().includes(query);
        const matchesDesc = rule.description.toLowerCase().includes(query);

        if (!matchesName && !matchesSource && !matchesApps && !matchesGroup && !matchesDesc) {
          return false;
        }
      }

      // Source Zone dropdown
      if (
        filters.sourceZoneFilter &&
        filters.sourceZoneFilter !== 'Any' &&
        filters.sourceZoneFilter !== 'Any Source Zone' &&
        rule.sourceZone !== filters.sourceZoneFilter
      ) {
        return false;
      }

      // Destination Zone dropdown
      if (
        filters.destinationZoneFilter &&
        filters.destinationZoneFilter !== 'Any' &&
        filters.destinationZoneFilter !== 'Any Destination Zone' &&
        rule.destinationZone !== filters.destinationZoneFilter
      ) {
        return false;
      }

      // Toolbar Action Filter
      if (
        filters.actionFilter &&
        filters.actionFilter !== 'Any' &&
        rule.action !== filters.actionFilter
      ) {
        return false;
      }

      // Sidebar Action filters
      const activeActions = Object.entries(filters.actions)
        .filter(([, isChecked]) => isChecked)
        .map(([actionKey]) => actionKey);

      if (activeActions.length > 0) {
        if (!activeActions.includes(rule.action)) {
          return false;
        }
      }

      // Sidebar Status filters
      const activeStatuses = Object.entries(filters.status)
        .filter(([, isChecked]) => isChecked)
        .map(([statusKey]) => statusKey);

      if (activeStatuses.length > 0) {
        if (activeStatuses.includes('Enabled') && !activeStatuses.includes('Disabled') && !rule.enabled) {
          return false;
        }
        if (activeStatuses.includes('Disabled') && !activeStatuses.includes('Enabled') && rule.enabled) {
          return false;
        }
      }

      // Zero hit traffic filter
      if (filters.trafficZeroHit) {
        if (rule.hitCount > 0) return false;
      }

      // Schedule filter
      if (filters.hasSchedule) {
        if (!rule.hasSchedule) return false;
      }

      // Date creation filters
      if (filters.fromDate) {
        if (rule.created < filters.fromDate) return false;
      }
      if (filters.toDate) {
        if (rule.created > filters.toDate) return false;
      }

      return true;
    });
  }, [rules, filters]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRules.length / pageSize) || 1;
  const paginatedRules = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRules.slice(start, start + pageSize);
  }, [filteredRules, currentPage, pageSize]);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(paginatedRules.map((r) => r.id));
      setSelectedRuleIds(allIds);
    } else {
      setSelectedRuleIds(new Set());
    }
  };

  const handleToggleSelectRule = (id: string) => {
    const next = new Set(selectedRuleIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRuleIds(next);
  };

  // Bulk actions
  const handleDeleteSelected = () => {
    if (selectedRuleIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedRuleIds.size} security rule(s)?`)) {
      setRules((prev) => prev.filter((r) => !selectedRuleIds.has(r.id)));
      setSelectedRuleIds(new Set());
    }
  };

  const handleEnableSelected = (enable: boolean) => {
    if (selectedRuleIds.size === 0) return;
    setRules((prev) =>
      prev.map((r) => {
        if (selectedRuleIds.has(r.id)) {
          return { ...r, enabled: enable };
        }
        return r;
      })
    );
  };

  const handleToggleRuleStatus = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDuplicateRule = (rule: SecurityRule) => {
    const copy: SecurityRule = {
      ...rule,
      id: Date.now().toString(),
      name: `${rule.name}-Copy`,
      created: new Date().toISOString().split('T')[0],
      modified: new Date().toISOString().split('T')[0],
      hitCount: 0,
      hitCountFormatted: '0 hits',
    };
    setRules((prev) => [copy, ...prev]);
  };

  // Export visible rules to CSV
  const handleGenerateCSV = () => {
    try {
      if (filteredRules.length === 0) {
        onNotify?.('error', 'CSV Export Failed', 'No security policy rules match the current view to export.');
        return;
      }

      const keysToExport = activeColumns.map((col) => col.key);
      const headers = activeColumns.map((col) => `"${col.label}"`).join(',');

      const rows = filteredRules.map((rule) => {
        return keysToExport
          .map((key) => {
            let val = (rule as any)[key];
            if (Array.isArray(val)) val = val.join('; ');
            if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
            if (val === undefined || val === null) val = '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',');
      });

      const fileName = `Security_Policies_${new Date().toISOString().split('T')[0]}.csv`;
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onNotify?.(
        'success',
        'CSV Generated Successfully',
        `Exported ${filteredRules.length} security rules to ${fileName}.`
      );
    } catch (err) {
      onNotify?.(
        'error',
        'CSV Generation Failed',
        `Failed to generate CSV file: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  };

  // Helper renderer for table cell values
  const renderCellContent = (rule: SecurityRule, key: ColumnKey) => {
    switch (key) {
      case 'name':
        return (
          <div className="font-medium text-slate-900 flex items-center justify-between group">
            <span className="flex items-center">
              <i
                className={`fa-regular fa-circle-check mr-2 text-xs ${
                  rule.enabled ? 'text-green-500' : 'text-slate-300'
                }`}
                title={rule.enabled ? 'Rule Enabled' : 'Rule Disabled'}
              ></i>
              <span className={rule.enabled ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}>
                {rule.name}
              </span>
            </span>
            <div className="hidden group-hover:flex items-center space-x-1.5 ml-2">
              <button
                onClick={() => onOpenEditModal(rule)}
                title="Edit Rule"
                className="text-slate-400 hover:text-brand transition-colors p-0.5"
              >
                <i className="fa-solid fa-pen text-xs"></i>
              </button>
              <button
                onClick={() => handleDuplicateRule(rule)}
                title="Duplicate Rule"
                className="text-slate-400 hover:text-blue-600 transition-colors p-0.5"
              >
                <i className="fa-regular fa-copy text-xs"></i>
              </button>
              <button
                onClick={() => handleToggleRuleStatus(rule.id)}
                title={rule.enabled ? 'Disable' : 'Enable'}
                className="text-slate-400 hover:text-orange-500 transition-colors p-0.5"
              >
                <i className={`fa-solid ${rule.enabled ? 'fa-pause' : 'fa-play'} text-xs`}></i>
              </button>
            </div>
          </div>
        );

      case 'tags':
        return (
          <div className="flex flex-wrap gap-1">
            {rule.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  tag === 'none'
                    ? 'bg-slate-50 text-slate-400 border border-slate-200'
                    : 'bg-slate-100 border border-slate-200 text-slate-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        );

      case 'sourceAddress':
      case 'destinationAddress':
      case 'sourceZone':
      case 'destinationZone': {
        const strVal = String((rule as any)[key] || 'any');
        const items = strVal.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
        if (items.length <= 2) {
          return (
            <span className="text-slate-700 font-mono text-xs truncate max-w-[200px] block" title={strVal}>
              {strVal || 'any'}
            </span>
          );
        }
        return (
          <div className="flex items-center space-x-1" title={strVal}>
            <span className="text-slate-700 font-mono text-xs truncate max-w-[150px]">
              {items.slice(0, 2).join('; ')}
            </span>
            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold shrink-0">
              +{items.length - 2}
            </span>
          </div>
        );
      }

      case 'application': {
        const apps = rule.application;
        if (apps.length <= 3) {
          return (
            <div className="flex items-center space-x-1 flex-wrap gap-y-1">
              {apps.map((app, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-orange-100 border border-orange-200 text-orange-800 rounded text-xs font-medium"
                >
                  {app}
                </span>
              ))}
            </div>
          );
        }
        return (
          <div className="flex items-center space-x-1" title={apps.join(', ')}>
            {apps.slice(0, 2).map((app, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 bg-orange-100 border border-orange-200 text-orange-800 rounded text-xs font-medium"
              >
                {app}
              </span>
            ))}
            <span className="px-1.5 py-0.5 bg-orange-200 text-orange-900 border border-orange-300 rounded text-xs font-bold shrink-0">
              +{apps.length - 2}
            </span>
          </div>
        );
      }

      case 'service': {
        const srvs = rule.service;
        if (srvs.length <= 3) {
          return <span className="text-slate-600 font-mono text-xs">{srvs.join(', ')}</span>;
        }
        return (
          <div className="flex items-center space-x-1 font-mono text-xs text-slate-600" title={srvs.join(', ')}>
            <span>{srvs.slice(0, 2).join(', ')}</span>
            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold shrink-0">
              +{srvs.length - 2}
            </span>
          </div>
        );
      }

      case 'action':
        return (
          <span
            className={`font-semibold flex items-center text-xs ${
              rule.action === 'Allow'
                ? 'text-status-allow'
                : rule.action === 'Deny'
                ? 'text-status-deny'
                : rule.action === 'Drop'
                ? 'text-status-drop'
                : 'text-amber-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-1.5 inline-block ${
                rule.action === 'Allow'
                  ? 'bg-status-allow'
                  : rule.action === 'Deny'
                  ? 'bg-status-deny'
                  : rule.action === 'Drop'
                  ? 'bg-status-drop'
                  : 'bg-amber-500'
              }`}
            ></span>
            {rule.action}
          </span>
        );

      case 'hitCount':
        const pct = Math.min(100, Math.max(5, Math.log10(rule.hitCount + 1) * 15));
        return (
          <div className="w-full max-w-[120px]">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  rule.hitCount > 100000
                    ? 'bg-brand'
                    : rule.hitCount > 0
                    ? 'bg-slate-500'
                    : 'bg-slate-200'
                }`}
                style={{ width: `${pct}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {rule.hitCountFormatted}
            </div>
          </div>
        );

      case 'description':
        return (
          <span className="text-slate-500 text-xs truncate max-w-xs block" title={rule.description}>
            {rule.description || '—'}
          </span>
        );

      case 'options': {
        const rawOptions = rule.options || 'none';
        const parts = rawOptions
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean);

        if (parts.length <= 1) {
          return <span className="text-slate-600 text-xs">{rawOptions}</span>;
        }

        return (
          <div className="flex flex-col space-y-0.5" title={rawOptions}>
            {parts.map((part, idx) => (
              <span key={idx} className="text-slate-600 text-xs block leading-tight">
                {part}
              </span>
            ))}
          </div>
        );
      }

      default:
        const val = (rule as any)[key];
        if (Array.isArray(val)) return val.join(', ');
        return <span className="text-slate-600 text-xs">{val || 'Any'}</span>;
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
      {/* Content Header Bar */}
      <div className="px-6 py-3.5 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3 shrink-0 bg-white">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-slate-800">Security Policies</h1>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-xs font-semibold">
            Rules: {filteredRules.length}
          </span>

          {selectedRuleIds.size > 0 && (
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
              <span className="text-xs text-brand font-semibold">
                {selectedRuleIds.size} selected
              </span>
              <button
                onClick={() => handleEnableSelected(true)}
                className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded text-xs font-medium transition-colors"
              >
                Enable
              </button>
              <button
                onClick={() => handleEnableSelected(false)}
                className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded text-xs font-medium transition-colors"
              >
                Disable
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-2 py-1 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded text-xs font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAddModal}
            className="flex items-center px-3 py-1.5 bg-brand hover:bg-orange-600 text-white rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <i className="fa-solid fa-plus mr-1.5"></i> Add Rule
          </button>

          <button
            onClick={handleGenerateCSV}
            title="Export filtered security rules to CSV file"
            className="flex items-center px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors shadow-xs text-xs font-medium cursor-pointer"
          >
            <i className="fa-solid fa-table-columns mr-1.5 text-slate-400"></i> Generate CSV
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="px-6 py-2 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center gap-3 shrink-0">
        <div className="relative w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </span>
          <input
            className="w-full py-1 pl-8 pr-3 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
            placeholder="Filter by Name, Source, or App..."
            type="text"
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
          />
        </div>

        {/* Source Zone Dropdown */}
        <select
          value={filters.sourceZoneFilter}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, sourceZoneFilter: e.target.value }))
          }
          className="py-1 pl-3 pr-8 bg-white border border-slate-300 rounded-sm text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="Any">Any Source Zone</option>
          {sourceZones
            .filter((z) => z !== 'Any')
            .map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
        </select>

        {/* Destination Zone Dropdown */}
        <select
          value={filters.destinationZoneFilter}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, destinationZoneFilter: e.target.value }))
          }
          className="py-1 pl-3 pr-8 bg-white border border-slate-300 rounded-sm text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="Any">Any Destination Zone</option>
          {destinationZones
            .filter((z) => z !== 'Any')
            .map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
        </select>

        {/* Action Quick Select */}
        <select
          value={filters.actionFilter}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, actionFilter: e.target.value }))
          }
          className="py-1 pl-3 pr-8 bg-white border border-slate-300 rounded-sm text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="Any">Any Action</option>
          <option value="Allow">Allow</option>
          <option value="Deny">Deny</option>
          <option value="Drop">Drop</option>
          <option value="Khác">Khác</option>
        </select>

        {(filters.searchQuery ||
          filters.sourceZoneFilter !== 'Any' ||
          filters.destinationZoneFilter !== 'Any' ||
          filters.actionFilter !== 'Any') && (
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                searchQuery: '',
                sourceZoneFilter: 'Any',
                destinationZoneFilter: 'Any',
                actionFilter: 'Any',
              }))
            }
            className="text-xs text-brand font-medium hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Data Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead className="sticky top-0 bg-slate-50 shadow-xs z-10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2.5 border-b border-r border-slate-200 w-10 text-center bg-slate-50">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    paginatedRules.length > 0 &&
                    paginatedRules.every((r) => selectedRuleIds.has(r.id))
                  }
                  className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
                />
              </th>
              <th className="px-2 py-2.5 border-b border-r border-slate-200 w-12 text-center bg-slate-50 min-w-[45px]"></th>
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  style={{ minWidth: col.minWidth || '120px' }}
                  className="px-4 py-2.5 border-b border-r border-slate-200 bg-slate-50 select-none"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-slate-200 text-slate-700">
            {paginatedRules.length === 0 ? (
              <tr>
                <td
                  colSpan={activeColumns.length + 2}
                  className="px-4 py-12 text-center text-slate-400 bg-slate-50/50"
                >
                  <i className="fa-solid fa-shield-halved text-3xl mb-2 block text-slate-300"></i>
                  No security policy rules match your current filter criteria.
                </td>
              </tr>
            ) : (
              paginatedRules.map((rule, idx) => {
                const isSelected = selectedRuleIds.has(rule.id);
                const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={rule.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-orange-50/40' : ''
                    } ${!rule.enabled ? 'opacity-70 bg-slate-50/30' : ''}`}
                  >
                    <td className="px-4 py-2 border-r border-slate-200 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRule(rule.id)}
                        className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
                      />
                    </td>
                    <td className="px-2 py-2 border-r border-slate-200 text-center font-mono text-slate-500 text-xs font-medium select-none">
                      {rowNumber}
                    </td>
                    {activeColumns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-2 border-r border-slate-200 align-middle"
                      >
                        {renderCellContent(rule, col.key)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="px-6 py-2.5 border-t border-slate-200 bg-white flex flex-wrap justify-between items-center gap-2 shrink-0">
        <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
          <span>
            Showing {filteredRules.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredRules.length)} of {filteredRules.length} rules
          </span>
          <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-3">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded px-2 py-1 focus:outline-none focus:border-brand font-medium cursor-pointer hover:border-slate-400"
            >
              {[20, 30, 40, 50, 75, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-xs text-slate-600">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 hover:text-slate-900 disabled:opacity-40 flex items-center border border-slate-200 rounded mr-1 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-chevron-left text-[10px] mr-1"></i> Previous
          </button>

          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-slate-400 select-none">
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(Number(page))}
                className={`w-7 h-7 rounded flex items-center justify-center font-medium text-xs cursor-pointer ${
                  currentPage === page
                    ? 'bg-brand text-white font-bold shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 hover:text-slate-900 disabled:opacity-40 flex items-center border border-slate-200 rounded ml-1 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Next <i className="fa-solid fa-chevron-right text-[10px] ml-1"></i>
          </button>
        </div>
      </div>
    </main>
  );
};
