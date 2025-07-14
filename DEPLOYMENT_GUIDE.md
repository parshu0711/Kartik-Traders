# Kartik Traders Deployment Guide

## 🚀 Updated Deployment Configuration

### What Changed

1. **Backend now serves frontend**: The Express server now serves the React frontend static files in production
2. **SPA routing fixed**: All routes now work correctly on page refresh
3. **Single deployment**: Frontend and backend are now deployed together

### Key Changes Made

#### 1. Server Configuration (`server/index.js`)
- Added static file serving for React build files
- Added catch-all route for SPA routing
- Removed the 404 handler that was breaking SPA routing

#### 2. Render Configuration (`render.yaml`)
- Updated build command to build both server and client
- Removed separate frontend service
- Backend now serves both API and frontend

### Deployment Steps

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Fix SPA routing - backend now serves frontend"
   git push origin main
   ```

2. **Render will automatically**:
   - Build the client React app
   - Build the server
   - Deploy everything as a single service

3. **Verify deployment**:
   - Visit your Render URL
   - Test navigation to `/login`, `/admin`, `/shop`, etc.
   - Refresh pages to ensure no 404 errors

### How It Works

1. **Development**: Frontend runs on port 5173, backend on port 5000
2. **Production**: Everything runs on one port, backend serves frontend files
3. **API calls**: Use relative URLs (e.g., `/api/products`) in production
4. **SPA routing**: All non-API routes serve `index.html`

### Environment Variables

Make sure these are set in Render:
- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_*` variables
- `FRONTEND_URL` (can be removed since frontend is served by backend)

### Testing

After deployment, test these scenarios:
1. ✅ Navigate to `/login` and refresh
2. ✅ Navigate to `/admin` and refresh  
3. ✅ Navigate to `/shop` and refresh
4. ✅ Navigate to `/product/123` and refresh
5. ✅ API calls work correctly
6. ✅ Admin dashboard functions properly

### Troubleshooting

If you still see 404 errors:
1. Check Render logs for build errors
2. Verify the `client/dist` folder is being built
3. Ensure the static file serving path is correct
4. Check that the catch-all route is working

### Rollback Plan

If needed, you can revert to separate deployments by:
1. Restoring the original `render.yaml` with separate services
2. Removing the static file serving from `server/index.js`
3. Redeploying both services separately 