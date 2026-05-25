# Testing Strategy

- Unit test token hashing, webhook signatures, request validation, and chat ID normalization.
- Integration test `/auth`, `/instances`, `/dashboard/tokens`, and `/messages/send` against a test database.
- Mock the WhatsApp adapter in API tests. Do not require QR login for CI.
- Run worker tests with Redis or a BullMQ-compatible test container.
- Webhook tests should use a local HTTP test server and assert payload, headers, retries, and non-2xx failures.
- Load test enqueueing separately from WhatsApp sending. The API should accept bursts while workers drain at safe per-instance rates.
- Add contract tests for SDK examples so snippets match the published API.
