# Multi-stage build: build Vue frontend, install backend deps, run Node server

# ---------- build frontend ----------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend ./
RUN npx vite build

# ---------- install backend deps ----------
FROM node:20-alpine AS backend-deps
WORKDIR /app
# install backend deps from root package.json (no backend-specific package.json)
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# ---------- runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# backend code and shared node_modules at /app/node_modules
COPY --from=backend-deps /app/node_modules ./node_modules
COPY backend ./backend

# frontend build
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 8080
CMD ["node","backend/src/server.js"]


