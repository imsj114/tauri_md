---
description: How to build and deploy the application
---

# Deployment

To build the application for production (macOS .app / .dmg):

1.  **Run the build command**:
    ```bash
    npm run tauri build
    ```
    This command will:
    *   Compile the TypeScript code (`tsc`).
    *   Build the frontend assets (`vite build`).
    *   Bundle the Tauri application (`tauri build`).

2.  **Locate the artifacts**:
    After the build completes, you can find the generated application bundle in:
    `src-tauri/target/release/bundle/macos/`

    Look for the `.app` file or the `.dmg` disk image.

3.  **Troubleshooting**:
    *   If you encounter permission errors, ensure you have the necessary code signing certificates set up if you are distributing outside of your local machine (though for local testing, ad-hoc signing usually works).
    *   Ensure all `fs` capabilities are correctly configured in `src-tauri/capabilities/default.json` if you run into runtime permission issues in the built app.
