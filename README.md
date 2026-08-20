# SeeMore

<p align="center">
  <img src="./public/icons/icon128.png" alt="SeeMore icon" width="112" height="112">
</p>

<p align="center">
  <strong>Making visual details accessible.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.2.0-blue" alt="Version 0.2.0">
  <img src="https://img.shields.io/badge/platform-Chrome%20148%2B-lightgrey" alt="Platform: Chrome 148+">
  <img src="https://img.shields.io/badge/built%20with-Vue%203%20%7C%20TypeScript%20%7C%20Vite-42b883" alt="Built with Vue 3, TypeScript, and Vite">
</p>

<p align="center">
  English | <a href="./README_ZH.md">中文</a>
</p>

## Overview

SeeMore is a Chrome extension designed to help blind and low-vision users understand product images and visual details on e-commerce pages.

The project is designed to prioritize Chrome Built-in AI for on-device image analysis and present product appearance, color, material, and image differences in a structured, follow-up-friendly format. SeeMore emphasizes facts before inference, explicit uncertainty, keyboard access, and screen-reader usability.

> [!IMPORTANT]
> SeeMore is currently in early development. Version 0.2.0 completes the second-phase single-image local AI analysis loop and requires a Chrome 148+ device that supports Chrome Built-in AI.

## Current Capabilities

- Chrome Manifest V3 extension foundation
- Opens the Side Panel from an image context menu, the toolbar icon, or `Alt+D`
- Extracts product names, prices, colors, materials, and descriptions from JSON-LD and page content
- Type-safe messaging between the Service Worker, Content Script, and Side Panel
- Semantic HTML, ARIA status announcements, and a keyboard-friendly panel interface
- Chrome extension icons in 16, 32, 48, and 128 pixels
- Chrome Built-in AI capability detection with model preparation and download progress
- Structured output rendered as one natural-language paragraph for product identification
- Translator API Chinese output with an English fallback when translation is unavailable

## Version History

### 0.2.0 — 2026-08-20

- Added end-to-end right-click image analysis from product pages into the Side Panel
- Added local Chrome Built-in AI image analysis with model preparation and download progress
- Added one natural-language product description combining visual details and product context
- Added cross-origin image error handling, cancellation, retry, and pending-image refresh states
- Refined the Side Panel for compact, keyboard-friendly, high-contrast use

### 0.1.0

- Initialized the Chrome Manifest V3 extension foundation and project structure

## Planned Capabilities

- Detect product galleries for multi-image understanding and comparison
- Allow follow-up questions about the current product

For the complete product definition and development scope, see the [SeeMore Product Requirements Document](./SeeMore%20产品需求文档%20PRD.md) (Chinese).

## Tech Stack

- Chrome Extension Manifest V3
- Vue 3
- TypeScript
- Vite

## Local Development

### Requirements

- Node.js 20 or later
- npm
- Chrome 148 or later

### Install and Build

```bash
npm install
npm run build
```

The production extension is generated in `dist/`.

### Load in Chrome

1. Open `chrome://extensions/`.
2. Enable **Developer mode** in the upper-right corner.
3. Select **Load unpacked**.
4. Choose the project's `dist/` directory.

After changing the source code, run `npm run build` again and reload SeeMore from the extensions page.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the extension |
| `npm run typecheck` | Run TypeScript type-checking only |
| `npm run preview` | Preview the Vite build output |

## Project Structure

```text
public/
├── icons/               # Chrome extension icons
└── manifest.json        # Manifest V3 configuration
src/
├── background/          # Service Worker and extension events
├── content/             # Page-context extraction
├── shared/              # Shared types, messages, and constants
└── sidepanel/           # Vue Side Panel interface
sidepanel.html           # Side Panel entry point
vite.config.ts           # Multi-entry build configuration
```

## Privacy

The current version has no remote backend and contains no logic for uploading images or page content. Future AI features will prioritize on-device processing and follow least-privilege and data-minimization principles.

## License

This project is licensed under the [Apache License 2.0](./LICENSE).
