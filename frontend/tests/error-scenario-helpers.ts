import { http, HttpResponse, HttpHandler } from 'msw';
import { setupServer, SetupServerApi } from 'msw/node';

/**
 * Error Scenario Helpers for Frontend Testing
 *
 * This module provides comprehensive utilities for simulating various error scenarios,
 * network failures, server errors, and chaos engineering conditions to ensure
 * robust error handling and graceful degradation in the application.
 */

// Types for error scenarios
export interface NetworkFailureConfig {
  type: 'disconnect' | 'slow' | 'intermittent' | 'dns-failure';
  duration?: number;
  frequency?: number;
  latency?: number;
}

export interface ServerErrorConfig {
  statusCode: number;
  message?: string;
  delay?: number;
  responseType?: 'json' | 'text' | 'html';
}

export interface ChaosConfig {
  failureRate: number;
  failureTypes: ('network' | 'server' | 'component' | 'state')[];
  duration?: number;
}

export interface ApplicationErrorConfig {
  type: 'js-error' | 'resource-failure' | 'storage-failure' | 'service-worker-failure';
  target?: string;
  frequency?: number;
}

// Network Failure Simulation
export class NetworkFailureSimulator {
  private server: SetupServerApi;
  private activeFailures: Map<string, NodeJS.Timeout> = new Map();

  constructor(server?: SetupServerApi) {
    this.server = server || setupServer();
  }

  /**
   * Simulate network disconnection
   */
  simulateDisconnect(endpoint: string, duration: number = 30000): void {
    const handler = http.all(endpoint, () => {
      return HttpResponse.text('Network Error', { status: 0 });
    });

    this.server.use(handler);

    const timeout = setTimeout(() => {
      this.server.resetHandlers();
      this.activeFailures.delete(endpoint);
    }, duration);

    this.activeFailures.set(endpoint, timeout);
  }

  /**
   * Simulate slow network with high latency
   */
  simulateSlowNetwork(endpoint: string, latency: number = 5000): void {
    const handler = http.all(endpoint, async () => {
      await new Promise(resolve => setTimeout(resolve, latency));
      return HttpResponse.json({ message: 'Slow response' });
    });

    this.server.use(handler);
  }

  /**
   * Simulate intermittent connectivity
   */
  simulateIntermittentConnectivity(endpoint: string, frequency: number = 0.3): void {
    const handler = http.all(endpoint, () => {
      if (Math.random() < frequency) {
        return HttpResponse.text('Connection lost', { status: 0 });
      }
      return HttpResponse.json({ success: true });
    });

    this.server.use(handler);
  }

  /**
   * Simulate DNS failure
   */
  simulateDNSFailure(endpoint: string): void {
    const handler = http.all(endpoint, () => {
      return HttpResponse.text('DNS resolution failed', { status: 0 });
    });

    this.server.use(handler);
  }

  /**
   * Apply network failure configuration
   */
  applyNetworkFailure(endpoint: string, config: NetworkFailureConfig): void {
    switch (config.type) {
      case 'disconnect':
        this.simulateDisconnect(endpoint, config.duration);
        break;
      case 'slow':
        this.simulateSlowNetwork(endpoint, config.latency);
        break;
      case 'intermittent':
        this.simulateIntermittentConnectivity(endpoint, config.frequency);
        break;
      case 'dns-failure':
        this.simulateDNSFailure(endpoint);
        break;
    }
  }

  /**
   * Clear all active network failures
   */
  clearAllFailures(): void {
    this.activeFailures.forEach(timeout => clearTimeout(timeout));
    this.activeFailures.clear();
    this.server.resetHandlers();
  }
}

// Server Error Simulation
export class ServerErrorSimulator {
  private server: SetupServerApi;

  constructor(server?: SetupServerApi) {
    this.server = server || setupServer();
  }

  /**
   * Simulate HTTP error responses
   */
  simulateHttpError(endpoint: string, config: ServerErrorConfig): void {
    const handler = http.all(endpoint, async () => {
      if (config.delay) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }

      const responseBody = config.message || this.getDefaultErrorMessage(config.statusCode);

      switch (config.responseType) {
        case 'text':
          return HttpResponse.text(responseBody, { status: config.statusCode });
        case 'html':
          return HttpResponse.html(`<html><body>${responseBody}</body></html>`, { status: config.statusCode });
        default:
          return HttpResponse.json({ message: responseBody }, { status: config.statusCode });
      }
    });

