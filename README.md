# Guess

Guess is a lightweight Hangman-style web game built with Node.js and TypeScript.

## What it does

- serves a browser page from a tiny Node.js HTTP server
- fetches a random word and hint from a Node API
- lets players guess letters with mouse or keyboard controls
- tracks mistakes, win/loss state, and restarts

## Requirements

- Node.js
- TypeScript compiler available on your path

## Run locally

```bash
npm run build
npm run start
```

Then open [http://localhost:8080](http://localhost:8080).

## Deploy on Render

This repo includes `render.yaml`, so Render can create the service from the repository automatically.

1. Push the latest code to GitHub.
2. In Render, choose `New +` then `Blueprint`.
3. Connect the `Guess` repository and let Render apply the included config.
4. After the first deploy, open the generated `.onrender.com` URL.

The service starts with `node server.js`, uses Render's `PORT` environment variable automatically, and serves the compiled browser files already checked into the repo.

## Development notes

- TypeScript source: `src/frontend/app.ts`
- Compiled browser script: `src/main/resources/static/app.js`
- Node server: `server.js`
