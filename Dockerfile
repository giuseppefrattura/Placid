# Stage 1: Install dependencies only when needed
FROM node:22-alpine AS deps
# Install libc6-compat for native dependency compilation if needed
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package descriptors and lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Minimal production runtime container
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run the container under a secure, non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets
COPY --from=builder /app/public ./public

# Set the correct permissions for the Next.js prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Leverages the standalone output built in Stage 2 to minimize footprint
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# hostname binds to loopback by default; inside Docker we want to bind to all interfaces (0.0.0.0)
ENV HOSTNAME="0.0.0.0"

# server.js is automatically created by Next.js in standalone build mode
CMD ["node", "server.js"]
