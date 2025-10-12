import { buildCache } from './cache-utils';

const command = process.argv[2];

switch (command) {
  case 'status':
    showCacheStatus();
    break;
  case 'clear':
    clearCache();
    break;
  case 'invalidate':
    invalidateCache();
    break;
  default:
    showHelp();
    break;
}

function showCacheStatus() {
  const status = buildCache.getCacheStatus();

  console.log('=== Build Cache Status ===');
  console.log(`Valid: ${status.valid ? 'Yes' : 'No'}`);

  if (status.lastBuild) {
    console.log(`Last Build: ${status.lastBuild.toLocaleString()}`);
  }

  if (status.fileCount !== undefined) {
    console.log(`Files Monitored: ${status.fileCount}`);
  }

  if (status.size !== undefined) {
    const sizeMB = (status.size / (1024 * 1024)).toFixed(2);
    console.log(`Build Size: ${sizeMB} MB`);
  }

  console.log('========================');
}

function clearCache() {
  console.log('Clearing build cache...');
  buildCache.clearCache();
  console.log('Cache cleared successfully');
}

function invalidateCache() {
  console.log('Invalidating cache...');
  buildCache.clearCache();
  console.log('Cache invalidated - next build will rebuild');
}

function showHelp() {
  console.log('Build Cache Manager');
  console.log('');
  console.log('Usage: node scripts/cache-manager.ts <command>');
  console.log('');
  console.log('Commands:');
  console.log('  status     Show cache status');
  console.log('  clear      Clear the cache');
  console.log('  invalidate Invalidate cache (same as clear)');
  console.log('');
  console.log('Examples:');
  console.log('  npm run cache:status');
  console.log('  npm run cache:clear');
}