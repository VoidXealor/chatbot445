import { ChatSession, ModelId } from '../types';

const STORAGE_KEY_SESSIONS = 'offline_llm_chat_sessions_v1';
const STORAGE_KEY_ACTIVE_MODEL = 'offline_llm_active_model_v1';
const STORAGE_KEY_DOWNLOADED_MODELS = 'offline_llm_downloaded_models_v1';
const STORAGE_KEY_ENGINE_CONFIG = 'offline_llm_engine_config_v1';

export interface DownloadedModelRecord {
  modelId: ModelId;
  downloadedAt: number;
  sizeBytes: number;
  version: string;
  cacheKey: string;
}

export const StorageService = {
  // Model registry
  getDownloadedModels(): DownloadedModelRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DOWNLOADED_MODELS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDownloadedModel(record: DownloadedModelRecord): void {
    const list = this.getDownloadedModels().filter(m => m.modelId !== record.modelId);
    list.push(record);
    try {
      localStorage.setItem(STORAGE_KEY_DOWNLOADED_MODELS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save downloaded model record', e);
    }
  },

  deleteDownloadedModel(modelId: ModelId): void {
    const list = this.getDownloadedModels().filter(m => m.modelId !== modelId);
    try {
      localStorage.setItem(STORAGE_KEY_DOWNLOADED_MODELS, JSON.stringify(list));
      // Also cleanup any CacheStorage caches if present
      if ('caches' in window) {
        caches.delete(`model-weights-${modelId}`).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to delete model', e);
    }
  },

  isModelDownloaded(modelId: ModelId): boolean {
    return this.getDownloadedModels().some(m => m.modelId === modelId);
  },

  getActiveModel(): ModelId | null {
    try {
      return (localStorage.getItem(STORAGE_KEY_ACTIVE_MODEL) as ModelId) || null;
    } catch {
      return null;
    }
  },

  setActiveModel(modelId: ModelId): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_MODEL, modelId);
    } catch (e) {
      console.error('Failed to set active model', e);
    }
  },

  // Sessions
  getSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  },

  // Config
  getEngineConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ENGINE_CONFIG);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveEngineConfig(config: unknown): void {
    try {
      localStorage.setItem(STORAGE_KEY_ENGINE_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save engine config', e);
    }
  }
};
