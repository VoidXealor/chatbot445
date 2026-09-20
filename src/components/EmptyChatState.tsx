import React from 'react';
import { 
  Sparkles, 
  Code2, 
  Lightbulb, 
  Mail, 
  ShieldCheck, 
  Cpu, 
  WifiOff 
} from 'lucide-react';
import { ModelId } from '../types';
import { AVAILABLE_MODELS } from '../data/models';

interface EmptyChatStateProps {
  activeModelId: ModelId | null;
  onSelectPrompt: (prompt: string) => void;
  onOpenModelHub: () => void;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({
  activeModelId,
  onSelectPrompt,
  onOpenModelHub,
}) => {
  const model = AVAILABLE_MODELS.find(m => m.id === activeModelId);

  const suggestionPrompts = [
    {
      title: 'Science & Nature',
      prompt: 'Why is the sky blue? Explain Rayleigh scattering simply.',
      icon: Lightbulb,
      color: 'text-amber-400'
    },
    {
      title: 'Instant Math',
      prompt: 'What is 15 * 8 and how many kilometers are in 25 miles?',
      icon: Sparkles,
      color: 'text-purple-400'
    },
    {
      title: 'Write Python Code',
      prompt: 'Write an efficient Python binary search algorithm with complexity analysis.',
      icon: Code2,
      color: 'text-blue-400'
    },
    {
      title: 'Creative Poem',
      prompt: 'Write a short atmospheric poem about a quiet rainy night in the city.',
      icon: Mail,
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-xl mx-auto my-auto animate-fadeIn">
      {/* App & Model badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-4 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-white">
          {model ? model.name : 'Local PC LLM Engine'}
        </span>
        <span className="text-neutral-500">•</span>
        <span className="text-emerald-400 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          On-Device Only
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
        How can I help you today?
      </h1>
      <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
        PC-grade intelligence directly in your pocket. Running 100% offline with zero telemetry, zero server APIs, and instant private responses.
      </p>

      {/* Suggestion Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
        {suggestionPrompts.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              id={`starter-prompt-${index}`}
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-neutral-700/80 transition-all text-xs group text-neutral-300 hover:text-white shadow-sm flex flex-col justify-between gap-1.5"
            >
              <div className="flex items-center gap-2 font-medium text-neutral-200">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.title}</span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                "{item.prompt}"
              </p>
            </button>
          );
        })}
      </div>

      {/* Safety Notice */}
      <div className="mt-8 flex items-center gap-2 text-[11px] text-neutral-500">
        <Cpu className="w-3.5 h-3.5 text-neutral-400" />
        <span>Hardware Crash Guard Active • Device RAM Monitored</span>
      </div>
    </div>
  );
};
