"use client";

import React, { useEffect, useId, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const uniqueId = useId().replace(/:/g, "_");
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"diagram" | "code">("diagram");
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // Clean and sanitize chart input
  const cleanChart = chart.trim();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function renderChart() {
      try {
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "base",
          fontFamily:
            "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
          themeVariables: {
            darkMode: false,
            background: "#ffffff",
            fontFamily:
              "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
            fontSize: "13px",
            primaryColor: "#f4f4f5",
            primaryTextColor: "#09090b",
            primaryBorderColor: "#cbd5e1",
            lineColor: "#64748b",
            secondaryColor: "#ffffff",
            secondaryTextColor: "#1e293b",
            secondaryBorderColor: "#e2e8f0",
            tertiaryColor: "#f8fafc",
            tertiaryTextColor: "#334155",
            tertiaryBorderColor: "#e2e8f0",
            mainBkg: "#ffffff",
            nodeBorder: "#94a3b8",
            clusterBkg: "#f8fafc",
            clusterBorder: "#cbd5e1",
            titleColor: "#0f172a",
            edgeLabelBackground: "#ffffff",
          },
        });

        const renderId = `mermaid_svg_${uniqueId}_${Date.now()}`;
        const { svg } = await mermaid.render(renderId, cleanChart);

        if (isMounted) {
          setSvgContent(svg);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("[Mermaid Diagram] Render warning:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Gagal merender diagram. Format kode mungkin memerlukan perbaikan."
          );
          setIsLoading(false);
          // Fallback to code view when diagram cannot be rendered
          setViewMode("code");
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [cleanChart, uniqueId]);

  // Lock body scroll on fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isFullscreen]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(2.2, +(prev + 0.15).toFixed(2)));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(0.4, +(prev - 0.15).toFixed(2)));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(cleanChart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <div
        className={`my-4 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs overflow-hidden transition-all ${className}`}
      >
        {/* Header Toolbar */}
        <div className="px-3.5 py-2.5 bg-zinc-50/90 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Indicator & Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 shadow-2xs text-xs font-semibold text-zinc-800">
              <span className="icon-[lucide--network] size-3.5 text-zinc-600" />
              <span>Diagram Arsitektur</span>
            </div>

            {/* Toggle Diagram vs Code */}
            {!error && (
              <div className="inline-flex rounded-lg bg-zinc-200/70 p-0.5 text-xs font-medium text-zinc-600">
                <button
                  type="button"
                  onClick={() => setViewMode("diagram")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    viewMode === "diagram"
                      ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Visual
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("code")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    viewMode === "code"
                      ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Kode
                </button>
              </div>
            )}
          </div>

          {/* Right: Actions (Zoom, Fullscreen, Copy) */}
          <div className="flex items-center gap-1.5 text-xs">
            {viewMode === "diagram" && !error && !isLoading && (
              <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  disabled={scale <= 0.4}
                  className="size-7 rounded-md flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 disabled:opacity-40 transition-colors"
                >
                  <span className="text-sm font-bold leading-none">−</span>
                </button>
                <span className="text-[11px] font-mono px-1.5 text-zinc-500 min-w-[3rem] text-center select-none">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  disabled={scale >= 2.2}
                  className="size-7 rounded-md flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 disabled:opacity-40 transition-colors"
                >
                  <span className="text-sm font-bold leading-none">+</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="size-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                >
                  <span className="icon-[lucide--refresh-cw] size-3" />
                </button>
              </div>
            )}

            {/* Expand / Fullscreen */}
            {viewMode === "diagram" && !error && !isLoading && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                title="Buka Layar Penuh"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 shadow-2xs transition-colors font-medium text-[11px]"
              >
                <span className="icon-[lucide--maximize-2] size-3" />
                <span className="hidden sm:inline">Perbesar</span>
              </button>
            )}

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyCode}
              title="Salin Kode Mermaid"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 shadow-2xs transition-colors font-medium text-[11px]"
            >
              {copied ? (
                <>
                  <span className="icon-[lucide--check-circle-2] size-3 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <span className="icon-[lucide--file-code-2] size-3 text-zinc-500" />
                  <span className="hidden sm:inline">Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Canvas */}
        <div className="relative min-h-[220px] max-h-[580px] overflow-auto bg-zinc-50/40 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] p-4 sm:p-6 transition-all">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400 font-mono text-xs">
              <span className="size-6 rounded-full border-2 border-zinc-300 border-t-zinc-800 animate-spin" />
              <span>Merender diagram alur...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 text-xs space-y-2 mb-3">
              <div className="flex items-center gap-2 font-semibold">
                <span className="icon-[lucide--info] size-4 text-amber-600" />
                <span>Format kode Mermaid beralih ke tampilan kode</span>
              </div>
              <p className="text-amber-800/90 leading-relaxed font-mono text-[11px]">
                {error}
              </p>
            </div>
          )}

          {viewMode === "diagram" && svgContent && (
            <div
              ref={containerRef}
              className="flex justify-center items-center w-full min-h-[180px] transition-transform duration-150 origin-top"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}

          {viewMode === "code" && (
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 font-mono text-xs">
              <div className="px-3.5 py-1.5 bg-zinc-900 text-zinc-400 text-[10px] uppercase tracking-wider border-b border-zinc-800 flex items-center justify-between">
                <span>Mermaid Syntax</span>
                <span>{cleanChart.split("\n").length} baris</span>
              </div>
              <pre className="p-4 overflow-x-auto leading-relaxed select-text text-zinc-200">
                <code>{cleanChart}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-3.5 py-1.5 bg-white border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Geser horizontal / gunakan tombol zoom untuk navigasi detail.</span>
          <span className="font-mono">Mermaid Engine</span>
        </div>
      </div>

      {/* Fullscreen Interactive Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-zinc-950/85 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between pb-3 text-white border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
                <span className="icon-[lucide--network] size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Diagram Arsitektur Sistem (Fullscreen)
                </h3>
                <p className="text-xs text-zinc-400">
                  Gunakan zoom kontrol atau scroll untuk menjelajahi seluruh modul
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen Zoom Controls */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-white">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.4}
                  className="size-7 rounded flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  <span className="font-bold">−</span>
                </button>
                <span className="text-xs font-mono px-2 text-zinc-300 min-w-[3rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={scale >= 2.2}
                  className="size-7 rounded flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  <span className="font-bold">+</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="size-7 rounded flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <span className="icon-[lucide--refresh-cw] size-3" />
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="size-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <span className="icon-[lucide--x] size-4" />
              </button>
            </div>
          </div>

          {/* Fullscreen Canvas */}
          <div className="flex-1 overflow-auto rounded-xl mt-3 p-6 sm:p-10 bg-white border border-zinc-800/50 flex items-center justify-center bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:20px_20px]">
            {svgContent && (
              <div
                ref={fullscreenContainerRef}
                className="w-full flex justify-center items-center transition-transform duration-150"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
