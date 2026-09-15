<div align="center">

  <a href="https://zip-magnifier.vercel.app/" target="_blank" rel="noopener noreferrer">
    <img src="./assets/logo.png" width="136" height="136" alt="Zip Magnifier Official Logo" />
  </a>

  <h1>Zip Magnifier</h1>
  <p><strong>Safe, lightning-fast, in-browser ZIP archive explorer and source code reader.</strong></p>

  <p>
    <a href="https://zip-magnifier.vercel.app/"><strong>🌐 Open Live Website »</strong></a>
  </p>

  [![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_Website-black?style=for-the-badge&logo=vercel)](https://zip-magnifier.vercel.app/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## ⚡ Overview

**Zip Magnifier** is a privacy-first, zero-install developer tool engineered to inspect, navigate, and read ZIP project archives directly inside your browser.

Ever downloaded an unfamiliar repository archive, code release, or backup zip and hesitated to extract thousands of files to your disk? Zip Magnifier decompresses and indexes the archive entirely in your browser's local memory—**no files are ever uploaded to any server**.

---

## ✨ Key Features

- 🛡️ **100% Client-Side & Private** — All ZIP decompression runs strictly locally using Web APIs and `JSZip`. Not a single byte ever leaves your machine.
- 🎛️ **Collapsible Sidebar (Desktop & Mobile)** — A clean, minimal toggle button right beside the title in the header navbar lets you collapse or expand the file explorer anytime.
- ⌨️ **Quick Keyboard Shortcut (`Ctrl + B` / `Cmd + B`)** — Toggle the explorer sidebar smoothly without lifting your hands from the keyboard.
- 📂 **Interactive File Tree & Filter** — Hierarchical folder structure with expand/collapse, instant path filtering, and real-time filename search.
- 💻 **Syntax-Aware Code Reader** — Clean, distraction-free source reader with line numbering, preserved indentation, and code formatting.
- 🖼️ **Image & Media Previews** — Native in-browser previews for SVG, PNG, JPG, WebP, and GIF assets without downloading third-party tools.
- ⚡ **Lazy Loading Architecture** — File contents are loaded on-demand when selected, keeping memory consumption low even for archives with thousands of files.
- 🔒 **Safe Sandbox Execution** — Scripts, HTML, and binary payloads are rendered purely as text and never executed in your browser context.
- 🎨 **Distinctive Visual Identity** — Custom multi-resolution transparent favicon and identity combining the archive zipper, precision magnification lens, and observant eye motif.

---

## 🚀 Live Demo

Experience the live application hosted globally on Vercel:

👉 **[https://zip-magnifier.vercel.app/](https://zip-magnifier.vercel.app/)**

*Tip: Drag & drop any `.zip` file onto the drop zone or click "Choose ZIP" to begin browsing immediately.*

---

## 🎨 Brand Identity

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="./assets/logo.png" width="96" height="96" alt="Zip Magnifier Icon" /><br />
        <b>The Magnifier Emblem</b><br />
        <sub>Interlocking archive zipper + precision lens + observant eye</sub>
      </td>
      <td>
        The Zip Magnifier brand identity blends three core concepts:
        <ul>
          <li><b>The Zipper:</b> Represents compressed project archives.</li>
          <li><b>The Magnifying Glass:</b> Represents deep inspection and code reading.</li>
          <li><b>The Observant Eye:</b> Symbolizes security, transparency, and clarity when exploring unknown archives safely.</li>
        </ul>
      </td>
    </tr>
  </table>
</div>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Modern reactive component architecture |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) | Strict type safety across the monorepo |
| **Bundler** | [Vite 7](https://vitejs.dev/) | Blazing fast local dev and optimized tree-shaken builds |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Dark-first responsive developer UI |
| **Components** | [Radix UI](https://www.radix-ui.com/) | Accessible unstyled primitives |
| **Extraction** | [JSZip](https://stuk.github.io/jszip/) | Client-side in-memory ZIP extraction |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent developer iconography |
| **Deployment** | [Vercel](https://vercel.com/) | Global Edge network static hosting |

---

## 🏗️ Architecture

```
User uploads ZIP (Drag & Drop or File Picker)
      │
      ▼
Browser Memory (JSZip) ──► In-Memory File Tree Index
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

This project is organized as a **pnpm monorepo**:

```text
├── assets/
│   └── logo.png            # Official high-resolution transparent brand logo
├── artifacts/
│   └── projectlens/        # Main frontend application (React + Vite)
│       ├── public/         # Static assets (favicons, manifest, icons)
│       │   ├── favicon.svg # Vector favicon for modern browser tabs
│       │   ├── favicon.ico # Multi-resolution ICO (16, 32, 48)
│       │   └── favicon.png # High-DPI tab icon
│       ├── src/
│       │   ├── App.tsx     # Core ZIP reader, tree explorer, and layout
│       │   ├── index.css   # Layout, theme tokens, and animations
│       │   └── main.tsx    # Application entry point
│       ├── package.json    # Frontend dependencies
│       └── vite.config.ts  # Vite configuration
├── lib/                    # Shared workspace libraries
├── scripts/                # Utility scripts (favicon generator, build helpers)
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── vercel.json             # Vercel deployment configuration
└── package.json            # Root workspace configuration
```

---

## 💻 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer recommended)
- [pnpm](https://pnpm.io/) (v9 or newer)

```bash
# Enable pnpm via corepack if not already active
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

3. **Run development server:**
   ```bash
   pnpm --filter @workspace/projectlens run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build

To build the static production bundle locally:

```bash
pnpm --filter @workspace/projectlens run build
```

Production-ready assets will be generated in `artifacts/projectlens/dist/public/`.

---

## 🚀 Deployment

The project includes a pre-configured [`vercel.json`](./vercel.json):

1. Connect your repository to [Vercel](https://vercel.com/new).
2. The deployment settings will automatically configure:
   - **Framework Preset:** `Vite`
   - **Build Command:** `pnpm --filter @workspace/projectlens run build`
   - **Output Directory:** `artifacts/projectlens/dist/public`
3. Click **Deploy**. Every push to `main` will automatically trigger a new deployment.

---

## 🔒 Security & Privacy

- **Zero Network Uploads:** No file contents, archive entries, or telemetry are transmitted over the network.
- **Purely Ephemeral:** All extracted assets exist strictly in browser memory and are purged immediately when the tab is closed or refreshed.
- **Non-executable Environment:** Scripts (`.js`, `.py`, `.sh`, `.bat`, etc.) are rendered purely as read-only plaintext to ensure zero risk of malicious execution.

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
