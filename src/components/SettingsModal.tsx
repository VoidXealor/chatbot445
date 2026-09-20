import React from 'react';
import { X, Sliders, Sparkles, Shield, RotateCcw } from 'lucide-react';
import { ModelEngineConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelEngineConfig;
  onChangeConfig: (newConfig: ModelEngineConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onChangeConfig({
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      systemPrompt: 'You are an intelligent, helpful AI running 100% locally and privately on the user\'s mobile device.',
      enableThinking: true,
      streamSpeed: 'natural',
      compilationBackend: 'auto',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        id="inference-settings-modal"
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-5 text-neutral-100 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-white">Inference Engine Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Inference Execution Mode Selector */}
          <div className="space-y-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Inference Engine Mode</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">
                {config.inferenceMode === 'local-only' ? '100% Offline Air-Gapped' : 'Smart Auto'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, inferenceMode: 'auto' })}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  (config.inferenceMode || 'auto') === 'auto'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="font-semibold text-[11px] text-white">Hybrid Cloud & Local</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">High-speed reasoning with automatic offline fallback</div>
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, inferenceMode: 'local-only' })}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  config.inferenceMode === 'local-only'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="font-semibold text-[11px] text-white">100% Local Only</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Zero cloud requests, zero API calls, air-gapped on device</div>
              </button>
            </div>
          </div>

          {/* Thinking Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Chain-of-Thought Reasoning</span>
              </div>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Show step-by-step thinking for DeepSeek-R1 and reasoning models.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.enableThinking}
              onChange={(e) => onChangeConfig({ ...config, enableThinking: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-neutral-800 border-neutral-700"
            />
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Temperature (Creativity)</span>
              <span className="font-mono text-neutral-300">{config.temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={config.temperature}
              onChange={(e) => onChangeConfig({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>Precise / Factual</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Generation Streaming Speed */}
          <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="font-semibold text-white">Streaming Speed</span>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['fast', 'natural', 'instant'] as const).map(speed => (
                <button
                  key={speed}
                  onClick={() => onChangeConfig({ ...config, streamSpeed: speed })}
                  className={`py-1.5 rounded-lg border text-center capitalize transition-colors ${
                    config.streamSpeed === speed
                      ? 'bg-blue-600 border-blue-500 text-white font-medium'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="font-semibold text-white">System Prompt</span>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => onChangeConfig({ ...config, systemPrompt: e.target.value })}
              rows={2}
              className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-700"
              placeholder="Set model behavior..."
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-neutral-900 font-semibold text-xs hover:bg-neutral-200 transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
