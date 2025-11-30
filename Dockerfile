# Multi-stage build for VendHub Manager

# Stage 1: Dependencies
FROM node:22-alpine AS dependencies
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 3: Runtime
FROM node:22-alpine AS runtime
WORKDIR /app

# Install pnpm and process utilities
RUN npm install -g pnpm@10.4.1 && \
    apk add --no-cache \
    curl \
    lsof \
    procps \
    bash

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Copy cleanup scripts
COPY scripts/cleanup-db-processes.mjs ./scripts/cleanup-db-processes.mjs

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production \
    PORT=3000

# Health check that runs cleanup script every 30 seconds
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Startup script that cleans up processes before starting the app
COPY --chown=nodejs:nodejs <<EOF /app/docker-entrypoint.sh
#!/bin/bash
set -e

echo "🧹 Running pre-startup cleanup..."

# Kill any stale processes
if [ -f scripts/cleanup-db-processes.mjs ]; then
    node scripts/cleanup-db-processes.mjs --clean-build --clean-ports || true
fi

echo "✅ Cleanup completed"
echo "🚀 Starting VendHub Manager..."

# Start the application
exec node dist/index.js
EOF

RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
