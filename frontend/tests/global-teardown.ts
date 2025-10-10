import { join } from 'path';
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

  // Clean up test database
  const backendDir = join(process.cwd(), '..', 'backend');
  const testDbPath = join(backendDir, 'test.db');

  if (fs.existsSync(testDbPath)) {
    console.log('Cleaning up test database...');
    fs.unlinkSync(testDbPath);
    console.log('Test database cleaned up');
  }
}
