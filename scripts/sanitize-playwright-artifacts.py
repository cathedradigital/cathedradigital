#!/usr/bin/env python3
"""Redact authenticated request headers from Playwright ZIP traces before upload."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
import json
import re
import zipfile

SENSITIVE_HEADERS = {
    "authorization",
    "proxy-authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "apikey",
}
BEARER_PATTERN = re.compile(r"(?i)(bearer\s+)[A-Za-z0-9._~+/=-]{16,}")
TEXT_SUFFIXES = {".trace", ".network", ".json", ".har", ".txt", ".log", ".md", ".html"}


def redact_object(value: object) -> tuple[object, int]:
    count = 0
    if isinstance(value, dict):
        # Playwright/ HAR headers are represented as {name, value} objects.
        header_name = value.get("name")
        if isinstance(header_name, str) and header_name.lower() in SENSITIVE_HEADERS and "value" in value:
            value["value"] = "[REDACTED]"
            count += 1
        for key, child in list(value.items()):
            if isinstance(key, str) and key.lower() in SENSITIVE_HEADERS and isinstance(child, str):
                value[key] = "[REDACTED]"
                count += 1
            else:
                value[key], child_count = redact_object(child)
                count += child_count
    elif isinstance(value, list):
        for index, child in enumerate(value):
            value[index], child_count = redact_object(child)
            count += child_count
    return value, count


def scrub_text(data: bytes, suffix: str) -> tuple[bytes, int]:
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        return data, 0

    count = 0
    if suffix in {".trace", ".network", ".json", ".har"}:
        lines = []
        for line in text.splitlines():
            try:
                value = json.loads(line)
            except json.JSONDecodeError:
                cleaned, replacements = BEARER_PATTERN.subn(r"\1[REDACTED]", line)
                count += replacements
                lines.append(cleaned)
                continue
            value, redactions = redact_object(value)
            cleaned = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
            cleaned, replacements = BEARER_PATTERN.subn(r"\1[REDACTED]", cleaned)
            count += redactions + replacements
            lines.append(cleaned)
        result = "\n".join(lines)
        if text.endswith("\n"):
            result += "\n"
        return result.encode("utf-8"), count

    cleaned, count = BEARER_PATTERN.subn(r"\1[REDACTED]", text)
    return cleaned.encode("utf-8"), count


def sanitize_zip(data: bytes, depth: int = 0) -> tuple[bytes, int]:
    if depth > 8:
        raise RuntimeError("Nested ZIP depth exceeded safety limit")
    source = BytesIO(data)
    output = BytesIO()
    redactions = 0

    with zipfile.ZipFile(source, "r") as archive, zipfile.ZipFile(output, "w") as cleaned:
        for info in archive.infolist():
            item = archive.read(info.filename)
            suffix = Path(info.filename).suffix.lower()
            if suffix == ".zip":
                item, nested_count = sanitize_zip(item, depth + 1)
                redactions += nested_count
            elif suffix in TEXT_SUFFIXES:
                item, item_count = scrub_text(item, suffix)
                redactions += item_count
            cleaned.writestr(info, item)

    return output.getvalue(), redactions


def main() -> None:
    roots = [Path("test-results"), Path("playwright-report/data")]
    archives = []
    for root in roots:
        if root.exists():
            archives.extend(path for path in root.rglob("*.zip") if path.is_file())

    total_redactions = 0
    processed = 0
    for archive_path in sorted(set(archives)):
        original = archive_path.read_bytes()
        sanitized, redactions = sanitize_zip(original)
        archive_path.write_bytes(sanitized)
        total_redactions += redactions
        processed += 1

    print(f"Sanitized {processed} Playwright ZIP archives; redacted {total_redactions} sensitive header/token value(s).")
    if not processed:
        print("No Playwright ZIP archives were produced; nothing to sanitize.")


if __name__ == "__main__":
    main()
