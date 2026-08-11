import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Box, 
  TicketCheck, 
  ArrowLeftRight, 
  Edit3, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Clock, 
  ExternalLink,
  Lock,
  UserCheck,
  LogOut
} from 'lucide-react';
import { User, Role, Asset, AssignmentTransfer, ComplaintTicket, Department } from '../types';

interface ProfileViewProps {
  currentUser: User;
  viewedUser?: User;
  users: User[];
  assets: Asset[];
  transfers: AssignmentTransfer[];
  complaints: ComplaintTicket[];
  departments: Department[];
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onOpenAssetDetail?: (asset: Asset) => void;
  onNavigateToTab?: (tab: any) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  viewedUser,
  users = [],
  assets = [],
  transfers = [],
  complaints = [],
  departments = [],
  onUpdateUser,
  onOpenAssetDetail,
  onNavigateToTab,
  onLogout
}) => {
  const targetUser = viewedUser || currentUser;
  const isSelf = targetUser.id === currentUser.id;
  const isSuperAdmin = currentUser.role === 'super_admin';

  const safeUsers = users || [];
  const safeAssets = assets || [];
  const safeTransfers = transfers || [];
  const safeComplaints = complaints || [];
  const safeDepartments = departments || [];

  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'activity'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(targetUser.name);
  const [editTitle, setEditTitle] = useState(targetUser.title || '');
  const [editPhone, setEditPhone] = useState(targetUser.phone || '');
  const [editAvatar, setEditAvatar] = useState(targetUser.avatar || '');
  const [editDepartmentId, setEditDepartmentId] = useState(targetUser.departmentId || '');
  const [editRole, setEditRole] = useState<Role>(targetUser.role);
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>(targetUser.status || 'Active');

  const handleOpenEdit = () => {
    setEditName(targetUser.name);
    setEditTitle(targetUser.title || '');
    setEditPhone(targetUser.phone || '');
    setEditAvatar(targetUser.avatar || '');
    setEditDepartmentId(targetUser.departmentId || '');
    setEditRole(targetUser.role);
    setEditStatus(targetUser.status || 'Active');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDept = safeDepartments.find(d => d.id === editDepartmentId);

    const updates: Partial<User> = {
      name: editName.trim(),
      title: editTitle.trim(),
      phone: editPhone.trim(),
      avatar: editAvatar.trim(),
      departmentId: editDepartmentId,
      departmentName: selectedDept ? selectedDept.name : targetUser.departmentName,
    };

    // Role & Status can only be edited by super_admin
    if (isSuperAdmin) {
      updates.role = editRole;
      updates.status = editStatus;
    }

    onUpdateUser(targetUser.id, updates);
    setIsEditModalOpen(false);
  };

  // Filter user's assigned assets
  const userAssets = safeAssets.filter(
    a => a && (a.assignedEmployeeName?.toLowerCase() === targetUser.name.toLowerCase() || a.assignedEmployeeId === targetUser.id)
  );

  // Filter user's transfers
  const userTransfers = safeTransfers.filter(
    t => t && (t.toEmployee?.toLowerCase() === targetUser.name.toLowerCase() || t.fromEmployee?.toLowerCase() === targetUser.name.toLowerCase() || t.requestedBy?.toLowerCase() === targetUser.name.toLowerCase())
  );

  // Filter user's complaints
  const userComplaints = safeComplaints.filter(
    c => c && (c.raisedByEmail?.toLowerCase() === targetUser.email.toLowerCase() || c.raisedBy?.toLowerCase() === targetUser.name.toLowerCase())
  );

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'super_admin':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800"><ShieldCheck className="w-3.5 h-3.5" /> Super Admin</span>;
      case 'asset_manager':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800"><Briefcase className="w-3.5 h-3.5" /> Asset Manager</span>;
      case 'technician':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><Briefcase className="w-3.5 h-3.5" /> Technician</span>;
      case 'employee':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><UserIcon className="w-3.5 h-3.5" /> Employee</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Banner Header */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />
        </div>

        <div className="px-6 pb-6 pt-0 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative group">
              <img
                src={targetUser.avatar}
                alt={targetUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800"
              />
              <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${targetUser.status === 'Inactive' ? 'bg-rose-500' : 'bg-emerald-500'}`} title={`Status: ${targetUser.status || 'Active'}`} />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {targetUser.name}
                </h2>
                {getRoleBadge(targetUser.role)}
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  targetUser.status === 'Inactive' 
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  {targetUser.status || 'Active'}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {targetUser.title || 'Staff Member'} • <span className="text-blue-600 dark:text-blue-400 font-semibold">{targetUser.departmentName}</span>
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                ID: {targetUser.id} • {targetUser.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isSelf ? 'Edit Profile' : 'Edit User Info'}</span>
            </button>

            {isSuperAdmin && onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('users')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                <span>User Directory</span>
              </button>
            )}

            {isSelf && onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all"
                title="Sign Out of Workspace"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Equipment</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{userAssets.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Box className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Support Tickets Filed</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{userComplaints.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <TicketCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Transfer Requests</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{userTransfers.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'overview'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Account Details & Permissions
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'assets'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Assigned Assets ({userAssets.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'activity'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Activity & Tickets ({userComplaints.length + userTransfers.length})
        </button>
      </div>

      {/* Tab 1: Account Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-500" /> Personal & Contact Information
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">User Identifier</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{targetUser.id}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Full Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{targetUser.name}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Corporate Email</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {targetUser.email}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Phone Number</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {targetUser.phone || 'Not provided'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Designation / Title</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{targetUser.title || 'Staff Member'}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Department</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{targetUser.departmentName} ({targetUser.departmentId})</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-500" /> Access Control & Security
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned Role</span>
                <span>{getRoleBadge(targetUser.role)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Account Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {targetUser.status || 'Active'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Authentication Token</span>
                <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                  JWT Bearer Token Active
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[11px] text-slate-800 dark:text-slate-200">
                  <Lock className="w-3.5 h-3.5 text-blue-500" /> Role-Based Access Security
                </p>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Self-editing of account roles or security permissions is strictly prohibited by server-side authorization policies. Contact a Super Administrator to adjust access privileges.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assigned Assets */}
      {activeTab === 'assets' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assets Assigned to {targetUser.name}</h3>

          {userAssets.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <Box className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold">No equipment currently assigned to this user profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onOpenAssetDetail?.(asset)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{asset.tag}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                      {asset.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-blue-500 transition-colors">
                    {asset.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {asset.brand} {asset.model} • S/N: {asset.serialNumber}
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Loc: {asset.location}</span>
                    <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                      View Details <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Activity & Tickets */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Complaints */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TicketCheck className="w-4 h-4 text-amber-500" /> Support Tickets Raised
            </h3>
            {userComplaints.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tickets raised by this user.</p>
            ) : (
              <div className="space-y-2">
                {userComplaints.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{c.title} <span className="font-mono text-slate-400 text-[10px]">({c.id})</span></p>
                      <p className="text-[11px] text-slate-500">Asset: {c.assetName} • Priority: {c.priority}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transfers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-500" /> Asset Assignment & Transfer Logs
            </h3>
            {userTransfers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No assignment or transfer history records found.</p>
            ) : (
              <div className="space-y-2">
                {userTransfers.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t.type}: {t.assetName} <span className="font-mono text-slate-400 text-[10px]">({t.id})</span></p>
                      <p className="text-[11px] text-slate-500">Requested: {t.requestedDate} • Reason: {t.reason}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-500" /> {isSelf ? 'Edit My Profile' : `Edit Profile: ${targetUser.name}`}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={editDepartmentId}
                  onChange={(e) => setEditDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                />
              </div>

              {/* Security Restricted Role & Status Fields */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Role & Account Status
                  </span>
                  {!isSuperAdmin && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Protected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">System Role</label>
                    <select
                      disabled={!isSuperAdmin}
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as Role)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="asset_manager">Asset Manager</option>
                      <option value="technician">Technician</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Account Status</label>
                    <select
                      disabled={!isSuperAdmin}
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as 'Active' | 'Inactive')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {!isSuperAdmin && (
                  <p className="text-[10px] text-slate-400 italic leading-tight">
                    Only Super Administrators are permitted to modify system roles or toggle account activation status.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md active:scale-95"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
