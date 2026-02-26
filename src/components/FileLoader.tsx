import { useState, useCallback } from "react";
import { inflate } from "pako";
import type { FeatureWindowsFile } from "@/types/sae";

interface FileLoaderProps {
  onLoaded: (data: FeatureWindowsFile) => void;
}

export default function FileLoader({ onLoaded }: FileLoaderProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");

  const processBuffer = useCallback(
    async (buffer: ArrayBuffer) => {
      try {
        setStatus("Processing…");
        setProgress(70);
        const bytes = new Uint8Array(buffer);
        let text: string;
        // Check gzip magic bytes
        if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
          setStatus("Decompressing…");
          const inflated = inflate(bytes);
          text = new TextDecoder().decode(inflated);
        } else {
          // Already decompressed (server may have done it)
          text = new TextDecoder().decode(bytes);
        }
        setStatus("Parsing JSON…");
        setProgress(90);
        const data = JSON.parse(text) as FeatureWindowsFile;
        setProgress(100);
        onLoaded(data);
      } catch (e: any) {
        console.error("Process error:", e);
        setError(e.message ?? "Failed to process file");
        setProgress(null);
      }
    },
    [onLoaded]
  );

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      setProgress(0);
      setStatus("Reading file…");
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 60));
      };
      reader.onload = () => processBuffer(reader.result as ArrayBuffer);
      reader.onerror = () => setError("Failed to read file");
      reader.readAsArrayBuffer(file);
    },
    [processBuffer]
  );

  const handleFetchBundled = useCallback(async () => {
    setError(null);
    setProgress(0);
    setStatus("Downloading…");

    try {
      const resp = await fetch(
        `${import.meta.env.BASE_URL}data/feature_windows_enhanced.json.gz`
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      // If the browser doesn't support streaming, fall back
      if (!resp.body) {
        setProgress(30);
        const buffer = await resp.arrayBuffer();
        setProgress(60);
        await processBuffer(buffer);
        return;
      }

      // Total size (may be null if server doesn't send Content-Length)
      const contentLengthHeader = resp.headers.get("Content-Length");
      const totalBytes = contentLengthHeader ? Number(contentLengthHeader) : null;

      const reader = resp.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;

      // Reserve, e.g., 0–80% for download, 80–100% for processing
      const DOWNLOAD_PORTION = 80;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedBytes += value.byteLength;

          if (totalBytes && totalBytes > 0) {
            setStatus(`Downloading… ${Math.round(receivedBytes/1024/1024)} MB / ${Math.round(totalBytes/1024/1024)} MB`)
            const pct = Math.min(
              DOWNLOAD_PORTION,
              Math.round((receivedBytes / totalBytes) * DOWNLOAD_PORTION)
            );
            setProgress(pct);
          } else {
            setStatus(`Downloading… ${Math.round(receivedBytes/1024/1024)} MB`)
            // No total size known: still show some movement (0..DOWNLOAD_PORTION)
            // This is heuristic; tweak as desired
            const pct = Math.min(
              DOWNLOAD_PORTION,
              5 + Math.floor(Math.log10(receivedBytes + 1) * 15)
            );
            setProgress(pct);
          }
        }
      }

      // Stitch chunks into a single ArrayBuffer
      const all = new Uint8Array(receivedBytes);
      let offset = 0;
      for (const c of chunks) {
        all.set(c, offset);
        offset += c.byteLength;
      }

      setStatus("Processing…");
      setProgress(DOWNLOAD_PORTION);
      await processBuffer(all.buffer);
      setProgress(100);
      setStatus("Done");
    } catch (e: any) {
      console.error("Fetch error:", e);
      setError(e.message ?? "Failed to fetch bundled file");
      setProgress(null);
    }
  }, [processBuffer]);


  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (progress !== null && !error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <p className="text-sm font-medium text-foreground">{status}</p>
        <div className="w-64 h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-200 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{progress}%</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        SAE Feature Viewer
      </h1>
      <p className="text-sm text-muted-foreground text-center">
        Load a <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">feature_windows_enhanced.json.gz</code> file to explore feature activations.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".gz,.json";
          input.onchange = () => input.files?.[0] && handleFile(input.files[0]);
          input.click();
        }}
      >
        <p className="text-sm text-muted-foreground">
          Drop file here or click to browse
        </p>
      </div>

      <button
        onClick={handleFetchBundled}
        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
      >
        or load bundled sample file
      </button>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
