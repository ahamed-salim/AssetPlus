import React from 'react';
import { 
  Box, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  ShieldAlert, 
  Trash2, 
  DollarSign, 
  Plus, 
  QrCode, 
  ArrowLeftRight, 
  TicketCheck, 
  ClipboardCheck, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { StatsCard } from '../components/common/StatsCard';
import { Badge, getStatusBadge } from '../components/common/Badge';
import { SystemStats, Asset, ComplaintTicket, AssignmentTransfer } from '../types';
import { ActiveTab } from '../components/layout/Sidebar';

interface DashboardViewProps {
  stats: SystemStats;
  assets: Asset[];
  complaints: ComplaintTicket[];
  transfers: AssignmentTransfer[];
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddAssetModal: () => void;
  onOpenAssetDetail: (asset: Asset) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  assets = [],
  complaints = [],
  transfers = [],
  onSelectTab,
  onOpenAddAssetModal,
  onOpenAssetDetail
}) => {
  const safeAssets = assets || [];
  const safeComplaints = complaints || [];
  const safeTransfers = transfers || [];

  // Chart 1: Category Distribution
  const categoryCounts = safeAssets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value
  }));

  const CATEGORY_COLORS = ['#2563eb', '#0d9488', '#d97706', '#7c3aed', '#db2777', '#475569'];

  // Chart 2: Status Breakdown
  const statusCounts = safeAssets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusCounts).map(([name, count]) => ({
    status: name,
    count
  }));

  // Critical items
  const openComplaints = safeComplaints.filter(c => c && (c.status === 'Open' || c.status === 'In Progress'));
  const expiringWarranties = safeAssets.filter(a => a && (a.warrantyStatus === 'Expiring Soon' || a.warrantyStatus === 'Expired'));
  const pendingTransfersList = safeTransfers.filter(t => t && t.status === 'Pending Approval');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white shadow-xl border border-slate-800">
        <div>
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest font-mono">
            OPERATIONS COMMAND CENTER
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Digital Asset Lifecycle Intelligence
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time infrastructure tracking, warranty health risk monitoring, and automated lifecycle assignments across all enterprise facilities.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddAssetModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Asset</span>
          </button>
          <button
            onClick={() => onSelectTab('qr_scanner')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold transition-all border border-slate-700"
          >
            <QrCode className="w-4 h-4 text-blue-400" />
            <span>Scan Tag</span>
          </button>
          <button
            onClick={() => onSelectTab('transfers')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold transition-all border border-slate-700"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
            <span>Transfer Request</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Assets"
          value={stats.totalAssets}
          subtitle={`$${stats.totalValuation.toLocaleString()} Value`}
          icon={Box}
          iconBgColor="bg-blue-50 dark:bg-blue-950/50"
          iconTextColor="text-blue-600 dark:text-blue-400"
          onClick={() => onSelectTab('assets')}
        />
        <StatsCard
          title="Assigned / In Use"
          value={stats.assignedAssets}
          subtitle={`${Math.round((stats.assignedAssets / (stats.totalAssets || 1)) * 100)}% Utilized`}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
          onClick={() => onSelectTab('assets')}
        />
        <StatsCard
          title="Available Pool"
          value={stats.availableAssets}
          subtitle="Ready for Checkout"
          icon={Clock}
          iconBgColor="bg-sky-50 dark:bg-sky-950/50"
          iconTextColor="text-sky-600 dark:text-sky-400"
          onClick={() => onSelectTab('assets')}
        />
        <StatsCard
          title="Under Repair"
          value={stats.underRepair}
          subtitle={`${openComplaints.length} Active Complaints`}
          icon={Wrench}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconTextColor="text-amber-600 dark:text-amber-400"
          onClick={() => onSelectTab('repairs')}
        />
        <StatsCard
          title="Warranty Expiring"
          value={stats.warrantyExpiring}
          subtitle="Action Required (30 days)"
          icon={ShieldAlert}
          iconBgColor="bg-rose-50 dark:bg-rose-950/50"
          iconTextColor="text-rose-600 dark:text-rose-400"
          onClick={() => onSelectTab('warranty')}
        />
        <StatsCard
          title="Disposed / Retired"
          value={stats.disposedAssets}
          subtitle="E-Waste Certified"
          icon={Trash2}
          iconBgColor="bg-slate-100 dark:bg-slate-800"
          iconTextColor="text-slate-600 dark:text-slate-400"
          onClick={() => onSelectTab('disposal')}
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Asset Distribution by Category
              </h3>
              <p className="text-xs text-slate-400">Inventory share across enterprise categories</p>
            </div>
            <button
              onClick={() => onSelectTab('reports')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Report <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Lifecycle Status Breakdown
              </h3>
              <p className="text-xs text-slate-400">Operational readiness & service states</p>
            </div>
            <button
              onClick={() => onSelectTab('assets')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Alerts & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance & Warranty Risk Alerts (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Maintenance & Warranty Risk Alerts
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
              {openComplaints.length + expiringWarranties.length} Requires Attention
            </span>
          </div>

          <div className="space-y-3">
            {/* Expiring / Expired Warranties */}
            {expiringWarranties.map((asset) => {
              const isExpired = asset.warrantyStatus === 'Expired';
              return (
                <div
                  key={asset.id}
                  onClick={() => onSelectTab('warranty')}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-amber-400 transition-colors cursor-pointer ${
                    isExpired
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/40'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isExpired
                        ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                    }`}>
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{asset.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">({asset.tag})</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          isExpired ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {asset.warrantyStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Vendor: <strong className="text-slate-700 dark:text-slate-300">{asset.warrantyVendor}</strong> • Start Date: <span className="font-mono">{asset.purchaseDate}</span> • Expiry Date: <strong className={isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>{asset.warrantyExpiry}</strong>
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold shrink-0 hover:underline ${
                    isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    Manage Warranty →
                  </span>
                </div>
              );
            })}

            {/* Critical Complaints */}
            {openComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectTab('complaints')}
                className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/40 flex items-center justify-between hover:border-rose-400 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{c.title}</span>
                      <Badge variant="danger">{c.priority}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Asset: {c.assetName} • Raised by: {c.raisedBy} ({c.department})
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline">
                  Assign Tech →
                </span>
              </div>
            ))}

            {expiringWarranties.length === 0 && openComplaints.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">
                All warranties are healthy and no open tickets logged.
              </p>
            )}
          </div>
        </div>

        {/* Pending Transfer Requests Side Panel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Pending Transfers
              </h3>
              <button
                onClick={() => onSelectTab('transfers')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View Workflow
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {pendingTransfersList.map((trf) => (
                <div key={trf.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span className="truncate max-w-[180px]">{trf.assetName}</span>
                    <Badge variant="purple">{trf.type}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Req by: <strong className="text-slate-700 dark:text-slate-300">{trf.requestedBy}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 italic">
                    "{trf.reason}"
                  </p>
                </div>
              ))}

              {pendingTransfersList.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No transfer approvals currently waiting.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onSelectTab('transfers')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition-colors"
          >
            Manage Equipment Transfers →
          </button>
        </div>
      </div>
    </div>
  );
};
