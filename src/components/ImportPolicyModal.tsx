import React, { useState } from 'react';
import { SecurityRule } from '../types';

interface ImportPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newRules: SecurityRule[], replace: boolean) => void;
}

export const ImportPolicyModal: React.FC<ImportPolicyModalProps> = ({
  isOpen,
  onClose,
  onImport,
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
        setPreviewRules(rulesArr);
      } else {
        // Parse CSV
        const lines = text.trim().split('\n');
        if (lines.length < 2) return;
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const parsedRules: SecurityRule[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim());
          if (cols.length < 2) continue;

          const nameIdx = headers.indexOf('name');
          const actionIdx = headers.indexOf('action');
          const srcZoneIdx = headers.indexOf('sourcezone') >= 0 ? headers.indexOf('sourcezone') : headers.indexOf('source zone');
          const dstZoneIdx = headers.indexOf('destinationzone') >= 0 ? headers.indexOf('destinationzone') : headers.indexOf('destination zone');

          parsedRules.push({
            id: `import-${i}-${Date.now()}`,
            name: nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx] : `Imported-Rule-${i}`,
            tags: ['Imported'],
            group: 'Imported',
            type: 'Untrust',
            sourceZone: srcZoneIdx >= 0 && cols[srcZoneIdx] ? cols[srcZoneIdx] : 'Trust',
            sourceAddress: 'Any',
            sourceUser: 'Any',
            sourceDevice: 'Any',
            destinationZone: dstZoneIdx >= 0 && cols[dstZoneIdx] ? cols[dstZoneIdx] : 'Untrust',
            destinationAddress: 'Any',
            destinationDevice: 'Any',
            application: ['web-browsing'],
            service: ['service-http'],
            urlCategory: 'any',
            action: (actionIdx >= 0 && cols[actionIdx] ? cols[actionIdx] : 'Allow') as any,
            profile: 'default',
            options: 'Log at Session End',
            ruleUuid: `${Math.random().toString(36).substr(2, 9)}`,
            description: 'Imported from CSV file',
            hitCount: 0,
            hitCountFormatted: '0 hits',
            lastHit: 'Never',
            firstHit: new Date().toISOString().split('T')[0],
            appsSeen: 1,
            daysNoNewApps: 0,
            modified: new Date().toISOString().split('T')[0],
            created: new Date().toISOString().split('T')[0],
            enabled: true,
          });
        }
        setPreviewRules(parsedRules);
      }
    } catch (err) {
      setErrorMsg('Invalid CSV or JSON format. Please check your data structure.');
      setPreviewRules([]);
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
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    if (previewRules.length === 0) {
      setErrorMsg('No valid rules found to import.');
      return;
    }
    onImport(previewRules, replaceExisting);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-arrow-up-from-bracket text-brand mr-2"></i>
            Import Security Policies
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-4">
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
                placeholder="Name, SourceZone, DestinationZone, Action&#10;Allow-Web, Trust, Untrust, Allow&#10;Block-Media, Trust, Untrust, Deny"
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          )}

          {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}

          {previewRules.length > 0 && (
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-700">
                  Preview ({previewRules.length} rules found):
                </span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 max-h-24 overflow-y-auto pr-1">
                {previewRules.map((r, idx) => (
                  <li key={idx} className="flex justify-between border-b border-slate-200 pb-0.5">
                    <span className="font-semibold text-slate-800">{r.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {r.sourceZone} ➔ {r.destinationZone} ({r.action})
                    </span>
                  </li>
                ))}
              </ul>
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
