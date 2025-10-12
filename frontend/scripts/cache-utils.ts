import { createHash } from 'crypto';
import { readFileSync, statSync, existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync, rmdirSync } from 'fs';
import { join, extname, relative } from 'path';

interface CacheMetadata {
  hash: string;
  timestamp: number;
  files: string[];
}

export class BuildCache {
  private cacheDir: string;
  private metadataFile: string;
  private isCI: boolean;

  constructor(cacheDir = '.cache') {
    this.cacheDir = join(process.cwd(), cacheDir);
    this.metadataFile = join(this.cacheDir, 'metadata.json');
    this.isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  }

  /**
   * Recursively find files in directory with given extensions
   */
  private findFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];

    try {
      const items = readdirSync(dir);
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip common directories
          if (!['node_modules', '.git', 'dist', 'coverage', 'test-results', '.cache'].includes(item)) {
            files.push(...this.findFiles(fullPath, extensions));
          }
        } else if (stat.isFile()) {
          const ext = extname(item);
          if (extensions.includes(ext)) {
            files.push(relative(process.cwd(), fullPath));
          }
        }
      }
    } catch (error) {
      // Ignore directories we can't read
    }

    return files;
  }

  /**
   * Get all source files that should be monitored for changes
   */
  private getSourceFiles(): string[] {
    const files: string[] = [];

    // Add specific config files
    const configFiles = [
      'index.html',
      'index.tsx',
      'package.json',
      'package-lock.json',
      'vite.config.ts',
      'vitest.config.ts',
      'vitest.integration.config.ts',
      'tsconfig.json',
      'tailwind.config.ts',
      'postcss.config.cjs',
    ];

    for (const file of configFiles) {
      if (existsSync(file)) {
        files.push(file);
      }
    }

    // Add source files from directories
    const sourceDirs = [
      { dir: 'src', exts: ['.ts', '.tsx', '.js', '.jsx'] },
      { dir: 'components', exts: ['.ts', '.tsx', '.js', '.jsx'] },
      { dir: 'pages', exts: ['.ts', '.tsx', '.js', '.jsx'] },
      { dir: 'services', exts: ['.ts', '.tsx', '.js', '.jsx'] },
      { dir: 'types', exts: ['.ts', '.tsx'] },
    ];

    for (const { dir, exts } of sourceDirs) {
      if (existsSync(dir)) {
        files.push(...this.findFiles(dir, exts));
      }
    }

    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Calculate hash of all source files
   */
  private calculateSourceHash(): string {
    const files = this.getSourceFiles();
    const hash = createHash('sha256');

    for (const file of files.sort()) { // Sort for consistent hashing
      if (existsSync(file)) {
        const content = readFileSync(file);
        hash.update(content);
        hash.update(file); // Include filename in hash
      }
    }

    return hash.digest('hex');
  }

  /**
   * Check if cache is valid
   */
  public isCacheValid(): boolean {
    if (!existsSync(this.metadataFile)) {
      return false;
    }

    try {
      const metadata: CacheMetadata = JSON.parse(readFileSync(this.metadataFile, 'utf-8'));
      const currentHash = this.calculateSourceHash();

      // Check if source files have changed
      if (metadata.hash !== currentHash) {
        console.log('Cache invalid: source files changed');
        return false;
      }

      // Check if build artifacts exist
      const distDir = join(process.cwd(), 'dist');
      if (!existsSync(distDir)) {
        console.log('Cache invalid: build artifacts missing');
        return false;
      }

      // In CI, be more strict - check if cache is not too old (24 hours)
      if (this.isCI) {
        const cacheAge = Date.now() - metadata.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (cacheAge > maxAge) {
          console.log('Cache invalid: too old for CI');
          return false;
        }
      }

      console.log('Cache is valid');
      return true;
    } catch (error) {
      console.log('Cache invalid: metadata corrupted', error);
      return false;
    }
  }

  /**
   * Update cache metadata after successful build
   */
  public updateCache(): void {
    try {
      // Ensure cache directory exists
      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }

      const metadata: CacheMetadata = {
        hash: this.calculateSourceHash(),
        timestamp: Date.now(),
        files: this.getSourceFiles(),
      };

      writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));
      console.log('Cache metadata updated');
    } catch (error) {
      console.warn('Failed to update cache metadata:', error);
    }
  }

  /**
   * Clear the cache
   */
  public clearCache(): void {
    try {
      if (existsSync(this.cacheDir)) {
        const files = readdirSync(this.cacheDir);
        for (const file of files) {
          unlinkSync(join(this.cacheDir, file));
        }
        rmdirSync(this.cacheDir);
        console.log('Cache cleared');
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache status information
   */
  public getCacheStatus(): {
    valid: boolean;
    lastBuild?: Date;
    fileCount?: number;
    size?: number;
  } {
    const valid = this.isCacheValid();

    if (!existsSync(this.metadataFile)) {
      return { valid: false };
    }

    try {
      const metadata: CacheMetadata = JSON.parse(readFileSync(this.metadataFile, 'utf-8'));
      const distDir = join(process.cwd(), 'dist');

      let size = 0;
      if (existsSync(distDir)) {
        const calculateSize = (dir: string): number => {
          let total = 0;
          const items = readdirSync(dir);
          for (const item of items) {
            const path = join(dir, item);
            const stats = statSync(path);
            if (stats.isDirectory()) {
              total += calculateSize(path);
            } else {
              total += stats.size;
            }
          }
          return total;
        };
        size = calculateSize(distDir);
      }

      return {
        valid,
        lastBuild: new Date(metadata.timestamp),
        fileCount: metadata.files.length,
        size,
      };
    } catch {
      return { valid: false };
    }
  }

  /**
   * Clean up old cache entries (keep only the most recent)
   */
  public cleanupOldEntries(): void {
    // For now, we only keep one cache entry
    // Could be extended to keep multiple versions
    console.log('Cache cleanup completed');
  }
}

// Export singleton instance
export const buildCache = new BuildCache();