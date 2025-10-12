import net from 'net';

/**
 * Port utility functions for integration tests
 */

/**
 * Check if a port is available
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });

    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Find the first available port in the range 8001-8010
 */
export async function findAvailablePort(): Promise<number> {
  for (let port = 8001; port <= 8010; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available ports found in range 8001-8010');
}