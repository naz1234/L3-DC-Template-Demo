# Train Removal preset update

## Production access

The application opens directly without signing in. The email-PIN screen, Turnstile check, session requirement, online-staff display, and sign-out control have been removed. Application pages and operational APIs no longer require an approved email address or Cloudflare Access token.

Existing `/login` and `/login.html` links redirect to `/`. Retired `/api/auth/*` endpoints return `410 Gone`. See [public access deployment notes](docs/public-access.md) for the separate Cloudflare Access gate and obsolete auth configuration.

- 12am rows now use the same steel-blue whole-row theme as 7pm, Fri, Sat and PH.
- Selecting 12am under West Depot automatically selects 12am under East Depot.
- West and East 12am rows still restore from their own saved preset data.
- 7pm TIDs 207, 209 and 211 remain violet.
- Duplicate rows remain red and take visual priority.
- Lint and production build passed.
## West master preset sync

Selecting any removal preset on West Depot now automatically selects the matching preset on East Depot. Each depot keeps and restores its own saved rows.

