import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Cpu, 
  AlertCircle 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate?: () => void;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-3 px-3 sm:px-4 animate-fadeIn">
        <div 
          id={`user-message-${message.id}`}
          className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60 leading-relaxed text-sm break-words whitespace-pre-wrap"
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`assistant-message-${message.id}`}
      className="flex gap-3 my-4 px-3 sm:px-4 text-neutral-200 animate-fadeIn"
    >
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
        <Bot className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        {/* Model header info */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="font-medium text-neutral-300">
            {message.modelUsed || 'Local On-Device LLM'}
          </span>
          {message.tokensPerSec && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
              <Cpu className="w-3 h-3 text-emerald-400" />
              {message.tokensPerSec} tok/s
            </span>
          )}
        </div>

        {/* DeepSeek-R1 / Reasoning Chain-of-Thought Accordion */}
        {message.reasoningContent && (
          <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 overflow-hidden text-xs">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="w-full px-3 py-2 flex items-center justify-between text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-1.5 font-medium text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Thinking Process</span>
              </div>
              {showThinking ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {showThinking && (
              <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/70 text-neutral-300 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                {message.reasoningContent}
              </div>
            )}
          </div>
        )}

        {/* Message Content with Markdown Support */}
        <div className="text-sm leading-relaxed text-neutral-200 break-words prose prose-invert max-w-none">
          {message.content ? (
            <div className="space-y-3">
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    if (isInline) {
                      return (
                        <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <div className="my-3 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                        <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                          <span className="font-mono">{match ? match[1] : 'code'}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                            }}
                            className="hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </button>
                        </div>
                        <pre className="p-3 overflow-x-auto text-xs text-neutral-200 font-mono">
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : isStreaming ? (
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs py-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-200"></span>
              <span className="ml-1 text-neutral-400">Generating offline token stream...</span>
            </div>
          ) : null}

          {/* If there was a generation error */}
          {message.error && (
            <div className="mt-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message.error}</span>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        {!isStreaming && message.content && (
          <div className="flex items-center gap-2 pt-1 text-neutral-400">
            <button
              id={`copy-msg-${message.id}`}
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 transition-colors text-xs flex items-center gap-1"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>

            {'speechSynthesis' in window && (
              <button
                id={`speak-msg-${message.id}`}
                onClick={handleToggleSpeech}
                className={`p-1.5 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 transition-colors text-xs flex items-center gap-1 ${
                  isSpeaking ? 'text-blue-400' : ''
                }`}
                title="Read aloud"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>
            )}

            {onRegenerate && (
              <button
                id={`regenerate-msg-${message.id}`}
                onClick={onRegenerate}
                className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 transition-colors text-xs flex items-center gap-1"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
