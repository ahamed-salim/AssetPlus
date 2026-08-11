import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import { Asset, Employee, Department, AssignmentTransfer } from '../types';
import { getAssets, getEmployees, getDepartments, getCurrentUser } from '../services/api';
import { ArrowRight, ArrowLeftRight, User, Building2, MapPin, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface CreateTransferModalProps {
  asset: Asset | null;
  assets?: Asset[];
  employees?: Employee[];
  departments?: Department[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transferData: Omit<AssignmentTransfer, 'id' | 'status'> & { autoApprove?: boolean }) => void;
}

export const CreateTransferModal: React.FC<CreateTransferModalProps> = ({
  asset: initialAsset,
  assets: propAssets,
  employees: propEmployees,
  departments: propDepartments,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const rawAssets = propAssets || getAssets();
  const availableAssets = rawAssets.filter(a => a.status !== 'Disposed');
  const availableEmployees = propEmployees || getEmployees();
  const availableDepartments = propDepartments || getDepartments();

  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [type, setType] = useState<'Checkout' | 'Checkin' | 'Transfer'>('Checkout');
  const [toEmployeeId, setToEmployeeId] = useState<string>('');
  const [toDeptId, setToDeptId] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('');
  const [autoApprove, setAutoApprove] = useState<boolean>(true);

  // Sync state when modal opens or initialAsset changes
  useEffect(() => {
    if (isOpen) {
      const activeAsset = initialAsset || availableAssets[0] || null;
      if (activeAsset) {
        setSelectedAssetId(activeAsset.id);
      }
      if (availableEmployees.length > 0) {
        setToEmployeeId(availableEmployees[0].id);
        setToDeptId(availableEmployees[0].departmentId);
        setToLocation(availableEmployees[0].location || 'Building A - HQ');
      }
      setTransferDate(new Date().toISOString().split('T')[0]);
      setReason('');
      setAutoApprove(true);
    }
  }, [isOpen, initialAsset]);

  if (!isOpen) return null;

  const currentAsset = availableAssets.find((a) => a.id === selectedAssetId) || initialAsset || availableAssets[0];

  const handleEmployeeChange = (empId: string) => {
    setToEmployeeId(empId);
    if (empId === 'IT_POOL') {
      setToLocation('IT Pool Storage Room 101');
      return;
    }
    const emp = availableEmployees.find((e) => e.id === empId);
    if (emp) {
      setToDeptId(emp.departmentId);
      if (emp.location) {
        setToLocation(emp.location);
      }
    }
  };

  const handleDepartmentChange = (deptId: string) => {
    setToDeptId(deptId);
    const dept = availableDepartments.find((d) => d.id === deptId);
    if (dept && dept.location && (!toLocation || toLocation === 'IT Pool Storage Room 101')) {
      setToLocation(dept.location);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAsset || !reason.trim()) return;

    const targetEmp = availableEmployees.find((e) => e.id === toEmployeeId);
    const targetDept = availableDepartments.find((d) => d.id === toDeptId);

    const fromEmpName = currentAsset.assignedEmployeeName || 'IT Pool (Unassigned)';
    const fromDeptName = currentAsset.departmentName || 'IT Operations';
    const fromLoc = currentAsset.location || 'Central IT Depot';

    const toEmpName = type === 'Checkin' ? 'IT Pool (Unassigned)' : targetEmp?.name || 'IT Pool (Unassigned)';
    const toDeptName = type === 'Checkin' ? 'IT Operations & Security' : targetDept?.name || currentAsset.departmentName;
    const finalToLocation = type === 'Checkin' ? 'IT Storage Pool 101' : toLocation || targetEmp?.location || currentAsset.location;

    onSubmit({
      assetId: currentAsset.id,
      assetName: currentAsset.name,
      assetTag: currentAsset.tag,
      type,
      fromEmployee: fromEmpName,
      toEmployee: toEmpName,
      fromDept: fromDeptName,
      toDept: toDeptName,
      fromLocation: fromLoc,
      toLocation: finalToLocation,
      requestedBy: getCurrentUser().name,
      requestedDate: transferDate,
      reason: reason.trim(),
      autoApprove,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asset Assignment & Transfer Management"
      subtitle="Reassign equipment, checkout to employees, or record hardware check-ins with full audit trailing"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Action Type Tabs */}
        <div>
          <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
            Action Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'Checkout', label: 'Checkout to User' },
                { id: 'Transfer', label: 'Transfer Custody' },
                { id: 'Checkin', label: 'Checkin to Pool' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                  type === item.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Asset Selection */}
        <div>
          <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
            Target Asset Equipment
          </label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
          >
            {availableAssets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.tag} — {a.name} ({a.status} • {a.assignedEmployeeName || 'Unassigned'})
              </option>
            ))}
          </select>
        </div>

        {/* Previous vs New Assignment Comparison Card */}
        {currentAsset && (
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Assignment Preview & Delta
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              {/* Previous */}
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase">
                  Previous Assignment
                </span>
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {currentAsset.assignedEmployeeName || 'IT Hardware Pool'}
                </div>
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {currentAsset.departmentName}
                </div>
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentAsset.location}
                </div>
              </div>

              {/* New */}
              <div className="p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                  New Assignment
                </span>
                <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  {type === 'Checkin'
                    ? 'IT Pool (Unassigned)'
                    : availableEmployees.find((e) => e.id === toEmployeeId)?.name || 'IT Pool (Unassigned)'}
                </div>
                <div className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  {type === 'Checkin'
                    ? 'IT Operations & Security'
                    : availableDepartments.find((d) => d.id === toDeptId)?.name || currentAsset.departmentName}
                </div>
                <div className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  {type === 'Checkin' ? 'IT Storage Pool 101' : toLocation || currentAsset.location}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inputs for New Assignment */}
        {type !== 'Checkin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                Target Employee / Custodian
              </label>
              <select
                value={toEmployeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="IT_POOL">Unassigned (IT Pool)</option>
                {availableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.departmentName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                Target Department
              </label>
              <select
                value={toDeptId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              >
                {availableDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
              New Physical Location
            </label>
            <input
              type="text"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              placeholder="e.g. Building B - Desk 204, Remote..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
              Effective Transfer Date
            </label>
            <input
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
            Business Reason & Justification *
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="e.g. Onboarding new senior staff member, hardware refresh policy, cross-department project allocation..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Instant Approval vs Request Mode */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              Execute Action Immediately
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {autoApprove
                ? 'Updates asset status, custodian & location instantly and logs audit event'
                : 'Submits request as "Pending Approval" for manager review'}
            </span>
          </div>
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => setAutoApprove(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Modal Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{autoApprove ? 'Confirm & Execute Transfer' : 'Submit Transfer Request'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
