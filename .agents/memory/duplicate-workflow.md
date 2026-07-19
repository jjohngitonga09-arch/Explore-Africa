---
name: Duplicate API Server workflow
description: There are two API Server workflows; only one works
---

There are two configured workflows for the API server:
- **"API Server"** (old, standalone) — always fails with `EADDRINUSE :8080` because the artifact workflow starts first
- **"artifacts/api-server: API Server"** (correct) — the artifact-managed workflow; this is the one actually serving traffic

**Why:** The project was originally set up with a standalone "API Server" workflow before the artifact system was adopted. Both target port 8080.

**How to apply:** Always restart `artifacts/api-server: API Server`, never the old `API Server` workflow. The old one can be left in FAILED state — it causes no harm. Do not delete it without checking if it has any configuration that differs.
