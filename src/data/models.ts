import { ModelMetadata } from '../types';

export const AVAILABLE_MODELS: ModelMetadata[] = [
  {
    id: 'smollm2-135m',
    name: 'SmolLM2 135M Instruct',
    tagline: 'Ultra-lightweight real model (Instant test)',
    publisher: 'HuggingFace',
    architecture: 'Llama-based 135M',
    quantization: 'q4 / onnx-mobile',
    huggingFaceRepo: 'HuggingFaceTB/SmolLM2-135M-Instruct',
    sizeBytes: 130 * 1024 * 1024, // ~130 MB real quantized ONNX weights
    formattedSize: '130 MB',
    minRamGb: 0.5,
    recommendedRamGb: 1,
    speedRating: 'Ultra Fast',
    crashRisk: 'None (Safe)',
    hasReasoning: false,
    contextWindow: 2048,
    compileTarget: 'Auto (Mobile Safe)',
    description: 'Genuine open-source model from Hugging Face. Small enough to download over mobile data in seconds, compiles fast, and will never crash your browser tab.',
    tags: ['Real HF Model', '130 MB Real Download', '45+ tok/s', 'Zero Crash Risk']
  },
  {
    id: 'qwen-1.5-0.5b',
    name: 'Qwen 2.5 0.5B Instruct',
    tagline: 'High-accuracy compact multilingual model',
    publisher: 'Qwen / ONNX Community',
    architecture: 'Qwen 2.5 500M',
    quantization: 'q4 (4-bit ONNX)',
    huggingFaceRepo: 'onnx-community/Qwen2.5-0.5B-Instruct',
    sizeBytes: 350 * 1024 * 1024, // ~350 MB
    formattedSize: '350 MB',
    minRamGb: 1.0,
    recommendedRamGb: 1.5,
    speedRating: 'Fast',
    crashRisk: 'Very Low',
    hasReasoning: false,
    contextWindow: 4096,
    compileTarget: 'WebGPU Shader',
    description: 'Official Xenova ONNX model for browser runtime. Outstanding conversational capability, multilingual reasoning, and code generation.',
    tags: ['Real HF ONNX', 'Xenova', '30 tok/s', 'High Accuracy']
  },
  {
    id: 'smollm2-360m',
    name: 'SmolLM2 360M Instruct',
    tagline: 'Optimized on-device instruction model',
    publisher: 'HuggingFace',
    architecture: 'Llama-based 360M',
    quantization: 'q4_k_m (4-bit)',
    huggingFaceRepo: 'HuggingFaceTB/SmolLM2-360M-Instruct',
    sizeBytes: 215 * 1024 * 1024, // 215 MB
    formattedSize: '215 MB',
    minRamGb: 0.8,
    recommendedRamGb: 1.5,
    speedRating: 'Ultra Fast',
    crashRisk: 'None (Safe)',
    hasReasoning: false,
    contextWindow: 4096,
    compileTarget: 'Auto (Mobile Safe)',
    description: 'Trained on high-quality synthetic and web data. Fast execution with low memory footprint on mobile devices.',
    tags: ['Real HF Model', 'Fast Download', '35 tok/s', 'Safe for All Phones']
  },
  {
    id: 'llama-3.2-1b',
    name: 'Llama 3.2 1B Instruct',
    tagline: 'Meta\'s premier edge model for mobile',
    publisher: 'Meta / ONNX Community',
    architecture: 'Llama 3.2 1.2B',
    quantization: 'int4 ONNX WebGPU',
    huggingFaceRepo: 'onnx-community/Llama-3.2-1B-Instruct',
    sizeBytes: 740 * 1024 * 1024, // 740 MB
    formattedSize: '740 MB',
    minRamGb: 1.5,
    recommendedRamGb: 2.5,
    speedRating: 'Fast',
    crashRisk: 'Low',
    hasReasoning: false,
    contextWindow: 4096,
    compileTarget: 'WebGPU Shader',
    description: 'Real Meta Llama 3.2 weights compiled for ONNX WebGPU runtime. Excellent instruction adherence, writing, and logic.',
    tags: ['Real Llama 3.2', 'Meta AI', '20-28 tok/s', 'Requires 2GB RAM']
  },
  {
    id: 'deepseek-r1-1.5b',
    name: 'DeepSeek-R1 Distill 1.5B',
    tagline: 'Real reasoning model with thinking steps',
    publisher: 'DeepSeek / ONNX Community',
    architecture: 'Qwen2.5-R1 1.7B',
    quantization: 'q4_k_s ONNX',
    huggingFaceRepo: 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX',
    sizeBytes: 940 * 1024 * 1024, // 940 MB
    formattedSize: '940 MB',
    minRamGb: 2.0,
    recommendedRamGb: 3.5,
    speedRating: 'Balanced',
    crashRisk: 'Moderate',
    hasReasoning: true,
    contextWindow: 4096,
    compileTarget: 'WebGPU Shader',
    description: 'Official distilled DeepSeek-R1 model on Hugging Face. Generates full step-by-step reasoning <think> blocks before answering.',
    tags: ['Real DeepSeek R1', 'Chain of Thought', 'Math & Code', '940 MB']
  }
];

export const DEFAULT_MODEL_ID = 'smollm2-135m';
