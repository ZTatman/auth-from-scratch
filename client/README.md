# Client App

React + TypeScript frontend for the auth demo.

## Development

From the repo root, start everything:

```bash
npm run start
```

Or run the client only:

```bash
cd client
npm run dev
```

The dev server runs at http://localhost:3000.

## Environment

`VITE_API_URL` controls the API base URL. If not set, the client proxies `/api` to `http://localhost:3001` via Vite.

## Scripts

- `npm run dev` start the Vite dev server
- `npm run build` type-check and build
- `npm run lint` run ESLint
- `npm run format` format with Prettier
- `npm run preview` preview the production build
