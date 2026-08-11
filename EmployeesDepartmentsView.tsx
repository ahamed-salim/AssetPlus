import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Eye, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  UserCheck,
  ShieldAlert,
  User,
  Filter
} from 'lucide-react';
import { Department, Employee, Asset, AssignmentTransfer, ComplaintTicket } from '../types';
import { AddEditEmployeeModal } from './AddEditEmployeeModal';
import { DeleteEmployeeModal } from './DeleteEmployeeModal';
import { AddEditDepartmentModal } from './AddEditDepartmentModal';
import { DeleteDepartmentModal } from './DeleteDepartmentModal';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { DepartmentDetailModal } from './DepartmentDetailModal';

interface EmployeesDepartmentsViewProps {
  assets: Asset[];
  employees: Employee[];
  departments: Department[];
  transfers: AssignmentTransfer[];
  complaints: ComplaintTicket[];
  onAddEmployee: (data: Omit<Employee, 'id' | 'assignedAssetCount'>) => void;
  onEditEmployee: (id: string, updates: Partial<Employee>) => void;
  onDeleteEmployee: (id: string) => void;
  onAddDepartment: (data: Omit<Department, 'id' | 'totalAssets'>) => void;
  onEditDepartment: (id: string, updates: Partial<Department>) => void;
  onDeleteDepartment: (id: string) => void;
  onOpenAssetDetail: (asset: Asset) => void;
  onOpenTransferModal: (asset: Asset) => void;
}

type SortFieldEmp = 'name' | 'id' | 'role' | 'departmentName' | 'assignedAssetCount' | 'status';
type SortFieldDept = 'name' | 'code' | 'headName' | 'budgetAllocated' | 'location';

