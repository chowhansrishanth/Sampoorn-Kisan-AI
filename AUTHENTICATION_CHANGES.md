# Authentication changes — 2026-09-22

## Result

- Signup → account created → login. Registration returns a sanitized account without a session token or cookie.
- Login → email/mobile + password → authenticated. Existing bcrypt hashing, JWTs, HttpOnly cookies, rate limits and protected-route middleware remain in use.
- Forgot password → registered email → secure reset link → new password → login.
- Removed verification-code and social sign-in handlers, state, screens, API routes, registration proofs, account-linking methods and schema fields.
- Reset tokens contain 32 random bytes, expire after 15 minutes, are stored as SHA-256 digests, and are consumed once. Reset and logout revoke sessions using the existing session-version mechanism. Development reset-link logging was removed. The existing test-only token response remains restricted to `NODE_ENV=test`.
- SMTP configuration and delivery failures return an explicit unavailable response. A failed delivery clears its outstanding token. Password reset now uses the same 8-character minimum and 72-byte maximum as registration.

## Files modified

- `backend/controllers/authController.js`
- `backend/routes/authRoutes.js`
- `backend/models/User.js`
- `frontend/src/pages/LoginGate.jsx`
- `frontend/src/config/firebase.js`
- `frontend/src/index.css`
- `.env.example`, `backend/.env.example`, `frontend/.env.example`
- `backend/.env` was checked and filtered for obsolete authentication variables; no values were disclosed.
- `backend/tests/authFlow.test.js`
- `backend/tests/hardening.test.js`
- `backend/tests/securityPenTest.test.js`
- `backend/tests/fullStackProductionAudit.test.js`
- `backend/tests/release_candidate_audit.js`
- `FINAL_FEATURE_MATRIX.md`
- `FINAL_RELEASE_REPORT.md`
- `Sampoorn_Kisan_AI_Complete_Project_Documentation.md`

Added `backend/tests/authBrowserSmoke.cjs` and this report.

## Files deleted

- `backend/models/OtpChallenge.js`
- `backend/services/otpChallenges.js`
- `backend/services/firebaseIdentity.js`
- `backend/tests/otpPersistence.test.js`

## Dependencies and environment

No package dependencies were removed: `firebase` and `firebase-admin` remain necessary for push notifications; `@google/genai` remains necessary for AI. The `firebase/auth` imports and provider exports were removed. SMTP dependencies remain necessary for reset emails.

Removed `OTP_HMAC_SECRET` from both backend environment examples and `VITE_FIREBASE_AUTH_DOMAIN` from the frontend example/configuration. No Google/Apple OAuth client ID or secret configuration remains in active source. Google application credentials and Firebase project/messaging configuration remain for notifications.

## Verification

- `frontend: npm run build` — passed.
- `frontend: npm run lint` — passed.
- `backend: npm test` — 22/22 suites passed. Three external-service checks were skipped. Results: `.audit/test-results/summary.json`.
- After reset-email handling changes, `backend: npm run test:security` — 13/13 checks passed, including mocked SMTP success/failure, missing mail configuration, token hashing/expiry, concurrent single-use consumption, credential validation, mobile login, removed-route 404s, protected endpoints and logout revocation. Log: `.audit/auth-security.log`.
- `backend: node tests/authBrowserSmoke.cjs` — passed in headless Chrome outside the sandbox, using isolated accounts and an ephemeral test server. Verified disabled empty login, absence of removed UI, signup returning to login without a session, password login, HttpOnly cookie, forgot-password form, reset-link form, return to login and successful use of the new password. No uncaught browser JavaScript errors. Log: `.audit/auth-browser.log`.
- `backend: npm start` — started successfully on isolated port 5097, with an isolated development user store. MongoDB was deliberately unavailable, exercising the existing development fallback. Server stopped after the check.
- Source/reference search found no remaining active removed-authentication implementations. Removed endpoint names remain only in negative regression assertions. Unrelated Google AI/fonts, Firebase messaging and Apple crop/system-font references were preserved.
- No backend build/lint script or frontend unit-test script is defined. The root package has no test script; checks ran in the relevant subprojects.

## Remaining deployment checks and limitations

- Real SMTP delivery and a live production MongoDB round trip were not exercised. Configure `EMAIL_USER`, `EMAIL_PASS`, `FRONTEND_URL` and production MongoDB, then verify inbox delivery. SMTP behavior was tested with an in-memory transport stub; browser recovery used the isolated test-mode reset response.
- Mobile-only accounts have no deliverable recovery email. Users needing email recovery must register an email address. Existing accounts without a password can use email reset when they have a deliverable stored email.
- Existing database records/collections and backup ZIPs were not destructively migrated. Legacy identity fields or challenge collections may remain as inert historical data; no active code consumes them. Existing passwords and accounts were preserved.
- Browser network diagnostics showed expected unauthenticated `/api/auth/me` 401 probes and an unrelated pre-existing `/icon-192.png` 404. No uncaught authentication JavaScript errors occurred.
- This directory is not available as a working Git repository (`git status` fails), so no Git diff or commit was produced.
- Dashboard, AI agents, crops, disease, weather, market, schemes, knowledge, XAI and ML implementation files were not changed.
