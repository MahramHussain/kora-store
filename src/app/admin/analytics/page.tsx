"use client";

import { useState, useEffect } from "react";
import { 
  FiExternalLink, 
  FiAlertCircle, 
  FiRefreshCw, 
  FiSmartphone, 
  FiMonitor, 
  FiInfo 
} from "react-icons/fi";

export default function AdminAnalyticsPage() {
  const shareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [overrideMobile, setOverrideMobile] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    // 1. Detect mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    // 2. Set timeout for iframe loading diagnostic
    setLoadTimeout(false);
    setIframeLoaded(false);
    
    if (!shareUrl) return;

    const timer = setTimeout(() => {
      setLoadTimeout(true);
    }, 6000); // 6 seconds threshold

    return () => clearTimeout(timer);
  }, [retryKey, shareUrl]);

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Site Traffic Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track visitors, page views, and store engagement in real-time
          </p>
        </div>

        {shareUrl && (
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-kora hover:bg-purple-700 text-white font-black px-5 py-3 rounded-2xl transition-all uppercase tracking-wider text-[11px] shadow-md shadow-kora/20 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Open dashboard in new tab</span>
            <FiExternalLink className="text-xs" />
          </a>
        )}
      </div>

      {shareUrl ? (
        isMobile && !overrideMobile ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full pointer-events-none" />
            
            <div className="space-y-4">
              <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">
                <FiSmartphone className="text-kora text-2xl animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Mobile Analytics Hub</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  For the best viewing experience and to bypass strict mobile browser privacy policies, we recommend opening the interactive dashboard in a new tab.
                </p>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
              <div className="flex gap-2.5 items-start">
                <FiInfo className="text-slate-400 text-sm shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Mobile browsers (especially Safari on iOS) block cookies and local storage inside cross-site embeds by default to prevent cross-site tracking. Running the dashboard directly in its own tab avoids this restriction.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-kora hover:bg-purple-700 text-white font-black px-6 py-4 rounded-2xl transition-all uppercase tracking-wider text-[11px] shadow-lg shadow-kora/20 text-center hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Live Dashboard</span>
                <FiExternalLink className="text-sm" />
              </a>
              <button
                onClick={() => setOverrideMobile(true)}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-bold px-6 py-4 rounded-2xl border border-slate-200 transition-all uppercase tracking-wider text-[10px]"
              >
                <FiMonitor className="text-sm" />
                <span>Try Embedded view</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-3 shadow-sm overflow-hidden h-[800px] flex flex-col relative">
            {!iframeLoaded && !loadTimeout && (
              <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center rounded-2xl z-10">
                <div className="relative w-10 h-10 mb-4">
                  <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-kora animate-spin" />
                </div>
                <p className="font-bold text-slate-400 uppercase tracking-[0.15em] text-[10px]">Loading Dashboard</p>
              </div>
            )}

            {!iframeLoaded && loadTimeout && (
              <div className="absolute inset-0 bg-slate-50/95 flex flex-col items-center justify-center p-6 text-center rounded-2xl z-10">
                <div className="max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-12 h-12 bg-amber-50 border border-amber-200/60 rounded-2xl flex items-center justify-center text-amber-500 mx-auto text-xl shadow-xs">
                    <FiAlertCircle />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Dashboard Blocked or Slow?</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto font-medium">
                      If the dashboard doesn't appear, your browser's tracking protection (like Safari's "Prevent Cross-Site Tracking") or an AdBlocker may be blocking cross-origin embedded frames.
                    </p>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow inline-flex items-center justify-center gap-2 bg-kora hover:bg-purple-700 text-white font-black px-4 py-3 rounded-xl transition-all uppercase tracking-wider text-[10px] shadow-md shadow-kora/10"
                    >
                      <span>Open in New Tab</span>
                      <FiExternalLink />
                    </a>
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-bold px-4 py-3 rounded-xl border border-slate-200 transition-all uppercase tracking-wider text-[10px]"
                    >
                      <FiRefreshCw />
                      <span>Retry</span>
                    </button>
                  </div>

                  {isMobile && (
                    <button
                      onClick={() => setOverrideMobile(false)}
                      className="text-[9px] text-slate-400 hover:text-slate-600 underline font-semibold block mx-auto pt-2"
                    >
                      Back to mobile-friendly view
                    </button>
                  )}
                </div>
              </div>
            )}

            <iframe
              key={retryKey}
              src={shareUrl}
              className="w-full flex-grow border-0 rounded-2xl"
              onLoad={() => setIframeLoaded(true)}
              allowFullScreen
            />
          </div>
        )
      ) : (
        <div className="bg-white border border-slate-200/85 p-6 sm:p-10 rounded-3xl shadow-sm space-y-8 max-w-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full pointer-events-none" />
          
          <div className="space-y-4">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200/60 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">
              📈
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Analytics Integration Required</h3>
              <p className="text-xs text-slate-400 mt-0.5">Setup Umami cloud tracking to monitor your traffic statistics directly in this dashboard.</p>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Setup Instructions</h4>
            
            <ol className="space-y-4 text-xs text-slate-600 list-decimal pl-4 leading-relaxed font-bold">
              <li>
                <span className="text-slate-800">Register on Umami:</span> Create a free account at{" "}
                <a href="https://umami.is" target="_blank" rel="noopener noreferrer" className="text-kora hover:underline">
                  umami.is
                </a>
              </li>
              <li>
                <span className="text-slate-800">Add Kora Store:</span> Add a new website domain (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">korastore.ae</code>) in the settings.
              </li>
              <li>
                <span className="text-slate-800">Enable Dashboard Share:</span> Go to website settings &rarr; <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">Share</code>, click <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">Add</code> to generate a public share link.
              </li>
              <li>
                <span className="text-slate-800">Configure Environment Keys:</span> Add the following lines to your project's <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">.env.local</code> or hosting platform configuration panel:
              </li>
            </ol>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-[11px] text-slate-700 space-y-1.5 shadow-inner">
              <p className="text-slate-400"># Set your website tracking ID</p>
              <p>
                <span className="text-purple-600 font-bold">NEXT_PUBLIC_UMAMI_WEBSITE_ID</span>
                =
                <span className="text-slate-900 font-semibold">"{websiteId || "a6fbf8e8-ee68-4cd4-a2a5-e3c3bfa1e11e"}"</span>
              </p>
              <div className="h-px bg-slate-200/80 my-2" />
              <p className="text-slate-400"># Set your public share url to view metrics here</p>
              <p>
                <span className="text-purple-600 font-bold">NEXT_PUBLIC_UMAMI_SHARE_URL</span>
                =
                <span className="text-slate-900 font-semibold">"https://cloud.umami.is/share/..."</span>
              </p>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200/40 rounded-2xl text-[11px] text-amber-800 font-medium leading-relaxed">
              💡 <span className="font-bold text-amber-900">Pro-tip:</span> Once these environment variables are set and the app is restarted (or redeployed), this instructions wizard will automatically be replaced with your live analytics charts!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
