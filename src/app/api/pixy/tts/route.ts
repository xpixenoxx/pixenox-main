import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

declare global {
  // eslint-disable-next-line no-var
  var __pixyKokoroBootPromise: Promise<boolean> | null | undefined;
}

const DEFAULT_LOCAL_TTS = "http://127.0.0.1:8000/tts";
const DEFAULT_LOCAL_HEALTH = "http://127.0.0.1:8000/health";

function resolvePythonExecutable(): string {
  const candidates = [
    process.env.PYTHON_PATH,
    "C:\\Python314\\python.exe",
    path.join(process.cwd(), ".venv", "Scripts", "python.exe"),
    "python",
  ].filter((c): c is string => Boolean(c && c.trim()));

  for (const cand of candidates) {
    if (cand === "python" || fs.existsSync(cand)) {
      return cand;
    }
  }
  return "python";
}

async function checkKokoroHealth(healthUrl: string, timeoutMs = 700): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(healthUrl, { signal: ctrl.signal, cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Automatically boots `scripts/kokoro_server.py` in the background during local dev
 * if `127.0.0.1:8000` is not yet running, using the verified Python interpreter + real log fd.
 */
async function ensureLocalKokoroServer(ttsEndpoint: string): Promise<boolean> {
  const isLocalDefault =
    ttsEndpoint.includes("127.0.0.1:8000") || ttsEndpoint.includes("localhost:8000");
  if (!isLocalDefault) return false;

  if (await checkKokoroHealth(DEFAULT_LOCAL_HEALTH)) {
    return true;
  }

  if (!globalThis.__pixyKokoroBootPromise) {
    globalThis.__pixyKokoroBootPromise = (async () => {
      let logFd: number | null = null;
      try {
        const scriptPath = path.join(process.cwd(), "scripts", "kokoro_server.py");
        if (!fs.existsSync(scriptPath)) return false;

        const pythonCmd = resolvePythonExecutable();
        const logPath = path.join(os.tmpdir(), "pixy-kokoro-tts.log");
        logFd = fs.openSync(logPath, "a");

        const child = spawn(pythonCmd, [scriptPath], {
          cwd: process.cwd(),
          detached: true,
          stdio: ["ignore", logFd, logFd],
          windowsHide: true,
          env: { ...process.env, PYTHONUTF8: "1", PYTHONIOENCODING: "utf-8" },
        });
        child.on("error", () => {});
        child.unref();

        fs.closeSync(logFd);
        logFd = null;

        const deadline = Date.now() + 15000;
        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 300));
          if (await checkKokoroHealth(DEFAULT_LOCAL_HEALTH)) {
            return true;
          }
        }
        return false;
      } catch {
        if (logFd !== null) {
          try {
            fs.closeSync(logFd);
          } catch {
            // Ignore
          }
        }
        return false;
      } finally {
        globalThis.__pixyKokoroBootPromise = null;
      }
    })();
  }

  return globalThis.__pixyKokoroBootPromise;
}

// Pre-warm Kokoro server as soon as the API route module loads in dev
void ensureLocalKokoroServer(
  process.env.KOKORO_TTS_URL || process.env.TTS_SERVICE_URL || DEFAULT_LOCAL_TTS
);

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const ttsEndpoint =
      process.env.KOKORO_TTS_URL ||
      process.env.TTS_SERVICE_URL ||
      DEFAULT_LOCAL_TTS;

    const callTts = async (): Promise<Response> => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 14000);
      try {
        return await fetch(ttsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: ctrl.signal,
        });
      } finally {
        clearTimeout(timer);
      }
    };

    let kokoroRes: Response | null = null;
    try {
      kokoroRes = await callTts();
    } catch {
      const booted = await ensureLocalKokoroServer(ttsEndpoint);
      if (booted) {
        try {
          kokoroRes = await callTts();
        } catch {
          kokoroRes = null;
        }
      }
    }

    if (!kokoroRes || !kokoroRes.ok) {
      return new NextResponse(null, { status: 204 });
    }

    const audioBuffer = await kokoroRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
