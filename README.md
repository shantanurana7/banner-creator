# Image Content Factory

A fully revamped, modular, and client-side web application built with React to create and customize branded banners across multiple platforms (Instagram, LinkedIn, Twitter/X, and E-Comms).

## Features

- **Multi-Platform Support**: Fixed high-resolution canvas outputs tailored perfectly to Instagram (1080×1080), LinkedIn (1200×627), Twitter (1600×900), and Email Communications (600×800).
- **Advanced Image Cropping**: Upload high-resolution images and crop, pan, zoom, rotate, or flip them directly from the browser using `react-advanced-cropper`.
- **Text Engine**: Dynamically add and position titles and subtitles with custom branding fonts (CondeSans-Bold and UniversLTStd).
- **Branded Window Motif**: An adjustable, movable gradient "window" cutout overlay that supports a 7:10 or 10:7 aspect ratio. Sizing dynamically enforces a minimum of 20% canvas coverage.
- **Dynamic Swoosh Effect**: Simulates a brush stroke trailing from the window cutout. Composed of 30 distinct horizontal color bands precisely sampled from the underlying pixels for perfect contextual blending.
- **Draft Stamping & Grids**: Quickly mark assets with a "Draft Version" stamp and use customizable compositional grids.
- **Session Auto-save**: Never lose your progress. All edits are safely persisted to `sessionStorage` in real-time.
- **Standalone Client Build**: Export the entire editor—HTML, CSS, JS, and all binary font/SVG assets—into a single standalone `index.html` file that runs in any browser without needing an internet connection or web server.

## Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

3. **Build the production version**
   ```bash
   npm run build
   ```

4. **Generate Standalone Client File**
   ```bash
   npm run build:client
   ```
   This will run the production build and then execute a custom Node script to package the entirety of the application into one single file located at `client-version/index.html`. You can distribute this single file safely!

## Technologies

- React 18, Tailwind CSS (Dark Mode Glassmorphism UI)
- `react-advanced-cropper` for image manipulations
- Native HTML5 Canvas API for complex layered image rendering
