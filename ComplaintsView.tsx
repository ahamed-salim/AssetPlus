import React, { useState } from 'react';
import { 
  TicketCheck, 
  Plus, 
  AlertTriangle, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Search, 
  Wrench, 
  DollarSign, 
  FileText, 
  User, 
  Calendar,
  ArrowUpRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { ComplaintTicket, Asset, Vendor } from '../types';
import { 
  createComplaint, 
  updateComplaintStatus, 
  updateComplaint, 
  createRepair 
} from '../services/api';
import { Badge } from '../components/common/Badge';

interface ComplaintsViewProps {
  complaints?: ComplaintTicket[];
  tickets?: ComplaintTicket[];
  assets: Asset[];
  vendors?: Vendor[];
  onRefresh: () => void;
  onOpenNewTicket?: () => void;
  onResolveTicket?: (ticketId: string) => void;
  onOpenAssetDetail?: (asset: Asset) => void;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  complaints: complaintsProp,
  tickets: ticketsProp,
  assets = [],
  vendors = [],
  onRefresh,
  onOpenNewTicket,
  onResolveTicket,
  onOpenAssetDetail
}) => {
  const safeAssets = assets || [];
  const safeVendors = vendors || [];
  const complaintsList = complaintsProp || ticketsProp || [];

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // New Complaint Form State
  const [selectedAssetId, setSelectedAssetId] = useState(safeAssets[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [raisedBy, setRaisedBy] = useState('Alex Rivera');

  // Detail / Action Modal State
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);
  const [actionTech, setActionTech] = useState('Sarah Jenkins');
  const [actionStatus, setActionStatus] = useState<ComplaintTicket['status']>('In Progress');
  const [actionDiagnosis, setActionDiagnosis] = useState('');
  const [actionRepairAction, setActionRepairAction] = useState('');
  const [actionCost, setActionCost] = useState<number>(0);
  const [actionNotes, setActionNotes] = useState('');

  // Escalation Modal
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalateVendor, setEscalateVendor] = useState(vendors[0]?.name || 'Internal IT Service Lab');

  const filteredComplaints = complaintsList.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.raisedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Handlers
  const handleSubmitNewComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === selectedAssetId);
    if (!asset) return;

    createComplaint({
      assetId: asset.id,
      assetName: asset.name,
      assetTag: asset.tag,
      raisedBy: raisedBy || 'Alex Rivera',
      raisedByEmail: `${(raisedBy || 'alex').toLowerCase().replace(' ', '.')}@assetpulse.io`,
      department: asset.departmentName,
      title,
      description,
      priority
    });

    setShowForm(false);
    setTitle('');
    setDescription('');
    onRefresh();
  };

  const handleOpenTicketDetails = (ticket: ComplaintTicket) => {
    setSelectedTicket(ticket);
    setActionTech(ticket.assignedTech || 'Sarah Jenkins');
    setActionStatus(ticket.status);
    setActionDiagnosis(ticket.diagnosis || '');
    setActionRepairAction(ticket.repairAction || '');
    setActionCost(ticket.cost || 0);
    setActionNotes(ticket.resolutionNotes || ticket.notes || '');
    setIsEscalating(false);
  };

  const handleSaveTicketAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    updateComplaintStatus(
      selectedTicket.id,
      actionStatus,
      actionTech,
      actionNotes,
      actionDiagnosis,
      actionRepairAction,
      Number(actionCost) || 0
    );

    setSelectedTicket(null);
    onRefresh();
  };

  const handleEscalateToRepair = () => {
    if (!selectedTicket) return;

    const asset = assets.find(a => a.id === selectedTicket.assetId || a.tag === selectedTicket.assetTag);
    if (!asset) return;

    // Create Repair Record directly from Complaint
    createRepair({
      ticketId: selectedTicket.id,
      assetId: asset.id,
      assetName: asset.name,
      assetTag: asset.tag,
      vendorName: escalateVendor,
      technicianName: actionTech || 'Sarah Jenkins',
      issueDescription: `${selectedTicket.title}: ${selectedTicket.description}`,
      diagnosis: actionDiagnosis || 'Escalated from support ticket',
      repairAction: actionRepairAction || 'Full hardware overhaul',
      priority: selectedTicket.priority,
      repairCost: Number(actionCost) || 250,
      partsCost: Number(actionCost) ? Math.round(actionCost * 0.6) : 150,
      laborCost: Number(actionCost) ? Math.round(actionCost * 0.4) : 100,
      downtimeDays: 3,
      repairvsReplaceScore: 25,
      recommendation: 'Repair Recommended',
      startDate: new Date().toISOString().split('T')[0],
      notes: `Escalated from Support Complaint Ticket #${selectedTicket.id}`
    });

    // Update Complaint Status to In Progress / Diagnosis
    updateComplaintStatus(selectedTicket.id, 'In Progress', actionTech, 'Escalated to Workshop Repair Order', actionDiagnosis, actionRepairAction, Number(actionCost) || 250);

    setSelectedTicket(null);
    setIsEscalating(false);
    onRefresh();
  };

  const openTicketsCount = complaintsList.filter(c => c.status === 'Open').length;
  const inProgressCount = complaintsList.filter(c => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Diagnosis').length;
  const resolvedCount = complaintsList.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TicketCheck className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>Complaints & Support Tickets</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Issue reporting, hardware malfunction logs, priority triage, technician assignment, diagnosis & repair actions
          </p>
        </div>

        <button
          onClick={() => {
            if (onOpenNewTicket) onOpenNewTicket();
            setShowForm(!showForm);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Hardware Issue</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unassigned Open Tickets</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">{openTicketsCount}</div>
            <span className="text-[10px] text-slate-400 font-semibold">Requires Technician Assignment</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">In Service & Diagnosis</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">{inProgressCount}</div>
            <span className="text-[10px] text-slate-400 font-semibold">Under Active Inspection</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Resolved & Closed</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{resolvedCount}</div>
            <span className="text-[10px] text-slate-400 font-semibold">Asset Verified Operational</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* New Complaint Form Panel */}
      {showForm && (
        <form onSubmit={handleSubmitNewComplaint} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-xs animate-in fade-in">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TicketCheck className="w-4 h-4 text-rose-600" />
            <span>Raise Hardware Issue Support Ticket</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Target Equipment *</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                required
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical (Halts Work)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Reported By</label>
              <input
                type="text"
                value={raisedBy}
                onChange={(e) => setRaisedBy(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Issue Title *</label>
            <input
              type="text"
              placeholder="e.g. Battery expansion, screen flickering, port malfunction..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Detailed Problem Description *</label>
            <textarea
              placeholder="Describe symptoms, frequency of issue, physical condition or error logs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold"
            >
              Submit Support Ticket
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by ID, issue title, asset, or reported user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Diagnosis">Diagnosis</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Ticket ID & Date</th>
              <th className="py-3.5 px-4">Asset Tag & Name</th>
              <th className="py-3.5 px-4">Issue Summary</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Reported By</th>
              <th className="py-3.5 px-4">Technician</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((ticket) => {
                const targetAsset = assets.find(a => a.id === ticket.assetId || a.tag === ticket.assetTag);
                return (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {ticket.id}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{ticket.assetName}</span>
                        {targetAsset && onOpenAssetDetail && (
                          <button
                            onClick={() => onOpenAssetDetail(targetAsset)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Asset Details"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{ticket.assetTag}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{ticket.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{ticket.description}</div>
                      {ticket.diagnosis && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 truncate font-medium">
                          Diagnosis: {ticket.diagnosis}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={ticket.priority === 'Critical' ? 'danger' : ticket.priority === 'High' ? 'warning' : 'info'}>
                        {ticket.priority}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold">{ticket.raisedBy}</div>
                      <div className="text-[10px] text-slate-400">{ticket.department}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {ticket.assignedTech || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          ticket.status === 'Resolved' || ticket.status === 'Closed'
                            ? 'success'
                            : ticket.status === 'In Progress' || ticket.status === 'Diagnosis'
                            ? 'purple'
                            : 'warning'
                        }
                      >
                        ● {ticket.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenTicketDetails(ticket)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs"
                      >
                        Manage & Diagnose
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No support tickets found matching current search/filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TICKET DETAILS & DIAGNOSIS MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-600">{selectedTicket.id}</span>
                  <Badge variant={selectedTicket.priority === 'Critical' ? 'danger' : 'warning'}>{selectedTicket.priority} Priority</Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedTicket.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Asset: <strong className="text-slate-800 dark:text-slate-200">{selectedTicket.assetName}</strong> ({selectedTicket.assetTag}) • Reported by {selectedTicket.raisedBy}
                </p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Original Problem Statement */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Issue Details</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{selectedTicket.description}</p>
            </div>

            {/* Form for Technician Diagnosis, Repair Action, Cost & Notes */}
            <form onSubmit={handleSaveTicketAction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    value={actionTech}
                    onChange={(e) => setActionTech(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ticket Status</label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="Open">Open</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Diagnosis">Diagnosis</option>
                    <option value="Resolved">Resolved (Operational)</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Technician Diagnosis</label>
                <textarea
                  placeholder="Record root cause findings, diagnostic scan results, hardware defects..."
                  value={actionDiagnosis}
                  onChange={(e) => setActionDiagnosis(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Repair Action Executed / Planned</label>
                <textarea
                  placeholder="Describe repair actions, part replacement, soldering, firmware updates..."
                  value={actionRepairAction}
                  onChange={(e) => setActionRepairAction(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Associated Repair Cost ($)</label>
                  <input
                    type="number"
                    value={actionCost}
                    onChange={(e) => setActionCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Resolution / Service Notes</label>
                  <input
                    type="text"
                    placeholder="Final testing notes or comments..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Option to Escalate directly to Workshop Repair Order */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">Escalate to Hardware Workshop Repair Order?</span>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    Creates an official repair record, marks asset status as 'Under Repair', and assigns vendor SLA tracking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleEscalateToRepair}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Escalate to Repair Order</span>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Ticket Diagnosis & Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
