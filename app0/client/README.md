## Client App — Quick Start

This is the client-side Next.js app. Use these steps so anyone on the team can clone, install, and run it locally.

### Prerequisites

- Node.js 18 or 20 (recommended)
- A package manager: npm (default), or Yarn/Pnpm/Bun

### 1) Clone the repo

```bash
git clone https://github.com/ZSuraj/abcd.git
cd abcd/app0/client
```

### 2) Install dependencies

```bash
# using npm (recommended)
npm install

# or using yarn
yarn install

# or using pnpm
pnpm install

# or using bun
bun install
```

### 3) Run the app in development

```bash
# http://localhost:3000
npm run dev

# or
yarn dev
pnpm dev
bun run dev
```

### 4) Build and start (production)

```bash
# build
npm run build

# start the built app
npm run start

# (alternatives)
yarn build && yarn start
pnpm build && pnpm start
bun run build && bun run start
```

### Available scripts (from package.json)

- `dev`: Start the Next.js dev server
- `build`: Create an optimized production build
- `start`: Run the production build
- `lint`: Lint the project

### Common issues

- Port already in use: change the port (e.g. `PORT=3001 npm run dev`) or stop the other process.
- Stale artifacts: remove `.next/` and retry (`rm -rf .next node_modules && npm install`).

### Notes

- Default dev URL: `http://localhost:3000`
- Config files: `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
