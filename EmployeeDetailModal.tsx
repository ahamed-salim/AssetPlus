import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';
import { Employee, Asset, AssignmentTransfer, ComplaintTicket } from '../types';
import { getStatusBadge, getConditionBadge } from '../components/common/Badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Laptop, 
  ArrowLeftRight, 
  TicketCheck, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  transfers: AssignmentTransfer[];
  complaints: ComplaintTicket[];
  onOpenAssetDetail: (asset: Asset) => void;
  onOpenTransferModal: (asset: Asset) => void;
  onOpenEditEmployee: (employee: Employee) => void;
  onOpenDeleteEmployee: (employee: Employee) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  isOpen,
  onClose,
  assets,
  transfers,
  complaints,
  onOpenAssetDetail,
  onOpenTransferModal,
  onOpenEditEmployee,
  onOpenDeleteEmployee,
}) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'history' | 'tickets' | 'profile'>('assets');

  if (!employee || !isOpen) return null;

  // Filter employee assets
  const assignedAssets = assets.filter(
    (a) => a.assignedEmployeeName === employee.name || a.assignedEmployeeId === employee.id
  );

  const totalAssetValuation = assignedAssets.reduce((sum, a) => sum + (a.currentValue || 0), 0);

  // Filter transfer logs
  const employeeTransfers = transfers.filter(
    (t) => t.fromEmployee === employee.name || t.toEmployee === employee.name
  );

  // Filter tickets
  const employeeTickets = complaints.filter(
    (c) => c.raisedBy === employee.name || c.department === employee.departmentName
  );

  const getStatusBadgeColor = (status: Employee['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'On Leave':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Terminated':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Employee Profile — ${employee.name}`}
      subtitle={`${employee.role} • ${employee.departmentName}`}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Profile Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 z-10">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">{employee.name}</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  {employee.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadgeColor(employee.status)}`}>
                  {employee.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{employee.role}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  {employee.departmentName}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {employee.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10 self-end sm:self-auto">
            <button
              onClick={() => onOpenEditEmployee(employee)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenDeleteEmployee(employee)}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
              title="Delete Employee"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Assigned Assets
            </span>
            <span className="text-base font-bold text-blue-600 dark:text-blue-400">
              {assignedAssets.length} Items
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Equipment Value
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              ${totalAssetValuation.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Transfer Logs
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">
              {employeeTransfers.length} Events
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Support Tickets
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">
              {employeeTickets.length} Filed
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('assets')}
            className={`pb-2.5 px-3 font-bold border-b-2 text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'assets'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Assigned Assets ({assignedAssets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 font-bold border-b-2 text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transfer History ({employeeTransfers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-2.5 px-3 font-bold border-b-2 text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'tickets'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <TicketCheck className="w-4 h-4" />
            <span>Support Tickets ({employeeTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 font-bold border-b-2 text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Contact & Details</span>
          </button>
        </div>

        {/* Tab 1: Assigned Assets */}
        {activeTab === 'assets' && (
          <div className="space-y-3">
            {assignedAssets.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {assignedAssets.map((asset) => (
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
                        <span>{asset.brand} {asset.model}</span>
                        <span>•</span>
                        <span>SN: {asset.serialNumber}</span>
                        <span>•</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">${asset.currentValue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(asset.status)}
                      {getConditionBadge(asset.condition)}
                      <button
                        onClick={() => onOpenAssetDetail(asset)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View Asset Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenTransferModal(asset)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Transfer / Check-in"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <Laptop className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-slate-600 dark:text-slate-300 font-semibold">No equipment currently assigned to {employee.name}.</p>
                <p className="text-slate-400 text-[11px]">You can assign available assets using the Equipment Transfer / Checkout tool.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Transfer History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {employeeTransfers.length > 0 ? (
              <div className="space-y-2">
                {employeeTransfers.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{t.id}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{t.type}</span>
                        <span className="font-mono text-slate-500">[{t.assetTag}] {t.assetName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        From: <strong className="text-slate-700 dark:text-slate-300">{t.fromEmployee || 'IT Pool'}</strong> → To: <strong className="text-slate-700 dark:text-slate-300">{t.toEmployee || 'IT Pool'}</strong>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.reason}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 block">{t.requestedDate}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.status === 'Approved' || t.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 font-medium">No transfer or checkout history found for this employee.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Tickets */}
        {activeTab === 'tickets' && (
          <div className="space-y-3">
            {employeeTickets.length > 0 ? (
              <div className="space-y-2">
                {employeeTickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{ticket.id}</span>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{ticket.title}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ticket.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">{ticket.description}</p>
                    {ticket.resolutionNotes && (
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 border border-slate-100 dark:border-slate-800">
                        <strong>Resolution:</strong> {ticket.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 font-medium">No open or historical support tickets for this employee.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile & Contact Details */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs border-b pb-1.5 border-slate-100 dark:border-slate-800">
                Contact Information
              </h4>
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Email Address</span>
                    <strong className="text-slate-900 dark:text-slate-100">{employee.email}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Phone Number</span>
                    <strong className="text-slate-900 dark:text-slate-100">{employee.phone}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Office Desk Location</span>
                    <strong className="text-slate-900 dark:text-slate-100">{employee.location}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs border-b pb-1.5 border-slate-100 dark:border-slate-800">
                Employment Metadata
              </h4>
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Department</span>
                    <strong className="text-slate-900 dark:text-slate-100">{employee.departmentName}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Job Title / Role</span>
                    <strong className="text-slate-900 dark:text-slate-100">{employee.role}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Employment Status</span>
                    <strong className="text-slate-900 dark:text-slate-100">{employee.status}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
          >
            Close Profile
          </button>
        </div>
      </div>
    </Modal>
  );
};
