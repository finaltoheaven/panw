import React, { useState } from 'react';
import { SecurityRule, RuleAction } from '../types';

interface ImportPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newRules: SecurityRule[], replace: boolean) => void;
  onNotify?: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

// Robust CSV parser handling quotes, commas, and line breaks
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let curCell = '';
  let curRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' || char === "'") {
      if (inQuotes && nextChar === char) {
        curCell += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      curRow.push(curCell.trim());
      curCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      curRow.push(curCell.trim());
      if (curRow.some((cell) => cell.length > 0)) {
        rows.push(curRow);
      }
      curRow = [];
      curCell = '';
    } else {
      curCell += char;
    }
  }

  if (curCell || curRow.length > 0) {
    curRow.push(curCell.trim());
    if (curRow.some((cell) => cell.length > 0)) {
      rows.push(curRow);
    }
  }

  return rows;
}

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/^["']|["']$/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export const ImportPolicyModal: React.FC<ImportPolicyModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onNotify,
}) => {
  const [importMode, setImportMode] = useState<'file' | 'text'>('file');
  const [pastedText, setPastedText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [previewRules, setPreviewRules] = useState<SecurityRule[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setPastedText(text);
    setErrorMsg('');
    if (!text.trim()) {
      setPreviewRules([]);
      return;
    }

    try {
      if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
        const parsed = JSON.parse(text);
        const rulesArr = Array.isArray(parsed) ? parsed : [parsed];
        const normalizedJsonRules: SecurityRule[] = rulesArr.map((r, i) => ({
          id: r.id || `import-json-${i}-${Date.now()}`,
          name: r.name || `Rule-${i + 1}`,
          tags: Array.isArray(r.tags) ? r.tags : (r.tags ? [r.tags] : ['Imported']),
          group: r.group || 'Any',
          type: r.type || 'Untrust',
          sourceZone: r.sourceZone || 'Trust',
          sourceAddress: r.sourceAddress || 'Any',
          sourceUser: r.sourceUser || 'Any',
          sourceDevice: r.sourceDevice || 'Any',
          destinationZone: r.destinationZone || 'Untrust',
          destinationAddress: r.destinationAddress || 'Any',
          destinationDevice: r.destinationDevice || 'Any',
          application: Array.isArray(r.application) ? r.application : (r.application ? [r.application] : ['any']),
          service: Array.isArray(r.service) ? r.service : (r.service ? [r.service] : ['any']),
          urlCategory: r.urlCategory || 'any',
          action: r.action || 'Allow',
          profile: r.profile || 'default',
          options: r.options || 'Log at Session End',
          ruleUuid: r.ruleUuid || `${Math.random().toString(36).substr(2, 9)}`,
          description: r.description || '',
          hitCount: typeof r.hitCount === 'number' ? r.hitCount : 0,
          hitCountFormatted: r.hitCountFormatted || `${r.hitCount || 0} hits`,
          lastHit: r.lastHit || 'Never',
          firstHit: r.firstHit || new Date().toISOString().split('T')[0],
          appsSeen: r.appsSeen || 1,
          daysNoNewApps: r.daysNoNewApps || 0,
          modified: r.modified || new Date().toISOString().split('T')[0],
          created: r.created || new Date().toISOString().split('T')[0],
          enabled: r.enabled !== false,
          hasSchedule: !!r.hasSchedule,
        }));
        setPreviewRules(normalizedJsonRules);
      } else {
        // Parse CSV
        const rows = parseCSV(text.trim());
        if (rows.length < 2) {
          const msg = 'CSV must contain a header row and at least one data row.';
          setErrorMsg(msg);
          setPreviewRules([]);
          onNotify?.('error', 'Import File Parsing Failed', msg);
          return;
        }

        const rawHeaders = rows[0];
        const normalizedHeaders = rawHeaders.map(normalizeHeader);

        // Check if 0th column is a row index column (empty string, '#', 'index', etc.)
        const isFirstColRowIndex =
          normalizedHeaders[0] === '' ||
          normalizedHeaders[0] === 'id' ||
          normalizedHeaders[0] === 'index' ||
          normalizedHeaders[0] === 'row' ||
          normalizedHeaders[0] === '#';

        const indexOffset = isFirstColRowIndex ? 1 : 0;

        const findColIndex = (candidates: string[]) => {
          for (const cand of candidates) {
            const candNorm = normalizeHeader(cand);
            const idx = normalizedHeaders.indexOf(candNorm);
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const getColIdx = (candidates: string[], defaultPos: number) => {
          const found = findColIndex(candidates);
          if (found !== -1) return found;
          const posWithOffset = defaultPos + indexOffset;
          if (normalizedHeaders.length > posWithOffset) return posWithOffset;
          return -1;
        };

        const nameIdx = getColIdx(['name', 'rulename', 'rule', 'policyname'], 0);
        const tagsIdx = getColIdx(['tags', 'tag'], 1);
        const groupIdx = getColIdx(['group', 'rulegroup'], 2);
        const typeIdx = getColIdx(['type', 'ruletype'], 3);
        const srcZoneIdx = getColIdx(['sourcezone', 'source zone', 'fromzone', 'from'], 4);
        const srcAddrIdx = getColIdx(['sourceaddress', 'source address', 'source', 'src'], 5);
        const srcUserIdx = getColIdx(['sourceuser', 'source user', 'user'], 6);
        const srcDevIdx = getColIdx(['sourcedevice', 'source device'], 7);
        const dstZoneIdx = getColIdx(['destinationzone', 'destination zone', 'tozone', 'to'], 8);
        const dstAddrIdx = getColIdx(['destinationaddress', 'destination address', 'destination', 'dst'], 9);
        const dstDevIdx = getColIdx(['destinationdevice', 'destination device'], 10);
        const appIdx = getColIdx(['application', 'applications', 'app', 'apps'], 11);
        const srvIdx = getColIdx(['service', 'services', 'ports', 'port'], 12);
        const urlCatIdx = getColIdx(['urlcategory', 'url category', 'category'], 13);
        const actionIdx = getColIdx(['action', 'ruleaction'], 14);
        const profileIdx = getColIdx(['profile', 'profiles', 'securityprofile'], 15);
        const optionsIdx = getColIdx(['options', 'option', 'logoptions'], 16);
        const uuidIdx = getColIdx(['ruleuuid', 'uuid', 'rule uuid'], 17);
        const descIdx = getColIdx(['ruleusagedescription', 'description', 'desc', 'comment'], 18);
        const hitCountIdx = getColIdx(['ruleusagehitcount', 'hitcount', 'hit count', 'hits'], 19);
        const lastHitIdx = getColIdx(['ruleusagelasthit', 'lasthit', 'last hit'], 20);
        const firstHitIdx = getColIdx(['ruleusagefirsthit', 'firsthit', 'first hit'], 21);
        const appsSeenIdx = getColIdx(['ruleusageappsseen', 'appsseen', 'apps seen'], 22);
        const daysNoNewIdx = getColIdx(['dayswithnonewapps', 'daysnonewapps'], 23);
        const modifiedIdx = getColIdx(['modified', 'updated', 'lastmodified'], 24);
        const createdIdx = getColIdx(['created', 'creationdate'], 25);
        const enabledIdx = findColIndex(['enabled', 'status', 'state', 'disabled']);

        const parsedRules: SecurityRule[] = [];

        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i];
          if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

          const getValue = (idx: number, fallback: string = '') => {
            if (idx !== -1 && cols[idx] !== undefined && cols[idx] !== null) {
              const str = cols[idx].trim().replace(/\[Disabled\]\s*/gi, '');
              return str ? str.replace(/;(?!\s)/g, '; ') : fallback;
            }
            return fallback;
          };

          const parseList = (idx: number, fallback: string[]) => {
            const raw = getValue(idx, '');
            if (!raw) return fallback;
            const items = raw.split(/[;,]/).map((s) => s.trim().replace(/\[Disabled\]\s*/gi, '')).filter(Boolean);
            return items.length > 0 ? items : fallback;
          };

          const rawAction = getValue(actionIdx, 'Allow').toLowerCase();
          let action: RuleAction = 'Allow';
          if (rawAction.includes('allow') || rawAction === 'pass') {
            action = 'Allow';
          } else if (rawAction.includes('deny') || rawAction === 'block') {
            action = 'Deny';
          } else if (rawAction.includes('drop') || rawAction === 'reset') {
            action = 'Drop';
          } else if (rawAction) {
            action = 'Khác';
          }

          let enabled = true;
          if (enabledIdx !== -1) {
            const val = cols[enabledIdx]?.toLowerCase().trim();
            if (val === 'false' || val === 'no' || val === '0' || val === 'disabled') {
              enabled = false;
            }
          }

          const rawHits = getValue(hitCountIdx, '0');
          let hitCount = parseInt(rawHits.replace(/[^0-9]/g, ''), 10) || 0;
          let hitCountFormatted = `${hitCount.toLocaleString()} hits`;
          if (hitCount >= 1000000000) {
            hitCountFormatted = `${(hitCount / 1000000000).toFixed(2)}B hits`;
          } else if (hitCount >= 1000000) {
            hitCountFormatted = `${(hitCount / 1000000).toFixed(1)}M hits`;
          } else if (hitCount >= 1000) {
            hitCountFormatted = `${(hitCount / 1000).toFixed(1)}k hits`;
          } else if (rawHits.toLowerCase().includes('m') || rawHits.toLowerCase().includes('k')) {
            hitCountFormatted = rawHits;
          }

          const ruleName = getValue(nameIdx, `Imported-Rule-${i}`);

          parsedRules.push({
            id: `import-csv-${i}-${Date.now()}`,
            name: ruleName,
            tags: parseList(tagsIdx, ['Imported']),
            group: getValue(groupIdx, 'Any'),
            type: getValue(typeIdx, 'Untrust'),
            sourceZone: getValue(srcZoneIdx, 'Trust'),
            sourceAddress: getValue(srcAddrIdx, 'Any'),
            sourceUser: getValue(srcUserIdx, 'Any'),
            sourceDevice: getValue(srcDevIdx, 'Any'),
            destinationZone: getValue(dstZoneIdx, 'Untrust'),
            destinationAddress: getValue(dstAddrIdx, 'Any'),
            destinationDevice: getValue(dstDevIdx, 'Any'),
            application: parseList(appIdx, ['web-browsing']),
            service: parseList(srvIdx, ['service-http']),
            urlCategory: getValue(urlCatIdx, 'any'),
            action,
            profile: getValue(profileIdx, 'default'),
            options: getValue(optionsIdx, 'Log at Session End'),
            ruleUuid: getValue(uuidIdx, `${Math.random().toString(36).substr(2, 9)}`),
            description: getValue(descIdx, 'Imported from CSV policy file'),
            hitCount,
            hitCountFormatted,
            lastHit: getValue(lastHitIdx, 'Never'),
            firstHit: getValue(firstHitIdx, new Date().toISOString().split('T')[0]),
            appsSeen: parseInt(getValue(appsSeenIdx, '1'), 10) || 1,
            daysNoNewApps: parseInt(getValue(daysNoNewIdx, '0'), 10) || 0,
            modified: getValue(modifiedIdx, new Date().toISOString().split('T')[0]),
            created: getValue(createdIdx, new Date().toISOString().split('T')[0]),
            enabled,
          });
        }

        if (parsedRules.length === 0) {
          const msg = 'Could not extract any valid security rules from CSV content.';
          setErrorMsg(msg);
          setPreviewRules([]);
          onNotify?.('error', 'Import Failed', msg);
        } else {
          setPreviewRules(parsedRules);
        }
      }
    } catch (err) {
      const msg = 'Invalid CSV or JSON format. Please check your file data structure.';
      setErrorMsg(msg);
      setPreviewRules([]);
      onNotify?.('error', 'Import Format Error', msg);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPastedText(content);
        handleTextChange(content);
      }
    };
    reader.onerror = () => {
      const msg = `Failed to read file ${file.name}.`;
      setErrorMsg(msg);
      onNotify?.('error', 'File Upload Failed', msg);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    if (previewRules.length === 0) {
      const msg = 'No valid rules found to import.';
      setErrorMsg(msg);
      onNotify?.('error', 'Import Failed', msg);
      return;
    }
    onImport(previewRules, replaceExisting);
    onNotify?.(
      'success',
      'Import Successful',
      `Successfully imported ${previewRules.length} security policy rule(s)${replaceExisting ? ' (replaced existing rules)' : ''}.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-arrow-up-from-bracket text-brand mr-2"></i>
            Import Security Policies
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setImportMode('file')}
              className={`pb-2 px-4 text-xs font-semibold border-b-2 cursor-pointer ${
                importMode === 'file'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Upload File (.csv, .json)
            </button>
            <button
              onClick={() => setImportMode('text')}
              className={`pb-2 px-4 text-xs font-semibold border-b-2 cursor-pointer ${
                importMode === 'text'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Paste Content
            </button>
          </div>

          {importMode === 'file' ? (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".csv, .json, text/plain"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 mb-2"></i>
              <p className="text-sm font-medium text-slate-700">
                Click or drag & drop CSV or JSON policy definition file here
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports standard Palo Alto policy export CSV files</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paste CSV or JSON Rules Data
              </label>
              <textarea
                rows={5}
                value={pastedText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={'Name, Source Zone, Source Address, Destination Zone, Destination Address, Application, Service, Action\nAllow-Web, Trust, 192.168.1.0/24, Untrust, Any, "web-browsing, ssl", "service-http, service-https", Allow\nBlock-Media, Trust, Marketing-VLAN, Untrust, Any, facebook, application-default, Deny'}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          )}

          {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}

          {previewRules.length > 0 && (
            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">
                  Import Preview ({previewRules.length} rules detected):
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded bg-white">
                <table className="w-full text-left text-[11px] min-w-[600px]">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="p-1.5 border-b">Name</th>
                      <th className="p-1.5 border-b">Group</th>
                      <th className="p-1.5 border-b">Type</th>
                      <th className="p-1.5 border-b">Source Zone</th>
                      <th className="p-1.5 border-b">Source Address</th>
                      <th className="p-1.5 border-b">Destination Zone</th>
                      <th className="p-1.5 border-b">Destination Address</th>
                      <th className="p-1.5 border-b">Application</th>
                      <th className="p-1.5 border-b">Service</th>
                      <th className="p-1.5 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRules.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-1.5 font-semibold text-slate-800">{r.name}</td>
                        <td className="p-1.5 text-slate-500">{r.group}</td>
                        <td className="p-1.5 text-slate-500">{r.type}</td>
                        <td className="p-1.5 text-slate-600">{r.sourceZone}</td>
                        <td className="p-1.5 text-slate-600">{r.sourceAddress}</td>
                        <td className="p-1.5 text-slate-600">{r.destinationZone}</td>
                        <td className="p-1.5 text-slate-600">{r.destinationAddress}</td>
                        <td className="p-1.5 text-orange-700 font-medium">{r.application.join(', ')}</td>
                        <td className="p-1.5 text-slate-600 font-mono">{r.service.join(', ')}</td>
                        <td className="p-1.5">
                          <span className={`font-bold ${r.action === 'Allow' ? 'text-green-600' : 'text-red-600'}`}>
                            {r.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="replaceExisting"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="rounded text-brand focus:ring-brand accent-orange-600"
            />
            <label htmlFor="replaceExisting" className="text-xs font-medium text-slate-700">
              Replace existing rules (Clear table before importing)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={previewRules.length === 0}
              onClick={handleImportSubmit}
              className="px-4 py-1.5 bg-brand text-white rounded hover:bg-orange-600 disabled:opacity-50 text-xs font-semibold shadow-xs"
            >
              Import {previewRules.length > 0 ? `(${previewRules.length} Rules)` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

