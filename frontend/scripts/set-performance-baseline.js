#!/usr/bin/env node

/**
 * Performance Baseline Setter
 *
 * Sets performance baselines for tests based on current results
 * or allows manual baseline configuration.
 */

const fs = require('fs');
const path = require('path');

function setPerformanceBaseline() {
  const args = process.argv.slice(2);
  const testName = args[0];
  const historyPath = path.join(process.cwd(), 'performance-reports', 'performance-history.json');

  if (!fs.existsSync(historyPath)) {
    console.error('❌ No performance history found. Run performance tests first.');
    process.exit(1);
  }

  try {
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));

    if (testName) {
      // Set baseline for specific test
      const testHistory = history.find(h => h.testName === testName);
      if (!testHistory || !testHistory.results || testHistory.results.length === 0) {
        console.error(`❌ No results found for test: ${testName}`);
        process.exit(1);
      }

      // Use the most recent result as baseline
      const latestResult = testHistory.results[testHistory.results.length - 1];
      testHistory.baseline = latestResult.metrics;

      console.log(`✅ Baseline set for ${testName}`);
      console.log(`   DOM Content Loaded: ${latestResult.metrics.pageLoad.domContentLoaded}ms`);
      console.log(`   Load Complete: ${latestResult.metrics.pageLoad.loadComplete}ms`);
      console.log(`   API Response Time: ${latestResult.metrics.api.averageResponseTime.toFixed(2)}ms`);

    } else {
      // Set baselines for all tests
      let updated = 0;
      for (const testHistory of history) {
        if (testHistory.results && testHistory.results.length > 0) {
          const latestResult = testHistory.results[testHistory.results.length - 1];
          testHistory.baseline = latestResult.metrics;
          updated++;
        }
      }

      console.log(`✅ Baselines set for ${updated} tests`);
    }

    // Save updated history
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    console.log(`📁 Baselines saved to: ${historyPath}`);

  } catch (error) {
    console.error('❌ Error setting performance baselines:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  setPerformanceBaseline();
}

module.exports = { setPerformanceBaseline };