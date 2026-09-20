import { DeviceHardwareInfo, ModelMetadata } from '../types';

export async function detectDeviceHardware(): Promise<DeviceHardwareInfo> {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || (window.innerWidth < 768);

  // RAM in GB if supported by browser (e.g. Chrome on Android)
  const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;

  // WebGPU support check
  let webGpuSupported = false;
  let webGpuAdapterName: string | undefined = undefined;

  if ('gpu' in navigator && (navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu) {
    try {
      const adapter = await (navigator as unknown as { gpu: { requestAdapter: () => Promise<{ info?: { architecture?: string; description?: string } } | null> } }).gpu.requestAdapter();
      if (adapter) {
        webGpuSupported = true;
        webGpuAdapterName = adapter.info?.description || adapter.info?.architecture || 'Hardware Accelerated GPU';
      }
    } catch {
      webGpuSupported = false;
    }
  }

  // Storage estimation
  let storageQuotaBytes = 10 * 1024 * 1024 * 1024; // Default fallback 10GB
  let storageUsageBytes = 0;

  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota) storageQuotaBytes = estimate.quota;
      if (estimate.usage) storageUsageBytes = estimate.usage;
    } catch (e) {
      console.warn('Storage estimate failed', e);
    }
  }

  const storageAvailableBytes = Math.max(0, storageQuotaBytes - storageUsageBytes);

  return {
    deviceMemoryGb: deviceMemory,
    hardwareConcurrency,
    webGpuSupported,
    webGpuAdapterName,
    storageQuotaBytes,
    storageUsageBytes,
    storageAvailableBytes,
    isMobileDevice: isMobile,
    platform: navigator.platform || (isMobile ? 'Mobile' : 'Desktop'),
    crashGuardActive: true,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
}

export function evaluateModelSafety(
  model: ModelMetadata, 
  hardware: DeviceHardwareInfo
): { isSafe: boolean; warningLevel: 'none' | 'caution' | 'danger'; reason?: string } {
  // If storage is insufficient
  if (hardware.storageAvailableBytes < model.sizeBytes * 1.3) {
    return {
      isSafe: false,
      warningLevel: 'danger',
      reason: `Insufficient device storage. Need ${model.formattedSize}, but only ${(hardware.storageAvailableBytes / (1024 * 1024)).toFixed(0)} MB available.`
    };
  }

  // If detected RAM is lower than minimum RAM
  if (hardware.deviceMemoryGb !== undefined) {
    if (hardware.deviceMemoryGb < model.minRamGb) {
      return {
        isSafe: false,
        warningLevel: 'danger',
        reason: `Your device reports ${hardware.deviceMemoryGb}GB RAM. This model requires minimum ${model.minRamGb}GB and will likely cause your mobile browser tab to crash.`
      };
    }
    if (hardware.deviceMemoryGb < model.recommendedRamGb) {
      return {
        isSafe: true,
        warningLevel: 'caution',
        reason: `Your device has ${hardware.deviceMemoryGb}GB RAM. ${model.name} will run, but other apps in the background may be closed by Android/iOS memory manager.`
      };
    }
  } else if (hardware.isMobileDevice && model.sizeBytes > 1.5 * 1024 * 1024 * 1024) {
    // Unknown RAM on mobile for models > 1.5GB
    return {
      isSafe: true,
      warningLevel: 'caution',
      reason: `Mobile browser memory limits are strict. For guaranteed stability with zero crashes, smaller models like SmolLM2 (215 MB) or Llama 3.2 (680 MB) are safest.`
    };
  }

  return {
    isSafe: true,
    warningLevel: 'none'
  };
}
