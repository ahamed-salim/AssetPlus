import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Building2, 
  MapPin, 
  User, 
  QrCode, 
  FileText, 
  ChevronRight, 
  X, 
  Calendar,
  Check,
  Edit3
} from 'lucide-react';
import { AssetAudit, AuditItem, Asset, Department } from '../types';
import { 
  getAudits, 
  createAudit, 
  verifyAuditItem, 
  completeAuditCampaign, 
  scanAssetInAudit 
} from '../services/api';

interface AuditViewProps {
  audits: AssetAudit[];
  assets: Asset[];
  departments: Department[];
  onRefresh: () => void;
  onOpenAssetDetail: (asset: Asset) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({
  audits: initialAudits,
  assets = [],
  departments = [],
  onRefresh,
  onOpenAssetDetail
}) => {
  const audits = getAudits() || [];
  const safeAssets = assets || [];
  const safeDepartments = departments || [];
  const [selectedAuditId, setSelectedAuditId] = useState<string>(audits[0]?.id || '');
  const activeAudit = audits.find(a => a.id === selectedAuditId) || audits[0];

  // Filters
  const [itemStatusFilter, setItemStatusFilter] = useState<'All' | 'Found' | 'Missing' | 'Damaged' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [noteEditItem, setNoteEditItem] = useState<AuditItem | null>(null);
  const [itemNoteText, setItemNoteText] = useState('');

  // Create Audit Form state
  const [campaignName, setCampaignName] = useState('');
  const [targetDept, setTargetDept] = useState('All Departments');
  const [targetLoc, setTargetLoc] = useState('All Locations');
  const [auditorName, setAuditorName] = useState('Alex Mercer (Lead Auditor)');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [campaignNotes, setCampaignNotes] = useState('');

  // Calculate audit statistics
  const items = activeAudit?.items || [];
  const totalExpected = activeAudit?.totalExpected || items.length || 0;
  const verifiedCount = items.filter(i => i.status !== 'Pending').length;
  const foundCount = items.filter(i => i.status === 'Found').length;
  const missingCount = items.filter(i => i.status === 'Missing').length;
  const damagedCount = items.filter(i => i.status === 'Damaged').length;
  const pendingCount = items.filter(i => i.status === 'Pending').length;
  const completionPercentage = totalExpected > 0 ? Math.round((verifiedCount / totalExpected) * 100) : 0;

  const filteredItems = items.filter(item => {
    if (itemStatusFilter !== 'All' && item.status !== itemStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.assetName.toLowerCase().includes(q);
      const matchTag = item.assetTag.toLowerCase().includes(q);
      const matchLoc = item.expectedLocation.toLowerCase().includes(q);
      const matchEmp = (item.assignedEmployeeName || '').toLowerCase().includes(q);
      if (!matchName && !matchTag && !matchLoc && !matchEmp) return false;
    }
    return true;
  });

  const handleVerify = (assetId: string, status: 'Found' | 'Missing' | 'Damaged', notes?: string) => {
    if (!activeAudit) return;
    verifyAuditItem(activeAudit.id, assetId, status, notes);
    onRefresh();
  };

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAudit || !scanInput.trim()) return;
    const res = scanAssetInAudit(activeAudit.id, scanInput.trim());
    if (res.success) {
      setScanMessage({ type: 'success', text: res.message });
      setScanInput('');
      onRefresh();
    } else {
      setScanMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setScanMessage(null), 4000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createAudit(
      campaignName || `Physical Asset Audit - ${targetDept}`,
      targetDept,
      targetLoc,
      auditorName,
      startDate,
      endDate,
      campaignNotes
    );
    setSelectedAuditId(created.id);
    setIsCreateModalOpen(false);
    onRefresh();

    // Reset form
    setCampaignName('');
    setCampaignNotes('');
  };

  const handleCompleteCampaign = () => {
    if (!activeAudit) return;
    if (window.confirm(`Are you sure you want to finalize and complete audit campaign "${activeAudit.campaignName}"?`)) {
      completeAuditCampaign(activeAudit.id);
      onRefresh();
    }
  };

