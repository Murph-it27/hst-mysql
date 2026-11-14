# Household Stock Tracker – MySQL + hosted website

Parts: Expo app (website/phone) -> backend/ (Node + Express) -> MySQL (cloud)

## A. Cloud database (TiDB Cloud or any MySQL host)
1. Create a free cluster; note host, port, user, password, database name.
2. MySQL Workbench: new connection with those details (SSL: Require).
3. Open backend/schema.sql, put `USE <your database name>;` on the first line, run it (lightning bolt).
   `SHOW TABLES;` must list `items` and `users`.

## B. GitHub
Push this folder to a new GitHub repository (the .env file must NOT be included).

## C. Backend on Render (render.com -> New -> Web Service)
- Root Directory: backend | Build: npm install | Start: npm start | Free instance
- Environment variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL=true, JWT_SECRET (long random text)
- Open https://<your-service>.onrender.com/health  ->  {"ok":true}

## D. Connect the app
config/api.ts:  const HOSTED_URL = 'https://<your-service>.onrender.com';

## E. Website
npm install
npm run build:web      (creates the dist folder)
Drag the dist folder onto https://app.netlify.com/drop  -> public link.

## Local testing (optional)
cd backend; copy .env.example to .env and fill it; npm install; npm start
Then (leave HOSTED_URL empty) in the project root: npm install; npx expo start
