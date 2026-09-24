import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  DownloadCloud, 
  X, 
  ShieldCheck, 
  Sliders,
  Search,
  Smartphone
} from 'lucide-react';
import { ChatSession } from '../types';
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
  onOpenInstallModal?: () => void;
}

function formatSessionDate(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24 && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffHours < 48 && (now.getDate() - date.getDate() === 1 || now.getDate() - date.getDate() === -30)) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const HighlightText: React.FC<{ text: string; highlight: string; className?: string }> = ({ 
  text, 
  highlight, 
  className = '' 
}) => {
  if (!highlight.trim()) return <span className={className}>{text}</span>;
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-blue-500/30 text-blue-200 rounded-xs px-0.5 font-medium not-italic">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

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
  onOpenInstallModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search when opening if requested, or keep clean
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter sessions by keyword in title or message content
  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sessions;

    return sessions.filter((session) => {
      // Check title
      const titleMatch = (session.title || '').toLowerCase().includes(query);
      if (titleMatch) return true;

      // Check messages
      if (session.messages && session.messages.length > 0) {
        return session.messages.some(
          (m) =>
            (m.content && m.content.toLowerCase().includes(query)) ||
            (m.reasoningContent && m.reasoningContent.toLowerCase().includes(query))
        );
      }

      return false;
    });
  }, [sessions, searchQuery]);

  // Helper to extract a relevant matching message snippet
  const getMessageSnippet = (session: ChatSession, query: string): string | null => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || !session.messages) return null;

    for (const m of session.messages) {
      const text = m.content || '';
      const idx = text.toLowerCase().indexOf(trimmed);
      if (idx !== -1) {
        const start = Math.max(0, idx - 18);
        const end = Math.min(text.length, idx + trimmed.length + 32);
        const prefix = start > 0 ? '…' : '';
        const suffix = end < text.length ? '…' : '';
        return `${prefix}${text.slice(start, end).replace(/\s+/g, ' ')}${suffix}`;
      }
    }
    return null;
  };

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
        className="relative w-80 max-w-[85vw] h-full bg-neutral-950 border-r border-neutral-800 flex flex-col z-50 text-neutral-200 animate-slideInLeft shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              AI
            </div>
            <span className="font-semibold text-sm text-white">Local Chatbot</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar: New Chat & Search */}
        <div className="p-3 space-y-2 border-b border-neutral-800/80">
          <button
            id="sidebar-new-chat-btn"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              id="sidebar-search-conversations-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchQuery('');
                  searchInputRef.current?.blur();
                }
              }}
              placeholder="Search conversations..."
              className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-neutral-900/90 border border-neutral-800 focus:border-blue-500/70 focus:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500/40 text-xs text-neutral-100 placeholder:text-neutral-500 transition-all"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Saved Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            <span>Conversations</span>
            {searchQuery.trim() ? (
              <span className="text-neutral-400 font-normal normal-case font-mono text-[10px]">
                {filteredSessions.length} {filteredSessions.length === 1 ? 'match' : 'matches'}
              </span>
            ) : (
              <span className="text-neutral-500 font-normal font-mono text-[10px]">
                {sessions.length}
              </span>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs px-2">
              No saved chats yet. Send a prompt to start an offline conversation.
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 px-3 text-neutral-400 text-xs flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-2.5">
                <Search className="w-4 h-4" />
              </div>
              <p className="font-medium text-neutral-300">No chats found</p>
              <p className="text-[11px] text-neutral-500 mt-0.5 max-w-[200px] truncate">
                No results matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors"
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const dateStr = formatSessionDate(session.updatedAt || session.createdAt);
              const messageSnippet = searchQuery.trim() ? getMessageSnippet(session, searchQuery) : null;

              return (
                <div
                  key={session.id}
                  id={`session-item-${session.id}`}
                  className={`group flex flex-col px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer border ${
                    isActive
                      ? 'bg-neutral-800 text-white font-medium border-neutral-700/60 shadow-xs'
                      : 'border-transparent text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100 hover:border-neutral-800/80'
                  }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-neutral-500 group-hover:text-neutral-400'}`} />
                      <HighlightText 
                        text={session.title || 'Untitled conversation'} 
                        highlight={searchQuery}
                        className="truncate block"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {dateStr && !messageSnippet && (
                        <span className="text-[10px] text-neutral-500 group-hover:opacity-0 transition-opacity font-mono">
                          {dateStr}
                        </span>
                      )}
                      <button
                        id={`delete-session-${session.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-neutral-400 rounded-md transition-opacity"
                        title="Delete chat"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Message snippet preview if matched in message content */}
                  {messageSnippet && (
                    <div className="mt-1 pl-5.5 text-[11px] text-neutral-400 line-clamp-1 italic">
                      <HighlightText text={messageSnippet} highlight={searchQuery} />
                    </div>
                  )}
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

          {onOpenInstallModal && (
            <button
              id="sidebar-install-apk-btn"
              onClick={() => {
                onClose();
                onOpenInstallModal();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Install App & APK Builder</span>
            </button>
          )}

          <div className="pt-2 px-2 flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Network Egress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

