#!/usr/bin/env python3
"""Redact authentication secrets from Playwright ZIP traces before upload."""
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
    "api-key",
    "api_key",
    "x-auth-token",
    "x-supabase-auth-token",
    "supabase-auth-token",
    "access_token",
    "refresh_token",
    "id_token",
    "token",
    "auth_token",
    "auth-token",
    "session_token",
    "session-token",
    "supabase_auth_token",
}
BEARER_PATTERN = re.compile(r"(?i)(bearer\s+)[A-Za-z0-9._~+/=-]{16,}")
JWT_PATTERN = re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")
SENSITIVE_PARAM_PATTERN = re.compile(r"(?i)([?&#](?:access_token|refresh_token|id_token|auth_token|token|apikey|api_key)=)[^&#\s]+")
AUTH_STORAGE_NAME_PATTERN = re.compile(r"(?i)(?:auth|access|refresh|session)[_-]?token")
TEXT_SUFFIXES = {".trace", ".network", ".json", ".har", ".txt", ".log", ".md", ".html"}


def scrub_string(value: str) -> tuple[str, int]:
    count = 0
    value, replacements = BEARER_PATTERN.subn(r"\1[REDACTED]", value)
    count += replacements
    value, replacements = JWT_PATTERN.subn("[REDACTED_JWT]", value)
    count += replacements
    value, replacements = SENSITIVE_PARAM_PATTERN.subn(r"\1[REDACTED]", value)
    count += replacements
    return value, count


def redact_object(value: object) -> tuple[object, int]:
    count = 0
    if isinstance(value, dict):
        # Playwright/HAR headers and localStorage entries use {name, value}.
        field_name = value.get("name")
        if isinstance(field_name, str):
            normalized_name = field_name.lower()
            is_secret_field = normalized_name in SENSITIVE_HEADERS
            is_auth_storage = "auth-token" in normalized_name or bool(
                AUTH_STORAGE_NAME_PATTERN.search(normalized_name)
            )
            if (is_secret_field or is_auth_storage) and isinstance(value.get("value"), str):
                value["value"] = "[REDACTED]"
                count += 1

        for key, child in list(value.items()):
            normalized_key = key.lower() if isinstance(key, str) else ""
            if normalized_key in SENSITIVE_HEADERS and isinstance(child, str):
                value[key] = "[REDACTED]"
                count += 1
            elif isinstance(child, str):
                # Trace files can embed storageState/response JSON inside a
                # string-valued field. Parse it before recursively scrubbing.
                stripped = child.lstrip()
                if normalized_key in {"value", "body", "text", "data"} and stripped.startswith(("{", "[")):
                    try:
                        embedded = json.loads(child)
                    except json.JSONDecodeError:
                        cleaned, replacements = scrub_string(child)
                        value[key] = cleaned
                        count += replacements
                    else:
                        embedded, embedded_count = redact_object(embedded)
                        value[key] = json.dumps(embedded, ensure_ascii=False, separators=(",", ":"))
                        count += embedded_count
                        cleaned, replacements = scrub_string(value[key])
                        value[key] = cleaned
                        count += replacements
                else:
                    cleaned, replacements = scrub_string(child)
                    value[key] = cleaned
                    count += replacements
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
                cleaned, replacements = scrub_string(line)
                count += replacements
                lines.append(cleaned)
                continue
            value, redactions = redact_object(value)
            cleaned = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
            cleaned, replacements = scrub_string(cleaned)
            count += redactions + replacements
            lines.append(cleaned)
        result = "\n".join(lines)
        if text.endswith("\n"):
            result += "\n"
        return result.encode("utf-8"), count

    cleaned, count = scrub_string(text)
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