export const EmployeesDepartmentsView: React.FC<EmployeesDepartmentsViewProps> = ({
  assets = [],
  employees = [],
  departments = [],
  transfers = [],
  complaints = [],
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  onOpenAssetDetail,
  onOpenTransferModal,
}) => {
  const safeAssets = assets || [];
  const safeEmployees = employees || [];
  const safeDepartments = departments || [];
  const safeTransfers = transfers || [];
  const safeComplaints = complaints || [];
  const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');

  // Search & Filter State - Employees
  const [empSearch, setEmpSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState('All');
  const [empSortField, setEmpSortField] = useState<SortFieldEmp>('name');
  const [empSortOrder, setEmpSortOrder] = useState<'asc' | 'desc'>('asc');
  const [empPage, setEmpPage] = useState(1);
  const [empItemsPerPage, setEmpItemsPerPage] = useState(8);

  // Search & Filter State - Departments
  const [deptSearch, setDeptSearch] = useState('');
  const [deptSortField, setDeptSortField] = useState<SortFieldDept>('name');
  const [deptSortOrder, setDeptSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal Control States
  const [isAddEditEmpOpen, setIsAddEditEmpOpen] = useState(false);
  const [selectedEmpForEdit, setSelectedEmpForEdit] = useState<Employee | null>(null);
  const [selectedEmpForDelete, setSelectedEmpForDelete] = useState<Employee | null>(null);
  const [selectedEmpForDetail, setSelectedEmpForDetail] = useState<Employee | null>(null);

  const [isAddEditDeptOpen, setIsAddEditDeptOpen] = useState(false);
  const [selectedDeptForEdit, setSelectedDeptForEdit] = useState<Department | null>(null);
  const [selectedDeptForDelete, setSelectedDeptForDelete] = useState<Department | null>(null);
  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState<Department | null>(null);

  // Sorting Handlers
  const handleEmpSort = (field: SortFieldEmp) => {
    if (empSortField === field) {
      setEmpSortOrder(empSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setEmpSortField(field);
      setEmpSortOrder('asc');
    }
  };

  const handleDeptSort = (field: SortFieldDept) => {
    if (deptSortField === field) {
      setDeptSortOrder(deptSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setDeptSortField(field);
      setDeptSortOrder('asc');
    }
  };

  // Filter Employees Logic
  const filteredEmployees = safeEmployees.filter((emp) => {
    const term = empSearch.toLowerCase();
    const matchesSearch =
      emp.name.toLowerCase().includes(term) ||
      emp.id.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term) ||
      emp.departmentName.toLowerCase().includes(term) ||
      emp.location.toLowerCase().includes(term) ||
      emp.phone.toLowerCase().includes(term);

    const matchesDept = selectedDeptFilter === 'All' || emp.departmentName === selectedDeptFilter;
    const matchesStatus = selectedStatusFilter === 'All' || emp.status === selectedStatusFilter;

    const empAssetsCount = safeAssets.filter(a => a.assignedEmployeeName === emp.name || a.assignedEmployeeId === emp.id).length;
    const matchesAssignment =
      selectedAssignmentFilter === 'All' ||
      (selectedAssignmentFilter === 'With Assets' && empAssetsCount > 0) ||
      (selectedAssignmentFilter === 'Unassigned' && empAssetsCount === 0);

    return matchesSearch && matchesDept && matchesStatus && matchesAssignment;
  });

  // Sort Employees Logic
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aVal: any = a[empSortField];
    let bVal: any = b[empSortField];

    if (empSortField === 'assignedAssetCount') {
      aVal = safeAssets.filter(ast => ast.assignedEmployeeName === a.name || ast.assignedEmployeeId === a.id).length;
      bVal = safeAssets.filter(ast => ast.assignedEmployeeName === b.name || ast.assignedEmployeeId === b.id).length;
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (aVal < bVal) return empSortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return empSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginated Employees
  const empTotalPages = Math.ceil(sortedEmployees.length / empItemsPerPage) || 1;
  const paginatedEmployees = sortedEmployees.slice((empPage - 1) * empItemsPerPage, empPage * empItemsPerPage);

  // Filter & Sort Departments Logic
  const filteredDepartments = safeDepartments.filter((dept) => {
    const term = deptSearch.toLowerCase();
    return (
      dept.name.toLowerCase().includes(term) ||
      dept.code.toLowerCase().includes(term) ||
      dept.headName.toLowerCase().includes(term) ||
      dept.location.toLowerCase().includes(term)
    );
  });

  const sortedDepartments = [...filteredDepartments].sort((a, b) => {
    let aVal: any = a[deptSortField];
    let bVal: any = b[deptSortField];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (aVal < bVal) return deptSortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return deptSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // CSV Export
  const exportEmployeesCSV = () => {
    const headers = ['Employee ID,Name,Email,Role,Department,Office Location,Phone,Status,Assigned Assets Count'];
    const rows = sortedEmployees.map((e) => {
      const count = assets.filter(a => a.assignedEmployeeName === e.name || a.assignedEmployeeId === e.id).length;
      return `"${e.id}","${e.name}","${e.email}","${e.role}","${e.departmentName}","${e.location}","${e.phone}","${e.status}",${count}`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AssetPulse_Employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDepartmentsCSV = () => {
    const headers = ['Department Code,Department Name,Department Head,Location,Allocated Budget,Total Assets,Total Valuation'];
    const rows = sortedDepartments.map((d) => {
      const dAssets = assets.filter(a => a.departmentName === d.name);
      const val = dAssets.reduce((s, a) => s + (a.currentValue || 0), 0);
      return `"${d.code}","${d.name}","${d.headName}","${d.location}",${d.budgetAllocated},${dAssets.length},${val}`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AssetPulse_Departments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEmpSortIcon = (field: SortFieldEmp) => {
    if (empSortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 inline ml-1" />;
    return empSortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400 inline ml-1" />
      : <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400 inline ml-1" />;
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Employees & Departments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organizational hierarchy, personnel inventory, and department hardware allocations
          </p>
        </div>

        {/* Tab Switcher & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'employees'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Employee Directory ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'departments'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Departments ({departments.length})
            </button>
          </div>

          <button
            onClick={activeTab === 'employees' ? exportEmployeesCSV : exportDepartmentsCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {activeTab === 'employees' ? (
            <button
              onClick={() => {
                setSelectedEmpForEdit(null);
                setIsAddEditEmpOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedDeptForEdit(null);
                setIsAddEditDeptOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'employees' ? (
        /* Employee Directory Section */
        <div className="space-y-4">
          {/* Employee Filter Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, ID, title, desk..."
                  value={empSearch}
                  onChange={(e) => {
                    setEmpSearch(e.target.value);
                    setEmpPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Dept Filter */}
              <select
                value={selectedDeptFilter}
                onChange={(e) => {
                  setSelectedDeptFilter(e.target.value);
                  setEmpPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value);
                  setEmpPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="All">All Employment Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated / Offboarded</option>
              </select>

              {/* Assignment Filter */}
              <select
                value={selectedAssignmentFilter}
                onChange={(e) => {
                  setSelectedAssignmentFilter(e.target.value);
                  setEmpPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="All">All Hardware Holders</option>
                <option value="With Assets">With Assigned Equipment</option>
                <option value="Unassigned">Unassigned (No Equipment)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-900 dark:text-slate-100">{filteredEmployees.length}</strong> personnel members
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Rows per page:</span>
                <select
                  value={empItemsPerPage}
                  onChange={(e) => {
                    setEmpItemsPerPage(Number(e.target.value));
                    setEmpPage(1);
                  }}
                  className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px]"
                >
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employee Directory Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => handleEmpSort('name')}>
                      Employee Name {getEmpSortIcon('name')}
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => handleEmpSort('role')}>
                      Job Title / Role {getEmpSortIcon('role')}
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => handleEmpSort('departmentName')}>
                      Department {getEmpSortIcon('departmentName')}
                    </th>
                    <th className="py-3 px-4">Desk Location</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 cursor-pointer text-center hover:text-blue-600" onClick={() => handleEmpSort('assignedAssetCount')}>
                      Assigned Equipment {getEmpSortIcon('assignedAssetCount')}
                    </th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {paginatedEmployees.map((emp) => {
                    const empAssets = assets.filter(
                      (a) => a.assignedEmployeeName === emp.name || a.assignedEmployeeId === emp.id
                    );

                    return (
                      <tr
                        key={emp.id}
                        onClick={() => setSelectedEmpForDetail(emp)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{emp.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{emp.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {emp.role}
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {emp.departmentName}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {emp.location}
                        </td>

                        <td className="py-3 px-4 space-y-0.5">
                          <div className="text-slate-800 dark:text-slate-200 flex items-center gap-1 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {emp.email}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {emp.phone}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold text-xs px-2.5 py-1 rounded-lg border ${
                            empAssets.length > 0
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}>
                            {empAssets.length} Assets
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedEmpForDetail(emp)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="View Employee Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedEmpForEdit(emp);
                                setIsAddEditEmpOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Employee Information"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setSelectedEmpForDelete(emp)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        No employees found matching active criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-900 dark:text-slate-100">{paginatedEmployees.length}</strong> of <strong>{filteredEmployees.length}</strong> employees (Page <strong>{empPage}</strong> of <strong>{empTotalPages}</strong>)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEmpPage((p) => Math.max(p - 1, 1))}
                  disabled={empPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {Array.from({ length: empTotalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setEmpPage(pageNum)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors ${
                      empPage === pageNum
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setEmpPage((p) => Math.min(p + 1, empTotalPages))}
                  disabled={empPage === empTotalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Departments Grid Section */
        <div className="space-y-4">
          {/* Dept Search Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search department code, name, head..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
              />
            </div>

            <span className="text-xs text-slate-500">
              Showing <strong className="text-slate-900 dark:text-slate-100">{filteredDepartments.length}</strong> department units
            </span>
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedDepartments.map((dept) => {
              const deptAssets = assets.filter((a) => a.departmentName === dept.name || a.departmentId === dept.id);
              const deptValuation = deptAssets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
              const deptStaff = employees.filter((e) => e.departmentName === dept.name || e.departmentId === dept.id);

              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDeptForDetail(dept)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group relative"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                        {dept.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {dept.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedDeptForEdit(dept);
                          setIsAddEditDeptOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Department"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedDeptForDelete(dept)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">DEPARTMENT HEAD</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{dept.headName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">PERSONNEL COUNT</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{deptStaff.length} Staff</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">HARDWARE ASSETS</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{deptAssets.length} Equipment</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">ASSET VALUATION</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${deptValuation.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Sample Asset Badges */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Allocated Assets Sample
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {deptAssets.slice(0, 3).map((a) => (
                        <span key={a.id} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {a.name}
                        </span>
                      ))}
                      {deptAssets.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No assets allocated</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Employee Modals */}
      <AddEditEmployeeModal
        employee={selectedEmpForEdit}
        isOpen={isAddEditEmpOpen}
        onClose={() => {
          setIsAddEditEmpOpen(false);
          setSelectedEmpForEdit(null);
        }}
        departments={departments}
        onSave={(data, id) => {
          if (id) {
            onEditEmployee(id, data);
          } else {
            onAddEmployee(data);
          }
        }}
      />

      <DeleteEmployeeModal
        employee={selectedEmpForDelete}
        isOpen={!!selectedEmpForDelete}
        onClose={() => setSelectedEmpForDelete(null)}
        onConfirmDelete={(id) => onDeleteEmployee(id)}
      />

      <EmployeeDetailModal
        employee={selectedEmpForDetail}
        isOpen={!!selectedEmpForDetail}
        onClose={() => setSelectedEmpForDetail(null)}
        assets={assets}
        transfers={transfers}
        complaints={complaints}
        onOpenAssetDetail={onOpenAssetDetail}
        onOpenTransferModal={onOpenTransferModal}
        onOpenEditEmployee={(emp) => {
          setSelectedEmpForDetail(null);
          setSelectedEmpForEdit(emp);
          setIsAddEditEmpOpen(true);
        }}
        onOpenDeleteEmployee={(emp) => {
          setSelectedEmpForDetail(null);
          setSelectedEmpForDelete(emp);
        }}
      />

      {/* Department Modals */}
      <AddEditDepartmentModal
        department={selectedDeptForEdit}
        isOpen={isAddEditDeptOpen}
        onClose={() => {
          setIsAddEditDeptOpen(false);
          setSelectedDeptForEdit(null);
        }}
        employees={employees}
        onSave={(data, id) => {
          if (id) {
            onEditDepartment(id, data);
          } else {
            onAddDepartment(data);
          }
        }}
      />

      <DeleteDepartmentModal
        department={selectedDeptForDelete}
        isOpen={!!selectedDeptForDelete}
        onClose={() => setSelectedDeptForDelete(null)}
        onConfirmDelete={(id) => onDeleteDepartment(id)}
      />

      <DepartmentDetailModal
        department={selectedDeptForDetail}
        isOpen={!!selectedDeptForDetail}
        onClose={() => setSelectedDeptForDetail(null)}
        assets={assets}
        employees={employees}
        transfers={transfers}
        onOpenAssetDetail={onOpenAssetDetail}
        onOpenEmployeeDetail={(emp) => {
          setSelectedDeptForDetail(null);
          setSelectedEmpForDetail(emp);
        }}
        onOpenEditDepartment={(dept) => {
          setSelectedDeptForDetail(null);
          setSelectedDeptForEdit(dept);
          setIsAddEditDeptOpen(true);
        }}
        onOpenDeleteDepartment={(dept) => {
          setSelectedDeptForDetail(null);
          setSelectedDeptForDelete(dept);
        }}
      />
    </div>
  );
};
