import React, { useState, useEffect } from 'react';
import { SecurityRule, RuleAction } from '../types';

interface AddEditRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: SecurityRule) => void;
  editingRule?: SecurityRule | null;
}

export const AddEditRuleModal: React.FC<AddEditRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRule,
}) => {
  const [name, setName] = useState('');
  const [tags, setTags] = useState('Trust');
  const [group, setGroup] = useState('Any');
  const [type, setType] = useState('Untrust');
  const [sourceZone, setSourceZone] = useState('Trust');
  const [sourceAddress, setSourceAddress] = useState('192.168.1.0/24');
  const [sourceUser, setSourceUser] = useState('Any');
  const [destinationZone, setDestinationZone] = useState('Untrust');
  const [destinationAddress, setDestinationAddress] = useState('Any');
  const [applications, setApplications] = useState('web-browsing, ssl');
  const [services, setServices] = useState('service-http, service-https');
  const [action, setAction] = useState<RuleAction>('Allow');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [hasSchedule, setHasSchedule] = useState(false);

  useEffect(() => {
    if (editingRule) {
      setName(editingRule.name);
      setTags(editingRule.tags.join(', '));
      setGroup(editingRule.group);
      setType(editingRule.type);
      setSourceZone(editingRule.sourceZone);
      setSourceAddress(editingRule.sourceAddress);
      setSourceUser(editingRule.sourceUser);
      setDestinationZone(editingRule.destinationZone);
      setDestinationAddress(editingRule.destinationAddress);
      setApplications(editingRule.application.join(', '));
      setServices(editingRule.service.join(', '));
      setAction(editingRule.action);
      setDescription(editingRule.description || '');
      setEnabled(editingRule.enabled);
      setHasSchedule(!!editingRule.hasSchedule);
    } else {
      setName('');
      setTags('Trust');
      setGroup('Any');
      setType('Untrust');
      setSourceZone('Trust');
      setSourceAddress('192.168.1.0/24');
      setSourceUser('Any');
      setDestinationZone('Untrust');
      setDestinationAddress('Any');
      setApplications('web-browsing, ssl');
      setServices('service-http, service-https');
      setAction('Allow');
      setDescription('');
      setEnabled(true);
      setHasSchedule(false);
    }
  }, [editingRule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedApps = applications
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedServices = services
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedTags = tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const nowStr = new Date().toISOString().split('T')[0];

    const ruleToSave: SecurityRule = {
      id: editingRule ? editingRule.id : Date.now().toString(),
      name: name.trim(),
      tags: parsedTags.length ? parsedTags : ['Trust'],
      group: group.trim() || 'Any',
      type: type.trim() || 'Untrust',
      sourceZone: sourceZone.trim() || 'Trust',
      sourceAddress: sourceAddress.trim() || 'Any',
      sourceUser: sourceUser.trim() || 'Any',
      sourceDevice: editingRule ? editingRule.sourceDevice : 'Any',
      destinationZone: destinationZone.trim() || 'Untrust',
      destinationAddress: destinationAddress.trim() || 'Any',
      destinationDevice: editingRule ? editingRule.destinationDevice : 'Any',
      application: parsedApps.length ? parsedApps : ['any'],
      service: parsedServices.length ? parsedServices : ['any'],
      urlCategory: editingRule ? editingRule.urlCategory : 'any',
      action,
      profile: editingRule ? editingRule.profile : 'default',
      options: editingRule ? editingRule.options : 'Log at Session End',
      ruleUuid: editingRule
        ? editingRule.ruleUuid
        : `${Math.random().toString(36).substr(2, 9)}-uuid`,
      description: description.trim(),
      hitCount: editingRule ? editingRule.hitCount : 0,
      hitCountFormatted: editingRule ? editingRule.hitCountFormatted : '0 hits',
      lastHit: editingRule ? editingRule.lastHit : 'Never',
      firstHit: editingRule ? editingRule.firstHit : nowStr,
      appsSeen: editingRule ? editingRule.appsSeen : parsedApps.length,
      daysNoNewApps: editingRule ? editingRule.daysNoNewApps : 0,
      modified: nowStr,
      created: editingRule ? editingRule.created : nowStr,
      enabled,
      hasSchedule,
    };

    onSave(ruleToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-shield-halved text-brand mr-2"></i>
            {editingRule ? 'Edit Security Rule' : 'Create New Security Rule'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Allow-Web-Access"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Trust, DMZ"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Zone
              </label>
              <input
                type="text"
                value={sourceZone}
                onChange={(e) => setSourceZone(e.target.value)}
                placeholder="e.g. Trust"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Zone
              </label>
              <input
                type="text"
                value={destinationZone}
                onChange={(e) => setDestinationZone(e.target.value)}
                placeholder="e.g. Untrust"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Address
              </label>
              <input
                type="text"
                value={sourceAddress}
                onChange={(e) => setSourceAddress(e.target.value)}
                placeholder="e.g. 192.168.1.0/24 or Any"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Address
              </label>
              <input
                type="text"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="e.g. Any"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applications (comma separated)
              </label>
              <input
                type="text"
                value={applications}
                onChange={(e) => setApplications(e.target.value)}
                placeholder="e.g. web-browsing, ssl"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Services (comma separated)
              </label>
              <input
                type="text"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="e.g. service-http, service-https"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as RuleAction)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="Allow">Allow</option>
                <option value="Deny">Deny</option>
                <option value="Drop">Drop</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Group
              </label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="e.g. Marketing-VLAN"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this rule..."
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded text-brand focus:ring-brand accent-orange-600"
              />
              <span className="text-sm font-medium text-slate-700">Enable Rule</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSchedule}
                onChange={(e) => setHasSchedule(e.target.checked)}
                className="rounded text-brand focus:ring-brand accent-orange-600"
              />
              <span className="text-sm font-medium text-slate-700">Enforce Schedule</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand text-white rounded hover:bg-orange-600 text-sm font-semibold shadow-xs"
            >
              {editingRule ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
