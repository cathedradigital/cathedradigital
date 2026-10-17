#!/usr/bin/env python3
"""Regression tests for Playwright artifact sanitization."""
from __future__ import annotations

from io import BytesIO
import importlib.util
import json
from pathlib import Path
import unittest
import zipfile

MODULE_PATH = Path(__file__).with_name("sanitize-playwright-artifacts.py")
SPEC = importlib.util.spec_from_file_location("playwright_sanitizer", MODULE_PATH)
assert SPEC and SPEC.loader
SANITIZER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SANITIZER)


class SanitizerTests(unittest.TestCase):
    def test_redacts_sensitive_headers_and_bearer_tokens_in_jsonl(self):
        trace = {
            "request": {
                "headers": [
                    {"name": "Authorization", "value": "Bearer abcdefghijklmnopqrstuvwxyz123456"},
                    {"name": "Cookie", "value": "sb-session=secret-cookie"},
                    {"name": "x-supabase-auth-token", "value": "secret-supabase-token"},
                ],
                "access_token": "secret-access-token",
            }
        }
        cleaned, count = SANITIZER.scrub_text((json.dumps(trace) + "\n").encode(), ".trace")
        output = cleaned.decode()
        self.assertGreaterEqual(count, 4)
        for secret in (
            "abcdefghijklmnopqrstuvwxyz123456",
            "secret-cookie",
            "secret-supabase-token",
            "secret-access-token",
        ):
            self.assertNotIn(secret, output)
        self.assertIn("[REDACTED]", output)

    def test_redacts_supabase_storage_state_jwt_and_query_tokens(self):
        jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.signature-value-long"
        storage_value = json.dumps({
            "access_token": jwt,
            "refresh_token": "refresh-secret-value",
            "token_type": "bearer",
        })
        trace = {
            "origins": [{
                "origin": "http://127.0.0.1:4173",
                "localStorage": [
                    {"name": "sb-project-auth-token", "value": storage_value},
                    {"name": "profile-cache", "value": storage_value},
                ],
            }],
            "request": {"url": f"https://example.test/path?access_token=query-secret&keep=yes"},
        }
        cleaned, count = SANITIZER.scrub_text((json.dumps(trace) + "\n").encode(), ".trace")
        output = cleaned.decode()
        self.assertGreaterEqual(count, 4)
        for secret in (jwt, "refresh-secret-value", "query-secret"):
            self.assertNotIn(secret, output)
        self.assertIn("keep=yes", output)

    def test_redacts_tokens_in_nested_zip(self):
        inner = BytesIO()
        with zipfile.ZipFile(inner, "w") as archive:
            archive.writestr("network.json", json.dumps({
                "headers": [{"name": "x-auth-token", "value": "secret-header-value"}],
                "authorization": "Bearer abcdefghijklmnopqrstuvwxyz123456",
            }))
        outer = BytesIO()
        with zipfile.ZipFile(outer, "w") as archive:
            archive.writestr("nested.zip", inner.getvalue())

        cleaned, count = SANITIZER.sanitize_zip(outer.getvalue())
        self.assertGreaterEqual(count, 2)
        with zipfile.ZipFile(BytesIO(cleaned)) as archive:
            with zipfile.ZipFile(BytesIO(archive.read("nested.zip"))) as nested:
                output = nested.read("network.json").decode()
        self.assertNotIn("secret-header-value", output)
        self.assertNotIn("abcdefghijklmnopqrstuvwxyz123456", output)

    def test_plain_text_bearer_token_is_redacted(self):
        cleaned, count = SANITIZER.scrub_text(
            b"authorization: Bearer abcdefghijklmnopqrstuvwxyz123456", ".log"
        )
        self.assertEqual(count, 1)
        self.assertNotIn(b"abcdefghijklmnopqrstuvwxyz123456", cleaned)


if __name__ == "__main__":
    unittest.main()
