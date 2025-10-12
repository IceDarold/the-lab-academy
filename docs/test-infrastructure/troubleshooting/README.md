# Troubleshooting Guide

This guide provides solutions for common issues encountered with the test infrastructure.

## Quick Diagnosis

### Run Diagnostic Commands

```bash
# Comprehensive test setup validation
npm run validate:test-setup

# Check system resources
npm run monitor:check

# Validate configurations
npm run config:validate

# Test database connectivity
npm run db:check
```

### Check System Status

```bash
# Check running processes
ps aux | grep -E "(node|python|postgres)"

# Check port usage
lsof -i :3000,8001,5432

# Check disk space
df -h

# Check memory usage
free -h  # Linux
vm_stat   # macOS
```

## Test Execution Issues

### Tests Not Running

#### Issue: `npm run test` fails with "command not found"
**Symptoms:** Tests don't start, command not recognized

**Solutions:**
```bash
# Check if dependencies are installed
cd frontend
npm install

# Check Node.js version
node --version  # Should be 20.x

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Tests timeout immediately
**Symptoms:** Tests start but fail with timeout errors

**Solutions:**
```bash
# Check test configuration
cat vitest.config.ts | grep timeout

# Increase timeout temporarily
export VITEST_TEST_TIMEOUT=60000

# Check for hanging processes
ps aux | grep -E "(vitest|playwright)"
kill -9 <PID>
```

### Database Connection Issues

#### Issue: "Connection refused" to PostgreSQL
**Symptoms:** Integration tests fail with database errors

**Solutions:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql     # Linux

# Start PostgreSQL
brew services start postgresql       # macOS
sudo systemctl start postgresql     # Linux

# Check connection
psql -h localhost -U postgres -d test_db

# Reset test database
cd backend
poetry run python scripts/reset_test_db.py
```

#### Issue: Database migration failures
**Symptoms:** Backend tests fail during database setup

**Solutions:**
```bash
# Check migration status
cd backend
poetry run alembic current

# Reset migrations
poetry run alembic downgrade base
poetry run alembic upgrade head

# Check migration files
ls backend/alembic/versions/
```

### Browser and E2E Test Issues

#### Issue: Playwright browser launch fails
**Symptoms:** E2E tests fail with browser errors

**Solutions:**
```bash
# Install browsers
cd frontend
npx playwright install --with-deps

# Check browser installation
npx playwright install-deps
npx playwright browsers

# Clear browser cache
rm -rf ~/.cache/ms-playwright
```

#### Issue: Visual regression tests failing
**Symptoms:** Screenshot comparisons fail unexpectedly

**Solutions:**
```bash
# Update baseline screenshots
npm run e2e:visual:update

# Check screenshot threshold
cat playwright.config.ts | grep threshold

# Review failed screenshots
ls frontend/test-results/visual-regression*/
open test-failed-1.png  # View differences
```

### Performance and Resource Issues

#### Issue: Tests running very slowly
**Symptoms:** Test execution takes much longer than expected

**Solutions:**
```bash
# Check system resources
top    # Linux/macOS
htop  # Linux

# Reduce parallel workers
export PLAYWRIGHT_WORKERS=1

# Check for memory leaks
npm run performance

# Clear test cache
npm run cache:clear
```

#### Issue: Out of memory errors
**Symptoms:** Tests crash with memory allocation errors

**Solutions:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Reduce test parallelism
export VITEST_MAX_THREADS=2

# Check for memory leaks in tests
npm run test:memory-profile
```

## Configuration Issues

### Issue: Configuration validation fails
**Symptoms:** `npm run validate:test-setup` reports errors

**Solutions:**
```bash
# Check validation output
npm run validate:test-setup 2>&1 | tee validation.log

# Review configuration files
cat frontend/vitest.config.ts
cat frontend/playwright.config.ts

