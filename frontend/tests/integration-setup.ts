import { spawn } from 'child_process';
import { join } from 'path';
import http from 'http';
import { findAvailablePort } from './port-utils';

export default async function integrationSetup() {
  const backendDir = join(process.cwd(), '..', 'backend');

  // Find available port for integration tests
  const testPort = await findAvailablePort();
  console.log(`Using port ${testPort} for integration tests`);

  // Set testing environment
  const env = {
    ...process.env,
    TESTING: 'true',
    INTEGRATION_TEST_PORT: testPort.toString(),
  };

  // Run database migrations
  console.log('Running database migrations for integration tests...');
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

  // Seed integration test data
  console.log('Seeding integration test data...');
  try {
    await new Promise<void>((resolve, reject) => {
      const seedProcess = spawn('poetry', ['run', 'python', '-m', 'scripts.integration_seed'], {
        cwd: backendDir,
        env,
        stdio: 'inherit',
      });

      seedProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Test data seeding completed successfully');
          resolve();
        } else {
          console.warn(`Seeding failed with exit code ${code}, continuing without seeded data`);
          resolve(); // Continue even if seeding fails
        }
      });

      seedProcess.on('error', (error) => {
        console.warn(`Seeding error: ${error.message}, continuing without seeded data`);
        resolve(); // Continue even if seeding fails
      });
    });
  } catch (error) {
    console.warn(`Seeding failed: ${error}, continuing without seeded data`);
  }

  // Start the backend server
  console.log('Starting backend server for integration tests...');
  const serverProcess = spawn('poetry', ['run', 'uvicorn', 'src.main:app', '--host', '127.0.0.1', '--port', testPort.toString()], {
    cwd: backendDir,
    env,
    stdio: 'inherit',
  });

  // Store the server process globally for teardown
  (global as any).__INTEGRATION_SERVER_PROCESS__ = serverProcess;

  // Wait for the server to be ready
  console.log('Waiting for backend server to be ready...');
  await new Promise<void>((resolve, reject) => {
    const checkServer = () => {
      const req = http.get(`http://localhost:${testPort}/health`, (res) => {
        if (res.statusCode === 200) {
          console.log('Backend server is ready for integration tests');
          resolve();
        } else {
          setTimeout(checkServer, 1000);
        }
      });

      req.on('error', () => {
        setTimeout(checkServer, 1000);
      });

      req.setTimeout(30000, () => {
        reject(new Error('Backend server startup timeout'));
      });
    };

    // Start checking after a short delay
    setTimeout(checkServer, 2000);
  });
}