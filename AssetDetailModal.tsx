import React, { useState } from 'react';
import { 
  Box, 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  FileText, 
  History,
  Tag,
  Cpu,
  Layers,
  ArrowLeftRight,
  Wrench,
  CheckCircle2,
  AlertCircle,
  TicketCheck,
  ClipboardCheck,
  Building2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { QRCodeView } from '../components/common/QRCodeView';
import { Badge, getStatusBadge, getConditionBadge } from '../components/common/Badge';
import { Asset } from '../types';
import { 
  getTransfers, 
  getRepairs, 
  getPMs, 
  getWarranties, 
  getComplaints, 
  getAudits,
  togglePMTask 
} from '../services/api';
import { calculateWarrantyStatus, formatDaysRemainingText } from '../utils/warranty';

interface AssetDetailModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTransfer?: (asset: Asset) => void;
  onOpenComplaint?: (asset: Asset) => void;
  onOpenEdit?: (asset: Asset) => void;
}

type TabType = 
  | 'overview' 
  | 'assignment' 
  | 'transfers' 
  | 'repairs' 
  | 'maintenance' 
  | 'warranty' 
  | 'complaints' 
  | 'audit' 
  | 'lifecycle';

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  isOpen,
  onClose,
  onOpenTransfer,
  onOpenComplaint,
  onOpenEdit,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [pmList, setPmList] = useState(() => getPMs());

  if (!asset) return null;

  // Linked records
  const transfers = getTransfers().filter(t => t.assetId === asset.id || t.assetTag === asset.tag);
  const repairs = getRepairs().filter(r => r.assetId === asset.id || r.assetTag === asset.tag);
  const complaints = getComplaints().filter(c => c.assetId === asset.id || c.assetTag === asset.tag);
  const warranties = getWarranties().filter(w => w.assetId === asset.id || w.assetName === asset.name);
  const audits = getAudits();
  
  // Find PMs matching this category or All
  const matchingPMs = pmList.filter(p => p.category === asset.category || p.category === 'All');

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'assignment', label: 'Assignment' },
    { id: 'transfers', label: 'Transfers', count: transfers.length },
    { id: 'repairs', label: 'Repairs', count: repairs.length },
    { id: 'maintenance', label: 'Maintenance', count: matchingPMs.length },
    { id: 'warranty', label: 'Warranty', count: warranties.length },
    { id: 'complaints', label: 'Complaints', count: complaints.length },
    { id: 'audit', label: 'Audit History' },
    { id: 'lifecycle', label: 'Lifecycle History', count: asset.timeline?.length },
  ];

  const handleToggleTask = (pmId: string, taskId: string) => {
    togglePMTask(pmId, taskId);
    setPmList(getPMs());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${asset.name}`}
      subtitle={`Tag: ${asset.tag} • Serial: ${asset.serialNumber} • Category: ${asset.category}`}
      maxWidth="5xl"
    >
      <div className="space-y-5 text-xs">
        {/* Top Banner Overview */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-600 text-white shadow-md">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(asset.status)}
                {getConditionBadge(asset.condition)}
                <span className="text-slate-400 font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded">
                  {asset.id}
                </span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                {asset.brand} {asset.model}
              </h4>
              <p className="text-slate-400 text-[11px]">
                Department: <strong className="text-slate-200">{asset.departmentName}</strong> • Location: {asset.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEdit && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEdit(asset);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Edit Asset
              </button>
            )}
            {onOpenTransfer && asset.status !== 'Disposed' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTransfer(asset);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Transfer / Checkout</span>
              </button>
            )}
            {onOpenComplaint && asset.status !== 'Disposed' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenComplaint(asset);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <TicketCheck className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </button>
            )}
          </div>
        </div>

        {/* Disposed Asset Warning Banner */}
        {asset.status === 'Disposed' && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block text-xs font-bold uppercase tracking-wider">Disposed & Decommissioned Asset</strong>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                This asset has been disposed and written off. It remains permanently archived in system history for compliance and audit trailing. It cannot be assigned, checked out, or transferred.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === tab.id ? 'bg-white text-blue-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left 2 Cols: Financials, Technical Specs, Key Info */}
            <div className="md:col-span-2 space-y-4">
              {/* Financial Valuation & Depreciation */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Financial Valuation & Depreciation Profile
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Purchase Price</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">${asset.purchaseCost.toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{asset.purchaseDate}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
                    <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Current Book Value</span>
                    <span className="text-base font-bold text-emerald-800 dark:text-emerald-300">${asset.currentValue.toLocaleString()}</span>
                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Straight-Line Depreciation</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Lifespan & Salvage</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">{asset.expectedLifespanYears} Yrs</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Salvage: ${asset.salvageValue}</span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  Hardware & System Specifications
                </h5>
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg font-mono text-[11px]">
                  {Object.entries(asset.specifications || {}).map(([key, val]) => (
                    <div key={key} className="flex flex-col border-b border-slate-200/50 dark:border-slate-700/50 pb-1.5">
                      <span className="text-slate-400 text-[10px] font-sans font-semibold uppercase">{key}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {asset.notes && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Operator Notes & Instructions
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                    {asset.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Right Col: QR Code Tag & Quick Summary */}
            <div className="space-y-4">
              <QRCodeView
                value={asset.qrCode}
                assetTag={asset.tag}
                assetName={asset.name}
                size={140}
              />

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Location & Department
                </h5>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <strong className="text-slate-900 dark:text-slate-100">{asset.departmentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <strong className="text-slate-900 dark:text-slate-100">{asset.location}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Serial No:</span>
                    <strong className="font-mono text-slate-900 dark:text-slate-100">{asset.serialNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span>{getStatusBadge(asset.status)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNMENT */}
        {activeTab === 'assignment' && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shrink-0">
                  {asset.assignedEmployeeName ? asset.assignedEmployeeName.charAt(0) : 'U'}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                    Current Custodian
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {asset.assignedEmployeeName || 'Unassigned (In IT Hardware Pool)'}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Department: {asset.departmentName} • Office Location: {asset.location}
                  </p>
                </div>
              </div>

              {onOpenTransfer && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenTransfer(asset);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Reassign / Checkout Equipment</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider">
                Custody & Assignment Rules
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="block text-slate-400 font-semibold text-[10px]">CUSTODY MODEL</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">Named User Checkout</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="block text-slate-400 font-semibold text-[10px]">DEPARTMENT CODE</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{asset.departmentId}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="block text-slate-400 font-semibold text-[10px]">LOCATION DESK</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{asset.location}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRANSFERS */}
        {activeTab === 'transfers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                Assignment & Transfer Logs ({transfers.length})
              </h5>
              {onOpenTransfer && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenTransfer(asset);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs"
                >
                  New Transfer Request
                </button>
              )}
            </div>

            {transfers.length > 0 ? (
              <div className="space-y-2">
                {transfers.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{t.id}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">{t.type}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">{t.status}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-semibold mt-1">
                        From: {t.fromEmployee || t.fromDept || 'N/A'} → To: {t.toEmployee || t.toDept || 'N/A'}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Reason: {t.reason}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono block">{t.requestedDate}</span>
                      <span className="text-[10px] text-slate-500">Requested by: {t.requestedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                No transfer or checkout requests recorded for this asset yet.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REPAIRS */}
        {activeTab === 'repairs' && (
          <div className="space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
              Hardware Repair History & AI Analysis ({repairs.length})
            </h5>

            {repairs.length > 0 ? (
              <div className="space-y-3">
                {repairs.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-500" />
                        <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{r.id}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">{r.status}</span>
                        {r.priority && (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">{r.priority} Priority</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{r.startDate} {r.endDate ? `to ${r.endDate}` : ''}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Reported Issue</span>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold">{r.issueDescription}</p>
                    </div>

                    {(r.diagnosis || r.repairAction) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                        {r.diagnosis && (
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Diagnosis</span>
                            <span className="text-slate-700 dark:text-slate-300">{r.diagnosis}</span>
                          </div>
                        )}
                        {r.repairAction && (
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Repair Action</span>
                            <span className="text-slate-700 dark:text-slate-300">{r.repairAction}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                      <div>
                        <span className="text-slate-400 block">TECHNICIAN / VENDOR</span>
                        <strong className="text-slate-800 dark:text-slate-200">{r.technicianName || 'Sarah Jenkins'} ({r.vendorName})</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">TOTAL REPAIR COST</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-mono">${r.repairCost}</strong>
                        {(r.partsCost || r.laborCost) && (
                          <div className="text-[9px] text-slate-400">Parts: ${r.partsCost || 0} | Labor: ${r.laborCost || 0}</div>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block">DOWNTIME</span>
                        <strong className="text-slate-800 dark:text-slate-200">{r.downtimeDays} Days</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">SCORE / REC</span>
                        <strong className="text-indigo-600 dark:text-indigo-400">{r.recommendation} ({r.repairvsReplaceScore}%)</strong>
                      </div>
                    </div>

                    {r.notes && (
                      <p className="text-[10px] text-slate-500 italic">Notes: {r.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                No repair records logged for this equipment.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MAINTENANCE */}
        {activeTab === 'maintenance' && (
          <div className="space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
              Preventive Maintenance (PM) Routines ({matchingPMs.length})
            </h5>

            {matchingPMs.length > 0 ? (
              <div className="space-y-3">
                {matchingPMs.map((pm) => (
                  <div key={pm.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-slate-900 dark:text-slate-100">{pm.title}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">{pm.frequency}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Next Due: <strong className="text-slate-800 dark:text-slate-200 font-mono">{pm.nextDueDate}</strong></span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interactive PM Checklist</span>
                      {pm.checklist.map((task) => (
                        <label
                          key={task.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(pm.id, task.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`text-xs ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                            {task.task}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                No active preventive maintenance schedules for this asset category.
              </div>
            )}
          </div>
        )}

        {/* TAB 6: WARRANTY */}
        {activeTab === 'warranty' && (() => {
          const autoStatus = calculateWarrantyStatus(asset.warrantyExpiry);
          const daysInfo = formatDaysRemainingText(asset.warrantyExpiry);

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  Vendor Warranty & SLA Coverage
                </h5>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  autoStatus === 'Active' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300' :
                  autoStatus === 'Expiring Soon' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300' :
                  'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                }`}>
                  ● Calculated Status: {autoStatus}
                </span>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                autoStatus === 'Active' 
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' 
                  : autoStatus === 'Expiring Soon'
                  ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                  : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    autoStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                    autoStatus === 'Expiring Soon' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {autoStatus === 'Active' && 'Active Vendor Warranty Protection'}
                      {autoStatus === 'Expiring Soon' && '⚠️ Warranty Expiring Soon - Action Required'}
                      {autoStatus === 'Expired' && '🚨 Warranty Expired - Out of Vendor Support'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      {daysInfo.text} • Vendor: <strong>{asset.warrantyVendor}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{asset.warrantyVendor}</h4>
                    <p className="text-[10px] text-slate-400">Policy Ref: {warranties[0]?.policyNumber || 'APP-ENT-2024-998'}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    SLA: Next Business Day Onsite
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                  {warranties[0]?.coverageDetails || 'Standard Enterprise Hardware Warranty: 24/7 Priority Tech Support, hardware defect replacement & express dispatch.'}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-slate-600 dark:text-slate-400 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">START DATE</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{asset.purchaseDate}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">EXPIRY DATE</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{asset.warrantyExpiry}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">CLAIMS FILED</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{warranties[0]?.claimCount || 0} Claims</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 7: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                Support Complaints & User Tickets ({complaints.length})
              </h5>
              {onOpenComplaint && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenComplaint(asset);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                >
                  Raise Support Ticket
                </button>
              )}
            </div>

            {complaints.length > 0 ? (
              <div className="space-y-2.5">
                {complaints.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{c.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.priority === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.priority} Priority
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                          {c.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{c.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400">{c.description}</p>
                    <p className="text-[10px] text-slate-400">Raised by: {c.raisedBy} ({c.department})</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                No user complaints or tickets logged for this asset.
              </div>
            )}
          </div>
        )}

        {/* TAB 8: AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
              Physical Inventory Audit Campaigns
            </h5>

            {audits.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-slate-900 dark:text-slate-100">{a.campaignName}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">{a.status}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{a.startDate} to {a.endDate}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Target Department: <strong>{a.targetDepartment}</strong></span>
                  <span>Scanned / Expected: <strong>{a.totalScanned} / {a.totalExpected}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 9: LIFECYCLE HISTORY */}
        {activeTab === 'lifecycle' && (
          <div className="space-y-4 pt-2">
            <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-500" />
              Chronological Audit Trail
            </h5>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {asset.timeline?.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{event.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{event.date}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{event.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Recorded by: {event.actor}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
