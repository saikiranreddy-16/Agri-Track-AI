# Manual QA Checklist – AgriTrack AI

A step-by-step checklist to verify AgriTrack AI features manually.

---

## 1. Authentication & Security Safeguards

- [ ] **Login Form Validation**:
  - Enter invalid credentials (e.g. non-numeric PIN) and verify the form blocks submission or displays a standard validator message.
  - Verify JWT session cookies use `HttpOnly` and `Secure` settings in production.
- [ ] **XSS Sanitization check**:
  - Enter raw html strings (e.g., `<script>alert(1)</script>`) in Customer Name or Machine Display Name.
  - Submit and reload: verify the output strips tags safely.
- [ ] **Account Ownership Partition**:
  - Try to fetch records using another Farm Admin's ID in URL query parameters. Verify it blocks access with a 403 Forbidden status.

---

## 2. Company Admin Workflows

- [ ] **Dashboard rendering**:
  - Verify stats and charts render.
- [ ] **Device Replacement**:
  - Initiate a device replacement, select a target device, provide reasons, and check if replacement finishes.

---

## 3. Farm Admin Workflows

- [ ] **Vehicle configurations**:
  - Register a machinery profile.
  - Add details (chassis, brand) and ensure registration succeeds.
- [ ] **Telemetry Map views**:
  - Verify path tracing lines and status pins are rendered correctly on the Leaflet map container.
