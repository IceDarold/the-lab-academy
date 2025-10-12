# Test Infrastructure Documentation Index

This index provides comprehensive navigation through all test infrastructure documentation, with cross-references and quick access to specific topics.

## Quick Start Navigation

| I Need To... | Go To | Why |
|-------------|-------|-----|
| Set up testing locally | [Setup Guide](setup/README.md) | Complete environment setup |
| Fix a failing test | [Troubleshooting Guide](troubleshooting/README.md) | Common issues and solutions |
| Modify test configurations | [Configuration Guide](configuration/README.md) | Safe configuration changes |
| Join the QA team | [Onboarding Guide](onboarding/README.md) | Training materials |
| Understand CI/CD | [CI/CD Guide](ci-cd/README.md) | Pipeline setup and monitoring |
| Maintain test infrastructure | [Maintenance Guide](maintenance/README.md) | Regular upkeep tasks |

## Documentation Structure

```
docs/test-infrastructure/
├── README.md                 # Main overview and navigation
├── INDEX.md                  # This comprehensive index
├── setup/
│   └── README.md            # Complete setup instructions
├── configuration/
│   └── README.md            # Configuration management
├── troubleshooting/
│   └── README.md            # Common issues and solutions
├── maintenance/
│   └── README.md            # Regular maintenance tasks
├── onboarding/
│   └── README.md            # Developer training materials
└── ci-cd/
    └── README.md            # CI/CD integration guide
```

## Topic-Based Cross-References

### Testing Fundamentals

