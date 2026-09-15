<div align="center">

  <h1>🔍 Zip Magnifier</h1>
  <p><strong>Safe, lightning-fast, in-browser ZIP archive explorer and source code reader.</strong></p>

  <p>
    <a href="https://zip-magnifier.vercel.app/"><strong>🌐 Explore Live Demo »</strong></a>
  </p>

  [![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://zip-magnifier.vercel.app/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## ⚡ Overview

**Zip Magnifier** (ProjectLens Viewer) is a privacy-focused, zero-install developer tool designed to inspect, navigate, and read ZIP project archives directly in the browser.

Ever downloaded a project archive, code release, or backup zip and hesitated to extract thousands of files to your disk? Zip Magnifier decompresses and indexes the archive entirely in your browser memory—**no files are ever uploaded to any server**.

---

## ✨ Features

- 🛡️ **100% Client-Side & Private** — All ZIP decompression runs locally via Web APIs and `JSZip`. Not a single byte ever leaves your device.
- 📂 **Interactive File Tree** — Hierarchical folder exploration with expand/collapse, instant filtering, and filename search.
- 💻 **Syntax-Aware Code Reader** — Clean, distraction-free source reader with line numbering, preserved indentation, and code formatting.
- 🖼️ **Media & Asset Previews** — Preview SVG, PNG, JPG, WebP, and GIF images directly without external tools.
- ⚡ **Lazy Loading Architecture** — File contents are loaded on-demand when selected, keeping memory consumption low even for large archives.
- 🔒 **Safe Sandbox Execution** — HTML, JS, and scripts are rendered purely as text and never executed in your browser context.
- 🌓 **Developer-First Dark UI** — Built with Tailwind CSS and Radix UI primitives for an ergonomic, responsive layout on desktop and mobile.

---

## 🚀 Live Demo

Experience the live application hosted on Vercel:

👉 **[https://zip-magnifier.vercel.app/](https://zip-magnifier.vercel.app/)**

Simply drag & drop any `.zip` file onto the drop zone to begin browsing instantly.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Component architecture & reactive UI |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) | Strict type safety across the monorepo |
| **Bundler** | [Vite 7](https://vitejs.dev/) | Ultra-fast local dev and optimized production builds |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Modern, dark-first responsive utility styling |
| **Components** | [Radix UI](https://www.radix-ui.com/) | Accessible, unstyled UI primitives |
| **Extraction** | [JSZip](https://stuk.github.io/jszip/) | In-memory decompression of ZIP file structures |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent developer iconography |
| **Hosting** | [Vercel](https://vercel.com/) | Global Edge CDN static deployment |

---

## 🏗️ Architecture

```
User uploads ZIP 
      │
      ▼
Browser (JSZip) ──► In-Memory File Tree Index
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    Selected Text File          Selected Image File
            │                           │
            ▼                           ▼
    Text Decoder Stream         Blob Object URL
            │                           │
            ▼                           ▼
    Syntax & Line Reader        Secure Image Preview
```

---

## 📁 Repository Structure

This repository is structured as a **pnpm monorepo**:

```text
├── artifacts/
│   └── projectlens/        # Main frontend web application (React + Vite)
│       ├── src/
│       │   ├── App.tsx     # Core ZIP pipeline, tree explorer, and reader
│       │   ├── index.css   # Theme styling & layout rules
│       │   └── main.tsx    # Application entry point
│       ├── package.json    # Frontend dependencies
│       └── vite.config.ts  # Vite build configuration
├── lib/                    # Shared workspace libraries
├── pnpm-workspace.yaml     # pnpm monorepo definitions & catalog versions
├── vercel.json             # Vercel deployment configuration
└── package.json            # Root workspace configuration
```

---

## 💻 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer recommended)
- [pnpm](https://pnpm.io/) (v9 or newer)

```bash
# Enable pnpm via corepack if not already installed
corepack enable
corepack prepare pnpm@latest --activate
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RushikeshRaju/zip-magnifier.git
   cd zip-magnifier
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start development server:**
   ```bash
   pnpm --filter @workspace/projectlens run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build

To test the production build locally:

```bash
pnpm --filter @workspace/projectlens run build
```

Production assets will be emitted to `artifacts/projectlens/dist/public/`.

---

## 🚀 Deploying to Vercel

This repository includes a [`vercel.json`](./vercel.json) pre-configured for one-click deployment on Vercel:

1. Import your fork/repository on [Vercel](https://vercel.com/new).
2. The project settings will be automatically populated from `vercel.json`:
   - **Framework Preset:** `Vite`
   - **Build Command:** `pnpm --filter @workspace/projectlens run build`
   - **Output Directory:** `artifacts/projectlens/dist/public`
3. Click **Deploy**.

---

## 🔒 Security & Privacy

- **Zero Remote Calls:** No file contents, archive entries, or telemetry metadata are transmitted over the network.
- **Purely Ephemeral:** All extracted assets exist strictly in browser memory and are discarded as soon as the tab is refreshed or closed.
- **Non-executable Environment:** Script files (`.js`, `.sh`, `.bat`, etc.) are rendered purely as plaintext to safeguard against malicious payload execution.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/RushikeshRaju">Rushikesh Raju</a></sub>
</div>
