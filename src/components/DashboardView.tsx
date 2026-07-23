import React from 'react';
import { SecurityRule } from '../types';

interface DashboardViewProps {
  rules: SecurityRule[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ rules }) => {
  const totalRules = rules.length;
  const activeRules = rules.filter((r) => r.enabled).length;
  const allowRules = rules.filter((r) => r.action === 'Allow').length;
  const denyRules = rules.filter((r) => r.action === 'Deny' || r.action === 'Drop').length;
  const zeroHitRules = rules.filter((r) => r.hitCount === 0).length;

  const totalHits = rules.reduce((acc, r) => acc + r.hitCount, 0);

  const topApps = [
    { name: 'ssl / tls', percent: 45, volume: '4.2 TB', color: 'bg-orange-500' },
    { name: 'web-browsing', percent: 28, volume: '2.8 TB', color: 'bg-blue-500' },
    { name: 'dns', percent: 12, volume: '850 GB', color: 'bg-emerald-500' },
    { name: 'pan-gp-agent (VPN)', percent: 8, volume: '620 GB', color: 'bg-purple-500' },
    { name: 'git-base / docker', percent: 7, volume: '410 GB', color: 'bg-slate-500' },
  ];

  const recentThreats = [
    { time: '19:48:12', rule: 'Drop-Malicious-IPs', app: 'botnet-cnc', src: '185.220.101.5', dst: '10.0.1.50', action: 'Drop' },
    { time: '19:42:05', rule: 'Block-Social-Media', app: 'facebook', src: '192.168.1.104', dst: '31.13.71.36', action: 'Deny' },
    { time: '19:35:19', rule: 'Block-P2P-And-Tor', app: 'bittorrent', src: '192.168.1.88', dst: '93.184.216.34', action: 'Drop' },
    { time: '19:20:00', rule: 'Drop-Malicious-IPs', app: 'vulnerability-exploit', src: '193.142.146.12', dst: '10.0.1.10', action: 'Drop' },
  ];

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Security Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time firewall policy evaluation, hit metrics, and threat prevention status.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-700">PA-5250 High Availability Active</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Total Security Rules
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1">{totalRules}</div>
          <div className="text-[11px] text-slate-500 mt-1">{activeRules} active enabled</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Allow Policies
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{allowRules}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Permitted traffic</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Deny / Drop Policies
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">{denyRules}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Threat enforcement</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Unused (0 Hits)
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{zeroHitRules}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Optimization targets</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Total Traffic Hits
          </div>
          <div className="text-2xl font-black text-brand mt-1">
            {(totalHits / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Evaluated sessions</div>
        </div>
      </div>

      {/* Main Grid Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Applications Distribution */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 flex items-center justify-between">
            <span>Top Applications by Traffic</span>
            <i className="fa-solid fa-chart-pie text-slate-400"></i>
          </h3>
          <div className="space-y-3">
            {topApps.map((app, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{app.name}</span>
                  <span className="text-slate-500 font-mono">{app.volume} ({app.percent}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${app.color}`}
                    style={{ width: `${app.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Threat & Block Event Feed */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800 flex items-center">
              <i className="fa-solid fa-shield-cat text-brand mr-2"></i>
              Recent Threat Enforcement Logs
            </h3>
            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold">
              Live Monitor
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Time</th>
                  <th className="p-2">Policy Rule</th>
                  <th className="p-2">App / Threat</th>
                  <th className="p-2">Source IP</th>
                  <th className="p-2">Destination</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentThreats.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2 font-mono text-slate-400">{log.time}</td>
                    <td className="p-2 font-medium text-slate-800">{log.rule}</td>
                    <td className="p-2 text-slate-600 font-mono">{log.app}</td>
                    <td className="p-2 text-slate-600 font-mono">{log.src}</td>
                    <td className="p-2 text-slate-600 font-mono">{log.dst}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          log.action === 'Drop'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
