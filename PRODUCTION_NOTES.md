Production checklist
--------------------

1. Security review & audit
   - Contract a security assessment and penetration test.
   - Review all cryptographic choices and verify threat model.

2. Dependency hygiene
   - Pin all dependencies and maintain an internal mirror or lockfile.
   - Remove unused transitive dependencies where possible.
   - This repo was migrated to Vite to reduce the transitive dependency surface. After pulling these changes run:

```cmd
npm install
npm run audit
npm run audit:fix  # review changes before committing
```

   - Consider migrating further by pinning patch-level versions in package-lock and running `npm ci` in CI environments.

3. Build & deployment
   - Use CI to build artifacts (npm ci, npm run build) in a clean environment.
   - Serve the static build from a hardened CDN or hosting provider with HTTPS.

4. Data handling & privacy
   - Ensure PII handling policy is in place. This app stores nothing server-side by default, but confirm no telemetry is enabled.

5. Monitoring & incident response
   - Prepare incident response plan and contact points.
