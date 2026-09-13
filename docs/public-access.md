# Public application access

The main application and its operational APIs are available without signing in. Opening the site loads the depot page and initializes the D1 schema directly. There is no email allowlist, PIN request, Turnstile check, session expiry, online-staff identity display, or sign-out action in the app.

ODO Reading, Admin, and About appear directly in the navigation and open without a password. Alarm (ALM), Overtime (OVT), Checklist (CHK), Roster (ROS), and Train Washing (WSH) have been removed from navigation and routing, including their short route aliases. Old bookmarks for these pages show Page Not Found. The Protected pages menu, shared admin credentials, and per-tab unlock state have been removed. Admin notes load when the Admin page is first opened.

The middleware retains the same-origin check on POST, PUT, PATCH, and DELETE requests.

## Deploying an existing Pages project

1. Deploy this revision with the existing `DB` binding. The app does not read `AUTH_MODE` or any other former login setting, so stale settings cannot re-enable the login.
2. If a Cloudflare Zero Trust Access application still covers the site's hostname or Pages preview hostname, remove that gate for this app in Cloudflare. That edge policy runs before the repository's code and is managed separately.
3. Remove the unused Pages `AUTH_EMAIL_SERVICE` binding and former `AUTH_*`, `TURNSTILE_*`, `CF_ACCESS_*`, and `OCC_ALLOWED_EMAILS` configuration when convenient. None is needed by the app.
4. The standalone `workers/auth-email` mailer and `oauth-info-site` are retired companion projects. They are not part of the Pages app build and are no longer called by it; decommission their deployments separately if they are no longer needed.

Keep the existing D1 database and operational records. Historical auth migrations remain in source so already-applied migration history stays intact; the app no longer reads the auth tables. This change does not delete database records or deployed companion projects.

## Verification

- Open `/` and a bookmarked app route in a fresh browser session: the app should render without a code prompt or session request.
- Open `/login` or `/login.html`: both should redirect to `/`.
- Call a former `/api/auth/*` endpoint: it should return `410 Gone` without contacting the mailer or authentication database.
- Load and save app data from the same origin: normal D1 operations should work without a login cookie.
