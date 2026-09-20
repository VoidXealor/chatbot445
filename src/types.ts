export type ModelId = 
  | 'smollm2-135m'
  | 'qwen-1.5-0.5b'
  | 'smollm2-360m'
  | 'llama-3.2-1b'
  | 'deepseek-r1-1.5b';

export interface ModelMetadata {
  id: ModelId;
  name: string;
  tagline: string;
  publisher: string;
  architecture: string;
  quantization: string;
  huggingFaceRepo: string;
  sizeBytes: number; // in bytes
  formattedSize: string;
  minRamGb: number;
  recommendedRamGb: number;
  speedRating: 'Ultra Fast' | 'Fast' | 'Balanced' | 'Advanced';
  crashRisk: 'None (Safe)' | 'Very Low' | 'Low' | 'Moderate' | 'High';
  hasReasoning: boolean; // DeepSeek-R1 / Gemini Thinking style
  contextWindow: number;
  description: string;
  tags: string[];
  compileTarget: 'WebGPU Shader' | 'WASM SIMD' | 'Auto (Mobile Safe)';
}

export type DownloadStatus = 
  | 'idle' 
  | 'checking-network' 
  | 'downloading-weights' 
  | 'compiling-engine'
  | 'compiling-webgpu' 
  | 'allocating-buffers' 
  | 'ready' 
  | 'paused' 
  | 'error';

export interface DownloadProgress {
  modelId: ModelId;
  status: DownloadStatus;
  bytesDownloaded: number;
  totalBytes: number;
  percentage: number;
  speedBytesPerSec: number;
  etaSeconds: number;
  currentPhase: string;
  activeFile?: string;
  compilationLog?: string[];
  errorMessage?: string;
  canResume?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoningContent?: string; // For <think> block like DeepSeek-R1
  isThinking?: boolean;
  timestamp: number;
  modelUsed?: string;
  tokensGenerated?: number;
  tokensPerSec?: number;
  isStreaming?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  modelId: ModelId;
  messages: ChatMessage[];
}

export interface DeviceHardwareInfo {
  deviceMemoryGb?: number;
  hardwareConcurrency: number;
  webGpuSupported: boolean;
  webGpuAdapterName?: string;
  storageQuotaBytes: number;
  storageUsageBytes: number;
  storageAvailableBytes: number;
  isMobileDevice: boolean;
  platform: string;
  crashGuardActive: boolean;
  isOnline: boolean;
}

export interface ModelEngineConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  enableThinking: boolean;
  streamSpeed: 'fast' | 'natural' | 'instant';
  compilationBackend: 'auto' | 'webgpu' | 'wasm';
  inferenceMode?: 'auto' | 'local-only' | 'cloud-accelerated';
}

export interface GenerationStats {
  tokensGenerated: number;
  tokensPerSec: number;
  reasoningTimeMs?: number;
}

export interface StreamGenerationOptions {
  modelId: ModelId;
  messages: ChatMessage[];
  config: ModelEngineConfig;
  signal?: AbortSignal;
  onToken: (token: string, isThinking?: boolean) => void;
  onComplete: (stats: GenerationStats) => void;
  onError: (errMsg: string) => void;
}

