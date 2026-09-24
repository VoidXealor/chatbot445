import React, { useState, useEffect, useRef } from 'react';
import { 
  DeviceHardwareInfo, 
  ChatMessage as ChatMessageType, 
  ChatSession, 
  ModelId, 
  ModelEngineConfig 
} from './types';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from './data/models';
import { detectDeviceHardware } from './services/hardware';
import { StorageService } from './services/storage';
import { offlineLlm } from './services/offlineLlmEngine';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatSidebar } from './components/ChatSidebar';
import { ModelDownloadModal } from './components/ModelDownloadModal';
import { DeviceStatsModal } from './components/DeviceStatsModal';
import { SettingsModal } from './components/SettingsModal';
import { EmptyChatState } from './components/EmptyChatState';
import { InstallApkModal } from './components/InstallApkModal';
import { Smartphone, Monitor, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  // Device & Hardware
  const [hardware, setHardware] = useState<DeviceHardwareInfo>({
    hardwareConcurrency: 4,
    webGpuSupported: false,
    storageQuotaBytes: 10 * 1024 * 1024 * 1024,
    storageUsageBytes: 0,
    storageAvailableBytes: 10 * 1024 * 1024 * 1024,
    isMobileDevice: true,
    platform: 'Mobile',
    crashGuardActive: true,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  // Active Model & Modals
  const [activeModelId, setActiveModelId] = useState<ModelId>(DEFAULT_MODEL_ID);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isInitialDownloadGate, setIsInitialDownloadGate] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  // Engine config
  const [engineConfig, setEngineConfig] = useState<ModelEngineConfig>(() => {
    return StorageService.getEngineConfig() || {
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      systemPrompt: 'You are a helpful, direct, and capable AI assistant running locally and privately. Answer questions clearly, accurately, and politely without unnecessary disclaimers.',
      enableThinking: true,
      streamSpeed: 'natural',
      compilationBackend: 'auto',
    };
  });

  // Sessions and Active Chat
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // PWA mobile app installation prompt
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsAppInstalled(true);
          setDeferredInstallPrompt(null);
          return;
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    }
    // Open install & APK guide modal
    setIsInstallModalOpen(true);
  };

  // Initialize on mount
  useEffect(() => {
    async function init() {
      // 1. Detect hardware
      const hw = await detectDeviceHardware();
      setHardware(hw);

      // Default desktop frame if not on a small screen
      if (!hw.isMobileDevice && window.innerWidth >= 1024) {
        setDeviceFrameMode(true);
      }

      // 2. Load downloaded models
      const downloaded = StorageService.getDownloadedModels();
      const savedActive = StorageService.getActiveModel();

      if (downloaded.length === 0) {
        // First turn: User must be asked to download a model first!
        setIsInitialDownloadGate(true);
        setIsDownloadModalOpen(true);
      } else {
        if (savedActive && StorageService.isModelDownloaded(savedActive)) {
          setActiveModelId(savedActive);
        } else {
          setActiveModelId(downloaded[0].modelId);
          StorageService.setActiveModel(downloaded[0].modelId);
        }
      }

      // 3. Load chat sessions
      const savedSessions = StorageService.getSessions();
      setSessions(savedSessions);
      if (savedSessions.length > 0) {
        setCurrentSessionId(savedSessions[0].id);
        setMessages(savedSessions[0].messages);
      } else {
        createNewChat();
      }
    }

    init();

    const handleOnline = () => setHardware(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setHardware(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save sessions to storage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      StorageService.saveSessions(sessions);
    }
  }, [sessions]);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleConfigChange = (newConfig: ModelEngineConfig) => {
    setEngineConfig(newConfig);
    StorageService.saveEngineConfig(newConfig);
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: 'chat_' + Date.now(),
      title: 'New conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelId: activeModelId,
      messages: [],
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setSystemAlert(null);
  };

  const selectSession = (sessionId: string) => {
    const s = sessions.find(x => x.id === sessionId);
    if (s) {
      setCurrentSessionId(s.id);
      setMessages(s.messages);
      setActiveModelId(s.modelId);
      setSystemAlert(null);
    }
  };

  const deleteSession = (sessionId: string) => {
    const updated = sessions.filter(x => x.id !== sessionId);
    setSessions(updated);
    if (currentSessionId === sessionId) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        createNewChat();
      }
    }
  };

  const handleModelInstalled = (modelId: ModelId) => {
    setActiveModelId(modelId);
    StorageService.setActiveModel(modelId);
    setIsInitialDownloadGate(false);
  };

  const handleSelectModel = (modelId: ModelId) => {
    setActiveModelId(modelId);
    StorageService.setActiveModel(modelId);
  };

  // Send prompt and stream local inference
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    // Verify model is downloaded
    if (!StorageService.isModelDownloaded(activeModelId)) {
      setIsDownloadModalOpen(true);
      return;
    }

    const userMessage: ChatMessageType = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Update session title if first message
    const isFirstMessage = messages.length === 0;
    const sessionTitle = isFirstMessage 
      ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) 
      : (sessions.find(s => s.id === currentSessionId)?.title || 'Conversation');

    // Assistant placeholder
    const assistantMsgId = 'asst_' + (Date.now() + 1);
    const assistantMessage: ChatMessageType = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      reasoningContent: '',
      timestamp: Date.now(),
      modelUsed: AVAILABLE_MODELS.find(m => m.id === activeModelId)?.name,
      isStreaming: true,
    };

    const messagesWithAsst = [...newMessages, assistantMessage];
    setMessages(messagesWithAsst);
    setIsGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Streaming accumulation
    let accumulatedContent = '';
    let accumulatedReasoning = '';

    await offlineLlm.generateResponse({
      modelId: activeModelId,
      messages: newMessages,
      config: engineConfig,
      signal: abortController.signal,
      onToken: (token: string, isThinking?: boolean) => {
        if (isThinking) {
          accumulatedReasoning += token;
        } else {
          accumulatedContent += token;
        }

        setMessages(prev => 
          prev.map(m => {
            if (m.id === assistantMsgId) {
              return {
                ...m,
                content: accumulatedContent,
                reasoningContent: accumulatedReasoning,
                isThinking: isThinking || false,
              };
            }
            return m;
          })
        );
      },
      onComplete: (stats: { tokensGenerated: number; tokensPerSec: number; reasoningTimeMs?: number }) => {
        setIsGenerating(false);
        setMessages(prev => {
          const finalMessages = prev.map(m => {
            if (m.id === assistantMsgId) {
              return {
                ...m,
                isStreaming: false,
                isThinking: false,
                tokensGenerated: stats.tokensGenerated,
                tokensPerSec: stats.tokensPerSec,
              };
            }
            return m;
          });

          // Update active session
          setSessions(oldSessions =>
            oldSessions.map(s => {
              if (s.id === currentSessionId) {
                return {
                  ...s,
                  title: sessionTitle,
                  messages: finalMessages,
                  updatedAt: Date.now(),
                  modelId: activeModelId,
                };
              }
              return s;
            })
          );

          return finalMessages;
        });
      },
      onError: (errMsg: string) => {
        setIsGenerating(false);
        setSystemAlert(`Generation error: ${errMsg}`);
        setMessages(prev =>
          prev.map(m => {
            if (m.id === assistantMsgId) {
              return {
                ...m,
                isStreaming: false,
                error: errMsg,
              };
            }
            return m;
          })
        );
      }
    });
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  const handleRegenerate = () => {
    if (messages.length < 2 || isGenerating) return;
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;
    const actualIdx = messages.length - 1 - lastUserIdx;
    const userPrompt = messages[actualIdx].content;
    const pruned = messages.slice(0, actualIdx);
    setMessages(pruned);
    handleSendMessage(userPrompt);
  };

  const hasDownloadedModels = StorageService.getDownloadedModels().length > 0;

  // Main UI
  const chatUI = (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-neutral-100 overflow-hidden relative">
      {/* Header */}
      <Header
        activeModelId={activeModelId}
        onOpenModelHub={() => {
          setIsInitialDownloadGate(false);
          setIsDownloadModalOpen(true);
        }}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onNewChat={createNewChat}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
        hardware={hardware}
        onInstallApp={handleInstallApp}
        canInstallApp={true}
      />

      {/* Crash Guard Alert Banner if any */}
      {systemAlert && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between animate-fadeIn z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{systemAlert}</span>
          </div>
          <button
            onClick={() => setSystemAlert(null)}
            className="text-amber-400 hover:text-white text-xs font-semibold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat messages viewport */}
      <div 
        id="chat-messages-container"
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scrollbar-thin"
      >
        {messages.length === 0 ? (
          <EmptyChatState
            activeModelId={activeModelId}
            onSelectPrompt={handleSendMessage}
            onOpenModelHub={() => {
              setIsInitialDownloadGate(false);
              setIsDownloadModalOpen(true);
            }}
          />
        ) : (
          <div className="py-2 w-full max-w-3xl mx-auto flex-1">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={message.isStreaming}
                onRegenerate={
                  message.role === 'assistant' && !message.isStreaming 
                    ? handleRegenerate 
                    : undefined
                }
              />
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        isGenerating={isGenerating}
        activeModelId={activeModelId}
        hasDownloadedModels={hasDownloadedModels}
        onOpenModelHub={() => {
          setIsInitialDownloadGate(false);
          setIsDownloadModalOpen(true);
        }}
      />

      {/* Sidebar Drawer */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
        onOpenModelHub={() => {
          setIsInitialDownloadGate(false);
          setIsDownloadModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Install App & PWABuilder APK Modal */}
      <InstallApkModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Model Download Hub Modal */}
      <ModelDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => {
          if (!isInitialDownloadGate || hasDownloadedModels) {
            setIsDownloadModalOpen(false);
          }
        }}
        isInitialRequired={isInitialDownloadGate && !hasDownloadedModels}
        hardware={hardware}
        activeModelId={activeModelId}
        onSelectModel={handleSelectModel}
        onModelInstalled={handleModelInstalled}
      />

      {/* Hardware & Offline Telemetry Modal */}
      <DeviceStatsModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        hardware={hardware}
        activeModelId={activeModelId}
      />

      {/* Engine Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={engineConfig}
        onChangeConfig={handleConfigChange}
      />
    </div>
  );

  // Desktop Responsive Wrapper: Allows toggling between sleek Mobile Phone Frame and Fluid Viewport
  return (
    <div className="w-screen h-screen bg-neutral-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      {/* Viewport switch pill on desktop displays */}
      <div className="hidden lg:flex fixed top-3 right-4 z-50 items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-full p-1 text-xs text-neutral-300 shadow-xl">
        <button
          onClick={() => setDeviceFrameMode(true)}
          className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
            deviceFrameMode 
              ? 'bg-neutral-800 text-white font-medium shadow-sm' 
              : 'hover:text-white'
          }`}
          title="Simulate mobile phone frame"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Frame</span>
        </button>
        <button
          onClick={() => setDeviceFrameMode(false)}
          className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
            !deviceFrameMode 
              ? 'bg-neutral-800 text-white font-medium shadow-sm' 
              : 'hover:text-white'
          }`}
          title="Fullscreen responsive mode"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Fluid View</span>
        </button>
      </div>

      {deviceFrameMode ? (
        <div className="h-[92vh] max-h-[860px] w-full max-w-[420px] rounded-[44px] p-3.5 bg-neutral-900 border-4 border-neutral-800 shadow-2xl flex flex-col relative animate-fadeIn">
          {/* Mobile phone speaker & camera notch */}
          <div className="w-28 h-5 bg-neutral-950 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neutral-900"></div>
            <div className="w-8 h-1 rounded-full bg-neutral-900"></div>
          </div>

          <div className="flex-1 w-full rounded-[32px] overflow-hidden flex flex-col border border-neutral-800/80 bg-neutral-950 shadow-inner">
            {chatUI}
          </div>

          {/* Home indicator bar */}
          <div className="w-32 h-1 bg-neutral-700/60 rounded-full mx-auto mt-2"></div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col">
          {chatUI}
        </div>
      )}
    </div>
  );
}
