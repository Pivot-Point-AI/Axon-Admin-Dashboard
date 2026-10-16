# Axon Dashboard PDF review

The PDF is a bug report. The user's later screenshots supply visual styling only;
Axon branding, navigation, API integration, and dashboard data are retained.

| PDF item | Result |
| --- | --- |
| 1 | Sidebar stays fixed, no hover expansion, Dashboard links directly to the home page. |
| 2 | Visible field focus/hover states, keyboard focus, button press feedback, consistent blue theme, required-field guidance. |
| 3 | Institution date/time selection has explicit Save and Cancel actions. Draft selection is committed only on Save. |
| 4 | Removed the duplicate auth theme provider, validate saved preferences, apply the saved mode before paint, and handle system theme changes and unavailable storage. |
| 5 | Institution ID copy action and combined ID/license-key copy. Done and modal dismissal remain blocked until clipboard writing succeeds; clipboard errors remain recoverable. |
| 6 | Replaced browser confirmations with styled application dialogs. Modal focus, Escape, and scroll locking support nested dialogs. |
| 7 | Dismissible notifications for successful API mutations and failed requests, automatically dismissed after five seconds. Clipboard feedback uses the same notifier. |
| 8a | Live logs show raw events without filter panels; pause/resume, follow, clear, and reconnect remain below the stream. |
| 8b | Historical requests have a selectable bounded fetch limit and 50-event local pages, with terminal-style raw logs. Structured event/audio details remain available. True server pagination needs a backend change (see below). |
| 9 | Removed Chat History from navigation. Existing bookmarks redirect to Logs. |
| 10 | Breadcrumbs consistently follow the heading at the start of the page. |
| 11 | New User roles are Manager and Viewer only; required markers and native form validation are present. Existing Super Admin accounts remain visible. |
| 12 | Edit control is present with an explanation of why it is disabled. Saving edits needs the missing backend update endpoint. |
| 13 | Configuration Refresh and Edit actions use the blue primary styling; Save retains disabled feedback until a value changes. |
| 14 | Required master-data fields have markers. Active switches update their label/color and correctly interpret false, 0, and serialized false values. Editing also validates required fields. |
| 15 | The PDF ends at “while deacti”. Clarification requested; the specific additional expected behavior is not described. |

## Confirmed backend limits

Read-only inspection of `/admin/openapi.json` on 2026-10-16 showed:

- `/management/{user_id}` supports DELETE only. There is no user update operation.
- `/logs/history` accepts dates, session/user/flow filters, and `limit`. There is
  no offset, cursor, or page parameter. The UI therefore pages the bounded returned
  set and explicitly explains that narrowing the date range locates other events.

No fictitious endpoints or pagination parameters were introduced.

## Validation

- `npm run build`
- `npx tsc --noEmit`
- `node --test scripts/test-pdf-fixes.cjs`

Regression tests use mocked requests, without writing to the live backend. They
cover serialized booleans, inactive bank update payloads, log request limits,
API error propagation/notifications, and HTML escaping in raw logs.
Browser appearance, clipboard permissions, and live backend mutations have not
been verified interactively.