    this.server.use(handler);
  }

  /**
   * Simulate API timeout
   */
  simulateTimeout(endpoint: string, timeoutMs: number = 30000): void {
    const handler = http.all(endpoint, async () => {
      await new Promise(resolve => setTimeout(resolve, timeoutMs));
      return HttpResponse.json({ message: 'Request timeout' });
    });

    this.server.use(handler);
  }

  /**
   * Simulate rate limiting
   */
  simulateRateLimit(endpoint: string, limit: number = 10, windowMs: number = 60000): void {
    let requestCount = 0;
    let windowStart = Date.now();

    const handler = http.all(endpoint, () => {
      const now = Date.now();

      if (now - windowStart > windowMs) {
        requestCount = 0;
        windowStart = now;
      }

      requestCount++;

      if (requestCount > limit) {
        return HttpResponse.json({
          message: 'Too many requests',
          retryAfter: Math.ceil((windowStart + windowMs - now) / 1000)
        }, { status: 429 });
      }

      return HttpResponse.json({ success: true });
    });

    this.server.use(handler);
  }

  /**
   * Simulate server overload
   */
  simulateServerOverload(endpoint: string, overloadProbability: number = 0.5): void {
    const handler = http.all(endpoint, async () => {
      if (Math.random() < overloadProbability) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        return HttpResponse.json({ message: 'Server overloaded' }, { status: 503 });
      }
      return HttpResponse.json({ success: true });
    });

    this.server.use(handler);
  }

  private getDefaultErrorMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    return messages[statusCode] || 'Unknown Error';
  }
}

// Chaos Engineering Utilities
export class ChaosEngineer {
  private networkSimulator: NetworkFailureSimulator;
  private serverSimulator: ServerErrorSimulator;
  private activeChaos: NodeJS.Timeout[] = [];

  constructor(networkSim?: NetworkFailureSimulator, serverSim?: ServerErrorSimulator) {
    this.networkSimulator = networkSim || new NetworkFailureSimulator();
    this.serverSimulator = serverSim || new ServerErrorSimulator();
  }

  /**
   * Inject random failures during test execution
   */
  injectRandomFailures(endpoints: string[], config: ChaosConfig): void {
    const chaosDuration = config.duration || 60000; // 1 minute default

    const chaosInterval = setInterval(() => {
      if (Math.random() < config.failureRate) {
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        const failureType = config.failureTypes[Math.floor(Math.random() * config.failureTypes.length)];

        this.injectFailure(endpoint, failureType);
      }
    }, 1000); // Check every second

    const stopTimeout = setTimeout(() => {
      clearInterval(chaosInterval);
      this.networkSimulator.clearAllFailures();
      this.serverSimulator = new ServerErrorSimulator(); // Reset server simulator
    }, chaosDuration);

    this.activeChaos.push(stopTimeout);
  }

  /**
   * Inject specific failure type
   */
  private injectFailure(endpoint: string, type: string): void {
    switch (type) {
      case 'network':
        this.networkSimulator.simulateIntermittentConnectivity(endpoint, 0.5);
        break;
      case 'server':
        this.serverSimulator.simulateHttpError(endpoint, { statusCode: 500 });
        break;
      case 'component':
        // Component failures handled separately
        break;
      case 'state':
        // State corruption handled separately
        break;
    }
  }

  /**
   * Test with broken React components
   */
  simulateComponentFailure(componentName: string): void {
    // This would be used in component tests to simulate component crashes
    console.warn(`Simulating failure for component: ${componentName}`);
  }

  /**
   * Test with corrupted application state
   */
  corruptApplicationState(stateKey: string, corruptionType: 'delete' | 'mutate' | 'nullify' = 'nullify'): void {
    // This would be used to simulate state corruption in tests
    const originalState = localStorage.getItem(stateKey);
    if (!originalState) return;

    let corruptedState: any;

    switch (corruptionType) {
      case 'delete':
        localStorage.removeItem(stateKey);
        break;
      case 'mutate':
        corruptedState = JSON.parse(originalState);
        // Randomly mutate some properties
        Object.keys(corruptedState).forEach(key => {
          if (Math.random() < 0.3) {
            corruptedState[key] = 'CORRUPTED_DATA';
          }
        });
        localStorage.setItem(stateKey, JSON.stringify(corruptedState));
        break;
      case 'nullify':
        localStorage.setItem(stateKey, 'null');
        break;
    }
  }

  /**
   * Test under memory pressure
   */
  simulateMemoryPressure(memoryMB: number = 100): void {
    // Simulate memory pressure by allocating large objects
    const largeObjects: any[] = [];
    const chunkSize = 1024 * 1024; // 1MB chunks

    for (let i = 0; i < memoryMB; i++) {
      largeObjects.push(new Array(chunkSize).fill('x'));
    }

    // Keep references to prevent garbage collection
    (window as any).__memoryPressureObjects = largeObjects;
  }

  /**
   * Stop all chaos engineering
   */
  stopChaos(): void {
    this.activeChaos.forEach(timeout => clearTimeout(timeout));
    this.activeChaos = [];
    this.networkSimulator.clearAllFailures();
  }
}

