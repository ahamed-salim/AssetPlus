import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileCheck, 
  DollarSign, 
  Building2, 
  Calendar, 
  User, 
  X, 
  ShieldAlert, 
  ExternalLink,
  Award,
  AlertTriangle
} from 'lucide-react';
import { DisposalRecord, Asset, AssetCondition } from '../types';
import { getDisposals, createDisposal, approveDisposal, rejectDisposal } from '../services/api';

interface DisposalViewProps {
  disposals: DisposalRecord[];
  assets: Asset[];
  onRefresh: () => void;
  onOpenAssetDetail: (asset: Asset) => void;
}

export const DisposalView: React.FC<DisposalViewProps> = ({
  disposals: initialDisposals,
  assets = [],
  onRefresh,
  onOpenAssetDetail
}) => {
  const safeAssets = assets || [];
  const disposals = getDisposals() || [];
  const [activeTabFilter, setActiveTabFilter] = useState<'All' | 'Disposed' | 'Pending' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // New Disposal Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [reason, setReason] = useState<DisposalRecord['reason']>('Beyond Economical Repair');
  const [disposalDate, setDisposalDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState<AssetCondition>('Decommissioned');
  const [requestedBy, setRequestedBy] = useState('Alex Mercer (Asset Mgr)');
  const [approvedBy, setApprovedBy] = useState('Eleanor Vance (VP Ops)');
  const [residualValue, setResidualValue] = useState<number>(0);
  const [saleOrRecycleAmount, setSaleOrRecycleAmount] = useState<number>(0);
  const [certificateNo, setCertificateNo] = useState(`CERT-EWASTE-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);

  // Non-disposed assets eligible for disposal request
  const eligibleAssets = assets.filter(a => a.status !== 'Disposed');

  // Filter disposals
  const filteredDisposals = disposals.filter(d => {
    const status = d.approvalStatus || d.status || 'Disposed';
    if (activeTabFilter !== 'All' && status !== activeTabFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.assetName.toLowerCase().includes(q);
      const matchTag = d.assetTag.toLowerCase().includes(q);
      const matchReq = (d.requestedBy || '').toLowerCase().includes(q);
      const matchCert = (d.certificateNo || '').toLowerCase().includes(q);
      if (!matchName && !matchTag && !matchReq && !matchCert) return false;
    }
    return true;
  });

  // Calculate totals
  const totalDisposed = disposals.filter(d => (d.approvalStatus || d.status) === 'Disposed').length;
  const pendingApprovals = disposals.filter(d => (d.approvalStatus || d.status) === 'Pending').length;
  const totalRealizedValue = disposals
    .filter(d => (d.approvalStatus || d.status) === 'Disposed')
    .reduce((acc, curr) => acc + (curr.saleOrRecycleAmount || 0), 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === selectedAssetId);
    if (!asset) {
      alert('Please select an asset to dispose.');
      return;
    }

    createDisposal({
      assetId: asset.id,
      assetName: asset.name,
      assetTag: asset.tag,
      reason,
      disposalDate,
      condition,
      requestedBy,
      approvedBy,
      residualValue: Number(residualValue) || 0,
      saleOrRecycleAmount: Number(saleOrRecycleAmount) || 0,
      certificateNo,
      notes,
      autoApprove
    });

    setIsModalOpen(false);
    onRefresh();

    // Reset form
    setSelectedAssetId('');
    setNotes('');
  };

  const handleApprove = (id: string) => {
    approveDisposal(id, approvedBy || 'Management');
    onRefresh();
  };

  const handleReject = (id: string) => {
    rejectDisposal(id, 'Disposal request declined after asset review.');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest font-mono">
              END-OF-LIFECYCLE MANAGEMENT
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
              E-Waste & Write-off Governance
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Asset Disposal & Decommissioning
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Record asset write-offs, obsolescence, recycling, and damage disposals. Disposed assets permanently remain in system history for audit compliance and cannot be assigned or transferred.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record Asset Disposal</span>
        </button>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Disposed & Written Off
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {totalDisposed} Assets
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Archived in repository history</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600">
            <Trash2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Approval Requests
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {pendingApprovals}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting management sign-off</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Realized Salvage / Recycle Value
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ${totalRealizedValue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Recovered from e-waste & sales</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['All', 'Disposed', 'Pending', 'Rejected'] as const).map(tab => {
            const isActive = activeTabFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTabFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab === 'Disposed' ? 'Disposed & Written Off' : tab}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search disposals or certificate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Disposals List / Table */}
      <div className="space-y-3">
        {filteredDisposals.map((record) => {
          const status = record.approvalStatus || record.status || 'Disposed';
          const matchedAsset = assets.find(a => a.id === record.assetId);

          return (
            <div
              key={record.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Asset & Disposal Info */}
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900">
                    {record.id}
                  </span>

                  <h3 
                    onClick={() => matchedAsset && onOpenAssetDetail(matchedAsset)}
                    className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-rose-600 cursor-pointer"
                  >
                    {record.assetName}
                  </h3>

                  <span className="font-mono text-xs text-slate-500">
                    ({record.assetTag})
                  </span>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    status === 'Disposed' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    ● {status === 'Disposed' ? 'Disposed & Written Off' : status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span>Reason: <strong className="text-slate-800 dark:text-slate-200">{record.reason}</strong></span>
                  <span>•</span>
                  <span>Date: <strong className="font-mono">{record.disposalDate}</strong></span>
                  <span>•</span>
                  <span>Condition: <strong>{record.condition}</strong></span>
                </div>

                {record.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{record.notes}"
                  </p>
                )}

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Requested by: <strong>{record.requestedBy}</strong></span>
                  {record.approvedBy && (
                    <span>• Approved by: <strong>{record.approvedBy}</strong></span>
                  )}
                  {record.certificateNo && (
                    <span>• Cert: <strong className="font-mono text-indigo-500">{record.certificateNo}</strong></span>
                  )}
                </div>
              </div>

              {/* Realized Value & Actions */}
              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Salvage / Sale Realized</span>
                  <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ${(record.saleOrRecycleAmount || 0).toLocaleString()}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  {status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(record.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Approve & Dispose
                      </button>
                      <button
                        onClick={() => handleReject(record.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 text-slate-700 dark:text-slate-300 hover:text-rose-700 font-bold text-xs cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {matchedAsset && (
                    <button
                      onClick={() => onOpenAssetDetail(matchedAsset)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>View History</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredDisposals.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
            <Trash2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No disposal records found</h4>
            <p className="text-xs text-slate-400">Record a new disposal or change search filters.</p>
          </div>
        )}
      </div>

      {/* RECORD DISPOSAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-50 dark:bg-rose-950/40">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Record Asset Disposal & Write-Off</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Asset to Dispose *
                </label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                >
                  <option value="">-- Choose Active Asset ({eligibleAssets.length} available) --</option>
                  {eligibleAssets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.tag} - {a.name} ({a.departmentName} • {a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Disposal Reason *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as DisposalRecord['reason'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Beyond Economical Repair">Beyond Economical Repair</option>
                    <option value="Obsolescence">Obsolescence / End of Life</option>
                    <option value="Lost/Stolen">Lost / Stolen</option>
                    <option value="Decommissioned">Decommissioned</option>
                    <option value="Sold">Sold / Liquidated</option>
                    <option value="Donated">Donated to Charity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Disposal Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={disposalDate}
                    onChange={(e) => setDisposalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asset Condition at Disposal
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as AssetCondition)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Decommissioned">Decommissioned</option>
                    <option value="Needs Repair">Needs Repair / Damaged</option>
                    <option value="Fair">Fair</option>
                    <option value="Good">Good</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    E-Waste Certificate # / Reference
                  </label>
                  <input
                    type="text"
                    value={certificateNo}
                    onChange={(e) => setCertificateNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Residual Book Value ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={residualValue}
                    onChange={(e) => setResidualValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sale / Scrap Amount Realized ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={saleOrRecycleAmount}
                    onChange={(e) => setSaleOrRecycleAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Requested By
                  </label>
                  <input
                    type="text"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Approved By / Approver
                  </label>
                  <input
                    type="text"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Disposal Notes & Technical Justification
                </label>
                <textarea
                  rows={2}
                  placeholder="Reason for write-off, environmental disposal partner details, or condition description..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoApproveCheck"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <label htmlFor="autoApproveCheck" className="text-xs text-slate-800 dark:text-slate-200 font-bold cursor-pointer">
                  Approve & Write Off Immediately (Asset status will change to 'Disposed')
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Confirm Asset Disposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
