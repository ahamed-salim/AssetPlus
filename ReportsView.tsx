import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Filter, 
  Search, 
  Box, 
  ArrowLeftRight, 
  Wrench, 
  ShieldAlert, 
  ClipboardCheck, 
  Trash2, 
  Clock, 
  Building2 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { 
  Asset, 
  Employee, 
  Department, 
  AssignmentTransfer, 
  RepairRecord, 
  PreventiveMaintenance, 
  WarrantyRecord, 
  AssetAudit, 
  DisposalRecord 
} from '../types';

interface ReportsViewProps {
  assets: Asset[];
  transfers: AssignmentTransfer[];
  repairs: RepairRecord[];
  pms: PreventiveMaintenance[];
  warranties: WarrantyRecord[];
  audits: AssetAudit[];
  disposals: DisposalRecord[];
  departments: Department[];
  employees: Employee[];
}

export type ReportType = 
  | 'inventory' 
  | 'transfers' 
  | 'maintenance' 
  | 'repairs' 
  | 'warranty' 
  | 'audit' 
  | 'disposal';

export const ReportsView: React.FC<ReportsViewProps> = ({
  assets = [],
  transfers = [],
  repairs = [],
  pms = [],
  warranties = [],
  audits = [],
  disposals = [],
  departments = []
}) => {
  const safeAssets = assets || [];
  const safeTransfers = transfers || [];
  const safeRepairs = repairs || [];
  const safePms = pms || [];
  const safeWarranties = warranties || [];
  const safeAudits = audits || [];
  const safeDisposals = disposals || [];
  const safeDepartments = departments || [];

  const [activeReport, setActiveReport] = useState<ReportType>('inventory');
  const [deptFilter, setDeptFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(safeAssets.map(a => a.category));
    return Array.from(set);
  }, [safeAssets]);

  // Helper calculation for straight-line depreciation
  const calculateBookValue = (asset: Asset) => {
    if (!asset.purchaseCost || asset.purchaseCost <= 0) return 0;
    const purchaseDate = new Date(asset.purchaseDate || '2024-01-01');
    const now = new Date();
    const ageYears = Math.max(0, (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    const usefulLife = asset.expectedLifespanYears || 5;
    const salvage = asset.salvageValue || 0;
    const depreciableAmount = Math.max(0, asset.purchaseCost - salvage);
    const yearlyDepreciation = depreciableAmount / usefulLife;
    const currentDepreciation = Math.min(depreciableAmount, yearlyDepreciation * ageYears);
    return Math.max(salvage, Math.round(asset.purchaseCost - currentDepreciation));
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (deptFilter !== 'All' && a.departmentName !== deptFilter) return false;
      if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = a.name.toLowerCase().includes(q);
        const matchTag = a.tag.toLowerCase().includes(q);
        const matchEmp = (a.assignedEmployeeName || '').toLowerCase().includes(q);
        if (!matchName && !matchTag && !matchEmp) return false;
      }
      return true;
    });
  }, [assets, deptFilter, categoryFilter, searchQuery]);

  // Filtered Transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.assetName.toLowerCase().includes(q) || (t.fromEmployee || '').toLowerCase().includes(q) || (t.toEmployee || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [transfers, searchQuery]);

  // Filtered Repairs
  const filteredRepairs = useMemo(() => {
    return repairs.filter(r => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return r.assetName.toLowerCase().includes(q) || r.vendorName.toLowerCase().includes(q) || r.issueDescription.toLowerCase().includes(q);
      }
      return true;
    });
  }, [repairs, searchQuery]);

  // Filtered PMs
  const filteredPMs = useMemo(() => {
    return pms.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || (p.assetName || '').toLowerCase().includes(q) || p.assignedTech.toLowerCase().includes(q);
      }
      return true;
    });
  }, [pms, searchQuery]);

  // Filtered Warranties
  const filteredWarranties = useMemo(() => {
    return warranties.filter(w => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return w.assetName.toLowerCase().includes(q) || w.vendorName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [warranties, searchQuery]);

  // Filtered Audits
  const filteredAudits = useMemo(() => {
    return audits.filter(a => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return a.campaignName.toLowerCase().includes(q) || a.targetDepartment.toLowerCase().includes(q);
      }
      return true;
    });
  }, [audits, searchQuery]);

  // Filtered Disposals
  const filteredDisposals = useMemo(() => {
    return disposals.filter(d => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return d.assetName.toLowerCase().includes(q) || d.reason.toLowerCase().includes(q) || d.assetTag.toLowerCase().includes(q);
      }
      return true;
    });
  }, [disposals, searchQuery]);

  // Chart Data Generators
  const categoryChartData = useMemo(() => {
    const counts: Record<string, { name: string; count: number; cost: number }> = {};
    filteredAssets.forEach(a => {
      if (!counts[a.category]) {
        counts[a.category] = { name: a.category, count: 0, cost: 0 };
      }
      counts[a.category].count += 1;
      counts[a.category].cost += a.purchaseCost || 0;
    });
    return Object.values(counts);
  }, [filteredAssets]);

  const departmentCostData = useMemo(() => {
    const deptMap: Record<string, number> = {};
    filteredAssets.forEach(a => {
      const dept = a.departmentName || 'Unassigned';
      deptMap[dept] = (deptMap[dept] || 0) + (a.purchaseCost || 0);
    });
    return Object.entries(deptMap).map(([name, cost]) => ({ name, cost }));
  }, [filteredAssets]);

  // CSV Export Handler
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let fileName = `AssetPulse_${activeReport}_report.csv`;

    if (activeReport === 'inventory') {
      headers = ['Tag', 'Name', 'Category', 'Department', 'Location', 'Status', 'Purchase Date', 'Purchase Cost ($)', 'Current Book Value ($)', 'Serial #'];
      rows = filteredAssets.map(a => [
        a.tag,
        a.name,
        a.category,
        a.departmentName,
        a.location,
        a.status,
        a.purchaseDate,
        a.purchaseCost || 0,
        calculateBookValue(a),
        a.serialNumber || 'N/A'
      ]);
    } else if (activeReport === 'transfers') {
      headers = ['ID', 'Asset Name', 'Asset Tag', 'From Employee', 'To Employee', 'Type', 'Transfer Date', 'Status', 'Requested By'];
      rows = filteredTransfers.map(t => [
        t.id,
        t.assetName,
        t.assetTag,
        t.fromEmployee || 'Unassigned',
        t.toEmployee || 'Unassigned',
        t.type,
        t.requestedDate,
        t.status,
        t.requestedBy
      ]);
    } else if (activeReport === 'repairs') {
      headers = ['Ticket ID', 'Asset Tag', 'Asset Name', 'Issue Description', 'Vendor', 'Priority', 'Cost ($)', 'Downtime (Days)', 'Status'];
      rows = filteredRepairs.map(r => [
        r.id,
        r.assetTag,
        r.assetName,
        r.issueDescription,
        r.vendorName,
        r.priority || 'Medium',
        r.repairCost || 0,
        r.downtimeDays || 0,
        r.status
      ]);
    } else if (activeReport === 'maintenance') {
      headers = ['PM ID', 'Asset Name', 'Title', 'Frequency', 'Assigned Tech', 'Next Due Date', 'Status'];
      rows = filteredPMs.map(p => [
        p.id,
        p.assetName || 'General',
        p.title,
        p.frequency,
        p.assignedTech,
        p.nextDueDate,
        p.status || 'Upcoming'
      ]);
    } else if (activeReport === 'warranty') {
      headers = ['Warranty ID', 'Asset Name', 'Vendor', 'Coverage Details', 'Start Date', 'Expiry Date', 'Status'];
      rows = filteredWarranties.map(w => [
        w.id,
        w.assetName,
        w.vendorName,
        w.coverageDetails,
        w.startDate,
        w.expiryDate,
        w.status
      ]);
    } else if (activeReport === 'audit') {
      headers = ['Audit ID', 'Campaign Name', 'Target Dept', 'Auditor', 'Total Expected', 'Verified Count', 'Completion Rate (%)', 'Status'];
      rows = filteredAudits.map(a => {
        const verified = a.items?.filter(i => i.status !== 'Pending').length || a.totalScanned;
        const rate = a.totalExpected > 0 ? Math.round((verified / a.totalExpected) * 100) : 0;
        return [
          a.id,
          a.campaignName,
          a.targetDepartment,
          a.auditorName,
          a.totalExpected,
          verified,
          `${rate}%`,
          a.status
        ];
      });
    } else if (activeReport === 'disposal') {
      headers = ['Disposal ID', 'Asset Tag', 'Asset Name', 'Reason', 'Disposal Date', 'Condition', 'Requested By', 'Salvage Amount ($)', 'Cert #', 'Status'];
      rows = filteredDisposals.map(d => [
        d.id,
        d.assetTag,
        d.assetName,
        d.reason,
        d.disposalDate,
        d.condition,
        d.requestedBy,
        d.saleOrRecycleAmount || 0,
        d.certificateNo || 'N/A',
        d.approvalStatus || d.status || 'Disposed'
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Report Summary Totals
  const totalPurchaseVal = filteredAssets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
  const totalBookVal = filteredAssets.reduce((sum, a) => sum + calculateBookValue(a), 0);
  const totalRepairCost = filteredRepairs.reduce((sum, r) => sum + (r.repairCost || 0), 0);
  const totalSalvageRealized = filteredDisposals.reduce((sum, d) => sum + (d.saleOrRecycleAmount || 0), 0);

  return (
    <div className="space-y-6 print:p-0 print:bg-white">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest font-mono">
              EXECUTIVE ANALYTICS & COMPLIANCE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
              Real-time Business Intelligence
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Reports, Financials & Analytics
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Generate printable lifecycle reports, evaluate straight-line asset depreciation, review maintenance costs, audit completion metrics, and export data tables to CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Types Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800 print:hidden">
        {[
          { id: 'inventory', label: 'Asset Inventory & Valuation', icon: Box },
          { id: 'transfers', label: 'Transfers & Assignments', icon: ArrowLeftRight },
          { id: 'maintenance', label: 'Preventive Maintenance', icon: Clock },
          { id: 'repairs', label: 'Repairs & Downtime', icon: Wrench },
          { id: 'warranty', label: 'Warranty & Coverage', icon: ShieldAlert },
          { id: 'audit', label: 'Audits & Physical Verification', icon: ClipboardCheck },
          { id: 'disposal', label: 'Disposals & Write-Offs', icon: Trash2 },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeReport === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveReport(item.id as ReportType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">Filters:</span>
          </div>

          {/* Dept Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search report records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Dynamic Summary Cards for Active Report */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeReport === 'inventory' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtered Total Assets</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{filteredAssets.length}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Active repository items</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Initial Purchase Value</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">${totalPurchaseVal.toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Original acquisition cost</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Depreciated Book Value</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${totalBookVal.toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Straight-line remaining value</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accumulated Depreciation</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                ${Math.max(0, totalPurchaseVal - totalBookVal).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Total write-down to date</p>
            </div>
          </>
        )}

        {activeReport === 'transfers' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Transfer Records</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{filteredTransfers.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {filteredTransfers.filter(t => t.status === 'Pending Approval').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Assignments</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {filteredTransfers.filter(t => t.status === 'Approved' || t.status === 'Completed').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custody Change Rate</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">Active</div>
            </div>
          </>
        )}

        {activeReport === 'repairs' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Repair Work Tickets</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{filteredRepairs.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Expenditure</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">${totalRepairCost.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Equipment Downtime</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {filteredRepairs.reduce((sum, r) => sum + (r.downtimeDays || 0), 0)} Days
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resolved Tickets</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {filteredRepairs.filter(r => r.status === 'Completed').length}
              </div>
            </div>
          </>
        )}

        {activeReport === 'maintenance' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled PM Routines</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{filteredPMs.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed On-Time</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {filteredPMs.filter(p => p.status === 'Completed').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue PMs</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {filteredPMs.filter(p => p.status === 'Overdue').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {filteredPMs.filter(p => p.status === 'Upcoming' || !p.status).length}
              </div>
            </div>
          </>
        )}

        {activeReport === 'warranty' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Warranty Policies</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{filteredWarranties.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Warranties</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {filteredWarranties.filter(w => w.status === 'Active').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expiring Soon (30 days)</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {filteredWarranties.filter(w => w.status === 'Expiring Soon').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expired Coverage</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {filteredWarranties.filter(w => w.status === 'Expired').length}
              </div>
            </div>
          </>
        )}

        {activeReport === 'audit' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Audit Campaigns</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{filteredAudits.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active / In Progress</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {filteredAudits.filter(a => a.status === 'In Progress').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Campaigns</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {filteredAudits.filter(a => a.status === 'Completed').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Verification Rate</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">85%</div>
            </div>
          </>
        )}

        {activeReport === 'disposal' && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Disposal Records</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{filteredDisposals.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Disposed Assets</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {filteredDisposals.filter(d => (d.approvalStatus || d.status) === 'Disposed').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Realized Scrap Value</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${totalSalvageRealized.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">E-Waste Certified</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {filteredDisposals.filter(d => !!d.certificateNo).length}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Visual Analytics Charts Section (Inventory / General) */}
      {activeReport === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
          {/* Category Distribution Bar Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span>Asset Valuation & Quantity by Category</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="cost" name="Purchase Cost ($)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Cost Bar Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>Department Asset Capital Distribution</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentCostData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="cost" name="Asset Capital ($)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Report Data Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
            {activeReport.toUpperCase()} DETAILED REPORT DATA
          </h3>
          <span className="text-xs text-slate-500">
            Showing records matching filter options
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header per Report Type */}
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                {activeReport === 'inventory' && (
                  <>
                    <th className="p-3">Tag & Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Purchase Date</th>
                    <th className="p-3 text-right">Acquisition Cost</th>
                    <th className="p-3 text-right">Current Book Value</th>
                  </>
                )}
                {activeReport === 'transfers' && (
                  <>
                    <th className="p-3">Transfer ID</th>
                    <th className="p-3">Asset</th>
                    <th className="p-3">From Employee</th>
                    <th className="p-3">To Employee</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Transfer Date</th>
                    <th className="p-3">Status</th>
                  </>
                )}
                {activeReport === 'repairs' && (
                  <>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Asset Name</th>
                    <th className="p-3">Issue Description</th>
                    <th className="p-3">Vendor</th>
                    <th className="p-3 text-right">Repair Cost</th>
                    <th className="p-3 text-center">Downtime</th>
                    <th className="p-3">Status</th>
                  </>
                )}
                {activeReport === 'maintenance' && (
                  <>
                    <th className="p-3">PM ID</th>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Routine Title</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Assigned Tech</th>
                    <th className="p-3">Next Due</th>
                    <th className="p-3">Status</th>
                  </>
                )}
                {activeReport === 'warranty' && (
                  <>
                    <th className="p-3">Warranty ID</th>
                    <th className="p-3">Asset Name</th>
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Coverage Details</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3">Status</th>
                  </>
                )}
                {activeReport === 'audit' && (
                  <>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Campaign Name</th>
                    <th className="p-3">Target Scope</th>
                    <th className="p-3">Auditor</th>
                    <th className="p-3 text-center">Expected / Scanned</th>
                    <th className="p-3 text-center">Completion Rate</th>
                    <th className="p-3">Status</th>
                  </>
                )}
                {activeReport === 'disposal' && (
                  <>
                    <th className="p-3">Disposal ID</th>
                    <th className="p-3">Asset Tag & Name</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Disposal Date</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3 font-mono">Cert #</th>
                    <th className="p-3 text-right">Salvage Value</th>
                  </>
                )}
              </tr>
            </thead>

            {/* Table Body per Report Type */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              {activeReport === 'inventory' && filteredAssets.map(a => {
                const bookVal = calculateBookValue(a);
                return (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <div className="font-bold">{a.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{a.tag}</div>
                    </td>
                    <td className="p-3">{a.category}</td>
                    <td className="p-3">{a.departmentName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'In Use' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        a.status === 'Available' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        a.status === 'Under Repair' || a.status === 'Maintenance' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{a.purchaseDate}</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">${(a.purchaseCost || 0).toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">${bookVal.toLocaleString()}</td>
                  </tr>
                );
              })}

              {activeReport === 'transfers' && filteredTransfers.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-blue-600">{t.id}</td>
                  <td className="p-3 font-bold">{t.assetName} ({t.assetTag})</td>
                  <td className="p-3">{t.fromEmployee || 'Unassigned'}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{t.toEmployee || 'Unassigned'}</td>
                  <td className="p-3">{t.type}</td>
                  <td className="p-3 font-mono">{t.requestedDate}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}

              {activeReport === 'repairs' && filteredRepairs.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-indigo-600">{r.id}</td>
                  <td className="p-3 font-bold">{r.assetName}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{r.issueDescription}</td>
                  <td className="p-3">{r.vendorName}</td>
                  <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400">${(r.repairCost || 0).toLocaleString()}</td>
                  <td className="p-3 text-center font-mono">{r.downtimeDays || 0}d</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}

              {activeReport === 'maintenance' && filteredPMs.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-blue-600">{p.id}</td>
                  <td className="p-3 font-bold">{p.assetName || 'General'}</td>
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">{p.frequency}</td>
                  <td className="p-3">{p.assignedTech}</td>
                  <td className="p-3 font-mono">{p.nextDueDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      p.status === 'Overdue' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {p.status || 'Upcoming'}
                    </span>
                  </td>
                </tr>
              ))}

              {activeReport === 'warranty' && filteredWarranties.map(w => (
                <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-indigo-600">{w.id}</td>
                  <td className="p-3 font-bold">{w.assetName}</td>
                  <td className="p-3">{w.vendorName}</td>
                  <td className="p-3">{w.coverageDetails}</td>
                  <td className="p-3 font-mono">{w.expiryDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      w.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      w.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}

              {activeReport === 'audit' && filteredAudits.map(a => {
                const verified = a.items?.filter(i => i.status !== 'Pending').length || a.totalScanned;
                const rate = a.totalExpected > 0 ? Math.round((verified / a.totalExpected) * 100) : 0;
                return (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-indigo-600">{a.id}</td>
                    <td className="p-3 font-bold">{a.campaignName}</td>
                    <td className="p-3">{a.targetDepartment}</td>
                    <td className="p-3">{a.auditorName}</td>
                    <td className="p-3 text-center font-mono">{a.totalExpected} / {verified}</td>
                    <td className="p-3 text-center font-bold text-indigo-600">{rate}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {activeReport === 'disposal' && filteredDisposals.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-rose-600">{d.id}</td>
                  <td className="p-3 font-bold">{d.assetName} ({d.assetTag})</td>
                  <td className="p-3">{d.reason}</td>
                  <td className="p-3 font-mono">{d.disposalDate}</td>
                  <td className="p-3">{d.condition}</td>
                  <td className="p-3 font-mono text-indigo-500">{d.certificateNo || 'N/A'}</td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">${(d.saleOrRecycleAmount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
