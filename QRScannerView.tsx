import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Scan,
  Search,
  Printer,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  Camera,
  RefreshCw,
  Layers,
  Filter,
  Download,
  Building2,
  MapPin,
  User,
  ShieldCheck,
  FileCode2,
  Eye,
  Sparkles,
  CameraOff
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Asset } from '../types';
import { QRCodeView } from '../components/common/QRCodeView';
import { getStatusBadge, getConditionBadge } from '../components/common/Badge';

interface QRScannerViewProps {
  assets: Asset[];
  onOpenDetailModal?: (asset: Asset) => void;
  onSelectAsset?: (asset: Asset) => void;
}

export const QRScannerView: React.FC<QRScannerViewProps> = ({
  assets,
  onOpenDetailModal,
  onSelectAsset
}) => {
  const triggerOpenDetail = (asset: Asset) => {
    if (onOpenDetailModal) {
      onOpenDetailModal(asset);
    } else if (onSelectAsset) {
      onSelectAsset(asset);
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<'scanner' | 'generator' | 'batch_print'>('scanner');

  // Scanner States
  const [scannedCode, setScannedCode] = useState('');
  const [matchedAsset, setMatchedAsset] = useState<Asset | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Single Generator States
  const [selectedAssetForGen, setSelectedAssetForGen] = useState<Asset>(assets[0] || null);
  const [payloadType, setPayloadType] = useState<'tag' | 'url' | 'json'>('tag');

  // Batch Print States
  const [batchSearch, setBatchSearch] = useState('');
  const [batchDeptFilter, setBatchDeptFilter] = useState('All');
  const [batchCategoryFilter, setBatchCategoryFilter] = useState('All');

  // Cleanup camera scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle resolution of QR/Barcode code to Asset
  const handleResolveCode = (codeStr: string) => {
    const cleanCode = codeStr.trim().toLowerCase();
    if (!cleanCode) return;

    // Search across Tag, ID, serialNumber, or embedded QR JSON
    const found = assets.find((a) => {
      if (a.tag.toLowerCase() === cleanCode) return true;
      if (a.id.toLowerCase() === cleanCode) return true;
      if (a.serialNumber.toLowerCase() === cleanCode) return true;
      if (a.qrCode.toLowerCase() === cleanCode) return true;
      if (a.qrCode.toLowerCase().includes(cleanCode)) return true;
      try {
        if (cleanCode.includes('{') && cleanCode.includes('}')) {
          const parsed = JSON.parse(cleanCode);
          if (parsed.tag && a.tag.toLowerCase() === parsed.tag.toLowerCase()) return true;
          if (parsed.id && a.id.toLowerCase() === parsed.id.toLowerCase()) return true;
        }
      } catch (e) {
        // Not JSON
      }
      return false;
    });

    if (found) {
      setMatchedAsset(found);
      setScanMessage(`Scan verified! Asset #${found.tag} matched (${found.name})`);
    } else {
      setMatchedAsset(null);
      setScanMessage(`No equipment found matching tag/code '${codeStr}'. Please verify property tag.`);
    }
  };

  // Live Camera Scanner Toggle
  const startCameraScanner = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-camera-stream');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          setScannedCode(decodedText);
          handleResolveCode(decodedText);
        },
        () => {
          // Frame parse error ignored
        }
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera Start Error:', err);
      setIsCameraActive(false);
      setCameraError(
        'Camera access unavailable or blocked. You can use File Upload or Enter Tag Manually below.'
      );
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsCameraActive(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Image File Upload Scan
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      const qrScanner = new Html5Qrcode('qr-file-reader-hidden');
      const decodedText = await qrScanner.scanFile(file, true);
      setScannedCode(decodedText);
      handleResolveCode(decodedText);
      qrScanner.clear();
    } catch (err) {
      setMatchedAsset(null);
      setScanMessage(`Could not read QR barcode from uploaded file. Please select a clearer photo.`);
    }
  };

  // Dynamic Payload Generator Value
  const getPayloadValue = (asset: Asset) => {
    if (!asset) return '';
    if (payloadType === 'url') {
      return `https://assetpulse.app/asset/${asset.tag}`;
    }
    if (payloadType === 'json') {
      return JSON.stringify({
        id: asset.id,
        tag: asset.tag,
        name: asset.name,
        sn: asset.serialNumber,
        dept: asset.departmentName,
        loc: asset.location
      });
    }
    return asset.tag;
  };

  // Filtered Assets for Batch Printing
  const filteredBatchAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(batchSearch.toLowerCase()) ||
      a.tag.toLowerCase().includes(batchSearch.toLowerCase()) ||
      a.category.toLowerCase().includes(batchSearch.toLowerCase()) ||
      a.location.toLowerCase().includes(batchSearch.toLowerCase());

    const matchesDept = batchDeptFilter === 'All' || a.departmentName === batchDeptFilter;
    const matchesCat = batchCategoryFilter === 'All' || a.category === batchCategoryFilter;

    return matchesSearch && matchesDept && matchesCat;
  });

  const departments = Array.from(new Set(assets.map((a) => a.departmentName)));
  const categories = Array.from(new Set(assets.map((a) => a.category)));

  // Bulk Print Sheet Handler
  const handleBulkPrintSheet = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const cardsHtml = filteredBatchAssets
      .map(
        (a) => `
      <div class="tag-card">
        <div class="tag-header">ASSETPULSE PROPERTY TAG</div>
        <div class="tag-code">${a.tag}</div>
        <div class="tag-name">${a.name}</div>
        <div class="tag-meta">
          <strong>Dept:</strong> ${a.departmentName}<br/>
          <strong>Loc:</strong> ${a.location}<br/>
          <strong>S/N:</strong> ${a.serialNumber}
        </div>
      </div>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AssetPulse - Batch Property Tags Sheet (${filteredBatchAssets.length} Items)</title>
          <style>
            @page { size: portrait; margin: 10mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 10px;
              background: #fff;
            }
            h1 { font-size: 16px; font-weight: 800; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 6px; }
            .grid-container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
            }
            .tag-card {
              border: 1.5px solid #0f172a;
              border-radius: 8px;
              padding: 10px;
              text-align: center;
              box-shadow: none;
              page-break-inside: avoid;
            }
            .tag-header { font-size: 9px; font-weight: 800; color: #2563eb; letter-spacing: 1px; }
            .tag-code { font-family: monospace; font-size: 15px; font-weight: 800; margin: 4px 0; color: #000; }
            .tag-name { font-size: 11px; font-weight: 700; color: #334155; }
            .tag-meta { font-size: 9px; color: #64748b; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px; }
          </style>
        </head>
        <body>
          <h1>AssetPulse Enterprise Audit Labels (${filteredBatchAssets.length} Assets)</h1>
          <div class="grid-container">
            ${cardsHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Hidden container for image file scanner */}
      <div id="qr-file-reader-hidden" className="hidden"></div>

      {/* Module View Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-500" />
            QR Tracking & Property Tag Module
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate, view, download, print, and scan property tags for hardware auditing and audit log verification
          </p>
        </div>

        {/* Sub Navigation Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setActiveSubTab('scanner');
              stopCameraScanner();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'scanner'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan & Resolve Tag</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('generator');
              stopCameraScanner();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'generator'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Single Tag Generator</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('batch_print');
              stopCameraScanner();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'batch_print'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Batch Print Sheet ({assets.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SCANNER & TAG RESOLUTION */}
      {activeSubTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Scanner Control Box (Camera Feed + File Upload + Manual Input) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Interactive Tag & Barcode Scanner
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                ● Live Ready
              </span>
            </div>

            {/* Camera Viewfinder Stream */}
            <div className="p-4 rounded-xl bg-slate-950 text-white flex flex-col items-center justify-center border border-slate-800 relative overflow-hidden min-h-[220px]">
              <div id="qr-camera-stream" className={`w-full max-w-[280px] rounded-lg overflow-hidden ${isCameraActive ? 'block' : 'hidden'}`} />

              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center">
                  <div className="w-32 h-32 border-2 border-dashed border-blue-500/60 rounded-xl flex items-center justify-center relative">
                    <QrCode className="w-12 h-12 text-blue-400 opacity-60" />
                    <div className="absolute inset-x-0 h-0.5 bg-blue-400 top-1/2 shadow-lg shadow-blue-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Start live camera feed to scan physical asset stickers, or upload image below
                  </p>
                  <button
                    onClick={startCameraScanner}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Webcam Scanner</span>
                  </button>
                </div>
              )}

              {isCameraActive && (
                <button
                  onClick={stopCameraScanner}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>

            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Alternative Input Methods: File Upload & Manual Text Entry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* File Upload Button */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload QR Image
                </label>
                <label className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-blue-500" />
                  <span>Choose Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Manual Entry */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Manual Barcode Entry
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. AP-99201"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={() => handleResolveCode(scannedCode)}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0"
                  >
                    Scan
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Test Presets */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Click Sample Tags to Test Instant Resolution:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {assets.slice(0, 5).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setScannedCode(a.tag);
                      handleResolveCode(a.tag);
                    }}
                    className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {a.tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Resolved Asset Result Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Audit Verification Result
                  </h3>
                </div>
                {matchedAsset && getStatusBadge(matchedAsset.status)}
              </div>

              {matchedAsset ? (
                <div className="py-4 space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Hardware Tag Resolved & Verified
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {matchedAsset.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-mono font-semibold">
                      Tag ID: {matchedAsset.tag} • S/N: {matchedAsset.serialNumber}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Category & Model
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100 block truncate">
                        {matchedAsset.category}
                      </strong>
                      <span className="text-slate-500 text-[11px] block truncate">
                        {matchedAsset.model}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Department & Location
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100 block truncate">
                        {matchedAsset.departmentName}
                      </strong>
                      <span className="text-slate-500 text-[11px] block truncate flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {matchedAsset.location}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Current Custodian
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-500" />
                        {matchedAsset.assignedEmployeeName || 'Unassigned (In IT Hardware Pool)'}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <QrCode className="w-8 h-8 opacity-50" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No Asset Tag Resolved Yet
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Scan a tag using your camera or click any sample tag on the left to resolve equipment specs
                    </p>
                  </div>
                </div>
              )}

              {scanMessage && !matchedAsset && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{scanMessage}</span>
                </div>
              )}
            </div>

            {matchedAsset && (
              <button
                onClick={() => triggerOpenDetail(matchedAsset)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Open Full Asset Profile & Lifecycle History</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SINGLE ASSET TAG GENERATOR */}
      {activeSubTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Selection and Payload Controls */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Property Tag & QR Payload Settings
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Target Asset
              </label>
              <select
                value={selectedAssetForGen?.id || ''}
                onChange={(e) => {
                  const found = assets.find((a) => a.id === e.target.value);
                  if (found) setSelectedAssetForGen(found);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tag} — {a.name} ({a.departmentName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                QR Payload Data Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'tag', label: 'Asset Tag' },
                    { id: 'url', label: 'URL Link' },
                    { id: 'json', label: 'JSON Meta' }
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPayloadType(mode.id)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                      payloadType === mode.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedAssetForGen && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Encoded QR Payload Preview
                </span>
                <div className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 break-all text-slate-800 dark:text-slate-200">
                  {getPayloadValue(selectedAssetForGen)}
                </div>
              </div>
            )}
          </div>

          {/* Center/Right: Live Interactive QRCodeView Component */}
          {selectedAssetForGen && (
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-sm">
                <QRCodeView
                  value={getPayloadValue(selectedAssetForGen)}
                  assetTag={selectedAssetForGen.tag}
                  assetName={selectedAssetForGen.name}
                  departmentName={selectedAssetForGen.departmentName}
                  location={selectedAssetForGen.location}
                  serialNumber={selectedAssetForGen.serialNumber}
                  size={180}
                  showActions={true}
                />
              </div>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 max-w-md pt-2">
                Click <strong>PNG</strong> or <strong>SVG</strong> to save the high-resolution vector image, or <strong>Print Tag</strong> to open the printable sticker label card.
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BATCH PROPERTY TAG PRINT SHEET */}
      {activeSubTab === 'batch_print' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={batchSearch}
                  onChange={(e) => setBatchSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <select
                value={batchDeptFilter}
                onChange={(e) => setBatchDeptFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={batchCategoryFilter}
                onChange={(e) => setBatchCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleBulkPrintSheet}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Sheet ({filteredBatchAssets.length} Tags)</span>
            </button>
          </div>

          {/* Batch Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBatchAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col items-center justify-between space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <QRCodeView
                  value={asset.qrCode || asset.tag}
                  assetTag={asset.tag}
                  assetName={asset.name}
                  departmentName={asset.departmentName}
                  location={asset.location}
                  size={120}
                  showActions={false}
                />
                <button
                  onClick={() => triggerOpenDetail(asset)}
                  className="w-full text-center py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Asset →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

