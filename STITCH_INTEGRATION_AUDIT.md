# Stitch integration audit and mapping

Completed before application edits. The existing frontend checkpoint is `.audit/pre-stitch-frontend.zip`.

## Existing architecture

React 19 + Vite, React Router lazy routes, Axios credential/token client, React state with Theme/Language contexts and local session storage. Shared UI primitives, resource loading hook, Web Speech hooks, Firebase messaging and offline IndexedDB support already exist. CSS is plain CSS with inline styles; Tailwind is not installed or needed.

Express routes/controllers/services serve authentication, crop, disease, agents, weather/mandi, knowledge, alerts, farm management and calculators. JWT/cookie/session-version protection and bcrypt remain unchanged. Production requires MongoDB; local development has a file store. Python crop/disease services and federated service are separate deployments; unavailable services must remain unavailable in the UI. Weather uses Open-Meteo, prices use the existing market service, and schemes/knowledge use the existing curated sources. AI chat has authenticated SSE/fallback requests, context/memory, speech and seven language options.

## Reference inventory

The export contains DESIGN.md, five generated HTML screens, four screenshots, and nine architecture/deployment/release documents plus a root package file. XAI has HTML but no screenshot. DESIGN.md and all screen structures were inspected; the backend replacement plan is reference material only and will not be executed. Its synthetic fallback proposal conflicts with the user's real-data requirement.

## Screen mapping

| Stitch reference | Existing functionality | Integration |
|---|---|---|
| Farmer Command Center | `/dashboard`, Dashboard.jsx; weather/mandi/alerts/profile/FL services | Shared sidebar/topbar, real farm overview and tonal widgets. `/` becomes the same command center. |
| Sahayak assistant | `/chat`, AIChat.jsx | Preserve SSE, memory, retries, speech, language and message actions; restyle conversation and farm context. |
| Crop recommendation/economics | `/crop-tool` currently financial calculator; `/xai` currently calls crop model | Reuse one real prediction/explanation component in both screens, retain financial/planning tabs. |
| Disease diagnosis | `/disease`, DiseaseDiagnosis.jsx | Retain file/camera/sample upload, history, speech/share/print; remove client-fabricated diagnosis and only show returned outputs. |
| XAI transparency | `/xai` and existing `/api/crop/recommend` | Actual returned explanation values; empty/error states instead of simulated SHAP/LIME/privacy metrics. |
| Weather / mandi | Existing Dashboard sections, `/mandi-forecast` | Sidebar links to real dashboard sections and existing forecast route; no invented endpoints. |
| Government schemes / knowledge | `/knowledge`, existing tabs/filter/source links | Deep-link the real tabs and unify cards/forms. |
| Alerts | `/alerts` | Existing stored alerts/dismiss API and severity mapping. |
| Settings | ProfileModal → FarmProfileWizard | Sidebar/topbar open the existing editable profile. |
| Other farm modules | All existing routes in App.jsx | Available under expandable tools navigation; consistent shared design and responsive forms. |
| Authentication | LoginGate + ResetPassword | Centered form only; no auth architecture changes or removed methods restored. |

## Audit findings to address

- XAI currently fabricates confidence, SHAP/LIME and summary metrics; disease fabricates successful diagnosis on errors. Remove these presentation fallbacks.
- Dashboard has static soil measurements and a fallback price; use real profile/weather fields or unavailable states.
- Missing `/icon-192.png` and `/icon-512.png` are referenced by manifest, notifications and service worker. Supply valid local icons; correct manifest shortcut paths to existing routes.
- Initial session restoration performs an intentional credentialed `/me` probe, including cookie-only sessions. Preserve security and deduplicate StrictMode requests rather than bypassing validation.
- AIChat was mounted without its existing `user` prop; pass the actual authenticated user for farm context and memory isolation.
- No new runtime libraries, backend routes, model contracts or demo data will be added.

## Sequence

Tokens/primitives → shell → dashboard → assistant → crop → disease → XAI → remaining modules → auth visuals → responsive/accessibility cleanup → full regression and visual comparison.

## Implementation status

- Added the shared responsive `AppShell` with Stitch-inspired navigation, top bar, mobile drawer, offline state, theme/language controls, and profile access.
- Added the Stitch token layer in `frontend/src/design-system.css` and aligned shared cards, buttons, headings, request states, and authentication primitives.
- Removed client-side fabricated disease diagnoses and XAI explanations. These screens now show model-unavailable states when the backend does not return data.
- Removed fabricated dashboard soil telemetry and net-return values; the dashboard now renders unavailable states until a connected sensor or market calculation supplies observations.
- Corrected the PWA icon references to the existing `frontend/public/favicon.svg` asset.
- Authentication remains the existing centered login, signup, and reset-link flow. No OTP, Google, Apple, or promotional auth panel was added.
