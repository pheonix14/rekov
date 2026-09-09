import logging
import sys
import os
import io
from datetime import datetime

class SafeStreamHandler(logging.StreamHandler):
    """A StreamHandler that never crashes on encoding errors.
    
    Forces UTF-8 output on Windows consoles that default to cp1252,
    and replaces any remaining unencodable characters with '?'.
    """
    def __init__(self):
        # Wrap sys.stdout in a UTF-8 writer that replaces bad chars
        stream = io.TextIOWrapper(
            sys.stdout.buffer, encoding='utf-8', errors='replace', line_buffering=True
        )
        super().__init__(stream)

    def emit(self, record):
        try:
            msg = self.format(record)
            self.stream.write(msg + self.terminator)
            self.stream.flush()
        except Exception:
            self.handleError(record)


class ColorFormatter(logging.Formatter):
    """Custom logging formatter for terminal colors."""

    grey = "\x1b[38;20m"
    cyan = "\x1b[36;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    green = "\x1b[32;20m"
    reset = "\x1b[0m"

    format_str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    FORMATS = {
        logging.DEBUG: grey + format_str + reset,
        logging.INFO: cyan + format_str + reset,
        logging.WARNING: yellow + format_str + reset,
        logging.ERROR: red + format_str + reset,
        logging.CRITICAL: bold_red + format_str + reset,
        25: green + format_str + reset,
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno, self.format_str)
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)


# Add custom SUCCESS level before anything else
logging.addLevelName(25, "SUCCESS")

def _success(self, message, *args, **kws):
    if self.isEnabledFor(25):
        self._log(25, message, args, **kws)

logging.Logger.success = _success


def setup_logger(name="rekov_system"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Prevent adding multiple handlers if setup is called more than once
    if logger.handlers:
        return logger

    # --- Console Handler (UTF-8 safe, with colors) ---
    ch = SafeStreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(ColorFormatter())

    # --- File Handler (plain text, UTF-8 encoded) ---
    log_dir = os.path.join(os.path.dirname(__file__), "data", "logs")
    os.makedirs(log_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join(log_dir, f"system_{timestamp}.log")

    fh = logging.FileHandler(log_file, encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    fh.setFormatter(file_formatter)

    logger.addHandler(ch)
    logger.addHandler(fh)

    return logger


# Expose a ready-to-use default instance
sys_logger = setup_logger()
