import React, { useState, useEffect } from 'react';
import { 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  Trash2, 
  Pause, 
  Play, 
  X, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Info,
  Wifi,
  WifiOff,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Layers,
  Terminal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AVAILABLE_MODELS } from '../data/models';
import { DeviceHardwareInfo, DownloadProgress, ModelId, ModelMetadata } from '../types';
import { ModelDownloader } from '../services/modelDownloader';
import { StorageService } from '../services/storage';
import { evaluateModelSafety } from '../services/hardware';

interface ModelDownloadModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isInitialRequired?: boolean;
  hardware: DeviceHardwareInfo;
  activeModelId: ModelId;
  onSelectModel: (modelId: ModelId) => void;
  onModelInstalled: (modelId: ModelId) => void;
}

export const ModelDownloadModal: React.FC<ModelDownloadModalProps> = ({
  isOpen,
  onClose,
  isInitialRequired = false,
  hardware,
  activeModelId,
  onSelectModel,
  onModelInstalled,
}) => {
  const [downloadProgresses, setDownloadProgresses] = useState<Record<string, DownloadProgress>>({});
  const [downloadedList, setDownloadedList] = useState<ModelId[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'safe' | 'reasoning'>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'storage' | 'custom'>('catalog');
  const [showLogs, setShowLogs] = useState<Record<string, boolean>>({});
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Custom model state
  const [customRepo, setCustomRepo] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  // Track online/offline status in real time
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load downloaded models
  const refreshDownloadedList = () => {
    const list = StorageService.getDownloadedModels().map(m => m.modelId);
    setDownloadedList(list);
  };

  useEffect(() => {
    refreshDownloadedList();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartDownload = (model: ModelMetadata, resume = false) => {
    if (!navigator.onLine) {
      alert('Cannot start download: Your Wi-Fi or mobile network is disconnected. Please turn on Wi-Fi/data to download model weights from Hugging Face.');
      return;
    }

    const currentProgress = downloadProgresses[model.id];
    const resumeBytes = resume && currentProgress ? currentProgress.bytesDownloaded : 0;

    setShowLogs(prev => ({ ...prev, [model.id]: true }));

    ModelDownloader.startDownload(
      model,
      (progress) => {
        setDownloadProgresses(prev => ({
          ...prev,
          [model.id]: progress,
        }));

        if (progress.status === 'ready') {
          refreshDownloadedList();
          onModelInstalled(model.id);
          try {
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.7 }
            });
          } catch {
            // Ignore confetti error
          }
        }
      },
      resumeBytes
    );
  };

  const handlePauseDownload = (modelId: ModelId) => {
    ModelDownloader.pauseDownload(modelId);
    setDownloadProgresses(prev => {
      const existing = prev[modelId];
      if (!existing) return prev;
      return {
        ...prev,
        [modelId]: { ...existing, status: 'paused', currentPhase: 'Download paused by user' }
      };
    });
  };

  const handleCancelDownload = (modelId: ModelId) => {
    ModelDownloader.cancelDownload(modelId);
    setDownloadProgresses(prev => {
      const copy = { ...prev };
      delete copy[modelId];
      return copy;
    });
  };

  const handleDeleteModel = (modelId: ModelId) => {
    if (confirm(`Remove this model from your phone's storage? You can re-download it anytime.`)) {
      StorageService.deleteDownloadedModel(modelId);
      refreshDownloadedList();
      if (activeModelId === modelId) {
        const remaining = StorageService.getDownloadedModels();
        if (remaining.length > 0) {
          onSelectModel(remaining[0].modelId);
        }
      }
    }
  };

  const filteredModels = AVAILABLE_MODELS.filter(m => {
    if (selectedFilter === 'safe') return m.crashRisk === 'None (Safe)' || m.crashRisk === 'Very Low';
    if (selectedFilter === 'reasoning') return m.hasReasoning;
    return true;
  });

  const totalDownloadedBytes = StorageService.getDownloadedModels().reduce(
    (acc, cur) => acc + cur.sizeBytes, 
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        id="model-download-modal"
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-neutral-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-start justify-between bg-neutral-900/95">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isOnline 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                {isOnline ? 'Online (Hugging Face Connected)' : 'Offline (Wi-Fi Disabled)'}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Cpu className="w-3 h-3" />
                Mobile Kernel Compiler
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {isInitialRequired ? 'Download Real PC Models for Mobile' : 'Hugging Face Mobile Model Hub'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Download genuine open-source LLM weights from Hugging Face CDN, compile matrix kernels for your mobile GPU/CPU, and run 100% offline.
            </p>
          </div>

          {!isInitialRequired && onClose && (
            <button
              id="close-model-hub-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Real Network Alert Banner if offline */}
        {!isOnline && (
          <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2.5 text-xs text-rose-200 flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              <strong>Wi-Fi / Network Offline:</strong> Real weights cannot be fetched without internet. Turn on Wi-Fi to download models. Any previously downloaded models will continue to run completely offline!
            </span>
          </div>
        )}

        {/* Diagnostic Bar */}
        <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-neutral-200">Mobile Compiler Target:</span>
            <span className="text-blue-400 font-mono">
              {hardware.webGpuSupported ? `WebGPU (${hardware.webGpuAdapterName || 'GPU'})` : 'WASM CPU SIMD'}
            </span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400">
              {hardware.deviceMemoryGb ? `${hardware.deviceMemoryGb}GB RAM` : 'Protected RAM'}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              id="tab-catalog"
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'catalog' 
                  ? 'bg-neutral-800 text-white shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Models ({AVAILABLE_MODELS.length})
            </button>
            <button
              id="tab-storage"
              onClick={() => setActiveTab('storage')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'storage' 
                  ? 'bg-neutral-800 text-white shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Device Cache ({(totalDownloadedBytes / (1024 * 1024)).toFixed(0)} MB)
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        {activeTab === 'catalog' && (
          <div className="px-4 pt-3 pb-1 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <button
              id="filter-all"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-white text-neutral-900 border-white font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              All Real Models
            </button>
            <button
              id="filter-safe"
              onClick={() => setSelectedFilter('safe')}
              className={`px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedFilter === 'safe'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Lightweight (SmolLM2 135M / 360M)
            </button>
            <button
              id="filter-reasoning"
              onClick={() => setSelectedFilter('reasoning')}
              className={`px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedFilter === 'reasoning'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              DeepSeek-R1 (Thinking Model)
            </button>
          </div>
        )}

        {/* Model List / Storage View */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
          {activeTab === 'catalog' ? (
            filteredModels.map((model) => {
              const isDownloaded = downloadedList.includes(model.id);
              const isActive = activeModelId === model.id;
              const progress = downloadProgresses[model.id];
              const isDownloading = progress && ['checking-network', 'downloading-weights', 'compiling-webgpu', 'allocating-buffers'].includes(progress.status);
              const isPaused = progress?.status === 'paused';
              const isError = progress?.status === 'error';
              const safety = evaluateModelSafety(model, hardware);
              const logExpanded = showLogs[model.id] ?? false;

              return (
                <div
                  key={model.id}
                  id={`model-card-${model.id}`}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-neutral-800/70 border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                      : isDownloaded
                      ? 'bg-neutral-900/90 border-neutral-700/60 hover:border-neutral-600'
                      : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700/60'
                  }`}
                >
                  {/* Top row: Model info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-base">
                          {model.name}
                        </span>
                        <a
                          href={`https://huggingface.co/${model.huggingFaceRepo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/50 font-mono flex items-center gap-1 transition-colors"
                          title="View repository on Hugging Face"
                        >
                          <span>{model.huggingFaceRepo.split('/')[0]}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                          {model.compileTarget}
                        </span>

                        {/* Safety Badge */}
                        {model.crashRisk === 'None (Safe)' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            Zero Crash Risk
                          </span>
                        )}
                        {model.crashRisk === 'Very Low' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                            Mobile Safe
                          </span>
                        )}
                        {model.crashRisk === 'Moderate' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            2GB+ RAM
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 mb-2">
                        {model.description}
                      </p>

                      {/* Tag badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {model.tags.map(t => (
                          <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-neutral-950/80 text-neutral-400 border border-neutral-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Size and Action Button */}
                    <div className="text-right flex flex-col items-end gap-2 shrink-0">
                      <div className="text-xs text-neutral-400 font-mono">
                        {model.formattedSize}
                      </div>

                      {isDownloaded ? (
                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active Model
                            </span>
                          ) : (
                            <button
                              id={`select-model-${model.id}`}
                              onClick={() => {
                                onSelectModel(model.id);
                                if (onClose) onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white transition-colors flex items-center gap-1"
                            >
                              Select
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            id={`delete-model-${model.id}`}
                            onClick={() => handleDeleteModel(model.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                            title="Delete model from device storage"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : isDownloading ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`pause-download-${model.id}`}
                            onClick={() => handlePauseDownload(model.id)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                            title="Pause download"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                          <button
                            id={`cancel-download-${model.id}`}
                            onClick={() => handleCancelDownload(model.id)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-900/50 hover:text-rose-300 text-neutral-400 transition-colors"
                            title="Cancel download"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : isPaused ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`resume-download-${model.id}`}
                            onClick={() => handleStartDownload(model, true)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Resume
                          </button>
                          <button
                            id={`cancel-download-${model.id}`}
                            onClick={() => handleCancelDownload(model.id)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-900/50 text-neutral-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`download-btn-${model.id}`}
                          onClick={() => handleStartDownload(model)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                            !isOnline
                              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                              : 'bg-white hover:bg-neutral-200 text-neutral-900 cursor-pointer'
                          }`}
                          title={!isOnline ? 'Connect to Wi-Fi to download' : 'Download and compile model'}
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download & Compile
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Safety Alert Box */}
                  {!isDownloaded && safety.warningLevel !== 'none' && !isDownloading && (
                    <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                      safety.warningLevel === 'danger'
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                    }`}>
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">RAM Safety Alert: </span>
                        {safety.reason}
                      </div>
                    </div>
                  )}

                  {/* REAL PROGRESS BAR & COMPILATION PIPELINE */}
                  {progress && (isDownloading || isPaused || isError) && (
                    <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-neutral-200 flex items-center gap-1.5">
                          {isDownloading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />}
                          {isPaused && <Pause className="w-3.5 h-3.5 text-amber-400" />}
                          {isError && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                          <span>{progress.currentPhase}</span>
                          {progress.activeFile && (
                            <span className="text-[11px] px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-400 font-mono">
                              {progress.activeFile}
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-semibold text-white">
                          {progress.percentage}%
                        </span>
                      </div>

                      {/* Animated Progress Bar */}
                      <div 
                        id={`progress-bar-container-${model.id}`}
                        className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 relative"
                      >
                        <div
                          id={`progress-bar-${model.id}`}
                          className={`h-full rounded-full transition-all duration-150 relative ${
                            isError 
                              ? 'bg-rose-500' 
                              : isPaused 
                              ? 'bg-amber-500' 
                              : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        >
                          {isDownloading && (
                            <div className="absolute inset-0 bg-white/25 animate-pulse"></div>
                          )}
                        </div>
                      </div>

                      {/* Download telemetry stats */}
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                        <span>
                          {(progress.bytesDownloaded / (1024 * 1024)).toFixed(1)} MB / {(progress.totalBytes / (1024 * 1024)).toFixed(1)} MB
                        </span>
                        {progress.speedBytesPerSec > 0 && (
                          <span>
                            {(progress.speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s
                          </span>
                        )}
                        {progress.etaSeconds > 0 && (
                          <span>
                            ETA: {progress.etaSeconds}s
                          </span>
                        )}
                      </div>

                      {/* Compilation and Network Console Log Toggle */}
                      {progress.compilationLog && progress.compilationLog.length > 0 && (
                        <div className="rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] overflow-hidden">
                          <button
                            onClick={() => setShowLogs(prev => ({ ...prev, [model.id]: !logExpanded }))}
                            className="w-full px-2.5 py-1.5 flex items-center justify-between text-neutral-400 hover:text-neutral-200 transition-colors"
                          >
                            <span className="flex items-center gap-1 font-mono text-neutral-300">
                              <Terminal className="w-3 h-3 text-blue-400" />
                              Mobile Compilation Log ({progress.compilationLog.length} steps)
                            </span>
                            {logExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                          {logExpanded && (
                            <div className="p-2.5 border-t border-neutral-800/80 max-h-28 overflow-y-auto font-mono text-[10px] text-neutral-300 space-y-1 scrollbar-thin bg-black/40">
                              {progress.compilationLog.map((line, idx) => (
                                <div key={idx} className="leading-tight">{line}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Error Handling & Recovery */}
                      {isError && (
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold">Download Failure: </span>
                            {progress.errorMessage || 'Network request interrupted.'}
                          </div>
                          <button
                            id={`retry-download-${model.id}`}
                            onClick={() => handleStartDownload(model, true)}
                            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold shrink-0 transition-colors"
                          >
                            Retry Download
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* Storage Manager Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-neutral-400" />
                    <span className="font-semibold text-white text-sm">Offline Browser Cache</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {(totalDownloadedBytes / (1024 * 1024)).toFixed(0)} MB compiled
                  </span>
                </div>

                <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden flex border border-neutral-800">
                  <div 
                    className="bg-emerald-500 h-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (totalDownloadedBytes / (2 * 1024 * 1024 * 1024)) * 100)}%` 
                    }}
                  ></div>
                </div>

                <p className="text-xs text-neutral-400">
                  Model weights are cached locally inside the browser's <code>CacheStorage</code>. Once downloaded and compiled, they never require any internet connection. You can test by turning on Airplane Mode.
                </p>
              </div>

              {downloadedList.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-xs">
                  No models compiled yet. Select a model from the catalog to download and compile.
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Compiled On-Device Models
                  </h4>
                  {downloadedList.map(id => {
                    const m = AVAILABLE_MODELS.find(x => x.id === id);
                    if (!m) return null;
                    return (
                      <div key={id} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white text-sm">{m.name}</div>
                          <div className="text-xs text-neutral-400 font-mono">
                            {m.formattedSize} • {m.quantization} • {m.compileTarget}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteModel(id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/95 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Info className="w-4 h-4 text-neutral-500 shrink-0" />
            <span>Turn off Wi-Fi after downloading to test 100% offline inference.</span>
          </div>

          {downloadedList.length > 0 && (
            <button
              id="start-chatting-btn"
              onClick={() => {
                if (!activeModelId && downloadedList.length > 0) {
                  onSelectModel(downloadedList[0]);
                }
                if (onClose) onClose();
              }}
              className="px-4 py-2 rounded-xl bg-white text-neutral-900 font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-md"
            >
              Start Chatting
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
