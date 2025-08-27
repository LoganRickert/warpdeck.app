# Multi-stage build for WarpDeck
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and lockfiles
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY server/package.json ./server/
COPY server/pnpm-lock.yaml ./server/
COPY client/package.json ./client/
COPY client/pnpm-lock.yaml ./client/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN cd server && pnpm install --frozen-lockfile
RUN cd client && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build client
RUN cd client && pnpm run build

# Build server
RUN cd server && pnpm run build

# Production runtime
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY package.json ./
COPY server/package.json ./server/
COPY pnpm-lock.yaml ./
COPY server/pnpm-lock.yaml ./server/
RUN npm install -g pnpm
RUN cd server && pnpm install --frozen-lockfile --prod

# Copy built assets
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist

# Create data directories
RUN mkdir -p ./server/data/dashboards
RUN mkdir -p ./server/data/images

# Set environment variables
ENV PORT=8089
ENV DATA_DIR=/app/server/data
ENV DASHBOARDS_DIR=/app/server/data/dashboards
ENV NODE_ENV=production

# Expose port
EXPOSE 8089

# Start the application
CMD ["node", "server/dist/index.js"]
