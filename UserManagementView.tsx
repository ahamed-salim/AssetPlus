import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Filter, 
  Briefcase, 
  User as UserIcon, 
  Wrench, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Eye, 
  Building2,
  Lock,
  Mail,
  Phone,
  Activity,
  Clock,
  Shield
} from 'lucide-react';
import { User, Role, Department, ActivityLog } from '../types';
import { apiFetchActivityLogs } from '../services/api';

interface UserManagementViewProps {
  currentUser: User;
  users: User[];
  departments: Department[];
  onCreateUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void | Promise<any>;
  onDeleteUser: (id: string) => void | Promise<any>;
  onViewProfile: (user: User) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  users = [],
  departments = [],
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onViewProfile
}) => {
  const safeUsers = users || [];
  const safeDepartments = departments || [];
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Sub-tabs: 'users' or 'activity_logs'
  const [activeTab, setActiveTab] = useState<'users' | 'activity_logs'>('users');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // Activity logs state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('All');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);

  // Role / Status Confirmation Modal State
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    user: User;
    updates: Partial<User>;
    roleChanged: boolean;
    statusChanged: boolean;
    oldRole: Role;
    newRole: Role;
    oldStatus: string;
    newStatus: string;
  } | null>(null);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('employee');
  const [newTitle, setNewTitle] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState(safeDepartments[0]?.id || 'DEP-001');
  const [newAvatar, setNewAvatar] = useState('');

  // Edit user form state
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editRole, setEditRole] = useState<Role>('employee');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');
  const [editAvatar, setEditAvatar] = useState('');

  // Load activity logs when switching to the activity_logs tab
  useEffect(() => {
    if (activeTab === 'activity_logs') {
      setIsLoadingLogs(true);
      apiFetchActivityLogs()
        .then(logs => setActivityLogs(logs || []))
        .finally(() => setIsLoadingLogs(false));
    }
  }, [activeTab]);

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setEditName(user.name);
    setEditTitle(user.title || '');
    setEditPhone(user.phone || '');
    setEditDepartmentId(user.departmentId || safeDepartments[0]?.id || '');
    setEditRole(user.role);
    setEditStatus(user.status || 'Active');
    setEditAvatar(user.avatar || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    const selectedDept = safeDepartments.find(d => d.id === editDepartmentId);

    const updates: Partial<User> = {
      name: editName.trim(),
      title: editTitle.trim(),
      phone: editPhone.trim(),
      avatar: editAvatar.trim(),
      departmentId: editDepartmentId,
      departmentName: selectedDept ? selectedDept.name : editUser.departmentName,
    };

    if (isSuperAdmin) {
      updates.role = editRole;
      updates.status = editStatus;
    }

    const roleChanged = isSuperAdmin && editRole !== editUser.role;
    const statusChanged = isSuperAdmin && editStatus !== (editUser.status || 'Active');

    // Requirement 9: Require confirmation before changing a user's role or deactivating/activating an account
    if (roleChanged || statusChanged) {
      setPendingConfirmation({
        user: editUser,
        updates,
        roleChanged,
        statusChanged,
        oldRole: editUser.role,
        newRole: editRole,
        oldStatus: editUser.status || 'Active',
        newStatus: editStatus
      });
      return;
    }

    onUpdateUser(editUser.id, updates);
    setEditUser(null);
  };

  const handleConfirmRoleStatusChange = async () => {
    if (!pendingConfirmation) return;
    await onUpdateUser(pendingConfirmation.user.id, pendingConfirmation.updates);
    setPendingConfirmation(null);
    setEditUser(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDept = safeDepartments.find(d => d.id === newDepartmentId);

    onCreateUser({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      title: newTitle.trim() || 'Staff Member',
      phone: newPhone.trim() || '+1 (555) 000-0000',
      departmentId: newDepartmentId,
      departmentName: selectedDept ? selectedDept.name : 'IT Operations & Security',
      avatar: newAvatar.trim() || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: 'Active'
    });

    setIsAddUserModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewTitle('');
    setNewPhone('');
    setNewAvatar('');
  };

  const filteredUsers = safeUsers.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'All' || (u.status || 'Active') === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'super_admin': return <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'asset_manager': return <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'technician': return <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'employee': return <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'asset_manager': return 'Asset Manager';
      case 'technician': return 'Technician';
      case 'employee': return 'Employee';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              User Access & Audit
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage system user accounts, role-based privileges, and review security audit activity logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab Navigation */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Accounts</span>
            </button>
            <button
              onClick={() => setActiveTab('activity_logs')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'activity_logs'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Security Audit Logs</span>
            </button>
          </div>

          {isSuperAdmin && activeTab === 'users' && (
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0 ml-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total System Users</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{safeUsers.length}</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Super Admins</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {safeUsers.filter(u => u.role === 'super_admin').length}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Asset Managers</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {safeUsers.filter(u => u.role === 'asset_manager').length}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Status</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {safeUsers.filter(u => (u.status || 'Active') === 'Active').length}
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, department, title, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="asset_manager">Asset Manager</option>
                <option value="technician">Technician</option>
                <option value="employee">Employee</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">User Profile</th>
                    <th className="px-4 py-3">Role & Privileges</th>
                    <th className="px-4 py-3">Department & Title</th>
                    <th className="px-4 py-3">Contact Info</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-semibold">
                        No user accounts match your search or filter parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {user.name}
                                {user.id === currentUser.id && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-extrabold">You</span>
                                )}
                              </p>
                              <p className="font-mono text-[10px] text-slate-400">{user.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {getRoleIcon(user.role)}
                            <span>{getRoleLabel(user.role)}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{user.title || 'Staff Member'}</p>
                          <p className="text-[10px] text-slate-400">{user.departmentName}</p>
                        </td>

                        <td className="px-4 py-3 space-y-0.5">
                          <p className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                          </p>
                          <p className="text-slate-400 text-[10px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {user.phone || 'N/A'}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            (user.status || 'Active') === 'Inactive'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                          }`}>
                            {user.status || 'Active'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onViewProfile(user)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                              title="View Profile Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                              title="Edit User Info"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {isSuperAdmin && user.id !== currentUser.id && (
                              <button
                                onClick={() => setDeleteTargetUser(user)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Security Audit Activity Logs Tab */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit logs by actor, action, details, entity ID..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={logActionFilter}
              onChange={(e) => setLogActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="REGISTER">REGISTER</option>
              <option value="ROLE_CHANGED">ROLE_CHANGED</option>
              <option value="USER_CREATED">USER_CREATED</option>
              <option value="USER_UPDATED">USER_UPDATED</option>
              <option value="USER_DELETED">USER_DELETED</option>
              <option value="ASSET_CREATED">ASSET_CREATED</option>
              <option value="ASSET_TRANSFERRED">ASSET_TRANSFERRED</option>
              <option value="ASSET_DISPOSED">ASSET_DISPOSED</option>
            </select>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor / User</th>
                    <th className="px-4 py-3">Security Action</th>
                    <th className="px-4 py-3">Entity Type & ID</th>
                    <th className="px-4 py-3">Audit Details</th>
                    <th className="px-4 py-3">IP Address</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoadingLogs ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-semibold">
                        <Activity className="w-6 h-6 animate-spin mx-auto text-purple-500 mb-2" />
                        Loading security audit activity records...
                      </td>
                    </tr>
                  ) : activityLogs.filter(log => {
                      const search = logSearch.toLowerCase();
                      const matches = 
                        log.action.toLowerCase().includes(search) ||
                        (log.userName || '').toLowerCase().includes(search) ||
                        (log.details || '').toLowerCase().includes(search) ||
                        log.entityType.toLowerCase().includes(search) ||
                        log.entityId.toLowerCase().includes(search);
                      const matchesAction = logActionFilter === 'All' || log.action === logActionFilter;
                      return matches && matchesAction;
                    }).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-semibold">
                        No activity records found matching query parameters.
                      </td>
                    </tr>
                  ) : (
                    activityLogs
                      .filter(log => {
                        const search = logSearch.toLowerCase();
                        const matches = 
                          log.action.toLowerCase().includes(search) ||
                          (log.userName || '').toLowerCase().includes(search) ||
                          (log.details || '').toLowerCase().includes(search) ||
                          log.entityType.toLowerCase().includes(search) ||
                          log.entityId.toLowerCase().includes(search);
                        const matchesAction = logActionFilter === 'All' || log.action === logActionFilter;
                        return matches && matchesAction;
                      })
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900 dark:text-white">{log.userName || 'System'}</p>
                            <p className="font-mono text-[10px] text-slate-400">{log.userId || 'N/A'}</p>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] font-mono ${
                              log.action === 'ROLE_CHANGED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                              log.action === 'LOGIN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                              log.action === 'REGISTER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                              log.action === 'USER_DELETED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {log.action}
                            </span>
                          </td>

                          <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-slate-900 dark:text-white">{log.entityType}:</span> {log.entityId}
                          </td>

                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={log.details}>
                            {log.details || 'N/A'}
                          </td>

                          <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                            {log.ipAddress || '127.0.0.1'}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Add New User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-500" /> Create System User Account
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan.hayes@assetpulse.io"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="asset_manager">Asset Manager</option>
                    <option value="technician">Technician</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title / Position</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Network Specialist"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-3847"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={newDepartmentId}
                  onChange={(e) => setNewDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md active:scale-95"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit User */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-500" /> Edit User Account: {editUser.name}
              </h3>
              <button
                onClick={() => setEditUser(null)}
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title / Position</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={editDepartmentId}
                  onChange={(e) => setEditDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">System Role</label>
                  <select
                    disabled={!isSuperAdmin}
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="asset_manager">Asset Manager</option>
                    <option value="technician">Technician</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
                  <select
                    disabled={!isSuperAdmin}
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md active:scale-95"
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role/Status Sensitivity Confirmation Modal */}
      {pendingConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Security Privilege Change</h3>
                <p className="text-xs text-slate-500">Super Admin Security Verification</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                You are modifying security-sensitive account parameters for <strong className="text-slate-900 dark:text-white">{pendingConfirmation.user.name}</strong> ({pendingConfirmation.user.email}):
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 font-mono text-[11px]">
                {pendingConfirmation.roleChanged && (
                  <p className="flex justify-between">
                    <span className="text-slate-400">System Role:</span>
                    <span><strong className="text-rose-500">{pendingConfirmation.oldRole}</strong> &rarr; <strong className="text-emerald-500">{pendingConfirmation.newRole}</strong></span>
                  </p>
                )}
                {pendingConfirmation.statusChanged && (
                  <p className="flex justify-between">
                    <span className="text-slate-400">Account Status:</span>
                    <span><strong className="text-rose-500">{pendingConfirmation.oldStatus}</strong> &rarr; <strong className="text-emerald-500">{pendingConfirmation.newStatus}</strong></span>
                  </p>
                )}
              </div>

              <p className="text-[11px] text-slate-500 italic">
                This security-sensitive action will be permanently recorded in the system audit log.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingConfirmation(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleStatusChange}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Confirm & Apply Privilege Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/80">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete User Account</h3>
                <p className="text-xs text-slate-500">Action requires Super Admin privilege</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete the account for <strong className="text-slate-900 dark:text-white">{deleteTargetUser.name}</strong> ({deleteTargetUser.id})? This will revoke system access privileges.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteUser(deleteTargetUser.id);
                  setDeleteTargetUser(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Permanently Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
