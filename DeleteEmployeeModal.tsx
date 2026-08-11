import React from 'react';
import { Modal } from '../components/common/Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Employee } from '../types';

interface DeleteEmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

export const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
  employee,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Employee Record"
      subtitle="Irreversible directory deletion"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-900 dark:text-rose-200 text-xs">
              Confirm deletion of employee record?
            </h4>
            <p className="text-rose-700 dark:text-rose-300 text-[11px] leading-relaxed">
              You are removing <strong className="font-semibold">{employee.name}</strong> ({employee.id}) — {employee.role} from the enterprise employee directory.
              {employee.assignedAssetCount > 0 && (
                <span className="block mt-1 font-bold text-rose-800 dark:text-rose-200">
                  ⚠️ Note: This employee currently holds {employee.assignedAssetCount} assigned equipment items.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Employee ID:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-100">{employee.id}</strong>
          </div>
          <div className="flex justify-between">
            <span>Department:</span>
            <strong className="text-slate-900 dark:text-slate-100">{employee.departmentName}</strong>
          </div>
          <div className="flex justify-between">
            <span>Email:</span>
            <strong className="text-slate-900 dark:text-slate-100">{employee.email}</strong>
          </div>
          <div className="flex justify-between">
            <span>Assigned Hardware:</span>
            <strong className="text-slate-900 dark:text-slate-100">{employee.assignedAssetCount} Assets</strong>
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
              onConfirmDelete(employee.id);
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
