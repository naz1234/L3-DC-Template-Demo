# Cloudflare Access login removed

The application no longer validates Cloudflare Access tokens or requires an approved-staff list. Old `AUTH_MODE` and Access variables do not change the application's public access behavior.

An existing Cloudflare Zero Trust Access policy is managed separately and can still present a login before traffic reaches Pages. Remove that gate for the app's hostname to enable direct access. See [public access deployment notes](public-access.md).
