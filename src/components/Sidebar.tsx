import React, { useState } from 'react';
import { ColumnKey, RuleFilters } from '../types';
import { ALL_COLUMNS } from '../data/mockRules';

interface SidebarProps {
  visibleColumns: Record<ColumnKey, boolean>;
  setVisibleColumns: React.Dispatch<React.SetStateAction<Record<ColumnKey, boolean>>>;
  filters: RuleFilters;
  setFilters: React.Dispatch<React.SetStateAction<RuleFilters>>;
  onOpenImportModal: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  visibleColumns,
  setVisibleColumns,
  filters,
  setFilters,
  onOpenImportModal,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [columnSearch, setColumnSearch] = useState('');

  const handleToggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAllColumns = () => {
    const updated: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => {
      updated[col.key] = true;
    });
    setVisibleColumns(updated as Record<ColumnKey, boolean>);
  };

  const handleResetDefaultColumns = () => {
    const updated: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => {
      updated[col.key] = col.defaultVisible;
    });
    setVisibleColumns(updated as Record<ColumnKey, boolean>);
  };

  const handleResetFilters = () => {
    setFilters((prev) => ({
      ...prev,
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
    }));
  };

  const filteredColumns = ALL_COLUMNS.filter((col) =>
    col.label.toLowerCase().includes(columnSearch.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-4 shrink-0 transition-all">
        <button
          onClick={() => setIsCollapsed(false)}
          title="Expand Sidebar"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
        >
          <i className="fa-solid fa-chevron-right text-xs"></i>
        </button>
        <div className="mt-6 flex flex-col space-y-4">
          <button
            title="Security Policies"
            className="p-2 bg-brand-light text-brand rounded-md"
          >
            <i className="fa-solid fa-shield-halved text-sm"></i>
          </button>
          <button
            title="Import Policies"
            onClick={onOpenImportModal}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
          >
            <i className="fa-solid fa-arrow-up-from-bracket text-sm"></i>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto select-none transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-slate-800 leading-tight text-base">Policies</h2>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
            Rule Management
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          title="Collapse Sidebar"
          className="text-slate-400 hover:text-slate-600 p-1"
        >
          <i className="fa-solid fa-chevron-left text-xs"></i>
        </button>
      </div>

      {/* Primary Nav */}
      <nav className="py-2 border-b border-slate-100">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex items-center px-4 py-2.5 bg-brand-light text-slate-900 border-l-4 border-brand text-sm font-medium"
        >
          <i className="fa-solid fa-shield-halved w-6 text-brand"></i>
          <span>Security</span>
        </a>
        <button
          onClick={onOpenImportModal}
          className="w-full flex items-center px-4 py-2.5 text-slate-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300 transition-colors text-sm text-left"
        >
          <i className="fa-solid fa-arrow-up-from-bracket w-6 text-slate-400"></i>
          <span>Import Policies</span>
        </button>
      </nav>

      {/* TUỲ CHỈNH CỘT (Column Customization) */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tuỳ Chỉnh cột
          </h3>
          <div className="flex space-x-2 text-[10px]">
            <button
              onClick={handleSelectAllColumns}
              className="text-brand hover:underline cursor-pointer"
            >
              Chọn tất
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleResetDefaultColumns}
              className="text-slate-500 hover:underline cursor-pointer"
            >
              Mặc định
            </button>
          </div>
        </div>

        <div className="flex items-center mb-2">
          <i className="fa-solid fa-table-columns text-slate-400 mr-2 text-xs"></i>
          <span className="font-medium text-slate-700 text-xs">Cột hiển thị</span>
        </div>

        {/* Quick filter for columns if many */}
        {ALL_COLUMNS.length > 10 && (
          <div className="mb-2">
            <input
              type="text"
              placeholder="Tìm cột..."
              value={columnSearch}
              onChange={(e) => setColumnSearch(e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] focus:outline-none focus:border-brand"
            />
          </div>
        )}

        <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {filteredColumns.map((col) => (
            <label
              key={col.key}
              className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={!!visibleColumns[col.key]}
                onChange={() => handleToggleColumn(col.key)}
                className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
              />
              <span
                className={
                  visibleColumns[col.key]
                    ? 'text-slate-800 font-medium'
                    : 'text-slate-500'
                }
              >
                {col.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* LỌC RULES (Rule Filters) */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Lọc Rules
          </h3>
          <button
            onClick={handleResetFilters}
            className="text-xs text-brand hover:text-orange-700 transition-colors font-medium cursor-pointer"
          >
            Xóa lọc
          </button>
        </div>

        <div className="space-y-4">
          {/* Action Category */}
          <div>
            <h4 className="text-xs font-medium text-slate-700 mb-2">Hành động</h4>
            <div className="space-y-1.5 text-xs ml-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.actions.Allow}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      actions: { ...prev.actions, Allow: e.target.checked },
                    }))
                  }
                  className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
                />
                <span className="flex items-center text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-status-allow mr-1.5 inline-block"></span>{' '}
                  Allow
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.actions.Deny}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      actions: { ...prev.actions, Deny: e.target.checked },
                    }))
                  }
                  className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
                />
                <span className="flex items-center text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-status-deny mr-1.5 inline-block"></span>{' '}
                  Deny
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.actions.Drop}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      actions: { ...prev.actions, Drop: e.target.checked },
                    }))
                  }
                  className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
                />
                <span className="flex items-center text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-status-drop mr-1.5 inline-block"></span>{' '}
                  Drop
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.actions.Khác}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      actions: { ...prev.actions, Khác: e.target.checked },
                    }))
                  }
                  className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
                />
                <span className="flex items-center text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim mr-1.5 inline-block"></span>{' '}
                  Khác
                </span>
              </label>
            </div>
          </div>

          {/* Status Category */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-medium text-slate-700 mb-2">Trạng thái</h4>
            <div className="space-y-1.5 text-xs ml-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status.Enabled}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: { ...prev.status, Enabled: e.target.checked },
                    }))
                  }
                  className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
                />
                <span className="text-slate-600 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-status-allow mr-1.5 inline-block"></span>
                  Enabled
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status.Disabled}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: { ...prev.status, Disabled: e.target.checked },
                    }))
                  }
                  className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
                />
                <span className="text-slate-600 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-status-deny mr-1.5 inline-block"></span>
                  Disabled
                </span>
              </label>
            </div>
          </div>

          {/* Traffic Category */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-medium text-slate-700 mb-2">Lưu lượng</h4>
            <div className="space-y-1.5 text-xs ml-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.trafficZeroHit}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      trafficZeroHit: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
                />
                <span className="text-slate-600">Hit Count = 0</span>
              </label>
            </div>
          </div>

          {/* Scheduling Category */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-medium text-slate-700 mb-2">Lịch trình</h4>
            <div className="space-y-1.5 text-xs ml-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasSchedule}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      hasSchedule: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-300 text-brand focus:ring-brand accent-orange-600"
                />
                <span className="text-slate-600">Has schedule</span>
              </label>
            </div>
          </div>

          {/* Rule Creation Time */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium text-slate-700">
                Thời gian tạo rule (Created)
              </h4>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">Lọc dựa trên ngày ở cột Created</p>
            <div className="space-y-2 text-xs ml-1">
              <div className="relative">
                <select
                  value={filters.timeRange}
                  onChange={(e) => {
                    const range = e.target.value;
                    const now = new Date('2026-07-22');
                    let from = '';
                    let to = '';
                    if (range === 'Cũ hơn 6 tháng') {
                      const d = new Date(now);
                      d.setMonth(d.getMonth() - 6);
                      to = d.toISOString().split('T')[0];
                    } else if (range === 'Cũ hơn 1 năm') {
                      const d = new Date(now);
                      d.setFullYear(d.getFullYear() - 1);
                      to = d.toISOString().split('T')[0];
                    } else if (range === 'Cũ hơn 2 năm') {
                      const d = new Date(now);
                      d.setFullYear(d.getFullYear() - 2);
                      to = d.toISOString().split('T')[0];
                    }
                    setFilters((prev) => ({
                      ...prev,
                      timeRange: range,
                      fromDate: from,
                      toDate: to,
                    }));
                  }}
                  className="w-full py-1.5 pl-3 pr-8 bg-white border border-slate-300 rounded-sm text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand shadow-xs appearance-none cursor-pointer"
                >
                  <option value="Chọn thời gian">Chọn thời gian</option>
                  <option value="Cũ hơn 6 tháng">Cũ hơn 6 tháng</option>
                  <option value="Cũ hơn 1 năm">Cũ hơn 1 năm</option>
                  <option value="Cũ hơn 2 năm">Cũ hơn 2 năm</option>
                  <option value="Custom">Custom (Tùy chọn ngày)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <i className="fa-solid fa-chevron-down text-[10px]"></i>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
                    <i className="fa-regular fa-calendar text-[10px]"></i>
                  </span>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        fromDate: e.target.value,
                        timeRange: 'Custom',
                      }))
                    }
                    placeholder="Từ ngày"
                    className="w-full py-1 pl-7 pr-2 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-slate-700"
                  />
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
                    <i className="fa-regular fa-calendar text-[10px]"></i>
                  </span>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        toDate: e.target.value,
                        timeRange: 'Custom',
                      }))
                    }
                    placeholder="Đến ngày"
                    className="w-full py-1 pl-7 pr-2 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