  const handleSaveNote = () => {
    if (!activeAudit || !noteEditItem) return;
    verifyAuditItem(activeAudit.id, noteEditItem.assetId, noteEditItem.status === 'Pending' ? 'Found' : noteEditItem.status, itemNoteText);
    setNoteEditItem(null);
    setItemNoteText('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
              PHYSICAL INVENTORY & COMPLIANCE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              Automated Audit Engine
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Asset Audit Campaigns & Verification
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Schedule physical inventory audits, select departments and locations, verify physical tags, flag missing/damaged assets, and track campaign completion metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Audit Campaign</span>
          </button>
        </div>
      </div>

      {/* Campaign Selector Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <ClipboardCheck className="w-5 h-5 text-indigo-500 shrink-0" />
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Campaign</label>
            <select
              value={selectedAuditId}
              onChange={(e) => setSelectedAuditId(e.target.value)}
              className="w-full sm:w-80 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {audits.map(a => (
                <option key={a.id} value={a.id}>
                  {a.campaignName} ({a.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeAudit && (
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span className="text-[10px] uppercase block font-semibold text-slate-400">Target Scope</span>
              <strong className="text-slate-800 dark:text-slate-200">{activeAudit.targetDepartment}</strong>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase block font-semibold text-slate-400">Lead Auditor</span>
              <strong className="text-slate-800 dark:text-slate-200">{activeAudit.auditorName}</strong>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            {activeAudit.status === 'In Progress' && (
              <button
                onClick={handleCompleteCampaign}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Finalize Campaign
              </button>
            )}
          </div>
        )}
      </div>

      {/* Campaign Progress Card & 4 KPI Cards */}
      {activeAudit && (
        <div className="space-y-4">
          {/* Main Progress Bar Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {activeAudit.campaignName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Scope: {activeAudit.targetDepartment} • Location: {activeAudit.targetLocation} • Campaign Period: {activeAudit.startDate} to {activeAudit.endDate}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {completionPercentage}%
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Completion Rate</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex">
              <div 
                style={{ width: `${(foundCount / totalExpected) * 100}%` }} 
                className="bg-emerald-500 h-full transition-all duration-300"
                title={`Found: ${foundCount}`}
              />
              <div 
                style={{ width: `${(missingCount / totalExpected) * 100}%` }} 
                className="bg-rose-500 h-full transition-all duration-300"
                title={`Missing: ${missingCount}`}
              />
              <div 
                style={{ width: `${(damagedCount / totalExpected) * 100}%` }} 
                className="bg-amber-500 h-full transition-all duration-300"
                title={`Damaged: ${damagedCount}`}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>{verifiedCount} of {totalExpected} Assets Verified</span>
              <div className="flex items-center gap-4 text-[11px] font-bold">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Found: {foundCount}
                </span>
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Missing: {missingCount}
                </span>
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Damaged: {damagedCount}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" /> Pending: {pendingCount}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Scan Input & Search Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Quick Barcode / Tag Scan Form */}
            <form onSubmit={handleQuickScan} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Scan QR or enter asset tag (e.g. AP-10291)..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                Scan & Verify
              </button>
            </form>

            {scanMessage && (
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                scanMessage.type === 'success' 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300' 
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300'
              }`}>
                {scanMessage.text}
              </div>
            )}

            {/* Filter Buttons & Search Query */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-1 overflow-x-auto">
                {(['All', 'Found', 'Missing', 'Damaged', 'Pending'] as const).map(status => {
                  const isActive = itemStatusFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setItemStatusFilter(status)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Asset Verification List */}
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const matchedAsset = assets.find(a => a.id === item.assetId);

              return (
                <div
                  key={item.assetId}
                  className={`p-4 rounded-2xl border transition-all bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    item.status === 'Found' ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/10' :
                    item.status === 'Missing' ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/10' :
                    item.status === 'Damaged' ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/10' :
                    'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Left: Asset details */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      item.status === 'Found' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' :
                      item.status === 'Missing' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600' :
                      item.status === 'Damaged' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {item.status === 'Found' && <CheckCircle2 className="w-5 h-5" />}
                      {item.status === 'Missing' && <XCircle className="w-5 h-5" />}
                      {item.status === 'Damaged' && <AlertTriangle className="w-5 h-5" />}
                      {item.status === 'Pending' && <Clock className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 
                          onClick={() => matchedAsset && onOpenAssetDetail(matchedAsset)}
                          className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 cursor-pointer"
                        >
                          {item.assetName}
                        </h4>
                        <span className="font-mono text-[11px] font-bold text-slate-500">
                          ({item.assetTag})
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          item.status === 'Found' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          item.status === 'Missing' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          item.status === 'Damaged' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          ● {item.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Expected Loc: <strong className="text-slate-700 dark:text-slate-300">{item.expectedLocation}</strong></span>
                        <span>•</span>
                        <span>Assigned To: <strong>{item.assignedEmployeeName}</strong></span>
                      </p>

                      {item.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic mt-1 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          Notes: "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Verification Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(item.assetId, 'Found')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        item.status === 'Found'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Found</span>
                    </button>

                    <button
                      onClick={() => handleVerify(item.assetId, 'Missing')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        item.status === 'Missing'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-800'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Missing</span>
                    </button>

                    <button
                      onClick={() => handleVerify(item.assetId, 'Damaged')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        item.status === 'Damaged'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-800'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Damaged</span>
                    </button>

                    <button
                      onClick={() => {
                        setNoteEditItem(item);
                        setItemNoteText(item.notes || '');
                      }}
                      title="Add / Edit Verification Notes"
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                <ClipboardCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No items match status filter</h4>
                <p className="text-[11px] text-slate-400">Try changing status filter or search query.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW AUDIT CAMPAIGN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/40">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Create Asset Audit Campaign</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 2026 IT Hardware Verification"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Department *
                  </label>
                  <select
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="All Departments">All Departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Building A or All Locations"
                    value={targetLoc}
                    onChange={(e) => setTargetLoc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Auditor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Scope & Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe scope, regulatory compliance mandate, or instructions for field auditors..."
                  value={campaignNotes}
                  onChange={(e) => setCampaignNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Launch Audit Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ITEM NOTES MODAL */}
      {noteEditItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Verification Notes: {noteEditItem.assetName}
            </h3>

            <textarea
              rows={3}
              value={itemNoteText}
              onChange={(e) => setItemNoteText(e.target.value)}
              placeholder="e.g. Asset relocated to Desk 402; physical tag slightly worn..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setNoteEditItem(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
