import { spawn } from 'child_process';
import { join } from 'path';
import http from 'http';
import { buildCache } from '../scripts/cache-utils';

export default async function globalSetup() {
  const backendDir = join(process.cwd(), '..', 'backend');
  const frontendDir = join(process.cwd(), '..', 'frontend');

  // Set testing environment
  const env = {
    ...process.env,
    TESTING: 'true',
  };

  // Run database migrations
  console.log('Running database migrations...');
  await new Promise<void>((resolve, reject) => {
    const migrateProcess = spawn('poetry', ['run', 'alembic', 'upgrade', 'head'], {
      cwd: backendDir,
      env,
      stdio: 'inherit',
    });

    migrateProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Migrations completed successfully');
        resolve();
      } else {
        reject(new Error(`Migration failed with exit code ${code}`));
      }
    });

    migrateProcess.on('error', reject);
  });

  // Seed test database
  console.log('Seeding test database...');
  await new Promise<void>((resolve, reject) => {
    const seedProcess = spawn('poetry', ['run', 'python', 'scripts/e2e_seed.py'], {
      cwd: backendDir,
      env,
      stdio: 'inherit',
    });

    seedProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Database seeding completed successfully');
        resolve();
      } else {
        reject(new Error(`Seeding failed with exit code ${code}`));
      }
    });

    seedProcess.on('error', reject);
  });

  // Start the backend server
  console.log('Starting backend server...');
  const serverProcess = spawn('poetry', ['run', 'uvicorn', 'src.main:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: backendDir,
    env,
    stdio: 'inherit',
    detached: true, // Allow the process to run independently
  });

  // Store the server process globally for teardown
  (global as any).__SERVER_PROCESS__ = serverProcess;

  // Wait for the server to be ready
  console.log('Waiting for server to be ready...');
  await new Promise<void>((resolve, reject) => {
    const checkServer = () => {
      const req = http.get('http://localhost:8000/health', (res) => {
        if (res.statusCode === 200) {
          console.log('Server is ready');
          resolve();
        } else {
          setTimeout(checkServer, 1000);
        }
      });

      req.on('error', () => {
        setTimeout(checkServer, 1000);
      });

      req.setTimeout(5000, () => {
        reject(new Error('Server startup timeout'));
      });
    };

    // Start checking after a short delay
    setTimeout(checkServer, 2000);
  });

      // Check build cache before building
  console.log('Checking build cache...');
  const cacheStatus = buildCache.getCacheStatus();
  console.log(`Cache status: ${cacheStatus.valid ? 'valid' : 'invalid'}`);
  if (cacheStatus.lastBuild) {
    console.log(`Last build: ${cacheStatus.lastBuild.toISOString()}`);
  }

  let needsBuild = !buildCache.isCacheValid();

  if (needsBuild) {
    // Start the frontend build
    console.log('Building frontend for E2E tests...');
    await new Promise<void>((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: frontendDir,
        env: {
          ...process.env,
          VITE_API_URL: 'http://127.0.0.1:8000/api',
        },
        stdio: 'inherit',
      });

                  buildProcess.on('close', (code) => {
        if (code === 0) {
          // Update cache after successful build
          buildCache.updateCache();
          console.log('Build cache updated');
          resolve();
        } else {
          reject(new Error(`Frontend build failed with exit code ${code}`));
        }
      });

      buildProcess.on('error', reject);
    });
  } else {
    console.log('Using cached build - skipping frontend build');
  }

  console.log('Starting frontend preview server...');
  const frontendProcess = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '3000'], {
    cwd: frontendDir,
    env: {
      ...process.env,
      VITE_API_URL: 'http://127.0.0.1:8000/api',
    },
    stdio: 'inherit',
    detached: true,
  });

  // Store the frontend process globally for teardown
  (global as any).__FRONTEND_PROCESS__ = frontendProcess;

  // Wait for the frontend to be ready
  console.log('Waiting for frontend to be ready...');
  await new Promise<void>((resolve, reject) => {
    const checkFrontend = () => {
      const req = http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200) {
          console.log('Frontend is ready');
          resolve();
        } else {
          setTimeout(checkFrontend, 1000);
        }
      });

      req.on('error', () => {
        setTimeout(checkFrontend, 1000);
      });

      req.setTimeout(10000, () => {
        reject(new Error('Frontend startup timeout'));
      });
    };

    // Start checking after a short delay
    setTimeout(checkFrontend, 3000);
  });
}