| Topic | Primary Guide | Related Sections |
|-------|---------------|------------------|
| **Unit Testing** | [Setup Guide - Unit Tests](setup/README.md#unit-testing-setup) | [Onboarding - Writing Tests](onboarding/README.md#writing-your-first-tests) |
| **Integration Testing** | [Setup Guide - Integration Tests](setup/README.md#integration-testing-setup) | [CI/CD - Integration Job](ci-cd/README.md#frontend-integration-tests-job) |
| **E2E Testing** | [Setup Guide - E2E Tests](setup/README.md#e2e-testing-setup) | [CI/CD - E2E Jobs](ci-cd/README.md#e2e-testing-jobs) |
| **Visual Regression** | [Setup Guide - Visual Tests](setup/README.md#running-e2e-tests) | [CI/CD - Visual Job](ci-cd/README.md#visual-regression-tests) |
| **Performance Testing** | [Setup Guide - Performance](setup/README.md#performance-testing-setup) | [Maintenance - Performance](maintenance/README.md#performance-baseline-updates) |
| **Accessibility Testing** | [Setup Guide - Accessibility](setup/README.md#accessibility-testing-setup) | [CI/CD - Accessibility Job](ci-cd/README.md#accessibility-tests) |

### Configuration Management

| Topic | Primary Guide | Related Sections |
|-------|---------------|------------------|
| **Vitest Config** | [Configuration - Vitest](configuration/README.md#vitest-configuration) | [Setup - Unit Tests](setup/README.md#unit-testing-setup) |
| **Playwright Config** | [Configuration - Playwright](configuration/README.md#playwright-config) | [Setup - E2E Tests](setup/README.md#e2e-testing-setup) |
| **Environment Variables** | [Configuration - Environment](configuration/README.md#environment-configuration) | [Setup - Environment](setup/README.md#environment-configuration) |
| **Validation** | [Configuration - Validation](configuration/README.md#configuration-validation) | [Troubleshooting - Config Issues](troubleshooting/README.md#configuration-issues) |

### CI/CD Pipeline

| Topic | Primary Guide | Related Sections |
|-------|---------------|------------------|
| **Pipeline Overview** | [CI/CD - Overview](ci-cd/README.md#ci-cd-pipeline-overview) | [Setup - CI Simulation](setup/README.md#ci-cd-environment-setup) |
| **Job Configuration** | [CI/CD - Job Details](ci-cd/README.md#job-configuration-details) | [Troubleshooting - CI Issues](troubleshooting/README.md#ci-cd-issues) |
| **Parallel Execution** | [CI/CD - Optimization](ci-cd/README.md#pipeline-optimization-strategies) | [Maintenance - Performance](maintenance/README.md#performance-optimization) |
| **Monitoring** | [CI/CD - Monitoring](ci-cd/README.md#monitoring-and-observability) | [Maintenance - Monitoring](maintenance/README.md#monitoring-and-alerting-setup) |

### Maintenance Tasks

| Task | Frequency | Guide | Related Sections |
|------|-----------|-------|------------------|
| **Dependency Updates** | Weekly | [Maintenance - Dependencies](maintenance/README.md#dependency-updates) | [Troubleshooting - Updates](troubleshooting/README.md#dependency-updates) |
| **Performance Baselines** | Bi-weekly | [Maintenance - Performance](maintenance/README.md#performance-baseline-updates) | [Configuration - Thresholds](configuration/README.md#updating-performance-thresholds) |
| **Browser Updates** | Monthly | [Maintenance - Browsers](maintenance/README.md#browser-updates) | [Setup - Browser Setup](setup/README.md#browser-dependencies) |
| **Configuration Audits** | Monthly | [Maintenance - Audits](maintenance/README.md#configuration-audits) | [Configuration - Validation](configuration/README.md#configuration-validation) |
| **Storage Cleanup** | Weekly | [Maintenance - Storage](maintenance/README.md#storage-cleanup) | [Troubleshooting - Resources](troubleshooting/README.md#performance-and-resource-issues) |

### Troubleshooting by Symptom

| Symptom | Primary Solution | Alternative Solutions |
|---------|------------------|----------------------|
| **Tests not running** | [Troubleshooting - Not Running](troubleshooting/README.md#tests-not-running) | [Setup - Validation](setup/README.md#validate-setup) |
| **Database connection failed** | [Troubleshooting - Database](troubleshooting/README.md#database-connection-issues) | [Setup - Database](setup/README.md#database-setup) |
| **Browser launch failed** | [Troubleshooting - Browser](troubleshooting/README.md#browser-and-e2e-test-issues) | [Setup - Browsers](setup/README.md#playwright-browsers) |
| **Configuration validation failed** | [Troubleshooting - Config](troubleshooting/README.md#configuration-issues) | [Configuration - Validation](configuration/README.md#configuration-validation) |
| **CI pipeline failing** | [Troubleshooting - CI](troubleshooting/README.md#ci-cd-issues) | [CI/CD - Debugging](ci-cd/README.md#local-ci-simulation) |
| **Tests running slowly** | [Troubleshooting - Performance](troubleshooting/README.md#performance-and-resource-issues) | [Maintenance - Optimization](maintenance/README.md#performance-optimization) |

## Command Reference

### Setup Commands

| Command | Purpose | Guide Reference |
|---------|---------|-----------------|
| `npm run validate:test-setup` | Validate complete setup | [Setup - Validation](setup/README.md#step-5-validate-setup) |
| `./scripts/setup-test-environment.sh` | Automated setup | [Setup - Quick Setup](setup/README.md#quick-setup-recommended) |
| `npm run e2e:install` | Install Playwright browsers | [Setup - Browsers](setup/README.md#playwright-browsers) |
| `npm run backend:run` | Start backend for testing | [Setup - Backend](setup/README.md#backend-dependencies) |

### Testing Commands

| Command | Purpose | Guide Reference |
|---------|---------|-----------------|
| `npm run test:run` | Run unit tests | [Setup - Unit Tests](setup/README.md#running-unit-tests) |
| `npm run test:integration` | Run integration tests | [Setup - Integration](setup/README.md#running-integration-tests) |
| `npm run e2e` | Run E2E tests | [Setup - E2E](setup/README.md#running-e2e-tests) |
| `npm run test:coverage` | Generate coverage reports | [Setup - Coverage](setup/README.md#running-unit-tests) |
| `npm run ci:test:full` | Run complete test suite | [CI/CD - Local Simulation](ci-cd/README.md#running-ci-commands-locally) |

### Configuration Commands

| Command | Purpose | Guide Reference |
|---------|---------|-----------------|
| `npm run config:validate` | Validate configurations | [Configuration - Validation](configuration/README.md#configuration-validation) |
| `npm run config:drift-check` | Check configuration drift | [Configuration - Monitoring](configuration/README.md#configuration-monitoring) |
| `npm run validate:test-setup` | Comprehensive validation | [Setup - Validation](setup/README.md#validate-setup) |

### Maintenance Commands

| Command | Purpose | Guide Reference |
|---------|---------|-----------------|
| `npm run maintenance:daily` | Daily maintenance | [Maintenance - Daily](maintenance/README.md#daily-maintenance-tasks) |
| `npm run maintenance:weekly` | Weekly maintenance | [Maintenance - Weekly](maintenance/README.md#weekly-maintenance-tasks) |
| `npm run cache:clear` | Clear caches | [Maintenance - Storage](maintenance/README.md#storage-cleanup) |
| `npm run performance:baseline` | Update performance baselines | [Maintenance - Performance](maintenance/README.md#performance-baseline-updates) |

### Troubleshooting Commands

| Command | Purpose | Guide Reference |
|---------|---------|-----------------|
| `npm run monitor:check` | System health check | [Troubleshooting - Diagnosis](troubleshooting/README.md#quick-diagnosis) |
| `npm run monitor:alerts` | Check alerts | [Troubleshooting - Monitoring](troubleshooting/README.md#monitoring-and-alerting) |
| `DEBUG=* npm run test:run` | Debug test execution | [Troubleshooting - Debug](troubleshooting/README.md#debug-mode-testing) |
| `npm run emergency:diagnose` | Emergency diagnosis | [Troubleshooting - Emergency](troubleshooting/README.md#emergency-procedures) |

### CI/CD Commands

| Command | Purpose | Guide Reference |
|---------|---------|-----------------|
| `npm run ci:test:full` | Simulate CI pipeline | [CI/CD - Local Simulation](ci-cd/README.md#simulating-ci-environment) |
| `npm run test:aggregate` | Aggregate test results | [CI/CD - Aggregation](ci-cd/README.md#test-result-aggregation) |
| `npm run test:dashboard` | Generate test dashboard | [CI/CD - Reporting](ci-cd/README.md#comprehensive-reporting) |

## File and Directory Reference

### Configuration Files

| File | Purpose | Guide Reference |
|------|---------|-----------------|
| `frontend/vitest.config.ts` | Unit test configuration | [Configuration - Vitest](configuration/README.md#vitest-configuration) |
| `frontend/vitest.integration.config.ts` | Integration test config | [Configuration - Integration](configuration/README.md#vitest-integration-config) |
| `frontend/playwright.config.ts` | E2E test configuration | [Configuration - Playwright](configuration/README.md#playwright-config) |
| `frontend/.env` | Environment variables | [Configuration - Environment](configuration/README.md#environment-variables) |
| `.github/workflows/ci.yml` | CI/CD pipeline | [CI/CD - Pipeline](ci-cd/README.md#pipeline-architecture) |

### Test Directories

| Directory | Contents | Guide Reference |
|-----------|----------|-----------------|
| `frontend/src/` | Source code with unit tests | [Onboarding - Unit Tests](onboarding/README.md#unit-test-example) |
| `frontend/tests/integration/` | Integration tests | [Onboarding - Integration](onboarding/README.md#integration-test-example) |
| `frontend/tests/` | E2E tests | [Onboarding - E2E](onboarding/README.md#e2e-test-example) |
| `frontend/test-results/` | Test output and artifacts | [Setup - Results](setup/README.md#validate-setup) |
| `frontend/coverage/` | Coverage reports | [Setup - Coverage](setup/README.md#running-unit-tests) |

### Script Files

| Script | Purpose | Guide Reference |
|--------|---------|-----------------|
| `scripts/setup-test-environment.sh` | Automated setup | [Setup - Quick Setup](setup/README.md#quick-setup-recommended) |
| `scripts/validate-test-setup.js` | Setup validation | [Setup - Validation](setup/README.md#validate-setup) |
| `scripts/test-runner.js` | Test orchestration | [Setup - Advanced](setup/README.md#advanced-setup-options) |
| `scripts/generate-test-summary.js` | Result aggregation | [CI/CD - Aggregation](ci-cd/README.md#test-result-aggregation) |

## Learning Path

### For New Team Members
1. **Start**: [Main README](../README.md) - Overview
2. **Setup**: [Setup Guide](setup/README.md) - Environment setup
3. **Learn**: [Onboarding Guide](onboarding/README.md) - Complete training
4. **Practice**: Write tests following examples
5. **Contribute**: Follow [Configuration Guide](configuration/README.md)

### For Experienced QA Engineers
1. **Deep Dive**: [CI/CD Guide](ci-cd/README.md) - Pipeline architecture
2. **Maintenance**: [Maintenance Guide](maintenance/README.md) - Operational tasks
3. **Optimization**: [Configuration Guide](configuration/README.md) - Advanced config
4. **Leadership**: [Onboarding Guide](onboarding/README.md) - Training others

### For Developers
1. **Quick Start**: [Setup Guide - Quick Setup](setup/README.md#quick-setup-recommended)
2. **Testing**: [Onboarding - Writing Tests](onboarding/README.md#writing-your-first-tests)
3. **CI/CD**: [CI/CD - Local Simulation](ci-cd/README.md#local-ci-simulation)
4. **Issues**: [Troubleshooting Guide](troubleshooting/README.md)

## Emergency Contacts and Resources

### Internal Resources
- **QA Lead**: [contact] - Technical guidance
- **DevOps Team**: [contact] - Infrastructure issues
- **Documentation Issues**: Create GitHub issue with `documentation` label

### External Resources
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Testing Library](https://testing-library.com/)

## Glossary

| Term | Definition | Guide Reference |
|------|------------|-----------------|
| **Unit Tests** | Tests individual functions/components | [Setup - Unit Tests](setup/README.md#unit-testing-setup) |
| **Integration Tests** | Tests component interactions | [Setup - Integration](setup/README.md#integration-testing-setup) |
| **E2E Tests** | Tests complete user journeys | [Setup - E2E](setup/README.md#e2e-testing-setup) |
| **Visual Regression** | Automated screenshot comparison | [Setup - Visual](setup/README.md#running-e2e-tests) |
| **CI/CD** | Continuous Integration/Deployment | [CI/CD Guide](ci-cd/README.md) |
| **Flaky Tests** | Tests that fail intermittently | [Troubleshooting - Flaky](troubleshooting/README.md#flaky-tests) |
| **Test Coverage** | Percentage of code tested | [Setup - Coverage](setup/README.md#running-unit-tests) |
| **Baseline** | Reference point for comparisons | [Maintenance - Baselines](maintenance/README.md#performance-baseline-updates) |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | October 2025 | Initial comprehensive index |
| | | Cross-references between all guides |
| | | Command reference and file index |
| | | Learning paths and glossary |

---

**Navigation Tips:**
- Use Ctrl+F (Cmd+F on Mac) to search this index
- Follow cross-references for related information
- Check the learning paths for structured progression
- Refer to the command reference for quick actions

**Feedback:** Found something missing or unclear? [Create an issue](https://github.com/your-org/the-lab-academy/issues/new?labels=documentation) or update this index.