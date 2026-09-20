import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  DownloadCloud, 
  Settings, 
  X, 
  ShieldCheck, 
  HardDrive, 
  Sliders
} from 'lucide-react';
import { ChatSession, ModelId } from '../types';
import { StorageService } from '../services/storage';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onOpenModelHub: () => void;
  onOpenSettings: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenModelHub,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const downloadedCount = StorageService.getDownloadedModels().length;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out drawer */}
      <div 
        id="chat-sidebar-drawer"
        className="relative w-72 max-w-[80vw] h-full bg-neutral-950 border-r border-neutral-800 flex flex-col z-50 text-neutral-200 animate-slideInLeft shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              AI
            </div>
            <span className="font-semibold text-sm text-white">Local Chatbot</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            id="sidebar-new-chat-btn"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Saved Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 scrollbar-thin">
          <div className="px-2 py-1 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Conversations
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs px-2">
              No saved chats yet. Send a prompt to start an offline conversation.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  id={`session-item-${session.id}`}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-neutral-800 text-white font-medium border border-neutral-700/60'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{session.title || 'Untitled conversation'}</span>
                  </div>

                  <button
                    id={`delete-session-${session.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-3 border-t border-neutral-800 space-y-1 text-xs">
          <button
            id="sidebar-models-hub-btn"
            onClick={() => {
              onClose();
              onOpenModelHub();
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <DownloadCloud className="w-4 h-4 text-emerald-400" />
              <span>Model Download Hub</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
              {downloadedCount} installed
            </span>
          </button>

          <button
            id="sidebar-settings-btn"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Inference Settings</span>
          </button>

          <div className="pt-2 px-2 flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Network Egress</span>
          </div>
        </div>
      </div>
    </div>
  );
};
