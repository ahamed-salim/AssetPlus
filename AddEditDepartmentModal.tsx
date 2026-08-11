import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import { Department, Employee } from '../types';

interface AddEditDepartmentModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSave: (departmentData: Omit<Department, 'id' | 'totalAssets'>, id?: string) => void;
}

export const AddEditDepartmentModal: React.FC<AddEditDepartmentModalProps> = ({
  department,
  isOpen,
  onClose,
  employees,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [headName, setHeadName] = useState('');
  const [location, setLocation] = useState('');
  const [budgetAllocated, setBudgetAllocated] = useState(100000);

  useEffect(() => {
    if (department) {
      setCode(department.code);
      setName(department.name);
      setHeadName(department.headName);
      setLocation(department.location);
      setBudgetAllocated(department.budgetAllocated);
    } else {
      setCode('');
      setName('');
      setHeadName(employees[0]?.name || 'Department Head');
      setLocation('Building A, Floor 1');
      setBudgetAllocated(150000);
    }
  }, [department, employees, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    onSave(
      {
        code: code.toUpperCase(),
        name,
        headName,
        location,
        budgetAllocated: Number(budgetAllocated) || 0,
      },
      department?.id
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={department ? `Edit Department — ${department.code}` : 'Add New Department'}
      subtitle={department ? `Update allocation parameters for ${department.name}` : 'Create an organizational unit in the enterprise directory'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Department Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. IT-OPS, ENG, FIN-HR"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Data Science & Analytics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Department Head / Manager</label>
            <select
              value={headName}
              onChange={(e) => setHeadName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.role})
                </option>
              ))}
              {!employees.some((e) => e.name === headName) && headName && (
                <option value={headName}>{headName}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Primary Location / Floor</label>
            <input
              type="text"
              required
              placeholder="e.g. Building B, Floor 4"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Annual IT Asset Budget Allocated ($USD)</label>
            <input
              type="number"
              min={0}
              step={5000}
              required
              value={budgetAllocated}
              onChange={(e) => setBudgetAllocated(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
          >
            {department ? 'Save Department' : 'Create Department'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
