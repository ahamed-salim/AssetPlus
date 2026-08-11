import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';
import { Asset } from '../types';

interface CreateComplaintModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (complaintData: {
    assetId: string;
    assetName: string;
    assetTag: string;
    raisedBy: string;
    raisedByEmail: string;
    department: string;
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
  }) => void;
}

export const CreateComplaintModal: React.FC<CreateComplaintModalProps> = ({
  asset,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  if (!asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    onSubmit({
      assetId: asset.id,
      assetName: asset.name,
      assetTag: asset.tag,
      raisedBy: asset.assignedEmployeeName || 'Asset Operator',
      raisedByEmail: 'operator@assetpulse.io',
      department: asset.departmentName,
      title,
      description,
      priority,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Report Issue / File Complaint — ${asset.tag}`}
      subtitle={`Equipment: ${asset.name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Issue Title</label>
          <input
            type="text"
            placeholder="e.g. Display backlight flickering / Power delivery drop"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
          />
        </div>

        <div>
          <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Priority Level</label>
          <div className="grid grid-cols-4 gap-2">
            {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  priority === p
                    ? p === 'Critical' ? 'bg-rose-600 text-white border-rose-600' : 'bg-amber-600 text-white border-amber-600'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Detailed Symptom Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe what happened, error codes, physical condition, and steps to reproduce..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs"
          >
            File Complaint Ticket
          </button>
        </div>
      </form>
    </Modal>
  );
};
