# Deployment Setup

## Overview

This document outlines the deployment configuration and process for the Legal Case Pro application. It covers environment setup, database configuration, build processes, and deployment options for both development and production environments.

## Environment Configuration

### Environment Variables

The application requires the following environment variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/legal_case_pro

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Application Configuration
NODE_ENV=development|production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Environment Files

The application uses `.env` files for environment configuration:

1. `.env.local` - Local development environment
2. `.env.test` - Testing environment
3. `.env.production` - Production environment

Example `.env.local` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/legal_case_pro_dev
JWT_SECRET=dev_secret_key
JWT_EXPIRY=24h
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Never commit `.env` files with sensitive information to version control. Use `.env.example` as a template.

## Database Setup

### Local Development Database

1. **Install PostgreSQL**:
   - Download and install PostgreSQL 13+ from the [official website](https://www.postgresql.org/download/)
   - Create a database named `legal_case_pro_dev`

2. **Run Prisma Migrations**:
   ```bash
   npx prisma migrate dev
   ```

3. **Seed the Database**:
   ```bash
   npx prisma db seed
   ```

### Production Database

1. **Provision a PostgreSQL Database**:
   - Options include AWS RDS, Google Cloud SQL, Azure Database for PostgreSQL, or managed services like Supabase or Railway
   
2. **Configure Connection**:
   - Set the `DATABASE_URL` environment variable with production credentials
   
3. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

## Building for Production

### Build Process

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Application**:
   ```bash
   npm run build
   ```
   
3. **Test the Production Build**:
   ```bash
   npm run start
   ```

### Optimizations

The build process includes several optimizations:

1. **Code Minification** - JavaScript and CSS minification
2. **Tree Shaking** - Removal of unused code
3. **Image Optimization** - Next.js automatic image optimization
4. **Static Generation** - Pre-rendered HTML where possible
5. **Code Splitting** - Automatic bundle splitting

## Docker Deployment

### Docker Configuration

The application includes Docker configuration for containerized deployment.

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=legal_case_pro
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Running with Docker Compose

```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Optional: Seed database
docker-compose exec app npx prisma db seed
```

## Cloud Deployment Options

### Vercel (Recommended)

Vercel is the optimal deployment platform for Next.js applications.

1. **Connect Repository**:
   - Link your GitHub/GitLab/Bitbucket repository to Vercel

2. **Configure Environment Variables**:
   - Add all required environment variables in the Vercel dashboard

3. **Deploy**:
   - Automatic deployments on push to main branch
   - Preview deployments for pull requests

4. **Database Connection**:
   - Connect to your PostgreSQL database using the `DATABASE_URL` environment variable

### AWS Deployment

1. **AWS Elastic Beanstalk**:
   - Create a new application and environment
   - Configure environment properties
   - Deploy application bundle

2. **AWS ECS/Fargate**:
   - Use Docker configuration
   - Configure task definitions and services
   - Set up load balancing

### Kubernetes Deployment

1. **Kubernetes Manifests**:
   - Create deployment.yaml, service.yaml, and configmap.yaml
   - Configure ingress for external access

2. **Deploy with kubectl**:
   ```bash
   kubectl apply -f kubernetes/
   ```

## CI/CD Pipeline

### GitHub Actions

Example GitHub Actions workflow for CI/CD:

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring and Logging

### Application Monitoring

1. **Sentry Integration**:
   - Error tracking and monitoring
   - Performance monitoring
   - Real user monitoring

2. **Prometheus and Grafana**:
   - System metrics
   - Custom application metrics
   - Alerting

### Logging

1. **Centralized Logging**:
   - Log aggregation with ELK stack (Elasticsearch, Logstash, Kibana)
   - Or use a managed service like Datadog or New Relic

2. **Log Format**:
   ```json
   {
     "timestamp": "ISO timestamp",
     "level": "info|warn|error|debug",
     "message": "Log message",
     "context": {
       "userId": "user_id",
       "requestId": "request_id",
       "additional": "context"
     }
   }
   ```

## Scaling Considerations

### Horizontal Scaling

1. **Stateless Application Design**:
   - Enables horizontal scaling
   - Session state stored in database or Redis

2. **Database Scaling**:
   - Read replicas for read-heavy workloads
   - Connection pooling

### Performance Optimization

1. **API Caching**:
   - Redis caching for frequent queries
   - Edge caching for static content

2. **CDN Integration**:
   - Next.js works well with Vercel's Edge Network
   - Alternatively, use Cloudflare or AWS CloudFront

## Backup and Recovery

### Database Backups

1. **Automated Backups**:
   - Daily full backups
   - Point-in-time recovery configuration
   - Retention policy: 7 daily, 4 weekly, 3 monthly

2. **Backup Testing**:
   - Regular restoration testing
   - Validation of backup integrity

### Disaster Recovery

1. **Recovery Procedure**:
   1. Restore database from latest backup
   2. Deploy application code to new environment
   3. Configure environment variables
   4. Verify application functionality

2. **Recovery Time Objective (RTO)**:
   - Target: < 1 hour for critical issues

## Security Configuration

1. **TLS/SSL Configuration**:
   - Enforce HTTPS
   - TLS 1.2 or higher
   - Regular certificate renewal

2. **Security Headers**:
   ```
   Content-Security-Policy: default-src 'self';
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   ```

3. **Rate Limiting**:
   - API rate limiting configuration
   - Protection against brute force attempts