# Reset to default configuration
git checkout origin/main -- frontend/*.config.ts
```

### Issue: Environment variables not working
**Symptoms:** Tests use wrong configuration values

**Solutions:**
```bash
# Check environment file
cat frontend/.env

# Export variables explicitly
export VITE_API_URL=http://127.0.0.1:8001/api
export VITE_TESTING=true

# Check variable loading
node -e "console.log(process.env.VITE_API_URL)"
```

## Network and Connectivity Issues

### Issue: Backend API not reachable
**Symptoms:** Integration tests fail with network errors

**Solutions:**
```bash
# Check if backend is running
curl http://127.0.0.1:8001/health

# Start backend manually
cd backend
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8001

# Check backend logs
tail -f backend/logs/app.log
```

### Issue: CORS errors in E2E tests
**Symptoms:** Frontend tests fail with CORS policy errors

**Solutions:**
```bash
# Check CORS configuration in backend
cat backend/src/main.py | grep CORS

# Update allowed origins for testing
# In backend/src/main.py
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

## CI/CD Issues

### Issue: CI pipeline failing
**Symptoms:** GitHub Actions jobs fail

**Solutions:**
```bash
# Run CI locally
npm run ci:test:full

# Check CI logs
# Go to GitHub Actions tab in repository

# Debug specific job
export CI=true
npm run test:integration:ci
```

### Issue: Artifact upload failures
**Symptoms:** Test results not available in CI

**Solutions:**
```bash
# Check artifact directory
ls -la frontend/test-results/

# Ensure proper permissions
chmod -R 755 frontend/test-results/

# Check disk space in CI
df -h
```

## Test Result and Reporting Issues

### Issue: Test results not generating
**Symptoms:** No test output or reports

**Solutions:**
```bash
# Check test result directories
ls -la frontend/test-results/
ls -la frontend/coverage/

# Run test aggregation
npm run test:aggregate

# Check reporter configuration
cat playwright.config.ts | grep reporter
```

### Issue: Dashboard not updating
**Symptoms:** Test dashboard shows stale data

**Solutions:**
```bash
# Generate dashboard manually
npm run test:dashboard

# Check dashboard data
cat frontend/test-dashboard/metrics.json

# Export metrics
npm run dashboard:export
```

## Advanced Troubleshooting

### Debug Mode Testing

```bash
# Enable debug logging
export DEBUG=test:*
export PLAYWRIGHT_DEBUG=1

# Run tests with verbose output
npm run test:run -- --reporter verbose

# Debug specific test
npx playwright test --debug tests/specific-test.test.ts
```

### Network Debugging

```bash
# Monitor network requests
npm run e2e -- --headed

# Check API calls
curl -v http://127.0.0.1:8001/api/health

# Use network proxy
export HTTP_PROXY=http://localhost:8080
```

### Memory and Performance Profiling

```bash
# Profile test execution
npm run performance:profile

# Check for memory leaks
npm run test:memory-leak-check

# Generate performance report
npm run performance:report
```

## Emergency Procedures

### Complete Test Environment Reset

```bash
# Stop all processes
pkill -f "node|python|postgres"

# Clean all caches and artifacts
npm run cache:clear
rm -rf frontend/node_modules/.cache
rm -rf frontend/test-results/
rm -rf frontend/coverage/
rm -rf backend/__pycache__/

# Reset database
cd backend
poetry run python scripts/reset_test_db.py --full

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install

cd backend
rm -rf .venv
poetry install

# Reinstall browsers
npx playwright install --with-deps
```

### Minimal Test Configuration

For critical situations, use minimal configuration:

```typescript
// minimal.config.ts
export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    environment: 'node',
    testTimeout: 10000,
  }
})
```

### Recovery Testing

```bash
# Run smoke tests only
npm run test:smoke

# Test critical paths
npm run test:critical-path

# Validate core functionality
npm run validate:core
```

## Monitoring and Alerting

### Set Up Monitoring

```bash
# Enable test monitoring
npm run monitor:alerts

# Check alert status
npm run monitor:check

# Generate alert report
npm run monitor:report
```

### Common Alert Scenarios

- **Test failure rate > 5%**: Check recent changes
- **Performance degradation > 10%**: Review system resources
- **Memory usage > 80%**: Scale test runners
- **Database connection failures**: Check database health

## Getting Help

### Internal Support
1. Check this troubleshooting guide
2. Review recent commits and changes
3. Check GitHub issues for similar problems
4. Contact the QA team lead

### External Resources
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [pytest Documentation](https://docs.pytest.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Creating Support Tickets
When creating issues, include:

```markdown
**Environment:**
- OS: [macOS/Linux/Windows]
- Node.js version: [run `node --version`]
- Python version: [run `python --version`]

**Steps to reproduce:**
1. [Clear steps to reproduce the issue]

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Logs:**
[Include relevant log output]

**Test command:**
[Command that fails]
```

---

**Changelog**
- v1.0.0: Initial comprehensive troubleshooting guide
- Added diagnostic procedures
- Included emergency recovery steps
- Added monitoring and alerting information