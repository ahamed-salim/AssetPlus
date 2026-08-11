import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';
import { Department, Employee, Asset, AssignmentTransfer } from '../types';
import { getStatusBadge, getConditionBadge } from '../components/common/Badge';
import { 
  Building2, 
  Users, 
  MapPin, 
  Laptop, 
  ArrowLeftRight, 
  Eye, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Mail, 
  Phone,
  PieChart
} from 'lucide-react';

interface DepartmentDetailModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  employees: Employee[];
  transfers: AssignmentTransfer[];
  onOpenAssetDetail: (asset: Asset) => void;
  onOpenEmployeeDetail: (employee: Employee) => void;
  onOpenEditDepartment: (department: Department) => void;
  onOpenDeleteDepartment: (department: Department) => void;
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  department,
  isOpen,
  onClose,
  assets,
  employees,
  transfers,
  onOpenAssetDetail,
  onOpenEmployeeDetail,
  onOpenEditDepartment,
  onOpenDeleteDepartment,
}) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'employees' | 'financials' | 'transfers'>('assets');

  if (!department || !isOpen) return null;

  // Department Assets
  const deptAssets = assets.filter(
    (a) => a.departmentName === department.name || a.departmentId === department.id
  );

  const deptValuation = deptAssets.reduce((sum, a) => sum + (a.currentValue || 0), 0);

  // Department Employees
  const deptEmployees = employees.filter(
    (e) => e.departmentName === department.name || e.departmentId === department.id
  );

  // Department Transfers
  const deptTransfers = transfers.filter(
    (t) => t.fromDept === department.name || t.toDept === department.name
  );

  const budgetUsagePercent = Math.min(Math.round((deptValuation / (department.budgetAllocated || 1)) * 100), 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Department Details — ${department.name}`}
      subtitle={`Code: ${department.code} • Location: ${department.location}`}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Department Banner Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                {department.code}
              </span>
              <h3 className="text-lg font-bold text-white">{department.name}</h3>
            </div>
            <p className="text-xs text-slate-300">
              Department Head: <strong className="text-white font-bold">{department.headName}</strong>
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {department.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                {deptEmployees.length} Staff Members
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onOpenEditDepartment(department)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Edit Department"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenDeleteDepartment(department)}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
              title="Delete Department"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Financials & Equipment Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Hardware Assets
            </span>
            <span className="text-base font-bold text-blue-600 dark:text-blue-400">
              {deptAssets.length} Equipment
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Current Asset Valuation
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              ${deptValuation.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Annual IT Budget
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">
              ${department.budgetAllocated.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Department Personnel
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">
              {deptEmployees.length} Employees
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('assets')}
            className={`pb-2.5 px-3 font-bold border-b-2 text-xs transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'assets'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Allocated Assets ({deptAssets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`pb-2.5 px-3 font-bold border-b-2 text-xs transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'employees'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personnel ({deptEmployees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`pb-2.5 px-3 font-bold border-b-2 text-xs transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'financials'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Budget & Valuation</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`pb-2.5 px-3 font-bold border-b-2 text-xs transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'transfers'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transfer History ({deptTransfers.length})</span>
          </button>
        </div>

        {/* Tab 1: Allocated Assets */}
        {activeTab === 'assets' && (
          <div className="space-y-3">
            {deptAssets.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {deptAssets.map((asset) => (
                  <div key={asset.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{asset.tag}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{asset.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Custodian: <strong className="text-slate-700 dark:text-slate-300">{asset.assignedEmployeeName || 'Unassigned (Dept Pool)'}</strong></span>
                        <span>•</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">${asset.currentValue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(asset.status)}
                      <button
                        onClick={() => onOpenAssetDetail(asset)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View Asset Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 font-medium">No assets currently allocated to this department.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Personnel */}
        {activeTab === 'employees' && (
          <div className="space-y-3">
            {deptEmployees.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {deptEmployees.map((emp) => {
                  const empAssets = assets.filter(a => a.assignedEmployeeName === emp.name);

                  return (
                    <div
                      key={emp.id}
                      onClick={() => onOpenEmployeeDetail(emp)}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{emp.role} • {emp.id}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                          {empAssets.length} Assets
                        </span>
                        <Eye className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 font-medium">No personnel registered in this department yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Budget & Financials */}
        {activeTab === 'financials' && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Asset Valuation vs Allocated Budget</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{budgetUsagePercent}% Utilized</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetUsagePercent > 90 ? 'bg-rose-500' : budgetUsagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetUsagePercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Equipment Valuation</span>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  ${deptValuation.toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Allocated IT Budget</span>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                  ${department.budgetAllocated.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Transfer History */}
        {activeTab === 'transfers' && (
          <div className="space-y-3">
            {deptTransfers.length > 0 ? (
              <div className="space-y-2">
                {deptTransfers.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{t.id}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{t.type}</span>
                        <span className="font-mono text-slate-500">[{t.assetTag}] {t.assetName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        From Dept: <strong className="text-slate-700 dark:text-slate-300">{t.fromDept}</strong> → To Dept: <strong className="text-slate-700 dark:text-slate-300">{t.toDept}</strong>
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 block">{t.requestedDate}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 font-medium">No transfer history associated with this department.</p>
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
};
