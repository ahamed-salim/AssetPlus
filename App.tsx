import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { AssetsView } from './views/AssetsView';
import { EmployeesDepartmentsView } from './views/EmployeesDepartmentsView';
import { TransfersView } from './views/TransfersView';
import { QRScannerView } from './views/QRScannerView';
import { ComplaintsView } from './views/ComplaintsView';
import { RepairsMaintenanceView } from './views/RepairsMaintenanceView';
import { WarrantiesView } from './views/WarrantiesView';
import { AuditView } from './views/AuditView';
import { DisposalView } from './views/DisposalView';
import { ReportsView } from './views/ReportsView';
import { AIAssistantView } from './views/AIAssistantView';
import { ProfileView } from './views/ProfileView';
import { UserManagementView } from './views/UserManagementView';
import { AddAssetModal } from './views/AddAssetModal';
import { EditAssetModal } from './views/EditAssetModal';
import { DeleteAssetModal } from './views/DeleteAssetModal';
import { AssetDetailModal } from './views/AssetDetailModal';
import { CreateTransferModal } from './views/CreateTransferModal';
import { CreateComplaintModal } from './views/CreateComplaintModal';
import { AIAssistantDrawer } from './views/AIAssistantDrawer';
import { CheckCircle2, AlertCircle, X, Activity } from 'lucide-react';
import { 
  getCurrentUser, 
  setCurrentUser as saveCurrentUser, 
  getUsers,
  updateUserRecord,
  createUserRecord,
  deleteUserRecord,
  apiFetchUsers,
  apiUpdateUser,
  apiDeleteUser,
  getAssets, 
  addAsset, 
  updateAsset, 
  deleteAsset,
  getTransfers, 
  createTransfer, 
  updateTransferStatus,
  getComplaints, 
  createComplaint, 
  updateComplaintStatus,
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getRepairs,
  getPMs,
  getWarranties,
  getVendors,
  getAudits,
  getDisposals,
  calculateStats,
  getAuthToken,
  setAuthToken,
  apiGetMe,
  apiLogout
} from './services/api';
import { User, Asset, Employee, Department } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getAuthToken());
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Data State
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [viewedUserProfile, setViewedUserProfile] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>(() => getAssets());
  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees());
  const [departments, setDepartments] = useState<Department[]>(() => getDepartments());
  const [transfers, setTransfers] = useState(() => getTransfers());
  const [complaints, setComplaints] = useState(() => getComplaints());
  const [repairs, setRepairs] = useState(() => getRepairs());
  const [pms, setPms] = useState(() => getPMs());
  const [warranties, setWarranties] = useState(() => getWarranties());
  const [audits, setAudits] = useState(() => getAudits());
  const [disposals, setDisposals] = useState(() => getDisposals());
  const [vendors, setVendors] = useState(() => getVendors());
  const [stats, setStats] = useState(() => calculateStats());

  // Modal States
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [detailAsset, setDetailAsset] = useState<Asset | null>(null);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [deleteTargetAsset, setDeleteTargetAsset] = useState<Asset | null>(null);
  const [transferTargetAsset, setTransferTargetAsset] = useState<Asset | null>(null);
  const [complaintTargetAsset, setComplaintTargetAsset] = useState<Asset | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Toast Banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Verify persistent session on startup
  useEffect(() => {
    const checkSession = async () => {
      const verifiedUser = await apiGetMe();
      if (verifiedUser) {
        setCurrentUser(verifiedUser);
        setIsAuthenticated(true);
      } else if (!getAuthToken()) {
        setIsAuthenticated(false);
      }
      setIsVerifyingSession(false);
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      apiFetchUsers().then(fetched => {
        if (fetched && fetched.length > 0) setUsers(fetched);
      });
    }
  }, [isAuthenticated]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const refreshData = () => {
    setUsers(getUsers());
    setAssets(getAssets());
    setEmployees(getEmployees());
    setDepartments(getDepartments());
    setTransfers(getTransfers());
    setComplaints(getComplaints());
    setRepairs(getRepairs());
    setPms(getPMs());
    setWarranties(getWarranties());
    setAudits(getAudits());
    setDisposals(getDisposals());
    setVendors(getVendors());
    setStats(calculateStats());
  };

  // Auth Callbacks
  const handleLoginSuccess = (user: User, token: string) => {
    setAuthToken(token);
    saveCurrentUser(user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    refreshData();
    showToast(`Welcome back, ${user.name}! Authenticated as ${user.role.toUpperCase()}`);
  };

  const handleRegisterSuccess = (user: User, token: string) => {
    setAuthToken(token);
    saveCurrentUser(user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    refreshData();
    showToast(`Account registered successfully. Welcome, ${user.name}!`);
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    
    // Purge auth tokens and local user state
    setAuthToken(null);
    localStorage.removeItem('assetpulse_current_user');
    sessionStorage.clear();
    
    setIsAuthenticated(false);
    setCurrentUser(null as any);
    setViewedUserProfile(null);
    
    // Prevent browser Back button from reopening protected views
    window.history.replaceState(null, '', '/');
    window.history.pushState(null, '', '/');

    showToast('Logged out successfully. Signed out of AssetPulse.', 'info');
  };

  // Loading indicator during session verification
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="p-3.5 rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/30 animate-pulse mb-4">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <p className="text-sm font-bold tracking-tight text-slate-200">Verifying Authenticated Session...</p>
        <p className="text-xs text-slate-500 mt-1 font-mono">AssetPulse Enterprise Gateway</p>
      </div>
    );
  }

  // Render Login/Register View if unauthenticated
  if (!isAuthenticated) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  // User Management Handlers
  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    const res = await apiUpdateUser(id, updates);
    if (!res.success) {
      showToast(res.error || 'Failed to update user account.', 'error');
      return false;
    }
    refreshData();
    const updated = res.user || updateUserRecord(id, updates);
    if (updated) {
      if (currentUser.id === id) {
        setCurrentUser(updated);
        saveCurrentUser(updated);
      }
      if (viewedUserProfile && viewedUserProfile.id === id) {
        setViewedUserProfile(updated);
      }
      showToast(`Updated user profile for ${updated.name}`);
    }
    return true;
  };

  const handleCreateUser = (userData: Omit<User, 'id'>) => {
    const created = createUserRecord(userData);
    refreshData();
    showToast(`Created user account for ${created.name}`);
  };

  const handleDeleteUser = async (id: string) => {
    const res = await apiDeleteUser(id);
    if (!res.success) {
      showToast(res.error || 'Failed to delete user account.', 'error');
      return false;
    }
    deleteUserRecord(id);
    refreshData();
    showToast('User account permanently deleted.', 'info');
    return true;
  };

  // Handlers
  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    saveCurrentUser(newUser);
    showToast(`Switched context to ${newUser.name} (${newUser.role.toUpperCase()})`, 'info');
  };

  const handleAddEmployee = (data: Omit<Employee, 'id' | 'assignedAssetCount'>) => {
    const created = addEmployee(data);
    refreshData();
    showToast(`Registered new employee: ${created.name} (${created.id})`);
  };

  const handleEditEmployee = (id: string, updates: Partial<Employee>) => {
    const updated = updateEmployee(id, updates);
    refreshData();
    if (updated) {
      showToast(`Updated employee record for ${updated.name}`);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    const success = deleteEmployee(id);
    refreshData();
    if (success) {
      showToast('Employee successfully removed from directory.', 'info');
    }
  };

  const handleAddDepartment = (data: Omit<Department, 'id' | 'totalAssets'>) => {
    const created = addDepartment(data);
    refreshData();
    showToast(`Created department: ${created.name} (${created.code})`);
  };

  const handleEditDepartment = (id: string, updates: Partial<Department>) => {
    const updated = updateDepartment(id, updates);
    refreshData();
    if (updated) {
      showToast(`Updated department parameters for ${updated.name}`);
    }
  };

  const handleDeleteDepartment = (id: string) => {
    const success = deleteDepartment(id);
    refreshData();
    if (success) {
      showToast('Department successfully removed from organization structure.', 'info');
    }
  };

  const handleAddAsset = (newAssetData: Omit<Asset, 'id' | 'qrCode' | 'timeline'>) => {
    const created = addAsset(newAssetData);
    refreshData();
    showToast(`Registered new digital asset: ${created.tag} (${created.name})`);
  };

  const handleSaveEditAsset = (id: string, updates: Partial<Asset>) => {
    const updated = updateAsset(id, updates);
    refreshData();
    if (updated) {
      showToast(`Updated asset parameters for ${updated.tag}`);
    }
  };

  const handleConfirmDeleteAsset = (id: string) => {
    const success = deleteAsset(id);
    refreshData();
    if (success) {
      showToast('Asset successfully removed from digital repository.', 'info');
    }
  };

  const handleCreateTransfer = (data: Parameters<typeof createTransfer>[0]) => {
    const record = createTransfer(data);
    refreshData();
    showToast(`Transfer request ${record.id} created for ${data.assetTag}`);
  };

  const handleCreateComplaint = (data: Parameters<typeof createComplaint>[0]) => {
    const ticket = createComplaint(data);
    refreshData();
    showToast(`Support complaint ticket ${ticket.id} filed successfully.`);
  };

  const handleApproveTransfer = (transferId: string) => {
    updateTransferStatus(transferId, 'Approved');
    refreshData();
    showToast(`Transfer ${transferId} approved and assigned.`, 'success');
  };

  const handleResolveComplaint = (ticketId: string) => {
    updateComplaintStatus(ticketId, 'Resolved', currentUser.name, 'Resolved via AssetPulse Operations Panel');
    refreshData();
    showToast(`Ticket ${ticketId} marked as resolved.`, 'success');
  };

  return (
    <div className={`min-h-screen flex bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white transition-colors`}>
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border bg-slate-900 text-white border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'ai_assistant') {
            setIsAIAssistantOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        currentUser={currentUser}
        pendingTransfersCount={stats.pendingTransfers}
        openTicketsCount={stats.openComplaints}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Sticky Header */}
        <Header
          currentUser={currentUser}
          onUserChange={handleUserChange}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
          onSearchChange={(term) => {
            if (activeTab !== 'assets') {
              setActiveTab('assets');
            }
          }}
          onNavigateToProfile={() => {
            setViewedUserProfile(currentUser);
            setActiveTab('profile');
          }}
          onLogout={handleLogout}
        />

        {/* View Workspace Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              viewedUser={viewedUserProfile || currentUser}
              users={users}
              assets={assets}
              transfers={transfers}
              complaints={complaints}
              departments={departments}
              onUpdateUser={handleUpdateUser}
              onOpenAssetDetail={(a) => setDetailAsset(a)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementView
              currentUser={currentUser}
              users={users}
              departments={departments}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onViewProfile={(u) => {
                setViewedUserProfile(u);
                setActiveTab('profile');
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              assets={assets}
              complaints={complaints}
              transfers={transfers}
              onSelectTab={(tab) => setActiveTab(tab)}
              onOpenAddAssetModal={() => setIsAddAssetOpen(true)}
            />
          )}

          {activeTab === 'assets' && (
            <AssetsView
              assets={assets}
              onOpenAddModal={() => setIsAddAssetOpen(true)}
              onOpenDetailModal={(a) => setDetailAsset(a)}
              onOpenEditModal={(a) => setEditAsset(a)}
              onOpenDeleteModal={(a) => setDeleteTargetAsset(a)}
              onOpenTransferModal={(a) => setTransferTargetAsset(a)}
              onOpenComplaintModal={(a) => setComplaintTargetAsset(a)}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesDepartmentsView
              assets={assets}
              employees={employees}
              departments={departments}
              transfers={transfers}
              complaints={complaints}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onAddDepartment={handleAddDepartment}
              onEditDepartment={handleEditDepartment}
              onDeleteDepartment={handleDeleteDepartment}
              onOpenAssetDetail={(a) => setDetailAsset(a)}
              onOpenTransferModal={(a) => setTransferTargetAsset(a)}
            />
          )}

          {activeTab === 'transfers' && (
            <TransfersView
              transfers={transfers}
              assets={assets}
              employees={employees}
              departments={departments}
              onRefresh={refreshData}
              onApproveTransfer={handleApproveTransfer}
              onOpenNewTransfer={() => setTransferTargetAsset(assets[0] || null)}
            />
          )}

          {activeTab === 'qr_scanner' && (
            <QRScannerView
              assets={assets}
              onSelectAsset={(a) => setDetailAsset(a)}
            />
          )}

          {activeTab === 'complaints' && (
            <ComplaintsView
              tickets={complaints}
              assets={assets}
              vendors={vendors}
              onRefresh={refreshData}
              onResolveTicket={handleResolveComplaint}
              onOpenNewTicket={() => setComplaintTargetAsset(assets[0] || null)}
              onOpenAssetDetail={(a) => setDetailAsset(a)}
            />
          )}

          {activeTab === 'repairs' && (
            <RepairsMaintenanceView
              repairs={repairs}
              pms={pms}
              assets={assets}
              vendors={vendors}
              onRefresh={refreshData}
              onOpenAssetDetail={(a) => setDetailAsset(a)}
            />
          )}

          {activeTab === 'warranty' && (
            <WarrantiesView
              warranties={warranties}
              assets={assets}
              vendors={vendors}
              onRefresh={refreshData}
              onOpenAssetDetail={(a) => setDetailAsset(a)}
            />
          )}

          {activeTab === 'audit' && (
            <AuditView
              audits={audits}
              assets={assets}
              departments={departments}
              onRefresh={refreshData}
              onOpenAssetDetail={(a) => setDetailAsset(a)}
            />
          )}

          {activeTab === 'disposal' && (
            <DisposalView
              disposals={disposals}
              assets={assets}
              onRefresh={refreshData}
              onOpenAssetDetail={(a) => setDetailAsset(a)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              assets={assets}
              transfers={transfers}
              repairs={repairs}
              pms={pms}
              warranties={warranties}
              audits={audits}
              disposals={disposals}
              departments={departments}
              employees={employees}
            />
          )}

          {activeTab === 'ai_assistant' && (
            <AIAssistantView
              assets={assets}
              warranties={warranties}
              repairs={repairs}
              employees={employees}
              departments={departments}
              onOpenAssetDetail={(a) => setDetailAsset(a)}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AddAssetModal
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
        onAdd={handleAddAsset}
      />

      <EditAssetModal
        asset={editAsset}
        isOpen={!!editAsset}
        onClose={() => setEditAsset(null)}
        onSave={handleSaveEditAsset}
      />

      <DeleteAssetModal
        asset={deleteTargetAsset}
        isOpen={!!deleteTargetAsset}
        onClose={() => setDeleteTargetAsset(null)}
        onConfirmDelete={handleConfirmDeleteAsset}
      />

      <AssetDetailModal
        asset={detailAsset}
        isOpen={!!detailAsset}
        onClose={() => setDetailAsset(null)}
        onOpenTransfer={(a) => setTransferTargetAsset(a)}
        onOpenComplaint={(a) => setComplaintTargetAsset(a)}
        onOpenEdit={(a) => setEditAsset(a)}
      />

      <CreateTransferModal
        asset={transferTargetAsset}
        assets={assets}
        employees={employees}
        departments={departments}
        isOpen={!!transferTargetAsset}
        onClose={() => setTransferTargetAsset(null)}
        onSubmit={handleCreateTransfer}
      />

      <CreateComplaintModal
        asset={complaintTargetAsset}
        isOpen={!!complaintTargetAsset}
        onClose={() => setComplaintTargetAsset(null)}
        onSubmit={handleCreateComplaint}
      />

      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        assets={assets}
        warranties={warranties}
        repairs={repairs}
        employees={employees}
        departments={departments}
        onOpenAssetDetail={(a) => setDetailAsset(a)}
      />
    </div>
  );
}
