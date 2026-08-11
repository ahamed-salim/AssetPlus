import React from 'react';
import { Modal } from '../components/common/Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Department } from '../types';

interface DeleteDepartmentModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

export const DeleteDepartmentModal: React.FC<DeleteDepartmentModalProps> = ({
  department,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!department) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Department Unit"
      subtitle="Irreversible organizational structure change"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-900 dark:text-rose-200 text-xs">
              Remove department "{department.name}"?
            </h4>
            <p className="text-rose-700 dark:text-rose-300 text-[11px] leading-relaxed">
              Deletions remove department classification codes ({department.code}). Personnel and assets registered under this department will need reassignment.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Department Code:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-100">{department.code}</strong>
          </div>
          <div className="flex justify-between">
            <span>Department Head:</span>
            <strong className="text-slate-900 dark:text-slate-100">{department.headName}</strong>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <strong className="text-slate-900 dark:text-slate-100">{department.location}</strong>
          </div>
          <div className="flex justify-between">
            <span>Budget Allocated:</span>
            <strong className="text-slate-900 dark:text-slate-100">${department.budgetAllocated.toLocaleString()}</strong>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmDelete(department.id);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold inline-flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
