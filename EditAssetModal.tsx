import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import { Asset, AssetCategory, AssetStatus, AssetCondition } from '../types';
import { mockDepartments, mockEmployees, mockVendors } from '../data/mockData';

interface EditAssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Asset>) => void;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  asset,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Asset>>({});

  useEffect(() => {
    if (asset) {
      setFormData({ ...asset });
    }
  }, [asset]);

  if (!asset) return null;

  const categories: AssetCategory[] = [
    'Laptops & Desktops',
    'Monitors & Displays',
    'Networking & Servers',
    'Mobile & Tablets',
    'Office Equipment',
    'Peripherals'
  ];

  const statuses: AssetStatus[] = [
    'In Use',
    'Available',
    'Under Repair',
    'Pending Transfer',
    'Maintenance',
    'Disposed'
  ];

  const conditions: AssetCondition[] = [
    'New',
    'Good',
    'Fair',
    'Needs Repair',
    'Decommissioned'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.serialNumber) return;

    onSave(asset.id, {
      ...formData,
      purchaseCost: Number(formData.purchaseCost || 0),
      currentValue: Number(formData.currentValue || 0),
      salvageValue: Number(formData.salvageValue || 0),
      expectedLifespanYears: Number(formData.expectedLifespanYears || 1),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Asset — ${asset.tag}`}
      subtitle={`Update parameters and configuration for ${asset.name}`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Asset Tag / ID</label>
            <input
              type="text"
              value={formData.tag || ''}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Equipment Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Category</label>
            <select
              value={formData.category || categories[0]}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Brand / Manufacturer</label>
            <input
              type="text"
              value={formData.brand || ''}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Model Name / No.</label>
            <input
              type="text"
              value={formData.model || ''}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Serial Number</label>
            <input
              type="text"
              value={formData.serialNumber || ''}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Operational Status</label>
            <select
              value={formData.status || statuses[0]}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Hardware Condition</label>
            <select
              value={formData.condition || conditions[0]}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {conditions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Department</label>
            <select
              value={formData.departmentId || mockDepartments[0].id}
              onChange={(e) => {
                const dept = mockDepartments.find(d => d.id === e.target.value);
                setFormData({
                  ...formData,
                  departmentId: e.target.value,
                  departmentName: dept?.name || ''
                });
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {mockDepartments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Assigned Employee</label>
            <select
              value={formData.assignedEmployeeId || 'unassigned'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'unassigned') {
                  setFormData({ ...formData, assignedEmployeeId: undefined, assignedEmployeeName: undefined });
                } else {
                  const emp = mockEmployees.find(emp => emp.id === val);
                  setFormData({
                    ...formData,
                    assignedEmployeeId: val,
                    assignedEmployeeName: emp?.name
                  });
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="unassigned">— Unassigned (IT Pool) —</option>
              {mockEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.departmentName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Location / Room / Desk</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Purchase Cost ($)</label>
            <input
              type="number"
              value={formData.purchaseCost ?? 0}
              onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Current Book Value ($)</label>
            <input
              type="number"
              value={formData.currentValue ?? 0}
              onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Salvage Value ($)</label>
            <input
              type="number"
              value={formData.salvageValue ?? 0}
              onChange={(e) => setFormData({ ...formData, salvageValue: Number(e.target.value) })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Warranty Vendor</label>
            <select
              value={formData.warrantyVendor || mockVendors[0].name}
              onChange={(e) => setFormData({ ...formData, warrantyVendor: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {mockVendors.map((v) => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Warranty Expiry Date</label>
            <input
              type="date"
              value={formData.warrantyExpiry || ''}
              onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Notes / Remarks</label>
          <textarea
            rows={2}
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Special operational notes, deployment details..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};
