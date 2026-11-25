import io
import os
import sys
import threading
import urllib.request
from pathlib import Path

# Guard against detached Windows spawn (stdio="ignore" / pythonw) where stdout/stderr are None
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w", encoding="utf-8")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w", encoding="utf-8")

import soundfile as sf
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from kokoro_onnx import Kokoro
from pydantic import BaseModel

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
HOME = Path.home()

MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx"
VOICES_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin"


def find_existing_file(env_key: str, filenames: list[str]) -> str | None:
    env_val = os.environ.get(env_key, "").strip()
    if env_val and "path\\to" not in env_val.lower() and Path(env_val).is_file():
        return str(Path(env_val).resolve())

    search_dirs = [
        HERE,
        ROOT,
        HOME / "Downloads",
        HOME / "Desktop",
        HOME / "Documents",
        HOME,
    ]
    for base in search_dirs:
        if not base.is_dir():
            continue
        for fname in filenames:
            direct = base / fname
            if direct.is_file():
                return str(direct.resolve())
        # Shallow 1-subfolder check (e.g. Downloads/kokoro-tts/kokoro-v1.0.onnx)
        try:
            for sub in base.iterdir():
                if sub.is_dir() and not sub.name.startswith(".") and sub.name != "node_modules":
                    for fname in filenames:
                        cand = sub / fname
                        if cand.is_file():
                            return str(cand.resolve())
        except PermissionError:
            continue
    return None


def download_with_progress(url: str, dest: Path) -> str:
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")
    print(f"[Kokoro TTS] Downloading {dest.name} ...")

    def reporthook(block_num: int, block_size: int, total_size: int):
        downloaded = block_num * block_size
        if total_size > 0:
            pct = min(100.0, downloaded * 100.0 / total_size)
            mb_done = downloaded / (1024 * 1024)
            mb_tot = total_size / (1024 * 1024)
            sys.stdout.write(f"\r  -> {mb_done:6.1f} / {mb_tot:6.1f} MB ({pct:5.1f}%)")
            sys.stdout.flush()

    urllib.request.urlretrieve(url, str(tmp), reporthook=reporthook)
    print()
    tmp.replace(dest)
    return str(dest.resolve())


model_path = find_existing_file(
    "KOKORO_MODEL_PATH",
    ["kokoro-v1.0.onnx", "kokoro-v0_19.onnx", "kokoro.onnx"],
)
if not model_path:
    model_path = download_with_progress(MODEL_URL, HERE / "kokoro-v1.0.onnx")

voices_path = find_existing_file(
    "KOKORO_VOICES_PATH",
    ["voices-v1.0.bin", "voices.bin", "voices.json"],
)
if not voices_path:
    voices_path = download_with_progress(VOICES_URL, HERE / "voices-v1.0.bin")

VOICE = os.environ.get("KOKORO_VOICE", "af_heart")
SPEED = float(os.environ.get("KOKORO_SPEED", "1.05"))

print(f"[Kokoro TTS] Model : {model_path}")
print(f"[Kokoro TTS] Voices: {voices_path} (voice={VOICE}, speed={SPEED})")
kokoro = Kokoro(model_path, voices_path)
synth_lock = threading.Lock()

app = FastAPI(title="Pixy Kokoro TTS Server")


class TTSRequest(BaseModel):
    text: str
    voice: str | None = None
    speed: float | None = None


@app.get("/health")
def health():
    return {"ok": True, "voice": VOICE}


@app.post("/tts")
def synthesize(req: TTSRequest):
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Missing text")

    with synth_lock:
        samples, sample_rate = kokoro.create(
            text,
            voice=req.voice or VOICE,
            speed=req.speed or SPEED,
            lang="en-us",
        )

    buf = io.BytesIO()
    sf.write(buf, samples, sample_rate, format="WAV")
    return Response(content=buf.getvalue(), media_type="audio/wav")


if __name__ == "__main__":
    print("\n[Kokoro TTS] Ready on http://127.0.0.1:8000/tts\n", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=8000, log_config=None)
