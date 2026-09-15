# Zip Magnifier

Zip Magnifier is a browser-only ZIP project viewer for exploring a real file tree and reading source files safely.

## Run & Operate

- `pnpm --filter @workspace/projectlens run dev` — run the Zip Magnifier web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TypeScript
- ZIP extraction: JSZip in the browser
- Styling: Tailwind CSS with local Zip Magnifier theme tokens

## Where things live

- `artifacts/projectlens/src/App.tsx` — client-side ZIP pipeline, project tree, file reader, and UI states
- `artifacts/projectlens/src/index.css` — Zip Magnifier visual system and responsive layout
- `artifacts/projectlens/package.json` — frontend dependencies and scripts

## Architecture decisions

- Uploaded archives are read and decompressed locally; no project bytes are sent to a server.
- The viewer renders HTML, JavaScript, and other project files as text only and never executes them.
- Explorer navigation becomes a drawer on narrow screens so reading remains content-first.
- File contents are loaded only when a file is selected rather than preloading every archive entry.

## Product

- Upload or drop one ZIP project archive.
- Browse a sorted, expandable file tree with local filename filtering.
- Read text files with line numbers, preserved whitespace, and lightweight language-aware token styling.
- Preview common images safely and show a clear fallback for unsupported binary files.
- Reopen another project or retry a failed extraction without login or setup.

## User preferences

 - Mobile-first, dark-first, restrained, professional developer-tool aesthetic.

## Gotchas

- The Vite config expects `PORT` and `BASE_PATH` when running build commands outside the managed workflow.
- There is intentionally no backend requirement for Zip Magnifier.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
