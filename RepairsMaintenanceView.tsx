import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  ShieldAlert, 
  CheckSquare, 
  Square, 
  User, 
  FileText, 
  Activity, 
  ArrowUpRight, 
  Sparkles, 
  RefreshCw,
  Layers,
  Tag,
  Building2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { 
  RepairRecord, 
  PreventiveMaintenance, 
  Asset, 
  Vendor,
  ComplaintTicket 
} from '../types';
import { 
  createRepair, 
  updateRepair, 
  createPM, 
  updatePM, 
  togglePMTask, 
  executePM,
  getComplaints 
} from '../services/api';
import { Badge } from '../components/common/Badge';

interface RepairsMaintenanceViewProps {
  repairs: RepairRecord[];
  pms: PreventiveMaintenance[];
  assets: Asset[];
  vendors: Vendor[];
  onRefresh: () => void;
  onOpenAssetDetail?: (asset: Asset) => void;
}

type TabType = 'repairs' | 'pm_schedules' | 'calendar';

export const RepairsMaintenanceView: React.FC<RepairsMaintenanceViewProps> = ({
  repairs = [],
  pms = [],
  assets = [],
  vendors = [],
  onRefresh,
  onOpenAssetDetail
}) => {
  const safeRepairs = repairs || [];
  const safePMs = pms || [];
  const safeAssets = assets || [];
  const safeVendors = vendors || [];

  const [activeTab, setActiveTab] = useState<TabType>('repairs');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modals state
  const [isNewRepairOpen, setIsNewRepairOpen] = useState(false);
  const [isUpdateRepairOpen, setIsUpdateRepairOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairRecord | null>(null);

  const [isNewPMOpen, setIsNewPMOpen] = useState(false);
  const [isExecutePMOpen, setIsExecutePMOpen] = useState(false);
  const [selectedPM, setSelectedPM] = useState<PreventiveMaintenance | null>(null);

  // New Repair Form State
  const [newRepairAssetId, setNewRepairAssetId] = useState(safeAssets[0]?.id || '');
  const [newRepairTicketId, setNewRepairTicketId] = useState('');
  const [newRepairVendor, setNewRepairVendor] = useState(safeVendors[0]?.name || 'Internal IT Service Lab');
  const [newRepairTech, setNewRepairTech] = useState('Sarah Jenkins');
  const [newRepairPriority, setNewRepairPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newRepairIssue, setNewRepairIssue] = useState('');
  const [newRepairDiagnosis, setNewRepairDiagnosis] = useState('');
  const [newRepairAction, setNewRepairAction] = useState('');
  const [newRepairPartsCost, setNewRepairPartsCost] = useState<number>(0);
  const [newRepairLaborCost, setNewRepairLaborCost] = useState<number>(0);
  const [newRepairStartDate, setNewRepairStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRepairTargetEndDate, setNewRepairTargetEndDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newRepairNotes, setNewRepairNotes] = useState('');

  // Update Repair Form State
  const [updateStatus, setUpdateStatus] = useState<RepairRecord['status']>('In Repair');
  const [updateDiagnosis, setUpdateDiagnosis] = useState('');
  const [updateRepairAction, setUpdateRepairAction] = useState('');
  const [updatePartsCost, setUpdatePartsCost] = useState<number>(0);
  const [updateLaborCost, setUpdateLaborCost] = useState<number>(0);
  const [updateEndDate, setUpdateEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [updateNotes, setUpdateNotes] = useState('');

  // New PM Form State
  const [newPMTitle, setNewPMTitle] = useState('');
  const [newPMAssetId, setNewPMAssetId] = useState('');
  const [newPMCategory, setNewPMCategory] = useState<Asset['category'] | 'All'>('All');
  const [newPMPriority, setNewPMPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newPMFrequency, setNewPMFrequency] = useState<'Monthly' | 'Quarterly' | 'Bi-Annually' | 'Annual'>('Quarterly');
  const [newPMNextDueDate, setNewPMNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPMTech, setNewPMTech] = useState('Sarah Jenkins');
  const [newPMVendor, setNewPMVendor] = useState(safeVendors[0]?.name || 'Internal Maintenance');
  const [newPMChecklistInput, setNewPMChecklistInput] = useState('Inspect cables & connections\nClean dust filters & fans\nRun diagnostic software scan');
  const [newPMEstimatedCost, setNewPMEstimatedCost] = useState<number>(150);
  const [newPMNotes, setNewPMNotes] = useState('');

  // Execute PM Form State
  const [executeTech, setExecuteTech] = useState('Sarah Jenkins');
  const [executeDiagnosis, setExecuteDiagnosis] = useState('');
  const [executeRepairAction, setExecuteRepairAction] = useState('');
  const [executeActualCost, setExecuteActualCost] = useState<number>(0);
  const [executeNotes, setNewExecuteNotes] = useState('');
  const [executeAssetId, setExecuteAssetId] = useState(assets[0]?.id || '');

  // Statistics calculation
  const activeRepairsCount = repairs.filter(r => r.status === 'In Repair' || r.status === 'In Diagnosis' || r.status === 'Parts Awaiting' || r.status === 'Scheduled').length;
  const totalRepairSpend = repairs.reduce((acc, r) => acc + (r.repairCost || 0), 0);
  const upcomingPMCount = pms.filter(p => p.active).length;
  const highRiskRepairsCount = repairs.filter(r => r.recommendation === 'Consider Replacement' || r.recommendation === 'Replace Immediately').length;

  // Filtered lists
  const filteredRepairs = repairs.filter(r => {
    const matchesSearch = 
      r.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.technicianName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || r.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredPMs = pms.filter(p => {
    return p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assignedTech.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handlers
  const handleOpenNewRepair = () => {
    setNewRepairAssetId(assets[0]?.id || '');
    setNewRepairTicketId('');
    setNewRepairVendor(vendors[0]?.name || 'Internal IT Lab');
    setNewRepairTech('Sarah Jenkins');
    setNewRepairPriority('Medium');
    setNewRepairIssue('');
    setNewRepairDiagnosis('');
    setNewRepairAction('');
    setNewRepairPartsCost(0);
    setNewRepairLaborCost(0);
    setNewRepairStartDate(new Date().toISOString().split('T')[0]);
    setNewRepairTargetEndDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setNewRepairNotes('');
    setIsNewRepairOpen(true);
  };

  const handleCreateRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === newRepairAssetId);
    if (!asset) return;

    const totalCost = (Number(newRepairPartsCost) || 0) + (Number(newRepairLaborCost) || 0);
    const score = Math.min(100, Math.round((totalCost / (asset.currentValue || 1)) * 100));
    let rec: 'Repair Recommended' | 'Consider Replacement' | 'Replace Immediately' = 'Repair Recommended';
    if (score > 60) rec = 'Replace Immediately';
    else if (score > 35) rec = 'Consider Replacement';

    createRepair({
      ticketId: newRepairTicketId || undefined,
      assetId: asset.id,
      assetName: asset.name,
      assetTag: asset.tag,
      vendorName: newRepairVendor,
      technicianName: newRepairTech,
      issueDescription: newRepairIssue,
      diagnosis: newRepairDiagnosis,
      repairAction: newRepairAction,
      priority: newRepairPriority,
      repairCost: totalCost,
      partsCost: Number(newRepairPartsCost) || 0,
      laborCost: Number(newRepairLaborCost) || 0,
      downtimeDays: 1,
      repairvsReplaceScore: score,
      recommendation: rec,
      startDate: newRepairStartDate,
      targetEndDate: newRepairTargetEndDate,
      notes: newRepairNotes
    });

    setIsNewRepairOpen(false);
    onRefresh();
  };

  const handleOpenUpdateRepair = (repair: RepairRecord) => {
    setSelectedRepair(repair);
    setUpdateStatus(repair.status);
    setUpdateDiagnosis(repair.diagnosis || '');
    setUpdateRepairAction(repair.repairAction || '');
    setUpdatePartsCost(repair.partsCost || 0);
    setUpdateLaborCost(repair.laborCost || 0);
    setUpdateEndDate(repair.endDate || new Date().toISOString().split('T')[0]);
    setUpdateNotes(repair.notes || '');
    setIsUpdateRepairOpen(true);
  };

  const handleUpdateRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepair) return;

    const totalCost = (Number(updatePartsCost) || 0) + (Number(updateLaborCost) || 0);

    updateRepair(selectedRepair.id, {
      status: updateStatus,
      diagnosis: updateDiagnosis,
      repairAction: updateRepairAction,
      partsCost: Number(updatePartsCost) || 0,
      laborCost: Number(updateLaborCost) || 0,
      repairCost: totalCost > 0 ? totalCost : selectedRepair.repairCost,
      endDate: updateStatus === 'Completed' ? updateEndDate : undefined,
      notes: updateNotes
    });

    setIsUpdateRepairOpen(false);
    setSelectedRepair(null);
    onRefresh();
  };

  const handleCreatePMSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tasks = newPMChecklistInput
      .split('\n')
      .filter(t => t.trim().length > 0)
      .map((t, idx) => ({ id: `task-${Date.now()}-${idx}`, task: t.trim(), completed: false }));

    const targetAsset = assets.find(a => a.id === newPMAssetId);

    createPM({
      title: newPMTitle,
      assetId: targetAsset?.id,
      assetName: targetAsset?.name,
      assetTag: targetAsset?.tag,
      category: newPMCategory,
      priority: newPMPriority,
      frequency: newPMFrequency,
      nextDueDate: newPMNextDueDate,
      assignedTech: newPMTech,
      vendorName: newPMVendor,
      checklist: tasks,
      active: true,
      status: 'Upcoming',
      estimatedCost: Number(newPMEstimatedCost) || 0,
      notes: newPMNotes
    });

    setIsNewPMOpen(false);
    onRefresh();
  };

  const handleOpenExecutePM = (pm: PreventiveMaintenance) => {
    setSelectedPM(pm);
    setExecuteTech(pm.assignedTech || 'Sarah Jenkins');
    setExecuteDiagnosis('');
    setExecuteRepairAction('');
    setExecuteActualCost(pm.estimatedCost || 0);
    setNewExecuteNotes('');
    setExecuteAssetId(pm.assetId || assets[0]?.id || '');
    setIsExecutePMOpen(true);
  };

  const handleExecutePMSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPM) return;

    executePM(
      selectedPM.id,
      executeTech,
      executeNotes || `Diagnosis: ${executeDiagnosis}. Action: ${executeRepairAction}`,
      Number(executeActualCost) || 0,
      executeAssetId
    );

    setIsExecutePMOpen(false);
    setSelectedPM(null);
    onRefresh();
  };

  const handleToggleTaskCheck = (pmId: string, taskId: string) => {
    togglePMTask(pmId, taskId);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Repairs & Preventive Maintenance</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hardware work orders, technician diagnosis, component repair actions, labor/parts costing, and PM schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewPMOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-xs border border-slate-700"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>New PM Schedule</span>
          </button>
          <button
            onClick={handleOpenNewRepair}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Log Repair Work Order</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Workshop Repairs</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 font-mono">{activeRepairsCount}</div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Under Technician Service</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">YTD Repair Cost</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 font-mono">${totalRepairSpend.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Parts & Labor Combined</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">PM Routines Active</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 font-mono">{upcomingPMCount}</div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Automated Maintenance</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Replace Warnings</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 font-mono">{highRiskRepairsCount}</div>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">High Repair vs Value Score</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('repairs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'repairs'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Repairs & Work Orders ({repairs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pm_schedules')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pm_schedules'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Preventive Maintenance ({pms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Maintenance Schedule</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search asset, tech, issue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {activeTab === 'repairs' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="In Repair">In Repair</option>
              <option value="In Diagnosis">In Diagnosis</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Parts Awaiting">Parts Awaiting</option>
              <option value="Completed">Completed</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: REPAIRS WORK ORDERS */}
      {activeTab === 'repairs' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Hardware Work Orders & Repair Records ({filteredRepairs.length})
              </span>
              <span className="text-[10px] text-slate-400">
                Click any work order to update technician diagnosis, repair actions, or cost
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRepairs.length > 0 ? (
                filteredRepairs.map((r) => {
                  const targetAsset = assets.find(a => a.id === r.assetId || a.tag === r.assetTag);
                  return (
                    <div 
                      key={r.id} 
                      className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Wrench className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{r.id}</span>
                              {r.ticketId && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-500">
                                  Linked Ticket: {r.ticketId}
                                </span>
                              )}
                              <Badge
                                variant={
                                  r.status === 'Completed'
                                    ? 'success'
                                    : r.status === 'In Repair'
                                    ? 'purple'
                                    : r.status === 'In Diagnosis'
                                    ? 'info'
                                    : 'warning'
                                }
                              >
                                ● {r.status}
                              </Badge>

                              {r.priority && (
                                <Badge variant={r.priority === 'Critical' ? 'danger' : r.priority === 'High' ? 'warning' : 'info'}>
                                  {r.priority} Priority
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
                              <span>{r.assetName}</span>
                              <span className="text-xs font-mono font-normal text-slate-400">({r.assetTag})</span>
                              {targetAsset && onOpenAssetDetail && (
                                <button
                                  onClick={() => onOpenAssetDetail(targetAsset)}
                                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                                >
                                  View Asset <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-auto">
                          <button
                            onClick={() => handleOpenUpdateRepair(r)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
                          >
                            Update Work Order
                          </button>
                        </div>
                      </div>

                      {/* Details Grid: Issue, Diagnosis, Repair Action */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reported Issue</span>
                          <p className="text-slate-800 dark:text-slate-200 font-semibold">{r.issueDescription}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Technician Diagnosis</span>
                          <p className="text-slate-700 dark:text-slate-300">
                            {r.diagnosis || <em className="text-slate-400">Awaiting detailed diagnostic testing...</em>}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Repair Action & Parts</span>
                          <p className="text-slate-700 dark:text-slate-300">
                            {r.repairAction || <em className="text-slate-400">No repair action recorded yet.</em>}
                          </p>
                        </div>
                      </div>

                      {/* Metadata Footer: Technician, Dates, Cost Breakdown, Repair vs Replace Score */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <strong>Tech:</strong> {r.technicianName} ({r.vendorName})
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <strong>Dates:</strong> {r.startDate} {r.endDate ? `to ${r.endDate}` : `(Target: ${r.targetEndDate || 'Pending'})`}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-slate-900 dark:text-slate-100 font-bold">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                            Total Cost: ${r.repairCost}
                            {(r.partsCost || r.laborCost) && (
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                (Parts: ${r.partsCost || 0} | Labor: ${r.laborCost || 0})
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px]">Repair Score:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.recommendation === 'Replace Immediately' 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                              : r.recommendation === 'Consider Replacement'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {r.recommendation} ({r.repairvsReplaceScore}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Wrench className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold text-sm">No repair work orders found matching filters.</p>
                  <p className="text-xs">Click "Log Repair Work Order" above to record hardware servicing.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PREVENTIVE MAINTENANCE */}
      {activeTab === 'pm_schedules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPMs.map((pm) => (
              <div 
                key={pm.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="purple">{pm.frequency}</Badge>
                        <Badge variant="info">{pm.category}</Badge>
                        {pm.priority && <Badge variant="warning">{pm.priority}</Badge>}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-2">
                        {pm.title}
                      </h3>
                      {pm.assetName && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                          Target Asset: {pm.assetName} ({pm.assetTag})
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenExecutePM(pm)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                    >
                      Perform Routine
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">ASSIGNED TECH</span>
                      <strong className="text-slate-800 dark:text-slate-200">{pm.assignedTech}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">NEXT DUE DATE</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{pm.nextDueDate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">LAST PERFORMED</span>
                      <span className="text-slate-600 dark:text-slate-400 font-mono">{pm.lastPerformedDate || 'Never'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">ESTIMATED COST</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">${pm.estimatedCost || 0}</span>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Routine Maintenance Checklist
                    </span>
                    <div className="space-y-1.5">
                      {pm.checklist.map((task) => (
                        <label
                          key={task.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTaskCheck(pm.id, task.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`text-xs ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                            {task.task}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {pm.notes && (
                  <p className="text-[11px] text-slate-500 italic border-t border-slate-100 dark:border-slate-800 pt-2">
                    Notes: {pm.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR & SCHEDULE */}
      {activeTab === 'calendar' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Integrated Asset Maintenance Calendar & Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Timeline of upcoming preventive checks, active repairs, and historical maintenance events
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[...pms.map(p => ({
              id: p.id,
              type: 'PM' as const,
              title: p.title,
              asset: p.assetName || p.category,
              tech: p.assignedTech,
              date: p.nextDueDate,
              badge: p.frequency,
              cost: p.estimatedCost
            })), ...repairs.map(r => ({
              id: r.id,
              type: 'Repair' as const,
              title: r.issueDescription,
              asset: `${r.assetName} (${r.assetTag})`,
              tech: r.technicianName,
              date: r.startDate,
              badge: r.status,
              cost: r.repairCost
            }))]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((item, idx) => (
              <div 
                key={`${item.id}-${idx}`}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4 text-xs hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg font-mono font-bold text-center w-16 ${
                    item.type === 'PM' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    <span className="block text-[9px] uppercase">{item.type}</span>
                    <span className="text-[11px]">{item.date}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Target: <strong className="text-slate-700 dark:text-slate-300">{item.asset}</strong> • Tech: {item.tech}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={item.type === 'PM' ? 'info' : 'warning'}>{item.badge}</Badge>
                  {item.cost !== undefined && (
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      ${item.cost}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: NEW REPAIR WORK ORDER */}
      {isNewRepairOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                <span>Log New Hardware Repair Work Order</span>
              </h3>
              <button onClick={() => setIsNewRepairOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateRepairSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Asset *</label>
                  <select
                    value={newRepairAssetId}
                    onChange={(e) => setNewRepairAssetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={newRepairPriority}
                    onChange={(e) => setNewRepairPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical (System Halts)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vendor / Repair Center</label>
                  <select
                    value={newRepairVendor}
                    onChange={(e) => setNewRepairVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Internal IT Service Lab">Internal IT Service Lab</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Technician *</label>
                  <input
                    type="text"
                    value={newRepairTech}
                    onChange={(e) => setNewRepairTech(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Display backlight flicker, failed logic board..."
                  value={newRepairIssue}
                  onChange={(e) => setNewRepairIssue(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Technician Diagnosis</label>
                  <textarea
                    placeholder="Root cause findings after hardware disassembly..."
                    value={newRepairDiagnosis}
                    onChange={(e) => setNewRepairDiagnosis(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Planned Repair Action</label>
                  <textarea
                    placeholder="e.g. Replace GPU thermal pads, install new battery module..."
                    value={newRepairAction}
                    onChange={(e) => setNewRepairAction(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parts Cost ($)</label>
                  <input
                    type="number"
                    value={newRepairPartsCost}
                    onChange={(e) => setNewRepairPartsCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Labor Cost ($)</label>
                  <input
                    type="number"
                    value={newRepairLaborCost}
                    onChange={(e) => setNewRepairLaborCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newRepairStartDate}
                    onChange={(e) => setNewRepairStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={newRepairTargetEndDate}
                    onChange={(e) => setNewRepairTargetEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes & Warranties</label>
                <textarea
                  placeholder="Additional technician notes, vendor order numbers, warranty claims..."
                  value={newRepairNotes}
                  onChange={(e) => setNewRepairNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRepairOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Create Repair Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE REPAIR WORK ORDER */}
      {isUpdateRepairOpen && selectedRepair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Update Work Order #{selectedRepair.id}
                </h3>
                <p className="text-[11px] text-slate-500">Asset: {selectedRepair.assetName} ({selectedRepair.assetTag})</p>
              </div>
              <button onClick={() => setIsUpdateRepairOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleUpdateRepairSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Repair Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="In Repair">In Repair (Work in Progress)</option>
                  <option value="In Diagnosis">In Diagnosis (Testing)</option>
                  <option value="Parts Awaiting">Parts Awaiting (Shipment Pending)</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed (Restore Asset to Service)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Technician Diagnosis</label>
                <textarea
                  value={updateDiagnosis}
                  onChange={(e) => setUpdateDiagnosis(e.target.value)}
                  placeholder="Record detailed diagnostic testing result & root cause..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Repair Action Taken</label>
                <textarea
                  value={updateRepairAction}
                  onChange={(e) => setUpdateRepairAction(e.target.value)}
                  placeholder="Describe parts replaced, soldering, firmware reflashing..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parts Cost ($)</label>
                  <input
                    type="number"
                    value={updatePartsCost}
                    onChange={(e) => setUpdatePartsCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Labor Cost ($)</label>
                  <input
                    type="number"
                    value={updateLaborCost}
                    onChange={(e) => setUpdateLaborCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Completion Date</label>
                  <input
                    type="date"
                    value={updateEndDate}
                    onChange={(e) => setUpdateEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Technician Notes</label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUpdateRepairOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Work Order Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NEW PREVENTIVE MAINTENANCE SCHEDULE */}
      {isNewPMOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span>Create Preventive Maintenance Routine</span>
              </h3>
              <button onClick={() => setIsNewPMOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreatePMSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Routine Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Server Room UPS & Rack Cooling Audit..."
                  value={newPMTitle}
                  onChange={(e) => setNewPMTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Category</label>
                  <select
                    value={newPMCategory}
                    onChange={(e) => setNewPMCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="All">All Categories</option>
                    <option value="Laptops & Desktops">Laptops & Desktops</option>
                    <option value="Monitors & Displays">Monitors & Displays</option>
                    <option value="Networking & Servers">Networking & Servers</option>
                    <option value="Mobile & Tablets">Mobile & Tablets</option>
                    <option value="Office Equipment">Office Equipment</option>
                    <option value="Peripherals">Peripherals</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Specific Asset (Optional)</label>
                  <select
                    value={newPMAssetId}
                    onChange={(e) => setNewPMAssetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="">None (Category Wide)</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                  <select
                    value={newPMFrequency}
                    onChange={(e) => setNewPMFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Bi-Annually">Bi-Annually</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={newPMNextDueDate}
                    onChange={(e) => setNewPMNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Est. Cost ($)</label>
                  <input
                    type="number"
                    value={newPMEstimatedCost}
                    onChange={(e) => setNewPMEstimatedCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Tech</label>
                  <input
                    type="text"
                    value={newPMTech}
                    onChange={(e) => setNewPMTech(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vendor / Partner</label>
                  <input
                    type="text"
                    value={newPMVendor}
                    onChange={(e) => setNewPMVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Checklist Items (One per line)</label>
                <textarea
                  value={newPMChecklistInput}
                  onChange={(e) => setNewPMChecklistInput(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPMOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Create PM Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EXECUTE / PERFORM PM */}
      {isExecutePMOpen && selectedPM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Execute Preventive Maintenance Routine
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{selectedPM.title}</p>
              </div>
              <button onClick={() => setIsExecutePMOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleExecutePMSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Asset *</label>
                <select
                  value={executeAssetId}
                  onChange={(e) => setExecuteAssetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Performing Tech</label>
                  <input
                    type="text"
                    value={executeTech}
                    onChange={(e) => setExecuteTech(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Actual Cost ($)</label>
                  <input
                    type="number"
                    value={executeActualCost}
                    onChange={(e) => setExecuteActualCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnosis / Observations</label>
                <textarea
                  placeholder="Record condition of hardware, battery health, thermal paste state..."
                  value={executeDiagnosis}
                  onChange={(e) => setExecuteDiagnosis(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Maintenance Action Taken</label>
                <textarea
                  placeholder="e.g. Cleaned fan dust filters, updated firmware, recalibrated battery..."
                  value={executeRepairAction}
                  onChange={(e) => setExecuteRepairAction(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Completion Notes</label>
                <textarea
                  placeholder="Additional notes..."
                  value={executeNotes}
                  onChange={(e) => setNewExecuteNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-[11px]">
                Submitting will log a <strong>Maintenance</strong> event to the asset's lifecycle timeline and update the next due date for this schedule!
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExecutePMOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Log & Complete PM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
