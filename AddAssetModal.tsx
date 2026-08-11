import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';
import { Asset, AssetCategory, AssetStatus, AssetCondition } from '../types';
import { mockDepartments, mockVendors } from '../data/mockData';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: Omit<Asset, 'id' | 'qrCode' | 'timeline'>) => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    tag: `AP-${Math.floor(10000 + Math.random() * 90000)}`,
    name: '',
    category: 'Laptops & Desktops' as AssetCategory,
    brand: '',
    model: '',
    serialNumber: '',
    departmentId: mockDepartments[0].id,
    departmentName: mockDepartments[0].name,
    location: 'Building A - Storage Pool',
    status: 'Available' as AssetStatus,
    condition: 'New' as AssetCondition,
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: 1500,
    currentValue: 1500,
    salvageValue: 300,
    expectedLifespanYears: 4,
    warrantyExpiry: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    warrantyVendor: mockVendors[0].name,
    warrantyStatus: 'Active' as const,
    notes: '',
    specProcessor: 'M3 Max / Intel i7',
    specMemory: '32 GB RAM',
    specStorage: '1 TB SSD'
  });

  const categories: AssetCategory[] = [
    'Laptops & Desktops',
    'Monitors & Displays',
    'Networking & Servers',
    'Mobile & Tablets',
    'Office Equipment',
    'Peripherals'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.serialNumber) return;

    onAdd({
      tag: formData.tag,
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber,
      departmentId: formData.departmentId,
      departmentName: formData.departmentName,
      location: formData.location,
      status: formData.status,
      condition: formData.condition,
      purchaseDate: formData.purchaseDate,
      purchaseCost: Number(formData.purchaseCost),
      currentValue: Number(formData.currentValue),
      salvageValue: Number(formData.salvageValue),
      expectedLifespanYears: Number(formData.expectedLifespanYears),
      warrantyExpiry: formData.warrantyExpiry,
      warrantyVendor: formData.warrantyVendor,
      warrantyStatus: formData.warrantyStatus,
      specifications: {
        Processor: formData.specProcessor,
        Memory: formData.specMemory,
        Storage: formData.specStorage
      },
      notes: formData.notes
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Digital Asset"
      subtitle="Add hardware equipment to enterprise lifecycle repository"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Asset Tag / Barcode</label>
            <input
              type="text"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Equipment Name</label>
            <input
              type="text"
              placeholder="e.g. MacBook Pro 16 M3 Max"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
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
              placeholder="e.g. Apple, Dell, Cisco"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Model Name / No.</label>
            <input
              type="text"
              placeholder="e.g. U3223QE, MBP18,2"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Serial Number</label>
            <input
              type="text"
              placeholder="e.g. C02G9981MD6R"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Assigned Department</label>
            <select
              value={formData.departmentId}
              onChange={(e) => {
                const dept = mockDepartments.find(d => d.id === e.target.value);
                setFormData({
                  ...formData,
                  departmentId: e.target.value,
                  departmentName: dept?.name || ''
                });
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              {mockDepartments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Location / Room</label>
            <input
              type="text"
              placeholder="e.g. Building A - Desk 304"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Purchase Cost ($)</label>
            <input
              type="number"
              value={formData.purchaseCost}
              onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value), currentValue: Number(e.target.value) })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Warranty Expiry Date</label>
            <input
              type="date"
              value={formData.warrantyExpiry}
              onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
          >
            Register Asset
          </button>
        </div>
      </form>
    </Modal>
  );
};
