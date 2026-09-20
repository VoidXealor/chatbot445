import { DownloadProgress, ModelId, ModelMetadata } from '../types';
import { StorageService } from './storage';
import { detectDeviceHardware, evaluateModelSafety } from './hardware';
import { transformersManager } from './transformersManager';

export type DownloadCallback = (progress: DownloadProgress) => void;

class RealModelDownloaderService {
  private activeDownloads = new Map<ModelId, {
    cancelled: boolean;
    abortController: AbortController;
  }>();

  async startDownload(
    model: ModelMetadata,
    onProgress: DownloadCallback,
    _resumeBytes = 0
  ): Promise<void> {
    const modelId = model.id;
    const abortController = new AbortController();
    
    this.activeDownloads.set(modelId, {
      cancelled: false,
      abortController
    });

    try {
      // 1. Strict real network check
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Device is offline! Please connect to Wi-Fi or mobile data to download model weights from Hugging Face.');
      }

      // 2. Hardware and storage check
      const hw = await detectDeviceHardware();
      const safety = evaluateModelSafety(model, hw);
      if (!safety.isSafe && safety.warningLevel === 'danger') {
        throw new Error(safety.reason || 'Insufficient memory or storage for this model.');
      }

      // 3. Download real ONNX model from Hugging Face using Transformers.js
      await transformersManager.getOrLoadPipeline(model, (p: DownloadProgress) => {
        const state = this.activeDownloads.get(modelId);
        if (state?.cancelled) {
          throw new Error('Download cancelled by user');
        }
        onProgress(p);
      });

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Download failed';
      this.activeDownloads.delete(modelId);

      onProgress({
        modelId,
        status: 'error',
        bytesDownloaded: 0,
        totalBytes: model.sizeBytes,
        percentage: 0,
        speedBytesPerSec: 0,
        etaSeconds: 0,
        currentPhase: 'Download aborted',
        errorMessage: errMsg,
        compilationLog: [`[${new Date().toLocaleTimeString()}] ❌ ${errMsg}`]
      });

      throw err;
    } finally {
      this.activeDownloads.delete(modelId);
    }
  }

  cancelDownload(modelId: ModelId): void {
    const state = this.activeDownloads.get(modelId);
    if (state) {
      state.cancelled = true;
      state.abortController.abort();
      this.activeDownloads.delete(modelId);
    }
  }

  pauseDownload(modelId: ModelId): void {
    this.cancelDownload(modelId);
  }

  resumeDownload(model: ModelMetadata, onProgress: DownloadCallback): Promise<void> {
    return this.startDownload(model, onProgress);
  }

  async deleteModel(modelId: ModelId): Promise<void> {
    StorageService.deleteDownloadedModel(modelId);
    transformersManager.unloadModel(modelId);

    // Also remove from CacheStorage
    if (typeof caches !== 'undefined') {
      try {
        const cache = await caches.open('transformers-cache');
        const keys = await cache.keys();
        for (const req of keys) {
          if (req.url.includes(modelId)) {
            await cache.delete(req);
          }
        }
      } catch (e) {
        console.warn('Cache cleanup error', e);
      }
    }
  }
}

export const modelDownloader = new RealModelDownloaderService();
export const ModelDownloader = modelDownloader;
