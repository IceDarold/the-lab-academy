# Test Infrastructure Setup Guide

This guide provides comprehensive instructions for setting up the complete test infrastructure for The Lab Academy project.

## Prerequisites

Before setting up the test infrastructure, ensure you have the following:

### System Requirements
- **Node.js**: Version 20.x or higher
- **Python**: Version 3.12 or higher
- **PostgreSQL**: Version 15 or higher (for integration and E2E tests)
- **Git**: Latest version
- **Docker**: Optional, for containerized testing

### Development Environment
- macOS, Linux, or Windows with WSL2
- At least 8GB RAM (16GB recommended)
- At least 20GB free disk space
- Stable internet connection

## Quick Setup (Recommended)

For most developers, use the automated setup script:

```bash
# Clone the repository
git clone https://github.com/your-org/the-lab-academy.git
cd the-lab-academy

# Run the automated setup
./scripts/setup-test-environment.sh
```

The script will:
- Install all dependencies
- Set up test databases
- Configure test environments
- Validate the setup

## Manual Setup

If you prefer manual setup or need to troubleshoot issues:

### Step 1: Install Dependencies

#### Frontend Dependencies
```bash
cd frontend
npm install
```

#### Backend Dependencies
```bash
cd backend
pip install poetry
poetry install
```

#### Playwright Browsers
```bash
cd frontend
npx playwright install --with-deps
```

### Step 2: Database Setup

#### Local PostgreSQL Setup
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create test database
createdb test_db
```

#### Alternative: Docker Setup
```bash
# Start PostgreSQL container
docker run -d \
  --name postgres-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=test_db \
  -p 5432:5432 \
  postgres:15
```

### Step 3: Environment Configuration

#### Frontend Environment Variables
Create `.env` file in the frontend directory:

```env
VITE_API_URL=http://127.0.0.1:8001/api
VITE_TESTING=true
VITE_ENVIRONMENT=development
```

#### Backend Environment Variables
Create `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db
SECRET_KEY=your-secret-key-here
TESTING=true
```

### Step 4: Database Initialization

#### Backend Database Setup
```bash
cd backend
poetry run python scripts/seed_database.py --test
```

#### Run Migrations
```bash
cd backend
poetry run alembic upgrade head
```

### Step 5: Validate Setup

Run the validation script to ensure everything is configured correctly:

```bash
cd frontend
npm run validate:test-setup
```

This will check:
- All dependencies are installed
- Configurations are valid
- Databases are accessible
- Test runners are functional

## Test Infrastructure Components

### Unit Testing Setup

#### Vitest Configuration
The unit tests use Vitest with the following setup:

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

#### Running Unit Tests
```bash
# Run all unit tests
npm run test:run

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test

# Run with UI
npm run test:ui
```

### Integration Testing Setup

#### Integration Test Configuration
Integration tests run against a real backend API:

```javascript
// vitest.integration.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/integration/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    testTimeout: 30000,
    globalSetup: ['./tests/integration-setup.ts'],
    env: {
      VITE_API_URL: 'http://127.0.0.1:8001/api',
      TESTING: 'true'
    }
  }
})
```

#### Running Integration Tests
```bash
# Start backend first
npm run backend:run

# In another terminal, run integration tests
npm run test:integration
```

### E2E Testing Setup

#### Playwright Configuration
E2E tests use Playwright with multi-browser support:

```javascript
// playwright.config.ts
const config = {
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
}
```

#### Running E2E Tests
```bash
# Install browsers
npm run e2e:install

# Run all E2E tests
npm run e2e

# Run specific test types
npm run e2e:api      # API-only tests
npm run e2e:ui-only  # UI-only tests
npm run e2e:visual   # Visual regression tests
```

### Backend Testing Setup

#### pytest Configuration
Backend tests use pytest with coverage:

```bash
# Run backend tests
cd backend
poetry run pytest --cov=src --cov-report=xml --cov-report=html
```

## Advanced Setup Options

### CI/CD Environment Setup

For CI/CD environments, additional configuration is needed:

#### GitHub Actions Setup
The CI pipeline automatically sets up the test environment. See [CI/CD Integration Guide](../ci-cd/README.md) for details.

#### Local CI Simulation
To simulate CI locally:

```bash
# Set CI environment variable
export CI=true

# Run CI test suite
npm run ci:test:full
```

### Performance Testing Setup

#### Lighthouse and Performance Monitoring
```bash
# Set performance baseline
npm run performance:baseline

# Run performance tests
npm run test:performance

# Generate performance reports
npm run performance:report
```

### Accessibility Testing Setup

#### axe-playwright Integration
```bash
# Run accessibility tests
npm run e2e:accessibility

# Generate accessibility reports
npm run accessibility:audit:report
```

## Troubleshooting Setup Issues

### Common Issues

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Reset test database
cd backend
poetry run python scripts/reset_test_db.py
```

#### Port Conflicts
```bash
# Check what's using ports
lsof -i :3000  # Frontend
lsof -i :8001  # Backend
lsof -i :5432  # Database

# Kill conflicting processes
kill -9 <PID>
```

#### Node.js Version Issues
```bash
# Check Node version
node --version

# Use nvm to switch versions
nvm use 20
```

### Validation Scripts

Run these commands to diagnose issues:

```bash
# Validate test setup
npm run validate:test-setup

# Check configuration
npm run config:validate

# Test database connectivity
npm run db:check
```

## Environment-Specific Setup

### Development Environment
- Full test suite available
- Hot reloading enabled
- Debug mode enabled
- All browsers supported

### Staging Environment
- Subset of tests run
- Performance benchmarks
- Integration with staging APIs
- Limited browser matrix

### Production Environment
- Smoke tests only
- Critical path validation
- Performance monitoring
- Accessibility compliance checks

## Next Steps

After completing setup:

1. Run a full test suite: `npm run ci:test:full`
2. Review test results in the dashboard
3. Set up your IDE for test debugging
4. Read the [Developer Onboarding Guide](../onboarding/README.md)

## Support

If you encounter issues:

1. Check the [Troubleshooting Guide](../troubleshooting/README.md)
2. Review existing GitHub issues
3. Create an issue with setup logs
4. Contact the DevOps team

---

**Changelog**
- v1.0.0: Initial comprehensive setup guide
- Added automated setup script
- Included advanced configuration options
- Added troubleshooting section