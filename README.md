# Tauri Markdown Editor

A modern, high-performance Markdown editor built with Tauri, React, and TypeScript. This application combines the performance of a native desktop app with the flexibility of web technologies.

## Features

- **Hybrid Editing**: Enjoy a WYSIWYG experience powered by [Milkdown](https://milkdown.dev/), allowing you to edit Markdown with immediate visual feedback.
- **Split View**: Switch to a classic "Editor + Preview" mode for those who prefer seeing the raw Markdown alongside the rendered output.
- **File Management**:
  - Open folders and navigate your local file system.
  - Create, read, update, and delete files.
  - **Rename** files and folders directly from the sidebar context menu.
  - Pin your favorite files for quick access.
- **Inline Images**: Drag and drop images or paste them from your clipboard directly into the editor.
- **Customization**:
  - Adjust font size, line height, and font family.
  - Toggle between Hybrid and Split view modes.
  - Settings are persisted automatically.
- **Dark Mode**: sleek, dark-themed interface designed for focus.

## Tech Stack

- **Core**: [Tauri](https://tauri.app/) (Rust + Webview)
- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Editor**: [Milkdown](https://milkdown.dev/) (ProseMirror based)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/imsj114/tauri-md.git
   cd tauri-md
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To run the application in development mode:

```bash
npm run tauri dev
```

This command will start the Vite development server and the Tauri application window.

### Build

To build the application for production:

```bash
npm run tauri build
```

The executable will be located in `src-tauri/target/release/bundle`.

## Usage

1. **Open a Folder**: Click the folder icon in the sidebar to select a directory from your computer.
2. **Create a File**: Click the "Plus" icon to create a new Markdown file.
3. **Edit**: Start typing in the editor. Changes are saved manually with `Cmd+S` (or `Ctrl+S`).
4. **Settings**: Click the gear icon in the sidebar to customize your editor preferences.
5. **Context Menu**: Right-click on any file in the sidebar to Pin, Rename, or Delete it.

## License

MIT

