import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  X, 
  ChevronRight,
  Send,
  ExternalLink
} from 'lucide-react';
import { WarrantyRecord, Asset, Vendor } from '../types';
import { formatDaysRemainingText, calculateWarrantyStatus } from '../utils/warranty';
import { 
  getWarranties, 
  createWarranty, 
  updateWarrantyRecord, 
  renewWarrantyPolicy, 
  claimWarrantyPolicy 
} from '../services/api';

interface WarrantiesViewProps {
  warranties: WarrantyRecord[];
  assets: Asset[];
  vendors: Vendor[];
  onRefresh: () => void;
  onOpenAssetDetail: (asset: Asset) => void;
}

export const WarrantiesView: React.FC<WarrantiesViewProps> = ({
  warranties: initialWarranties,
  assets = [],
  vendors = [],
  onRefresh,
  onOpenAssetDetail,
}) => {
  const safeAssets = assets || [];
  const safeVendors = vendors || [];
  const warranties = getWarranties() || [];

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Expiring Soon' | 'Expired'>('All');
  const [vendorFilter, setVendorFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState<WarrantyRecord | null>(null);
  const [claimTarget, setClaimTarget] = useState<WarrantyRecord | null>(null);

  // Form States for Register
  const [regAssetId, setRegAssetId] = useState<string>(safeAssets[0]?.id || '');
  const [regVendorName, setRegVendorName] = useState<string>(safeVendors[0]?.name || 'Dell Commercial Solutions');
  const [regPolicyNumber, setRegPolicyNumber] = useState<string>('');
  const [regStartDate, setRegStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [regExpiryDate, setRegExpiryDate] = useState<string>(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [regCoverageDetails, setRegCoverageDetails] = useState<string>('');

  // Form States for Renew
  const [renewExpiryDate, setRenewExpiryDate] = useState<string>('');
  const [renewPolicyNumber, setRenewPolicyNumber] = useState<string>('');
  const [renewNotes, setRenewNotes] = useState<string>('');

  // Form States for Claim
  const [claimDescription, setClaimDescription] = useState<string>('');

  // Calculate Statistics
  const totalCount = warranties.length;
  const activeCount = warranties.filter(w => w.status === 'Active').length;
  const expiringSoonCount = warranties.filter(w => w.status === 'Expiring Soon').length;
  const expiredCount = warranties.filter(w => w.status === 'Expired').length;

  const filteredWarranties = warranties.filter(w => {
    if (statusFilter !== 'All' && w.status !== statusFilter) return false;
    if (vendorFilter !== 'All' && w.vendorName !== vendorFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAsset = w.assetName.toLowerCase().includes(q);
      const matchVendor = w.vendorName.toLowerCase().includes(q);
      const matchPolicy = w.policyNumber.toLowerCase().includes(q);
      const matchCoverage = w.coverageDetails.toLowerCase().includes(q);
      if (!matchAsset && !matchVendor && !matchPolicy && !matchCoverage) return false;
    }
    return true;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAsset = assets.find(a => a.id === regAssetId);
    createWarranty({
      assetId: regAssetId,
      assetName: selectedAsset ? selectedAsset.name : 'Enterprise Equipment',
      vendorName: regVendorName,
      policyNumber: regPolicyNumber || `POL-${Date.now().toString().slice(-6)}`,
      startDate: regStartDate,
      expiryDate: regExpiryDate,
      coverageDetails: regCoverageDetails || 'Standard Enterprise Hardware Warranty & Maintenance',
      claimCount: 0
    });
    setIsRegisterModalOpen(false);
    onRefresh();
    // Reset form
    setRegPolicyNumber('');
    setRegCoverageDetails('');
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewTarget) return;
    renewWarrantyPolicy(renewTarget.id, renewExpiryDate, renewTarget.vendorName, renewPolicyNumber, renewNotes);
    setRenewTarget(null);
    onRefresh();
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimTarget) return;
    claimWarrantyPolicy(claimTarget.id, claimDescription);
    setClaimTarget(null);
    setClaimDescription('');
    onRefresh();
  };

  const openRenewModal = (w: WarrantyRecord) => {
    setRenewTarget(w);
    setRenewPolicyNumber(w.policyNumber);
    // Default to +1 year from current expiry or today
    const currExpiry = new Date(w.expiryDate || Date.now());
    if (currExpiry.getTime() < Date.now()) {
      currExpiry.setTime(Date.now());
    }
    currExpiry.setFullYear(currExpiry.getFullYear() + 1);
    setRenewExpiryDate(currExpiry.toISOString().split('T')[0]);
    setRenewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950 text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest font-mono">
              CONTRACT & SLA COMPLIANCE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              Automated Status Engine
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Warranty Management & Vendor SLA Coverage
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Automatically track hardware warranty statuses, monitor expiration dates, file direct vendor claims, and extend coverage terms across all enterprise hardware assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Warranty Policy</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('All')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'All' 
              ? 'bg-slate-900 text-white border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Warranties</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalCount}</span>
            <span className="text-xs text-slate-400">Registered Policies</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('Active')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Active' 
              ? 'bg-slate-900 text-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Warranties</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">Valid Coverage</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('Expiring Soon')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Expiring Soon' 
              ? 'bg-slate-900 text-white border-amber-500 ring-2 ring-amber-500/20 shadow-md' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Expiring Soon</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{expiringSoonCount}</span>
            <span className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">Action Needed (45 Days)</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('Expired')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Expired' 
              ? 'bg-slate-900 text-white border-rose-500 ring-2 ring-rose-500/20 shadow-md' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Expired Warranties</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ShieldX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{expiredCount}</span>
            <span className="text-xs text-rose-600/80 dark:text-rose-400/80 font-medium">Out of Warranty</span>
          </div>
        </div>
      </div>

      {/* Automated Expiration Alert Banner */}
      {(expiringSoonCount > 0 || expiredCount > 0) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border border-amber-500/30 dark:border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Warranty Health Risk Notification</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-extrabold">
                  {expiringSoonCount + expiredCount} Policies Need Attention
                </span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                {expiringSoonCount > 0 && `${expiringSoonCount} warranty policies are expiring within 45 days. `}
                {expiredCount > 0 && `${expiredCount} assets have expired warranties and require extension or contract renewal.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setStatusFilter('Expiring Soon')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
            >
              View Expiring ({expiringSoonCount})
            </button>
            <button
              onClick={() => setStatusFilter('Expired')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
            >
              View Expired ({expiredCount})
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Active', 'Expiring Soon', 'Expired'] as const).map(tab => {
            const count = 
              tab === 'All' ? totalCount :
              tab === 'Active' ? activeCount :
              tab === 'Expiring Soon' ? expiringSoonCount : expiredCount;
            const isActive = statusFilter === tab;

            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Vendor Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search asset, vendor, policy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Vendors</option>
              {vendors.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Warranty List Grid */}
      <div className="space-y-4">
        {filteredWarranties.map((warranty) => {
          const linkedAsset = assets.find(a => a.id === warranty.assetId);
          const daysText = formatDaysRemainingText(warranty.expiryDate);

          return (
            <div 
              key={warranty.id}
              className={`p-5 rounded-2xl border transition-all bg-white dark:bg-slate-900 space-y-4 ${
                warranty.status === 'Expired' 
                  ? 'border-rose-200/80 dark:border-rose-900/40 bg-rose-50/10 dark:bg-rose-950/10' 
                  : warranty.status === 'Expiring Soon'
                  ? 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/10 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header: Asset Name, Status Badge, Days Remaining */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    warranty.status === 'Active' 
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                      : warranty.status === 'Expiring Soon'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  }`}>
                    {warranty.status === 'Active' && <ShieldCheck className="w-5 h-5" />}
                    {warranty.status === 'Expiring Soon' && <ShieldAlert className="w-5 h-5" />}
                    {warranty.status === 'Expired' && <ShieldX className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 
                        onClick={() => linkedAsset && onOpenAssetDetail(linkedAsset)}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1"
                      >
                        <span>{warranty.assetName}</span>
                        {linkedAsset && <ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
                      </h3>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        warranty.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                        warranty.status === 'Expiring Soon' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                        'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}>
                        ● {warranty.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Policy Ref: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{warranty.policyNumber}</span> • Vendor: <strong className="text-slate-800 dark:text-slate-200">{warranty.vendorName}</strong>
                    </p>
                  </div>
                </div>

                {/* Expiry Badge */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 ${
                    daysText.badgeColor === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                    daysText.badgeColor === 'amber' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                    'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{daysText.text}</span>
                  </span>
                </div>
              </div>

              {/* Grid Info: Start Date, Expiry Date, Coverage Details, Claims */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Start Date</span>
                  <div className="font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{warranty.startDate}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Expiry Date</span>
                  <div className="font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{warranty.expiryDate}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 md:col-span-2">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Coverage Terms & SLA</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2">
                    {warranty.coverageDetails}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{warranty.claimCount || 0} Claims Filed</span>
                  <span>•</span>
                  <span>Vendor SLA: Express Replacement</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setClaimTarget(warranty)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-500" />
                    <span>Log Claim</span>
                  </button>

                  <button
                    onClick={() => openRenewModal(warranty)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Renew / Extend Policy</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredWarranties.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
            <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No warranty records match your filter criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms or clearing status filters to view all asset warranty policies.
            </p>
            <button
              onClick={() => { setStatusFilter('All'); setVendorFilter('All'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: REGISTER NEW WARRANTY POLICY */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Register Asset Warranty Policy</h3>
              </div>
              <button 
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Asset *
                </label>
                <select
                  value={regAssetId}
                  onChange={(e) => setRegAssetId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Warranty Vendor *
                  </label>
                  <select
                    value={regVendorName}
                    onChange={(e) => setRegVendorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Policy / Contract #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. APP-ENT-2026-001"
                    value={regPolicyNumber}
                    onChange={(e) => setRegPolicyNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Warranty Start Date *
                  </label>
                  <input
                    type="date"
                    value={regStartDate}
                    onChange={(e) => setRegStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Warranty Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={regExpiryDate}
                    onChange={(e) => setRegExpiryDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Automatic Status Preview */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Calculated Status:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {calculateWarrantyStatus(regExpiryDate)} ({formatDaysRemainingText(regExpiryDate).text})
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Coverage Details & SLA Support Terms
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe coverage, accidental damage protection, technician dispatch SLA..."
                  value={regCoverageDetails}
                  onChange={(e) => setRegCoverageDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                >
                  Save Warranty Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RENEW / EXTEND WARRANTY */}
      {renewTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50 dark:bg-amber-950/40">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Renew / Extend Warranty Coverage</h3>
                  <p className="text-[10px] text-slate-500">{renewTarget.assetName}</p>
                </div>
              </div>
              <button 
                onClick={() => setRenewTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Expiry Date *
                </label>
                <input
                  type="date"
                  value={renewExpiryDate}
                  onChange={(e) => setRenewExpiryDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* Quick Extension Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Add:</span>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setFullYear(d.getFullYear() + 1);
                    setRenewExpiryDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  +1 Year
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setFullYear(d.getFullYear() + 2);
                    setRenewExpiryDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  +2 Years
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setFullYear(d.getFullYear() + 3);
                    setRenewExpiryDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  +3 Years
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Policy / Renewal Reference #
                </label>
                <input
                  type="text"
                  value={renewPolicyNumber}
                  onChange={(e) => setRenewPolicyNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Renewal Notes & Extension PO Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Record PO number, vendor quote, or warranty extension terms..."
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRenewTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LOG WARRANTY CLAIM */}
      {claimTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-blue-50 dark:bg-blue-950/40">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">File Vendor Warranty Claim</h3>
                  <p className="text-[10px] text-slate-500">{claimTarget.assetName} • Policy {claimTarget.policyNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setClaimTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  disabled
                  value={claimTarget.vendorName}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hardware Issue / Failure Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe hardware defect, thermal shutdown, battery failure, or component breakdown..."
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setClaimTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Submit Warranty Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
