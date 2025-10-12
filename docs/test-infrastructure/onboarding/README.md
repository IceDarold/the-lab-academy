# Developer Onboarding Guide

Welcome to the QA team! This guide will help you get started with our comprehensive test infrastructure.

## Welcome and Overview

### What You'll Learn
- Understanding our test infrastructure architecture
- Setting up your development environment
- Running and writing tests
- Contributing to test infrastructure improvements
- Best practices and workflows

### Time Estimate
- **Day 1**: Environment setup and basic testing (4 hours)
- **Day 2**: Advanced testing and CI/CD (4 hours)
- **Week 1**: Writing tests and contributing (16 hours)
- **Ongoing**: Maintenance and improvement (continuous)

## Day 1: Getting Started

### 1. Environment Setup (1 hour)

#### Prerequisites Check
```bash
# Check your system
node --version    # Should be 20.x
python --version  # Should be 3.12.x
git --version     # Latest version
```

#### Clone and Setup
```bash
# Clone the repository
git clone https://github.com/your-org/the-lab-academy.git
cd the-lab-academy

# Run automated setup
./scripts/setup-test-environment.sh

# Verify setup
npm run validate:test-setup
```

#### Manual Verification
```bash
# Check installations
cd frontend && npm list --depth=0
cd ../backend && poetry check

# Test basic connectivity
curl http://127.0.0.1:8001/health
```

### 2. Understanding Test Types (1 hour)

#### Unit Tests
```bash
# Run unit tests
npm run test:run

# With coverage
npm run test:coverage

# Watch mode for development
npm run test
```

**What they test:** Individual functions and components in isolation

#### Integration Tests
```bash
# Start backend first
npm run backend:run

# In another terminal, run integration tests
npm run test:integration
```

**What they test:** Component interactions and API integrations

#### E2E Tests
```bash
# Install browsers
npm run e2e:install

# Run E2E tests
npm run e2e
```

**What they test:** Complete user journeys from browser to database

### 3. Your First Test Run (2 hours)

#### Hands-On Exercise: Run the Full Test Suite
```bash
# Start backend
npm run backend:run

# In another terminal, start frontend
npm run dev

# In a third terminal, run tests
npm run ci:test:full
```

**Expected Outcome:** All tests pass, you see comprehensive reports

#### Exercise: Debug a Failing Test
```bash
# Intentionally break a test (for learning)
# Edit a test file to make it fail

# Run tests to see failure
npm run test:run

# Fix the test
# Run again to confirm fix
```

## Day 2: Deep Dive into Testing

### 1. Test Infrastructure Architecture (1 hour)

#### Understanding the Layers
```
┌─────────────────┐
│   E2E Tests     │ Playwright - User journeys
├─────────────────┤
│ Integration     │ Vitest + API - Component interaction
├─────────────────┤
│   Unit Tests    │ Vitest - Isolated functions
├─────────────────┤
│   Application   │ Frontend + Backend code
├─────────────────┤
│   Test Data     │ Databases, fixtures, mocks
└─────────────────┘
```

#### Key Technologies
- **Vitest**: Fast unit and integration testing
- **Playwright**: Cross-browser E2E testing
- **pytest**: Backend API testing
- **Custom Scripts**: Test orchestration and reporting

### 2. Writing Your First Tests (2 hours)

#### Unit Test Example
```typescript
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    button.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Integration Test Example
```typescript
// tests/integration/auth-flow.test.tsx
describe('Authentication Flow', () => {
  it('should login user successfully', async () => {
    // Start from login page
    await page.goto('/login')

    // Fill login form
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')

    // Submit form
    await page.click('[data-testid="login-button"]')

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible()
  })
})
```

#### E2E Test Example
```typescript
// tests/auth-login-e2e.test.ts
import { test, expect } from '@playwright/test'

test('user can login and access dashboard', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login')

  // Perform login
  await page.fill('input[name="email"]', 'user@example.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // Verify successful login
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('text=Welcome back')).toBeVisible()
})
```

### 3. Test Debugging (1 hour)

#### Common Debugging Techniques
```bash
# Run specific test
npm run test:run -- --grep "Button component"

# Run with debug output
DEBUG=test:* npm run test:run

# Run E2E test in headed mode
npm run e2e:headed -- --grep "login"

# Debug Playwright test
npx playwright test --debug tests/auth-login-e2e.test.ts
```

#### Debugging Checklist
- [ ] Check test setup and teardown
- [ ] Verify test data and fixtures
- [ ] Check network requests in E2E tests
- [ ] Review console logs and errors
- [ ] Validate test selectors and waits

## Week 1: Contributing to Test Infrastructure

### 1. Code Quality Standards (2 hours)

#### Test Naming Conventions
```typescript
// Good: Descriptive and specific
describe('UserProfile Component', () => {
  describe('when user is logged in', () => {
    it('displays user avatar and name', () => {
      // test implementation
    })

    it('allows editing profile information', () => {
      // test implementation
    })
  })
})

