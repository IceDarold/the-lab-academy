import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Global teardown for integration tests
 * Cleans up test environment after all integration tests complete
 */
export default async function globalTeardown() {
  console.log('🧹 Starting integration test teardown...');

  try {
    // Stop the server process stored in global scope
    const serverProcess = (global as any).__INTEGRATION_SERVER_PROCESS__;
    if (serverProcess) {
      try {
        serverProcess.kill('SIGTERM');
        console.log('✅ Stopped test backend server process');
      } catch (error) {
        console.warn('⚠️  Could not stop test backend server process:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Also try to stop any running test backend servers via PID file (fallback)
    const testBackendPidFile = path.join(process.cwd(), 'test-backend.pid');
    if (existsSync(testBackendPidFile)) {
      try {
        const pid = parseInt(require('fs').readFileSync(testBackendPidFile, 'utf8').trim());
        process.kill(pid, 'SIGTERM');
        console.log(`✅ Stopped test backend server (PID: ${pid})`);
        require('fs').unlinkSync(testBackendPidFile);
      } catch (error) {
        console.warn('⚠️  Could not stop test backend server:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Clean up test database if it exists
    const testDbPath = path.join(process.cwd(), '..', 'backend', 'test.db');
    if (existsSync(testDbPath)) {
      try {
        require('fs').unlinkSync(testDbPath);
        console.log('✅ Cleaned up test database');
      } catch (error) {
        console.warn('⚠️  Could not clean up test database:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Clean up any temporary test files
    const tempDir = path.join(process.cwd(), 'temp');
    if (existsSync(tempDir)) {
      try {
        execSync(`rm -rf ${tempDir}`, { stdio: 'inherit' });
        console.log('✅ Cleaned up temporary test files');
      } catch (error) {
        console.warn('⚠️  Could not clean up temporary files:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log('✅ Integration test teardown completed');
  } catch (error) {
    console.error('❌ Integration test teardown failed:', error instanceof Error ? error.message : 'Unknown error');
    // Don't throw error to avoid failing the test run
  }
}