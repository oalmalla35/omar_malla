# Omar Almalla — Video Editing Portfolio

Responsive React + TypeScript portfolio, built with Vite. Includes Instagram project embeds, locally stored project covers, and a circular portrait.

## Run locally

Use Node.js 24 and pnpm.

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
```

The static site is generated in `dist/`.

## Deploy to Vercel

Upload this source to a GitHub repository, then import the repository in Vercel.
The included `vercel.json` specifies:

- Framework: Vite
- Build command: `pnpm run build`
- Output directory: `dist`
- Node.js: 24.x (declared in `package.json`)

Publish a production deployment and confirm that visitors can open it without authentication.
No environment variables or backend are required for this version.

## Edit content

Update `src/content/portfolio.json`. See `HOW_TO_UPDATE.md` for the Arabic guide.
This version does not include an admin dashboard or automatic Instagram feed synchronization.

## GitHub Pages

Create a new repository for this portfolio, push the files on the main branch, then select Settings > Pages > Source: GitHub Actions. The included workflow builds and publishes the project. It automatically uses the repository name as the base path, including for local portrait and project-cover URLs.

This configuration is for a project repository (not a username.github.io root repository). No custom domain or environment secrets are needed.
