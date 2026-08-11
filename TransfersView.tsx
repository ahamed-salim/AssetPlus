import React, { useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  User,
  Box,
  ArrowRight,
  Search,
  Filter,
  MapPin,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';
import { AssignmentTransfer, Asset, Employee, Department } from '../types';
import { createTransfer, updateTransferStatus, getEmployees, getDepartments } from '../services/api';
import { Badge } from '../components/common/Badge';

interface TransfersViewProps {
  transfers: AssignmentTransfer[];
  assets: Asset[];
  employees?: Employee[];
  departments?: Department[];
  onRefresh: () => void;
  onApproveTransfer?: (id: string) => void;
  onOpenNewTransfer?: () => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  transfers = [],
  assets = [],
  employees: propEmployees,
  departments: propDepartments,
  onRefresh,
  onApproveTransfer,
  onOpenNewTransfer
}) => {
  const safeTransfers = transfers || [];
  const safeAssets = assets || [];
  const employees = propEmployees || getEmployees() || [];
  const departments = propDepartments || getDepartments() || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending Approval' | 'Approved' | 'Rejected'>('All');
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [selectedAssetId, setSelectedAssetId] = useState(safeAssets[0]?.id || '');
  const [transferType, setTransferType] = useState<'Checkout' | 'Checkin' | 'Transfer'>('Checkout');
  const [targetEmpId, setTargetEmpId] = useState(employees[0]?.id || '');
  const [targetDeptId, setTargetDeptId] = useState(employees[0]?.departmentId || departments[0]?.id || '');
  const [targetLocation, setTargetLocation] = useState(employees[0]?.location || 'Building A - HQ');
  const [effectiveDate, setEffectiveDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);

  const selectedAsset = safeAssets.find((a) => a.id === selectedAssetId) || safeAssets[0];

  const handleEmpSelect = (empId: string) => {
    setTargetEmpId(empId);
    if (empId === 'IT_POOL') {
      setTargetLocation('IT Pool Storage Room 101');
      return;
    }
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setTargetDeptId(emp.departmentId);
      if (emp.location) setTargetLocation(emp.location);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !reason.trim()) return;

    const emp = employees.find((e) => e.id === targetEmpId);
    const dept = departments.find((d) => d.id === targetDeptId);

    const fromEmp = selectedAsset.assignedEmployeeName || 'IT Pool (Unassigned)';
    const fromDept = selectedAsset.departmentName || 'IT Operations';
    const fromLoc = selectedAsset.location || 'Central IT Depot';

    const toEmp = transferType === 'Checkin' ? 'IT Pool (Unassigned)' : emp?.name || 'IT Pool (Unassigned)';
    const toDept = transferType === 'Checkin' ? 'IT Operations & Security' : dept?.name || selectedAsset.departmentName;
    const finalLoc = transferType === 'Checkin' ? 'IT Storage Pool 101' : targetLocation || selectedAsset.location;

    createTransfer({
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      assetTag: selectedAsset.tag,
      type: transferType,
      fromEmployee: fromEmp,
      toEmployee: toEmp,
      fromDept: fromDept,
      toDept: toDept,
      fromLocation: fromLoc,
      toLocation: finalLoc,
      requestedBy: 'Operations Manager',
      requestedDate: effectiveDate,
      reason: reason.trim(),
      autoApprove
    });

    setShowForm(false);
    setReason('');
    onRefresh();
  };

  const handleApprove = (id: string) => {
    if (onApproveTransfer) {
      onApproveTransfer(id);
    } else {
      updateTransferStatus(id, 'Approved');
      onRefresh();
    }
  };

  const handleReject = (id: string) => {
    updateTransferStatus(id, 'Rejected');
    onRefresh();
  };

  // Filter transfers
  const filteredTransfers = safeTransfers.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.toEmployee || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.fromEmployee || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Approved'
        ? t.status === 'Approved' || t.status === 'Completed'
        : t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = transfers.filter((t) => t.status === 'Pending Approval').length;
  const approvedCount = transfers.filter((t) => t.status === 'Approved' || t.status === 'Completed').length;
  const rejectedCount = transfers.filter((t) => t.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-500" />
            Equipment Assignments & Transfers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Checkout equipment to employees, checkin returned hardware, or approve cross-department transfers
          </p>
        </div>

        <button
          onClick={() => {
            if (onOpenNewTransfer) {
              onOpenNewTransfer();
            } else {
              setShowForm(!showForm);
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Transfer / Assignment Record</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] block">TOTAL TRANSFERS</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{transfers.length}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Recorded in audit log</span>
        </div>
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
          <span className="text-amber-700 dark:text-amber-400 font-semibold uppercase text-[10px] block">PENDING APPROVAL</span>
          <span className="text-2xl font-bold text-amber-900 dark:text-amber-200">{pendingCount}</span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">Awaiting release</span>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold uppercase text-[10px] block">APPROVED & COMPLETED</span>
          <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">{approvedCount}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Asset assigned</span>
        </div>
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs">
          <span className="text-rose-700 dark:text-rose-400 font-semibold uppercase text-[10px] block">REJECTED REQUESTS</span>
          <span className="text-2xl font-bold text-rose-900 dark:text-rose-200">{rejectedCount}</span>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 block mt-0.5">Retained original</span>
        </div>
      </div>

      {/* Inline New Request Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Create Equipment Transfer or Assignment Record</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Action Type</label>
              <select
                value={transferType}
                onChange={(e) => setTransferType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
              >
                <option value="Checkout">Checkout (Assign to Employee)</option>
                <option value="Transfer">Transfer (Reassign Employee / Dept)</option>
                <option value="Checkin">Checkin (Return to Hardware Pool)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Select Equipment</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>{a.tag} — {a.name} ({a.assignedEmployeeName || 'Unassigned'})</option>
                ))}
              </select>
            </div>

            {transferType !== 'Checkin' && (
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Target Employee / Custodian</label>
                <select
                  value={targetEmpId}
                  onChange={(e) => handleEmpSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="IT_POOL">Unassigned (IT Pool)</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.departmentName})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Target Department</label>
              <select
                value={targetDeptId}
                onChange={(e) => setTargetDeptId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">New Physical Location</label>
              <input
                type="text"
                placeholder="e.g. Building B - Desk 204"
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Transfer Date</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Business Justification / Reason *</label>
            <input
              type="text"
              placeholder="e.g. Onboarding new staff member, hardware refresh..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Execute Transfer Immediately</span>
              <span className="text-[11px] text-slate-500">Auto-approves transfer and updates asset status and timeline</span>
            </div>
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-xs"
            >
              Submit Transfer Record
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transfer ID, tag, employee, reason..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {(['All', 'Pending Approval', 'Approved', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Transfer Requests Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Transfer ID</th>
                <th className="py-3.5 px-4">Equipment</th>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Previous Assignment</th>
                <th className="py-3.5 px-4">New Assignment</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {trf.id}
                      <div className="text-[10px] text-slate-400 font-normal">{trf.requestedDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{trf.assetName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{trf.assetTag}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={trf.type === 'Checkout' ? 'info' : trf.type === 'Checkin' ? 'neutral' : 'purple'}>
                        {trf.type}
                      </Badge>
                    </td>
                    {/* Previous Assignment */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {trf.fromEmployee || 'IT Pool'}
                      </div>
                      <div className="text-[10px] text-slate-400">{trf.fromDept || 'IT Operations'}</div>
                      {trf.fromLocation && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{trf.fromLocation}</span>
                        </div>
                      )}
                    </td>
                    {/* New Assignment */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {trf.toEmployee || 'IT Pool'}
                      </div>
                      <div className="text-[10px] text-slate-500">{trf.toDept || 'IT Operations'}</div>
                      {trf.toLocation && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-blue-500" />
                          <span>{trf.toLocation}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 italic text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      "{trf.reason}"
                      <span className="block not-italic text-[10px] text-slate-400 mt-0.5">Req by: {trf.requestedBy}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          trf.status === 'Approved' || trf.status === 'Completed'
                            ? 'success'
                            : trf.status === 'Pending Approval'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        ● {trf.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {trf.status === 'Pending Approval' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(trf.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(trf.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No transfer or assignment records match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
