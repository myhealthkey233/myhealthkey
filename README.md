# MyHealthKey (local)

Local reproduction of the Base44 app for locking/unlocking PDF patient records.

This repository has been migrated from Create React App (react-scripts) to Vite to reduce transitive dependencies and improve developer experience. The app still runs entirely in the browser and performs client-side encryption/decryption using the Web Crypto API.

Quick start (after cloning):

1. npm install
2. npm run dev

Build for production:

1. npm run build
2. npm run preview

Audit and fixing guidance:

- Run `npm audit` to view advisories.
- Use `npm run audit:fix` to attempt automatic fixes (this runs `npm audit fix --force`). This can upgrade packages in breaking ways — review changes before committing.

Why Vite?

- Smaller and more modern dev toolchain with fewer transitive dependencies.
- Faster cold-start and HMR during development.

Files of interest:

- `src/Layout.js` — app header, navigation and footer
- `src/pages/Lock.js` — lock/encrypt page and UI
- `src/pages/Unlock.js` — unlock/decrypt page and UI
- `src/App.js`, `src/index.js`, `src/styles.css`
- `index.html` — Vite entry file (project root)

Security notes:

- The app derives keys via PBKDF2 (SHA-256) and uses AES-GCM for authenticated encryption. PBKDF2 iterations were increased to 200000 in this scaffold.
- All crypto happens in the user's browser — the server does not see keys or plaintext.
- Before any production deployment (especially for government usage), perform a formal security review and dependency audit.

If you want, I can continue by:

- Running a guided dependency pinning and `npm audit` session (I can prepare the package changes; you run the commands locally), or
- Proceeding to add unit tests and a small GitHub Actions workflow to run tests and produce artifacts.
# MyHealthKey (local)

This is a small React scaffold reproducing the Base44 UI for locking and unlocking PDF patient records. It includes on-device encryption and decryption using the Web Crypto API and mirrors the app's UI from the screenshots.

Production notes
- This project is intended as a starting point. Before deploying in production for real patient data (e.g., for a Ministry of Health), perform the security hardening steps below.

Recommended production checklist
- Use a supported Node.js LTS version (Node 18+ recommended).
- Pin exact dependency versions and run `npm audit` to address vulnerabilities.
- Consider migrating from `react-scripts` (Create React App) to `Vite` for a smaller dependency surface and faster builds.
- Review cryptography parameters. This scaffold uses PBKDF2 with 200k iterations and AES-GCM 256.
- Implement a secure deployment pipeline and host on a trusted provider. Serve over HTTPS only.

How to run (development)
- Install dependencies and start the dev server (for local testing):

```cmd
cd "c:\Users\zzz\Downloads\MyHealthKey"
npm install
npm start
```

Files added
- `src/Layout.js` — app header, navigation and footer
- `src/pages/Lock.js` — lock/encrypt page and UI
- `src/pages/Unlock.js` — unlock/decrypt page and UI
- `src/App.js`, `src/index.js`, `src/styles.css`
- `public/favicon.svg`, `public/manifest.json`

Notes
- The app uses the browser's `crypto.subtle` for PBKDF2 + AES-GCM. All encryption/decryption is local to the device.
- This scaffold uses minimal dependencies and plain CSS. You can plug in Tailwind or a component library if desired.

Security & legal
- This code is provided as-is. If you're delivering software to government agencies handling patient data, consult legal counsel and perform a formal security audit and penetration test.
