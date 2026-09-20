import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  Square, 
  Mic, 
  MicOff, 
  Sparkles, 
  Paperclip, 
  ShieldCheck 
} from 'lucide-react';
import { ModelId } from '../types';
import { AVAILABLE_MODELS } from '../data/models';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  activeModelId: ModelId | null;
  hasDownloadedModels: boolean;
  onOpenModelHub: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  activeModelId,
  hasDownloadedModels,
  onOpenModelHub,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<unknown>(null);

  const activeModel = AVAILABLE_MODELS.find(m => m.id === activeModelId);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Web Speech API for voice dictation
  const handleToggleVoice = () => {
    const SpeechRecognition = 
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition || 
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported by your current browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        (recognitionRef.current as { stop: () => void }).stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new (SpeechRecognition as new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          onresult: (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
          onerror: () => void;
          onend: () => void;
          start: () => void;
          stop: () => void;
        })();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
      } catch (e) {
        console.error('Speech recognition error', e);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasDownloadedModels) {
      onOpenModelHub();
      return;
    }
    if (isGenerating) {
      onStopGeneration();
      return;
    }
    const trimmed = inputText.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full px-3 pb-3 sm:px-4 sm:pb-4 pt-1">
      <div 
        id="chat-input-container"
        className="w-full max-w-3xl mx-auto rounded-2xl bg-neutral-900 border border-neutral-800 focus-within:border-neutral-700 shadow-xl transition-all"
      >
        {/* Model info banner above input */}
        <div className="px-3.5 pt-2 pb-1 flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800/40">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-neutral-300">
              {activeModel ? activeModel.name : 'No model selected'}
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-emerald-400/90 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              100% Offline
            </span>
          </div>

          <button
            id="switch-model-pill"
            onClick={onOpenModelHub}
            className="hover:text-white transition-colors flex items-center gap-1 text-[11px] font-medium"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            Switch Model
          </button>
        </div>

        {/* Input box */}
        <div className="flex items-end gap-2 p-2 sm:p-2.5">
          <button
            id="attach-file-btn"
            type="button"
            onClick={() => alert('Attachments are processed 100% locally on your phone without network transmission.')}
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl transition-colors shrink-0"
            title="Attach file (offline)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            id="chat-textarea"
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasDownloadedModels 
                ? `Message ${activeModel?.name || 'offline model'}...` 
                : 'Download a model to start offline chat...'
            }
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-neutral-500 focus:outline-none resize-none py-1.5 max-h-32 scrollbar-thin leading-relaxed"
          />

          <div className="flex items-center gap-1 shrink-0">
            <button
              id="voice-dictation-btn"
              type="button"
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl transition-colors ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title="Voice input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {isGenerating ? (
              <button
                id="stop-generation-btn"
                type="button"
                onClick={onStopGeneration}
                className="p-2 rounded-xl bg-white text-neutral-900 hover:bg-neutral-200 font-medium transition-colors shadow-sm"
                title="Stop generating"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                id="send-message-btn"
                type="button"
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() && hasDownloadedModels}
                className={`p-2 rounded-xl font-medium transition-all shadow-sm ${
                  inputText.trim() || !hasDownloadedModels
                    ? 'bg-white text-neutral-900 hover:bg-neutral-200 cursor-pointer'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
                title="Send prompt"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="text-center text-[11px] text-neutral-500 mt-2">
        Zero server telemetry. All prompt calculations occur locally on your mobile CPU & GPU.
      </p>
    </div>
  );
};