// Avoid: Vague or implementation-focused
describe('UserProfile', () => {
  it('works correctly', () => {
    // test implementation
  })
})
```

#### Test Organization
```
tests/
├── unit/                    # Unit tests
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/            # Integration tests
│   ├── api/
│   └── ui/
├── e2e/                    # E2E tests
│   ├── auth/
│   ├── courses/
│   └── admin/
└── shared/                 # Shared test utilities
    ├── fixtures/
    ├── helpers/
    └── mocks/
```

### 2. Contributing Guidelines (2 hours)

#### Pull Request Process
1. **Create feature branch**
   ```bash
   git checkout -b feature/add-login-tests
   ```

2. **Write tests first (TDD)**
   ```bash
   # Write failing test
   npm run test:run -- --grep "new feature"

   # Implement feature
   # Test passes
   ```

3. **Run full test suite**
   ```bash
   npm run ci:test:full
   ```

4. **Create PR with description**
   ```markdown
   ## Description
   Add comprehensive login test coverage

   ## Changes
   - Added unit tests for LoginForm component
   - Added integration tests for auth flow
   - Added E2E tests for login journey

   ## Testing
   - All existing tests pass
   - New tests provide 95% coverage for login flow
   - Manual testing confirms functionality
   ```

#### Code Review Checklist
- [ ] Tests follow naming conventions
- [ ] Test coverage meets requirements (>80%)
- [ ] No flaky tests (tests pass consistently)
- [ ] Tests are isolated and independent
- [ ] Test data is realistic and comprehensive
- [ ] Error cases are covered
- [ ] Performance tests included where relevant

### 3. Advanced Testing Techniques (4 hours)

#### Visual Regression Testing
```typescript
// tests/visual-regression.test.ts
test('login page matches design', async ({ page }) => {
  await page.goto('/login')

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle')

  // Take screenshot and compare
  await expect(page).toHaveScreenshot('login-page.png')
})
```

#### Performance Testing
```typescript
// tests/performance.test.ts
test('login form loads quickly', async ({ page }) => {
  const startTime = Date.now()

  await page.goto('/login')
  await page.waitForSelector('form')

  const loadTime = Date.now() - startTime
  expect(loadTime).toBeLessThan(2000) // 2 seconds
})
```

#### Accessibility Testing
```typescript
// tests/accessibility.test.ts
test('login page is accessible', async ({ page }) => {
  await page.goto('/login')

  // Run accessibility audit
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
```

### 4. CI/CD Integration (4 hours)

#### Understanding the Pipeline
```yaml
# .github/workflows/ci.yml key jobs
jobs:
  frontend-unit-tests:     # Fast feedback
  frontend-integration-tests: # API integration
  backend-tests:           # Database and API
  e2e-api-tests:           # API contracts
  e2e-ui-tests:            # User interfaces
  visual-regression-tests: # Design consistency
  performance-tests:       # Speed and efficiency
  accessibility-tests:     # Inclusive design
```

#### Local CI Simulation
```bash
# Simulate CI environment
export CI=true

# Run same commands as CI
npm run test:integration:ci
npm run e2e:ci
npm run performance:ci
```

#### Debugging CI Failures
```bash
# Check CI logs
# Go to GitHub Actions tab

# Reproduce locally
export CI=true
npm run e2e:ci

# Debug with verbose output
DEBUG=* npm run e2e:ci
```

## Ongoing Learning and Contribution

### Weekly Activities
- **Monday**: Review weekend test results and alerts
- **Tuesday**: Update test cases for new features
- **Wednesday**: Performance and accessibility testing
- **Thursday**: Test infrastructure improvements
- **Friday**: Test coverage analysis and planning

### Monthly Goals
- Achieve >90% test coverage
- Reduce flaky tests to <1%
- Improve test execution time by 10%
- Add automated tests for new features

### Learning Resources
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Test Automation University](https://testautomationu.applitools.com/)

### Getting Help
- **Daily Standup**: Share progress and blockers
- **QA Lead**: For technical guidance
- **DevOps Team**: For infrastructure issues
- **Documentation**: This guide and related docs

## Assessment and Certification

### Skills Checklist
- [ ] Can set up complete test environment
- [ ] Understands all test types and when to use them
- [ ] Can write comprehensive test suites
- [ ] Familiar with debugging techniques
- [ ] Contributes to test infrastructure improvements
- [ ] Follows testing best practices

### Practical Assessment
Create a comprehensive test suite for a new feature:

1. **Unit tests** for components and utilities
2. **Integration tests** for API interactions
3. **E2E tests** for user journeys
4. **Performance tests** for speed requirements
5. **Accessibility tests** for inclusive design
6. **Visual regression tests** for design consistency

### Next Steps
- Join the QA guild meetings
- Participate in test infrastructure planning
- Mentor new team members
- Contribute to testing tools and frameworks

## Welcome to the Team!

You're now equipped to contribute effectively to our test infrastructure. Remember:

- **Quality over quantity**: Well-written tests are better than many poorly written ones
- **Prevention over cure**: Write tests to prevent regressions
- **Collaboration**: Testing is a team effort
- **Continuous improvement**: Always look for ways to improve our testing practices

Happy testing! 🚀

---

**Changelog**
- v1.0.0: Initial comprehensive onboarding guide
- Added hands-on exercises and examples
- Included advanced testing techniques
- Added assessment and certification section