// Application Error Scenario Simulation
export class ApplicationErrorSimulator {
  /**
   * Simulate JavaScript errors
   */
  simulateJSError(errorType: 'reference' | 'type' | 'syntax' | 'runtime' = 'runtime'): void {
    const errors = {
      reference: () => { (window as any).nonExistentFunction(); },
      type: () => { const x: any = {}; x(); },
      syntax: () => { eval('invalid syntax {{{'); },
      runtime: () => { throw new Error('Simulated runtime error'); }
    };

    try {
      errors[errorType]();
    } catch (error) {
      // Error will be caught by error boundaries
      throw error;
    }
  }

  /**
   * Simulate resource loading failures
   */
  simulateResourceFailure(resourceType: 'image' | 'font' | 'css' | 'js', url: string): void {
    // This would be used with MSW to mock failed resource requests
    console.warn(`Simulating ${resourceType} failure for: ${url}`);
  }

  /**
   * Simulate localStorage/sessionStorage failures
   */
  simulateStorageFailure(storageType: 'localStorage' | 'sessionStorage', operation: 'read' | 'write' | 'quota' = 'write'): void {
    const storage = storageType === 'localStorage' ? localStorage : sessionStorage;

    switch (operation) {
      case 'read':
        // Mock read failure
        Object.defineProperty(window, storageType, {
          value: {
            getItem: () => { throw new Error('Storage read failed'); },
            setItem: storage.setItem,
            removeItem: storage.removeItem,
            clear: storage.clear
          }
        });
        break;
      case 'write':
        Object.defineProperty(window, storageType, {
          value: {
            getItem: storage.getItem,
            setItem: () => { throw new Error('Storage write failed'); },
            removeItem: storage.removeItem,
            clear: storage.clear
          }
        });
        break;
      case 'quota':
        // Simulate quota exceeded
        Object.defineProperty(window, storageType, {
          value: {
            getItem: storage.getItem,
            setItem: () => { throw new Error('Quota exceeded'); },
            removeItem: storage.removeItem,
            clear: storage.clear
          }
        });
        break;
    }
  }

  /**
   * Simulate service worker failures
   */
  simulateServiceWorkerFailure(failureType: 'registration' | 'activation' | 'fetch' | 'sync' = 'registration'): void {
    switch (failureType) {
      case 'registration':
        Object.defineProperty(navigator, 'serviceWorker', {
          value: {
            register: () => Promise.reject(new Error('Service worker registration failed')),
            getRegistrations: () => Promise.resolve([])
          }
        });
        break;
      case 'activation':
        // Service worker activation failure would be handled in SW code
        console.warn('Service worker activation failure simulated');
        break;
      case 'fetch':
        // Fetch event failure in service worker
        console.warn('Service worker fetch failure simulated');
        break;
      case 'sync':
        // Background sync failure
        console.warn('Service worker sync failure simulated');
        break;
    }
  }
}

// User Experience Validation Helpers
export class UXValidationHelper {
  /**
   * Verify error messages are displayed
   */
  async verifyErrorMessage(page: any, expectedMessage: string): Promise<boolean> {
    try {
      await page.waitForSelector(`text=${expectedMessage}`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify fallback UI is displayed
   */
  async verifyFallbackUI(page: any, fallbackSelector: string): Promise<boolean> {
    try {
      await page.waitForSelector(fallbackSelector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify retry mechanism works
   */
  async testRetryMechanism(page: any, retryButtonSelector: string, successSelector: string): Promise<boolean> {
    try {
      await page.click(retryButtonSelector);
      await page.waitForSelector(successSelector, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify graceful degradation
   */
  async verifyGracefulDegradation(page: any, degradedFeatures: string[]): Promise<boolean> {
    // Check that core functionality still works when optional features fail
    for (const feature of degradedFeatures) {
      const element = await page.$(`[data-testid="${feature}"]`);
      if (!element) {
        return false; // Required feature missing
      }
    }
    return true;
  }
}

// Main Error Scenario Manager
export class ErrorScenarioManager {
  public networkSimulator: NetworkFailureSimulator;
  public serverSimulator: ServerErrorSimulator;
  public chaosEngineer: ChaosEngineer;
  public appSimulator: ApplicationErrorSimulator;
  public uxValidator: UXValidationHelper;

  constructor() {
    this.networkSimulator = new NetworkFailureSimulator();
    this.serverSimulator = new ServerErrorSimulator();
    this.chaosEngineer = new ChaosEngineer(this.networkSimulator, this.serverSimulator);
    this.appSimulator = new ApplicationErrorSimulator();
    this.uxValidator = new UXValidationHelper();
  }

  /**
   * Setup MSW server for error scenario testing
   */
  setupMSWServer(handlers: HttpHandler[] = []): SetupServerApi {
    const server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'bypass' });
    return server;
  }

  /**
   * Cleanup all error scenarios
   */
  cleanup(): void {
    this.networkSimulator.clearAllFailures();
    this.chaosEngineer.stopChaos();
  }
}

// Export singleton instance for convenience
export const errorScenarioManager = new ErrorScenarioManager();