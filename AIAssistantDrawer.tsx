import React from 'react';
import { X, Bot } from 'lucide-react';
import { Asset, WarrantyRecord, RepairRecord, Employee, Department } from '../types';
import { AIAssistantView } from './AIAssistantView';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  warranties?: WarrantyRecord[];
  repairs?: RepairRecord[];
  employees?: Employee[];
  departments?: Department[];
  onOpenAssetDetail?: (asset: Asset) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  assets,
  warranties = [],
  repairs = [],
  employees = [],
  departments = [],
  onOpenAssetDetail
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono">AssetPulse AI Assistant Drawer</h3>
              <p className="text-[11px] text-slate-400">Natural Language Equipment Query Copilot</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AIAssistantView embedded */}
        <div className="flex-1 p-2 overflow-hidden">
          <AIAssistantView
            assets={assets}
            warranties={warranties}
            repairs={repairs}
            employees={employees}
            departments={departments}
            onOpenAssetDetail={(a) => {
              onClose();
              onOpenAssetDetail?.(a);
            }}
          />
        </div>
      </div>
    </div>
  );
};
