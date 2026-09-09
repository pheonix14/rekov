import subprocess
import os
import sys
import threading
import time
import io
from logger import sys_logger


_ERROR_KEYWORDS = {"traceback", "error:", "exception:", "failed", "fatal", "critical"}
_INFO_KEYWORDS = {"info:", "started", "startup", "running on", "waiting for", "complete", "ready"}


def read_stream(stream, name, is_stderr=False):
    """Read output from a subprocess stream and route it to the correct log level."""
    for raw_line in iter(stream.readline, b""):
        line = raw_line.decode("utf-8", errors="replace").strip()
        if not line:
            continue
        lower = line.lower()
        if any(kw in lower for kw in _ERROR_KEYWORDS):
            sys_logger.error(f"[{name}] {line}")
        elif is_stderr and not any(kw in lower for kw in _INFO_KEYWORDS):
            sys_logger.warning(f"[{name}] {line}")
        else:
            sys_logger.info(f"[{name}] {line}")
    stream.close()


def run_process(cmd, cwd, name):
    """Launch a subprocess and stream its output to the logger."""
    sys_logger.info(f"[{name}] Spawning: {' '.join(cmd)}")
    try:
        process = subprocess.Popen(
            cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            env=os.environ.copy(),
        )
        threading.Thread(target=read_stream, args=(process.stdout, name, False), daemon=True).start()
        threading.Thread(target=read_stream, args=(process.stderr, name, True), daemon=True).start()
        return process
    except Exception as e:
        sys_logger.error(f"[{name}] Failed to start: {e}")
        return None


def main():
    sys_logger.success("==================================================")
    sys_logger.success("  REKOV -- Unified System Launcher")
    sys_logger.success("==================================================")
    sys_logger.info("")
    sys_logger.info("  Single process managing all services.")
    sys_logger.info("  Backend + Frontend launched together.")
    sys_logger.info("")

    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "rekov")
    frontend_dir = os.path.join(root_dir, "rekoviu")

    # ---- 1. Backend dependencies ----
    sys_logger.info("[SETUP] Installing backend dependencies...")
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt", "--quiet"],
            cwd=backend_dir, check=True,
        )
        sys_logger.success("[SETUP] Backend dependencies ready.")
    except subprocess.CalledProcessError as e:
        sys_logger.error(f"[SETUP] Backend dependencies failed: {e}")
        sys.exit(1)

    # ---- 2. Frontend dependencies ----
    sys_logger.info("[SETUP] Installing frontend dependencies...")
    try:
        subprocess.run(["cmd", "/c", "npm", "install", "--silent"], cwd=frontend_dir, check=True)
        sys_logger.success("[SETUP] Frontend dependencies ready.")
    except subprocess.CalledProcessError as e:
        sys_logger.error(f"[SETUP] Frontend dependencies failed: {e}")
        sys.exit(1)

    # ---- 3. Launch both services ----
    backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    frontend_cmd = ["cmd", "/c", "npm", "run", "dev"]

    backend_process = run_process(backend_cmd, backend_dir, "API")
    frontend_process = run_process(frontend_cmd, frontend_dir, "UI")

    sys_logger.success("==================================================")
    sys_logger.success("  ALL SYSTEMS ONLINE")
    sys_logger.success("==================================================")
    sys_logger.info("")
    sys_logger.info("  -> http://localhost:3000         (Application)")
    sys_logger.info("  -> http://localhost:3000/kiosk    (Self-Service)")
    sys_logger.info("  -> http://localhost:8000/docs     (API Docs)")
    sys_logger.info("")
    sys_logger.info("  Press Ctrl+C to stop.")
    sys_logger.info("")

    # ---- 4. Keep-alive loop ----
    try:
        while True:
            if backend_process and backend_process.poll() is not None:
                sys_logger.error(f"API process exited (code {backend_process.returncode})")
                break
            if frontend_process and frontend_process.poll() is not None:
                sys_logger.error(f"UI process exited (code {frontend_process.returncode})")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        sys_logger.warning("Shutting down...")
    finally:
        sys_logger.info("Terminating child processes...")
        if backend_process and backend_process.poll() is None:
            backend_process.terminate()
        if frontend_process and frontend_process.poll() is None:
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(frontend_process.pid)],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
        sys_logger.success("System shutdown complete.")


if __name__ == "__main__":
    main()
