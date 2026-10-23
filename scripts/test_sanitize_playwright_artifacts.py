import importlib.util
import json
from pathlib import Path
import unittest

MODULE_PATH = Path(__file__).with_name("sanitize-playwright-artifacts.py")
SPEC = importlib.util.spec_from_file_location("sanitize_playwright_artifacts", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
SANITIZER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SANITIZER)
scrub_text = SANITIZER.scrub_text


class PasswordRedactionTests(unittest.TestCase):
    def test_redacts_password_input_value_in_html(self):
        source = b'<input id="auth-password" type="password" value="E2E-secret-123" />'
        cleaned, count = scrub_text(source, ".html")
        self.assertNotIn(b"E2E-secret-123", cleaned)
        self.assertIn(b'value="[REDACTED]"', cleaned)
        self.assertEqual(count, 1)

    def test_redacts_password_input_when_value_precedes_type(self):
        source = b'<input value="E2E-secret-123" type="password" id="auth-password">'
        cleaned, count = scrub_text(source, ".html")
        self.assertNotIn(b"E2E-secret-123", cleaned)
        self.assertIn(b'value="[REDACTED]"', cleaned)
        self.assertEqual(count, 1)

    def test_redacts_password_fields_and_snapshot_html_in_trace_json(self):
        payload = {
            "type": "password",
            "value": "E2E-secret-123",
            "snapshot": '<input type="password" value="E2E-secret-123">',
        }
        source = (json.dumps(payload) + "\\n").encode()
        cleaned, count = scrub_text(source, ".trace")
        self.assertNotIn(b"E2E-secret-123", cleaned)
        self.assertIn(b"[REDACTED]", cleaned)
        self.assertGreaterEqual(count, 2)

    def test_does_not_redact_email_input_value(self):
        source = b'<input type="email" value="test@example.com">'
        cleaned, count = scrub_text(source, ".html")
        self.assertIn(b"test@example.com", cleaned)
        self.assertEqual(count, 0)


if __name__ == "__main__":
    unittest.main()
