import React from 'react';
import { Building2, Star, Clock, FileCheck, Phone, Mail, Box } from 'lucide-react';
import { Vendor, Asset } from '../types';
import { mockVendors } from '../data/mockData';

interface VendorsViewProps {
  assets: Asset[];
}

export const VendorsView: React.FC<VendorsViewProps> = ({ assets }) => {
  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Vendors & Supply Partners
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Hardware suppliers, authorized warranty centers, SLA response benchmarks and supply contracts
        </p>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {mockVendors.map((vendor) => {
          const vendorAssets = assets.filter(a => a.warrantyVendor === vendor.name);

          return (
            <div
              key={vendor.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {vendor.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Contact: <strong className="text-slate-700 dark:text-slate-300">{vendor.contactPerson}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{vendor.rating} / 5.0</span>
                </div>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vendor.phone}</span>
                </div>
              </div>

              {/* SLA & Contract Specs */}
              <div className="grid grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="block text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    SLA RESPONSE
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {vendor.slaResponseHours} Hours
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="block text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <FileCheck className="w-3 h-3 text-emerald-500" />
                    CONTRACTS
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {vendor.activeContracts} Active SLA
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="block text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Box className="w-3 h-3 text-purple-500" />
                    LINKED ASSETS
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5 block">
                    {vendorAssets.length || vendor.linkedAssetsCount} Equipment
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
