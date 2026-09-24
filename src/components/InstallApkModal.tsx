import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallApkModal: React.FC<InstallApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'pwabuilder' | 'studio'>('pwa');

  if (!isOpen) return null;

  // The published app URL or current origin
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-sr3oxyxdhtnvnjmjm7ln5t-111243490662.asia-southeast1.run.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-5 h-5 text-neutral-950 font-bold" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Install App & APK Builder</h2>
              <p className="text-xs text-neutral-400">Run 100% offline on Android or Desktop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Direct Install (Easiest)
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pwabuilder'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            PWABuilder (APK)
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            Android Studio
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero-Build Instant WebAPK Installation</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Modern Android devices automatically convert installable PWAs into signed standalone APKs via Google Play services — no APK compiling required!
                </p>
              </div>

              {isInstalled ? (
                <div className="p-4 rounded-2xl bg-neutral-800/80 border border-neutral-700 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-white">App is already installed!</p>
                  <p className="text-[11px] text-neutral-400">
                    Running in standalone mode with offline storage & WebGPU active.
                  </p>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={async () => {
                    const ok = await install();
                    if (ok) onClose();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all text-sm"
                >
                  <Download className="w-4 h-4" />
                  Install App to Phone / PC Now
                </button>
              ) : (
                <div className="space-y-2.5">
                  <p className="font-medium text-white">To install on your phone directly from Chrome:</p>
                  <ol className="list-decimal pl-4 space-y-2 text-neutral-400 text-[11px]">
                    <li>Open this app link in <strong className="text-white">Google Chrome</strong> on your Android phone.</li>
                    <li>Tap the <strong className="text-white">three dots (⋮)</strong> menu in Chrome's top right.</li>
                    <li>Tap <strong className="text-emerald-400">"Install app"</strong> or <strong className="text-emerald-400">"Add to Home screen"</strong>.</li>
                    <li>Chrome and Android will automatically package it into a native launcher icon on your phone!</li>
                  </ol>
                </div>
              )}

              {isIOS && (
                <div className="p-3.5 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 text-[11px] text-neutral-400 space-y-1">
                  <p className="text-white font-medium">On iPhone / iPad (Safari):</p>
                  <p>1. Tap the <strong className="text-white">Share</strong> icon at the bottom of Safari.</p>
                  <p>2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/20 text-[11px] text-neutral-300">
                <span className="font-semibold text-blue-400 block mb-1">PWABuilder by Microsoft</span>
                PWABuilder analyzes the Web App Manifest & Service Worker and generates a packaged <code className="text-white bg-neutral-800 px-1 py-0.5 rounded">.apk</code> file for direct sideloading or Google Play.
              </div>

              {/* URL Copy Box */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1.5 font-medium">
                  Your Published PWA URL:
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-transparent text-[11px] text-neutral-200 outline-none truncate font-mono"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2.5 text-[11px]">
                <p className="font-semibold text-white">How to generate your APK:</p>
                <div className="space-y-2 text-neutral-400">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                    <p>Make sure you clicked the black <strong className="text-white">Publish</strong> button in AI Studio top toolbar so the link is public.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                    <p>Open <strong className="text-blue-400">PWABuilder.com</strong> and paste your published URL.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                    <p>Click <strong className="text-white">Start</strong> → <strong className="text-white">Package for Stores</strong> → select <strong className="text-emerald-400">Android</strong> → <strong className="text-white">Download APK</strong>!</p>
                  </div>
                </div>
              </div>

              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors text-xs"
              >
                <span>Open PWABuilder.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {activeTab === 'studio' && (
            <div className="space-y-3.5 text-[11px]">
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-neutral-300">
                <span className="font-semibold text-purple-400 block mb-1">Android Studio & Capacitor CLI</span>
                Build an offline APK directly on your laptop with Gradle.
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-white">Commands to compile APK on your laptop:</p>
                <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[10px] overflow-x-auto leading-relaxed">
{`# 1. Build the production offline bundle
npm run build

# 2. Sync web assets to Android
npx cap sync android

# 3. Compile the debug APK
cd android && ./gradlew assembleDebug

# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk`}
                </pre>
              </div>

              <p className="text-neutral-400">
                You can install <code className="text-neutral-200">app-debug.apk</code> directly on any Android phone using <code className="text-neutral-200">adb install</code> or sending it via WhatsApp/Telegram!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-between text-xs">
          <span className="text-neutral-400 text-[11px]">All models run 100% offline once downloaded</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
