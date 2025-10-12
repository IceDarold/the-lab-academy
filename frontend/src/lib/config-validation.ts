import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { z } from 'zod';

/**
 * Checks if a file is a valid config file that can be imported as a module
 */
function isImportableConfigFile(filePath: string): boolean {
  if (!existsSync(filePath)) {
    return false;
  }
  const ext = filePath.split('.').pop()?.toLowerCase();
  return ext === 'ts' || ext === 'js';
}

// Environment variable schemas
const envSchema = z.object({
  VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL'),
  VITE_MODE: z.enum(['development', 'production', 'test']).optional(),
  VITE_API_TIMEOUT: z.string().transform(val => parseInt(val)).optional(),
  VITE_API_MAX_RETRIES: z.string().transform(val => parseInt(val)).optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_KEY: z.string().optional(),
  TEST_SUPABASE_URL: z.string().url().optional(),
  TEST_SUPABASE_KEY: z.string().optional(),
  TEST_SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

// Playwright config schema
const playwrightConfigSchema = z.object({
  testDir: z.string(),
  testMatch: z.array(z.string()),
  fullyParallel: z.boolean(),
  forbidOnly: z.boolean(),
  retries: z.number(),
  workers: z.number().optional(),
  expect: z.object({
    toHaveScreenshot: z.object({
      threshold: z.number(),
      maxDiffPixels: z.number(),
    }),
  }),
  use: z.object({
    actionTimeout: z.number(),
    navigationTimeout: z.number(),
    baseURL: z.string().url(),
    trace: z.string(),
    screenshot: z.string(),
    video: z.string(),
  }),
  projects: z.array(z.object({
    name: z.string(),
    use: z.record(z.any()),
  })),
});

// Vitest config schema
const vitestConfigSchema = z.object({
  plugins: z.array(z.any()),
  resolve: z.object({
    alias: z.record(z.string()),
  }),
  test: z.object({
    globals: z.boolean(),
    environment: z.string(),
    include: z.array(z.string()),
    exclude: z.array(z.string()),
    setupFiles: z.array(z.string()),
    css: z.boolean(),
    coverage: z.object({
      provider: z.string(),
      reporter: z.array(z.string()),
      exclude: z.array(z.string()),
    }).optional(),
    testTimeout: z.number().optional(),
    hookTimeout: z.number().optional(),
    globalSetup: z.array(z.string()).optional(),
    globalTeardown: z.array(z.string()).optional(),
    env: z.record(z.string()).optional(),
  }),
});

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigValidationOptions {
  strict?: boolean;
  verbose?: boolean;
}

/**
 * Loads environment variables from .env file with validation
 */
export async function loadAndValidateEnvironmentVariables(
  options: ConfigValidationOptions = {}
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Load .env file
    const envPath = resolve(process.cwd(), '..', '.env');
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf8');
      const envVars: Record<string, string> = {};

      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      });

      // Validate against schema
      const validation = envSchema.safeParse(envVars);

      if (!validation.success) {
        result.isValid = false;
        validation.error.errors.forEach(err => {
          result.errors.push(`Environment variable ${err.path.join('.')}: ${err.message}`);
        });
      }

      // Check required variables
      const requiredVars = ['VITE_API_URL'];
      requiredVars.forEach(varName => {
        if (!envVars[varName] && !process.env[varName]) {
          result.errors.push(`Required environment variable not found: ${varName}`);
          result.isValid = false;
        }
      });

      if (options.verbose) {
        const optionalVars = ['VITE_MODE', 'VITE_API_TIMEOUT', 'SUPABASE_URL'];
        optionalVars.forEach(varName => {
          if (!envVars[varName] && !process.env[varName]) {
            result.warnings.push(`Optional environment variable not set: ${varName}`);
          }
        });
      }
    } else {
      result.errors.push('.env file not found');
      result.isValid = false;
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Failed to load environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Validates Playwright configuration
 */
export async function validatePlaywrightConfig(
  config: any,
  options: ConfigValidationOptions = {}
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    const validation = playwrightConfigSchema.safeParse(config);

    if (!validation.success) {
      result.isValid = false;
      validation.error.errors.forEach(err => {
        result.errors.push(`Playwright config ${err.path.join('.')}: ${err.message}`);
      });
    }

    // Additional validations
    if (config.testDir && !existsSync(join(process.cwd(), config.testDir))) {
      result.warnings.push(`Test directory does not exist: ${config.testDir}`);
    }

    if (config.use?.baseURL) {
      try {
        new URL(config.use.baseURL);
      } catch {
        result.errors.push(`Invalid baseURL: ${config.use.baseURL}`);
        result.isValid = false;
      }
    }

    if (options.strict && config.workers === undefined && !process.env.CI) {
      result.warnings.push('Workers not configured, using default');
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Failed to validate Playwright config: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Validates Vitest configuration
 */
export async function validateVitestConfig(
  config: any,
  options: ConfigValidationOptions = {}
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    const validation = vitestConfigSchema.safeParse(config);

    if (!validation.success) {
      result.isValid = false;
      validation.error.errors.forEach(err => {
        result.errors.push(`Vitest config ${err.path.join('.')}: ${err.message}`);
      });
    }

    // Additional validations
    if (config.test?.setupFiles) {
      config.test.setupFiles.forEach((file: string) => {
        const filePath = join(process.cwd(), file);
        if (!existsSync(filePath)) {
          result.errors.push(`Setup file does not exist: ${file}`);
          result.isValid = false;
        }
      });
    }

    if (config.test?.globalSetup) {
      config.test.globalSetup.forEach((file: string) => {
        const filePath = join(process.cwd(), file);
        if (!existsSync(filePath)) {
          result.errors.push(`Global setup file does not exist: ${file}`);
          result.isValid = false;
        }
      });
    }

    if (config.test?.globalTeardown) {
      config.test.globalTeardown.forEach((file: string) => {
        const filePath = join(process.cwd(), file);
        if (!existsSync(filePath)) {
          result.errors.push(`Global teardown file does not exist: ${file}`);
          result.isValid = false;
        }
      });
    }

    if (options.strict && !config.test?.coverage) {
      result.warnings.push('Coverage configuration not found');
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Failed to validate Vitest config: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Comprehensive config validation that checks all config types
 */
export async function validateAllConfigs(
  options: ConfigValidationOptions = {}
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Validate environment variables
  const envResult = await loadAndValidateEnvironmentVariables(options);
  result.errors.push(...envResult.errors);
  result.warnings.push(...envResult.warnings);
  if (!envResult.isValid) result.isValid = false;

  // Validate Playwright config (lazy load)
  const playwrightConfigPath = resolve(process.cwd(), 'playwright.config.ts');
  if (isImportableConfigFile(playwrightConfigPath)) {
    try {
      const playwrightConfig = await import('../../playwright.config.ts');
      const pwResult = await validatePlaywrightConfig(playwrightConfig.default || playwrightConfig, options);
      result.errors.push(...pwResult.errors);
      result.warnings.push(...pwResult.warnings);
      if (!pwResult.isValid) result.isValid = false;
    } catch (error) {
      result.errors.push(`Failed to load Playwright config: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }
  } else {
    result.warnings.push('Playwright config file not found or not importable, skipping validation');
  }

  // Validate Vitest configs (lazy load)
  // Validate vitest.config.ts
  const vitestConfigPath = resolve(process.cwd(), 'vitest.config.ts');
  if (isImportableConfigFile(vitestConfigPath)) {
    try {
      const vitestModule = await import('../../vitest.config.ts');
      let vitestConfig = vitestModule.default || vitestModule;

      // If it's a function (defineConfig), we can't easily validate the result
      // without executing it, so we'll skip detailed validation for now
      if (typeof vitestConfig === 'function') {
        result.warnings.push('vitest.config.ts: Function-based config detected, skipping detailed validation');
      } else {
        const vtResult = await validateVitestConfig(vitestConfig, options);
        result.errors.push(...vtResult.errors.map(err => `vitest.config.ts: ${err}`));
        result.warnings.push(...vtResult.warnings.map(warn => `vitest.config.ts: ${warn}`));
        if (!vtResult.isValid) result.isValid = false;
      }
    } catch (error) {
      result.errors.push(`Failed to load vitest.config.ts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }
  } else {
    result.warnings.push('vitest.config.ts not found or not importable, skipping validation');
  }

  // Validate vitest.integration.config.ts
  const vitestIntegrationConfigPath = resolve(process.cwd(), 'vitest.integration.config.ts');
  if (isImportableConfigFile(vitestIntegrationConfigPath)) {
    try {
      const vitestModule = await import('../../vitest.integration.config.ts');
      let vitestConfig = vitestModule.default || vitestModule;

      // If it's a function (defineConfig), we can't easily validate the result
      // without executing it, so we'll skip detailed validation for now
      if (typeof vitestConfig === 'function') {
        result.warnings.push('vitest.integration.config.ts: Function-based config detected, skipping detailed validation');
      } else {
        const vtResult = await validateVitestConfig(vitestConfig, options);
        result.errors.push(...vtResult.errors.map(err => `vitest.integration.config.ts: ${err}`));
        result.warnings.push(...vtResult.warnings.map(warn => `vitest.integration.config.ts: ${warn}`));
        if (!vtResult.isValid) result.isValid = false;
      }
    } catch (error) {
      result.errors.push(`Failed to load vitest.integration.config.ts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }
  } else {
    result.warnings.push('vitest.integration.config.ts not found or not importable, skipping validation');
  }

  return result;
}

/**
 * Throws an error if validation fails, otherwise returns the result
 */
export async function validateConfigsOrThrow(
  options: ConfigValidationOptions = {}
): Promise<ValidationResult> {
  const result = await validateAllConfigs(options);

  if (!result.isValid) {
    const errorMessage = [
      'Configuration validation failed:',
      ...result.errors.map(err => `  ❌ ${err}`),
      ...result.warnings.map(warn => `  ⚠️  ${warn}`),
    ].join('\n');

    throw new Error(errorMessage);
  }

  return result;
}

/**
 * Utility function to get validation summary
 */
export function getValidationSummary(result: ValidationResult): string {
  const lines = [];

  if (result.isValid) {
    lines.push('✅ All configurations are valid');
  } else {
    lines.push('❌ Configuration validation failed');
  }

  if (result.errors.length > 0) {
    lines.push(`Errors (${result.errors.length}):`);
    result.errors.forEach(err => lines.push(`  ❌ ${err}`));
  }

  if (result.warnings.length > 0) {
    lines.push(`Warnings (${result.warnings.length}):`);
    result.warnings.forEach(warn => lines.push(`  ⚠️  ${warn}`));
  }

  return lines.join('\n');
}