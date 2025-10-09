<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xz-dOjU12CvgwEuR6ttm3am2eFRaNFmQ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Production Deployment

This application is configured for deployment behind a reverse proxy (e.g., nginx) that routes `/api/*` requests to the backend API server.

### API Configuration

- **Base URL**: `/api` (configured in `lib/config.ts`)
- **Environment Override**: Set `VITE_API_URL` to override the default proxy-based URL for direct API access
- **Development Proxy**: Vite dev server proxies `/api` to `http://localhost:8000` (configurable via `VITE_API_PROXY_TARGET`)

### Proxy Setup Example (nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/built/app;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://your-backend-server:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Alternative: Direct API Access

If deploying without a proxy, set the production environment variable:

```bash
VITE_API_URL=https://your-api-domain.com
```

This will bypass the `/api` prefix and make requests directly to the specified URL.