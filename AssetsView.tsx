import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  QrCode, 
  ArrowLeftRight, 
  Eye, 
  MoreHorizontal, 
  Download,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  TicketCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Asset, AssetCategory, AssetStatus, AssetCondition } from '../types';
import { getStatusBadge, getConditionBadge } from '../components/common/Badge';
import { mockDepartments } from '../data/mockData';

interface AssetsViewProps {
  assets: Asset[];
  onOpenAddModal: () => void;
  onOpenDetailModal: (asset: Asset) => void;
  onOpenEditModal: (asset: Asset) => void;
  onOpenDeleteModal: (asset: Asset) => void;
  onOpenTransferModal: (asset: Asset) => void;
  onOpenComplaintModal: (asset: Asset) => void;
}

type SortField = 'name' | 'tag' | 'purchaseCost' | 'currentValue' | 'purchaseDate' | 'warrantyExpiry';

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets = [],
  onOpenAddModal,
  onOpenDetailModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onOpenTransferModal,
  onOpenComplaintModal
}) => {
  const safeAssets = assets || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const categories = ['All', 'Laptops & Desktops', 'Monitors & Displays', 'Networking & Servers', 'Mobile & Tablets', 'Office Equipment', 'Peripherals'];
  const statuses = ['All', 'In Use', 'Available', 'Under Repair', 'Pending Transfer', 'Maintenance', 'Disposed'];
  const conditions = ['All', 'New', 'Good', 'Fair', 'Needs Repair', 'Decommissioned'];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter logic
  const filteredAssets = safeAssets.filter((asset) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      asset.name.toLowerCase().includes(term) ||
      asset.tag.toLowerCase().includes(term) ||
      asset.serialNumber.toLowerCase().includes(term) ||
      asset.brand.toLowerCase().includes(term) ||
      asset.model.toLowerCase().includes(term) ||
      asset.location.toLowerCase().includes(term) ||
      (asset.assignedEmployeeName && asset.assignedEmployeeName.toLowerCase().includes(term));

    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || asset.status === selectedStatus;
    const matchesDept = selectedDept === 'All' || asset.departmentName === selectedDept;
    const matchesCondition = selectedCondition === 'All' || asset.condition === selectedCondition;

    return matchesSearch && matchesCategory && matchesStatus && matchesDept && matchesCondition;
  });

  // Sort logic
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage) || 1;
  const paginatedAssets = sortedAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToCSV = () => {
    const headers = ['Asset ID,Tag,Name,Category,Brand,Model,Serial,Status,Condition,Location,Assigned Employee,Department,Purchase Cost,Current Value,Warranty Expiry'];
    const rows = sortedAssets.map(a => 
      `"${a.id}","${a.tag}","${a.name}","${a.category}","${a.brand}","${a.model}","${a.serialNumber}","${a.status}","${a.condition}","${a.location}","${a.assignedEmployeeName || 'Unassigned'}","${a.departmentName}",${a.purchaseCost},${a.currentValue},"${a.warrantyExpiry}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AssetPulse_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 inline ml-1" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400 inline ml-1" />
      : <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400 inline ml-1" />;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Assets Repository & Inventory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage enterprise hardware lifecycle, track custodians, valuations, and warranty statuses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tag, name, serial..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="All">All Departments</option>
            {mockDepartments.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={selectedCondition}
            onChange={(e) => {
              setSelectedCondition(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
          >
            {conditions.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Conditions' : c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredAssets.length}</strong> equipment items
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px]"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('tag')}>
                  Tag / ID {getSortIcon('tag')}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('name')}>
                  Equipment Name {getSortIcon('name')}
                </th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assigned Custodian & Dept</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('currentValue')}>
                  Book Value {getSortIcon('currentValue')}
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {paginatedAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onOpenDetailModal(asset)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    <div className="text-blue-600 dark:text-blue-400">{asset.tag}</div>
                    <div className="text-[10px] text-slate-400 font-sans font-normal">{asset.id}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{asset.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {asset.brand} {asset.model} • SN: {asset.serialNumber}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {asset.category}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {asset.assignedEmployeeName || 'Unassigned (IT Pool)'}
                    </div>
                    <div className="text-[10px] text-slate-400">{asset.departmentName}</div>
                  </td>

                  <td className="py-3 px-4">{getStatusBadge(asset.status)}</td>
                  <td className="py-3 px-4">{getConditionBadge(asset.condition)}</td>

                  <td className="py-3 px-4 font-bold font-mono text-slate-900 dark:text-slate-100">
                    ${asset.currentValue.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onOpenDetailModal(asset)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Full Profile & Tabs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenDetailModal(asset)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Property QR Tag"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenEditModal(asset)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Asset Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenTransferModal(asset)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Transfer / Checkout"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenComplaintModal(asset)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Report Complaint"
                      >
                        <TicketCheck className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenDeleteModal(asset)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No hardware equipment matches your active search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-100">{paginatedAssets.length}</strong> of <strong>{filteredAssets.length}</strong> items (Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-semibold"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
