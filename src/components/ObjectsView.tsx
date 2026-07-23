import React, { useState } from 'react';

export const ObjectsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'addresses' | 'services' | 'tags'>('addresses');
  const [searchTerm, setSearchTerm] = useState('');

  const addressObjects = [
    { name: '192.168.1.0/24', type: 'IP Subnet', value: '192.168.1.0/24', description: 'Internal LAN Workstations' },
    { name: 'Marketing-VLAN', type: 'IP Netmask', value: '10.10.20.0/24', description: 'Marketing Department Subnet' },
    { name: 'EDL-High-Risk-IPs', type: 'External Dynamic List', value: 'https://feeds.paloaltonetworks.com/threats', description: 'Palo Alto Threat Intelligence EDL' },
    { name: 'Payment-Processor-Cluster', type: 'IP Range', value: '10.50.1.10 - 10.50.1.20', description: 'PCI-DSS Compliant Payment Servers' },
    { name: 'GlobalProtect-Gateway', type: 'FQDN', value: 'vpn.enterprise.com', description: 'Public VPN Gateway' },
    { name: '10.244.0.0/16', type: 'IP Subnet', value: '10.244.0.0/16', description: 'Kubernetes Pod Network' },
  ];

  const serviceObjects = [
    { name: 'service-http', protocol: 'TCP', port: '80', description: 'Standard HTTP Web Protocol' },
    { name: 'service-https', protocol: 'TCP', port: '443', description: 'TLS/SSL Secure Web Traffic' },
    { name: 'service-dns', protocol: 'UDP/TCP', port: '53', description: 'Domain Name Resolution' },
    { name: 'tcp-8080', protocol: 'TCP', port: '8080', description: 'Custom Web Application Port' },
    { name: 'tcp-9090', protocol: 'TCP', port: '9090', description: 'Prometheus Metrics Ingestion' },
    { name: 'tcp-2049', protocol: 'TCP', port: '2049', description: 'Network File System (NFS)' },
  ];

  const tagObjects = [
    { name: 'Trust', color: 'bg-blue-100 text-blue-800 border-blue-300', description: 'Internal Trusted Security Zone' },
    { name: 'Untrust', color: 'bg-red-100 text-red-800 border-red-300', description: 'External Public Internet Zone' },
    { name: 'Zone-A', color: 'bg-purple-100 text-purple-800 border-purple-300', description: 'Microservices Enclave A' },
    { name: 'Infrastructure', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', description: 'Core Network Services' },
    { name: 'PCI-DSS', color: 'bg-amber-100 text-amber-800 border-amber-300', description: 'Payment Card Industry Compliance' },
    { name: 'DevOps', color: 'bg-teal-100 text-teal-800 border-teal-300', description: 'Development and CI/CD Pipelines' },
  ];

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Objects Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define network addresses, custom service ports, and security tags used in policy rules.
          </p>
        </div>
        <button className="flex items-center px-3 py-1.5 bg-brand hover:bg-orange-600 text-white rounded text-xs font-semibold shadow-xs">
          <i className="fa-solid fa-plus mr-1.5"></i> Add Object
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('addresses')}
          className={`pb-2 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'addresses'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Address Objects ({addressObjects.length})
        </button>
        <button
          onClick={() => setActiveSubTab('services')}
          className={`pb-2 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'services'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Service Objects ({serviceObjects.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tags')}
          className={`pb-2 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'tags'
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Tags & Categories ({tagObjects.length})
        </button>
      </div>

      {/* Search toolbar */}
      <div className="w-72">
        <input
          type="text"
          placeholder="Filter objects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {/* Object Lists */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
        {activeSubTab === 'addresses' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {addressObjects
                .filter((o) => o.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((obj, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{obj.name}</td>
                    <td className="p-3 text-slate-500">{obj.type}</td>
                    <td className="p-3 font-mono text-brand font-medium">{obj.value}</td>
                    <td className="p-3 text-slate-600">{obj.description}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeSubTab === 'services' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Service Name</th>
                <th className="p-3">Protocol</th>
                <th className="p-3">Port / Details</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {serviceObjects
                .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((srv, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{srv.name}</td>
                    <td className="p-3 text-slate-500">{srv.protocol}</td>
                    <td className="p-3 font-mono text-brand font-medium">{srv.port}</td>
                    <td className="p-3 text-slate-600">{srv.description}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeSubTab === 'tags' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Tag Name</th>
                <th className="p-3">Badge Preview</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tagObjects
                .filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((tag, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{tag.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs border font-medium ${tag.color}`}>
                        {tag.name}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{tag.description}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
