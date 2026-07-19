# Testing Guidelines – AgriTrack AI

This document details the testing architecture, configurations, and scripts for AgriTrack AI.

## 1. Test Architecture

### Backend Unit & Integration Tests
- **Framework**: Vitest (Node environment)
- **Database**: isolated memory container via `mongodb-memory-server`
- **API pings**: Mocked integrations using `supertest`
- **Target Coverage**: >=90%

### Frontend Component Tests
- **Framework**: Vitest (JSDOM environment) + React Testing Library
- **Target Coverage**: >=85%

### End-to-End (E2E) Browser Tests
- **Framework**: Playwright (automates headless browser navigations)

---

## 2. Executing Automated Tests

### Backend Unit & Integration Tests
Run unit tests and print code coverage reports:
```bash
cd backend
npm run test
npm run test:coverage
```

### Frontend Component Tests
```bash
npm run test
npm run test:coverage
```

### Playwright E2E Tests
```bash
npx playwright test
```
