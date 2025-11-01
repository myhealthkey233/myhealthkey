## Security Policy

If you discover a security vulnerability, please report it directly to the maintainers.

Minimum recommended process:

- Do not create public issues for security reports.
- Prefer encrypted email to the project owner. If not available, create a private issue.

This repository is intended for local deployment. Before production deployment:

- Review and pin dependency versions.
- Run `npm audit` and address high/critical findings.
- Consider migrating to a modern bundler (Vite) to reduce transitive dependency surface.
