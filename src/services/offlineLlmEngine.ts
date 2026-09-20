import { ModelId, ChatMessage, StreamGenerationOptions } from '../types';
import { AVAILABLE_MODELS } from '../data/models';
import { StorageService } from './storage';
import { transformersManager } from './transformersManager';

class OfflineLlmEngine {
  private static instance: OfflineLlmEngine;
  private isProcessing = false;

  public static getInstance(): OfflineLlmEngine {
    if (!OfflineLlmEngine.instance) {
      OfflineLlmEngine.instance = new OfflineLlmEngine();
    }
    return OfflineLlmEngine.instance;
  }

  public isBusy(): boolean {
    return this.isProcessing;
  }

  public async generateResponse(options: StreamGenerationOptions): Promise<void> {
    if (this.isProcessing) {
      options.onError('Another generation is already running. Please wait.');
      return;
    }

    this.isProcessing = true;
    const { modelId, messages, config, onToken, onComplete, onError, signal } = options;

    try {
      const model = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];

      // Check if model has been downloaded
      const isDownloaded = StorageService.isModelDownloaded(model.id) || transformersManager.isModelLoadedInMemory(model.id);
      
      if (!isDownloaded) {
        throw new Error(`Model "${model.name}" has not been downloaded to your device yet. Please open Model Manager to download its ONNX weights.`);
      }

      // Execute real in-browser neural text generation via Transformers.js (WebGPU / WASM)
      await transformersManager.generateText({
        model,
        messages,
        config,
        onToken,
        onComplete: (stats) => {
          onComplete(stats);
        },
        onError: (err) => {
          onError(err);
        },
        signal
      });

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error generating on-device response';
      onError(errMsg);
    } finally {
      this.isProcessing = false;
    }
  }
}

export const offlineLlm = OfflineLlmEngine.getInstance();
