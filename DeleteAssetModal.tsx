import React from 'react';
import { Modal } from '../components/common/Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Asset } from '../types';

interface DeleteAssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

export const DeleteAssetModal: React.FC<DeleteAssetModalProps> = ({
  asset,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!asset) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Digital Asset"
      subtitle="Irreversible action from repository"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-900 dark:text-rose-200 text-xs">
              Are you sure you want to permanently delete this asset?
            </h4>
            <p className="text-rose-700 dark:text-rose-300 text-[11px] leading-relaxed">
              You are about to delete <strong className="font-mono">{asset.tag}</strong> — <strong>{asset.name}</strong> ({asset.brand} {asset.model}). This will remove its lifecycle records, tag history, and financial audit logs from the repository.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Asset Tag:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-100">{asset.tag}</strong>
          </div>
          <div className="flex justify-between">
            <span>Serial Number:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-100">{asset.serialNumber}</strong>
          </div>
          <div className="flex justify-between">
            <span>Current Valuation:</span>
            <strong className="text-slate-900 dark:text-slate-100">${asset.currentValue.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between">
            <span>Assigned Employee:</span>
            <strong className="text-slate-900 dark:text-slate-100">{asset.assignedEmployeeName || 'Unassigned'}</strong>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmDelete(asset.id);
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
