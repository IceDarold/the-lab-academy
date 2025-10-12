import { join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

export default async function globalTeardown() {
  const serverProcess = (global as any).__SERVER_PROCESS__;
  const frontendProcess = (global as any).__FRONTEND_PROCESS__;

  if (serverProcess) {
    console.log('Stopping backend server...');
    serverProcess.kill('SIGTERM');

    // Wait a bit for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Force kill if still running
    if (!serverProcess.killed) {
      serverProcess.kill('SIGKILL');
    }

    console.log('Server stopped');
  }

  if (frontendProcess) {
    console.log('Stopping frontend server...');
    frontendProcess.kill('SIGTERM');

    // Wait a bit for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Force kill if still running
    if (!frontendProcess.killed) {
      frontendProcess.kill('SIGKILL');
    }

    console.log('Frontend stopped');
  }

  // Clean up test data from databases before removing local file
  const backendDir = join(process.cwd(), '..', 'backend');
  const cleanupScriptPath = join(backendDir, 'scripts', 'e2e_cleanup.py');

  if (fs.existsSync(cleanupScriptPath)) {
    console.log('Running database cleanup script...');

    try {
      await new Promise<void>((resolve, reject) => {
        const cleanupProcess = spawn('python3', [cleanupScriptPath], {
          cwd: backendDir,
          stdio: 'inherit'
        });

        cleanupProcess.on('close', (code) => {
          if (code === 0) {
            console.log('Database cleanup completed successfully');
            resolve();
          } else {
            console.warn(`Database cleanup exited with code ${code}, continuing with teardown`);
            resolve(); // Don't fail the teardown if cleanup fails
          }
        });

        cleanupProcess.on('error', (error) => {
          console.warn(`Failed to run database cleanup: ${error.message}, continuing with teardown`);
          resolve(); // Don't fail the teardown if cleanup fails
        });
      });
    } catch (error) {
      console.warn(`Database cleanup failed: ${error}, continuing with teardown`);
    }
  } else {
    console.log('Database cleanup script not found, skipping cleanup');
  }

  // Clean up test database file
  const testDbPath = join(backendDir, 'test.db');

  if (fs.existsSync(testDbPath)) {
    console.log('Cleaning up test database file...');
    fs.unlinkSync(testDbPath);
    console.log('Test database file cleaned up');
  }
}
