import React from 'react';
import { 
  Menu, 
  Plus, 
  Sparkles, 
  ChevronDown, 
  Activity, 
  WifiOff,
  DownloadCloud
} from 'lucide-react';
import { ModelId, DeviceHardwareInfo } from '../types';
import { AVAILABLE_MODELS } from '../data/models';

interface HeaderProps {
  activeModelId: ModelId | null;
  onOpenModelHub: () => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenTelemetry: () => void;
  hardware: DeviceHardwareInfo;
  onInstallApp?: () => void;
  canInstallApp?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeModelId,
  onOpenModelHub,
  onToggleSidebar,
  onNewChat,
  onOpenTelemetry,
  hardware,
  onInstallApp,
  canInstallApp = false,
}) => {
  const currentModel = AVAILABLE_MODELS.find(m => m.id === activeModelId);

  return (
    <header 
      id="app-header"
      className="h-14 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none"
    >
      {/* Left side: Menu toggle & New Chat */}
      <div className="flex items-center gap-1.5">
        <button
          id="menu-sidebar-btn"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
          aria-label="Toggle chat history"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          id="new-chat-btn"
          onClick={onNewChat}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors flex items-center gap-1 text-xs font-medium"
          title="Start new conversation"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Center: Model Selector pill */}
      <div className="flex items-center">
        <button
          id="header-model-selector-btn"
          onClick={onOpenModelHub}
          className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold max-w-[140px] sm:max-w-[200px] truncate">
            {currentModel ? currentModel.name : 'Choose Model'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </div>

      {/* Right side: Install PWA + Online/Offline Status & Telemetry */}
      <div className="flex items-center gap-1.5">
        {onInstallApp && (
          <button
            id="install-pwa-btn"
            onClick={onInstallApp}
            className="px-2.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Install as native offline mobile app"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        <button
          id="offline-telemetry-btn"
          onClick={onOpenTelemetry}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            !hardware.isOnline
              ? 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-300'
              : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400'
          }`}
          title="Hardware diagnostics & offline telemetry"
        >
          {hardware.isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="hidden sm:inline font-mono">100% On-Device</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline font-mono text-purple-300">Air-Gapped</span>
            </>
          )}
          <Activity className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>
    </header>
  );
};
