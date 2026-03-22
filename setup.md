# Setup Guide -- Free Tier Services

## MongoDB Atlas Free Tier (M0)

1. Go to <https://www.mongodb.com/cloud/atlas> and create a free account.
2. Click "Build a Database" and select the **M0 Free** tier (shared, 512 MB).
3. Choose your preferred cloud provider and region (any works).
4. Set a cluster name (e.g., `weed-diary-cluster`).
5. Under "Database Access", create a database user with username/password and "Read and write to any database" role.
6. Under "Network Access", click "Add IP Address":
   - Development: add `0.0.0.0/0` (allows all IPs).
   - Production: add your server's IP only.
7. Go to "Database" > "Connect" > "Connect your application".
8. Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/weed-diary`.
9. Replace `<username>` and `<password>` with your database user credentials.
10. Paste into `.env` as `MONGODB_URI`.

## Cloudinary Free Tier

1. Go to <https://cloudinary.com/users/register/free> and create a free account.
2. Free tier includes ~25 credits/month (approx 25 GB storage + 25 GB bandwidth + 25,000 transformations).
3. After signup, you land on the Dashboard.
4. Copy three values from the Dashboard:
   - **Cloud Name** (top of dashboard, e.g., `dxyz1234`)
   - **API Key** (numeric string)
   - **API Secret** (click "Reveal" to see)
5. Paste into `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=dxyz1234
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your-api-secret-here
   ```
6. Optional: in Cloudinary Settings > Upload, create an upload preset named `weed-diary` with folder `weed-diary/` for organization.

## Google Maps Embed API (optional, free)

1. Go to <https://console.cloud.google.com> and create a project (or select existing).
2. Navigate to "APIs and Services" > "Library".
3. Search for "Maps Embed API" and click "Enable" (this is free, no billing required for embed-only usage).
4. Go to "APIs and Services" > "Credentials" > "Create Credentials" > "API Key".
5. Restrict the key: under "API restrictions", select "Maps Embed API" only.
6. Under "Application restrictions", add your domain (or leave unrestricted for dev).
7. Copy the API key and paste into `.env` as `GOOGLE_MAPS_API_KEY`.
8. If you skip this step, the app will fall back to a plain Google Maps link instead of an embedded map.

## Quick Start

```bash
# Clone and install
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Copy env template and fill in your values
cp .env.example .env

# Run dev servers (Express on :5000, Vite on :5173)
npm run dev

# Run tests
npm test

# Production build
npm run build
npm start
```
