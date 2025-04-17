# Deploying to GitHub Pages

This guide explains how to deploy the static frontend of the Polygon Clipping Visualization Tool to GitHub Pages.

## Prerequisites

- GitHub account
- Git installed on your local machine
- Your project pushed to a GitHub repository

## Option 1: Using GitHub Actions (Recommended)

1. In your repository on GitHub, go to **Settings** > **Pages**

2. Create a file `.github/workflows/deploy.yml` in your repository with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v2

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages # The branch the action should deploy to
          folder: . # The folder the action should deploy
```

3. Push this file to your repository, and GitHub Actions will automatically deploy your site.

## Option 2: Manual Deployment

1. Create a separate branch for GitHub Pages:

```bash
git checkout -b gh-pages
```

2. For a static-only version, you can remove server-side files and keep only:
   - HTML files
   - CSS files
   - JavaScript files
   - Images and other static assets

3. Push this branch to GitHub:

```bash
git push origin gh-pages
```

4. In your repository on GitHub, go to **Settings** > **Pages**

5. Set the Source to the `gh-pages` branch and press Save

## Adapting Your App for GitHub Pages

Since GitHub Pages only serves static content, if your app requires a backend:

1. Modify your JavaScript to use relative URLs or configure for a static environment
2. Consider using a service like Heroku, Vercel, or Render for the backend
3. Update API endpoints in your frontend code

## Testing Your Deployment

Once deployed, your app will be available at:
`https://[username].github.io/[repository-name]/`

For example: `https://johndoe.github.io/polygon-clipping-visualization/`