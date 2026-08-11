import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import { Employee, Department } from '../types';

interface AddEditEmployeeModalProps {
  employee: Employee | null; // null if adding new
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onSave: (employeeData: Omit<Employee, 'id' | 'assignedAssetCount'>, id?: string) => void;
}

export const AddEditEmployeeModal: React.FC<AddEditEmployeeModalProps> = ({
  employee,
  isOpen,
  onClose,
  departments,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Terminated'>('Active');

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
      setRole(employee.role);
      setDepartmentId(employee.departmentId);
      setLocation(employee.location);
      setPhone(employee.phone);
      setAvatar(employee.avatar || '');
      setStatus(employee.status);
    } else {
      setName('');
      setEmail('');
      setRole('');
      setDepartmentId(departments[0]?.id || '');
      setLocation('');
      setPhone('');
      setAvatar('');
      setStatus('Active');
    }
  }, [employee, departments, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;

    const selectedDept = departments.find((d) => d.id === departmentId) || departments[0];

    onSave(
      {
        name,
        email,
        role,
        departmentId: selectedDept?.id || 'DEP-001',
        departmentName: selectedDept?.name || 'Unassigned',
        location: location || `${selectedDept?.location || 'Building A'} - Desk`,
        phone: phone || '+1 (555) 000-0000',
        avatar: avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        status,
      },
      employee?.id
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? `Edit Employee — ${employee.id}` : 'Add New Employee'}
      subtitle={employee ? `Update profile information for ${employee.name}` : 'Register a new team member in the enterprise directory'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Elena Rostova"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Email Address *</label>
            <input
              type="email"
              required
              placeholder="elena.rostova@assetpulse.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Job Title / Role *</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Architect"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Office Location / Desk</label>
            <input
              type="text"
              placeholder="e.g. Building A - Desk 304"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 019-8822"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Employment Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated / Offboarded</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Avatar Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px]"
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
            {employee ? 'Save Changes' : 'Register Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
