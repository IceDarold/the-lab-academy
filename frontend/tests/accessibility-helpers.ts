import { Page } from '@playwright/test';
import AxeBuilder from 'axe-playwright';

/**
 * Accessibility testing helpers for Playwright tests
 * Provides utilities for WCAG compliance checking and accessibility audits
 */

export interface AccessibilityConfig {
  level: 'A' | 'AA' | 'AAA';
  includeBestPractices?: boolean;
  excludeRules?: string[];
  includeRules?: string[];
}

export interface AccessibilityResult {
  violations: any[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
}

export class AccessibilityHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Run comprehensive accessibility audit using axe-core
   */
  async runAccessibilityAudit(
    config: AccessibilityConfig = { level: 'AA' },
    context?: string
  ): Promise<AccessibilityResult> {
    const axe = new AxeBuilder({ page: this.page });

    // Configure audit level
    switch (config.level) {
      case 'A':
        axe.withTags(['wcag2a']);
        break;
      case 'AA':
        axe.withTags(['wcag2a', 'wcag2aa']);
        break;
      case 'AAA':
        axe.withTags(['wcag2a', 'wcag2aa', 'wcag2aaa']);
        break;
    }

    // Include best practices if requested
    if (config.includeBestPractices) {
      axe.withTags(['best-practice']);
    }

    // Exclude specific rules
    if (config.excludeRules) {
      axe.exclude(config.excludeRules);
    }

    // Include specific rules
    if (config.includeRules) {
      axe.withRules(config.includeRules);
    }

    // Run the audit
    const results = await axe.analyze();

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      inapplicable: results.inapplicable,
    };
  }

  /**
   * Check accessibility of a specific element
   */
  async checkElementAccessibility(
    selector: string,
    config: AccessibilityConfig = { level: 'AA' }
  ): Promise<AccessibilityResult> {
    const axe = new AxeBuilder({ page: this.page })
      .include(selector);

    // Configure audit level
    switch (config.level) {
      case 'A':
        axe.withTags(['wcag2a']);
        break;
      case 'AA':
        axe.withTags(['wcag2a', 'wcag2aa']);
        break;
      case 'AAA':
        axe.withTags(['wcag2a', 'wcag2aa', 'wcag2aaa']);
        break;
    }

    const results = await axe.analyze();

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      inapplicable: results.inapplicable,
    };
  }

  /**
   * Test keyboard navigation for a page
   */
  async testKeyboardNavigation(): Promise<void> {
    // Focus on first focusable element
    await this.page.keyboard.press('Tab');

    // Get all focusable elements
    const focusableElements = await this.page.$$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

    // Test tab navigation through all focusable elements
    for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
      const activeElement = await this.page.evaluate(() => document.activeElement);
      if (activeElement) {
        // Check if element is visible
        const isVisible = await this.page.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }, activeElement);

        if (!isVisible) {
          throw new Error(`Focusable element is not visible: ${activeElement.tagName}`);
        }
      }
      await this.page.keyboard.press('Tab');
    }
  }

  /**
   * Check color contrast for text elements
   */
  async checkColorContrast(): Promise<void> {
    // This would require additional color contrast checking
    // For now, we'll rely on axe-core's color-contrast rule
    const results = await this.runAccessibilityAudit({ level: 'AA' });

    const contrastViolations = results.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      throw new Error(`Color contrast violations found: ${contrastViolations.length}`);
    }
  }

  /**
   * Check form accessibility
   */
  async checkFormAccessibility(formSelector: string): Promise<void> {
    const results = await this.checkElementAccessibility(formSelector, { level: 'AA' });

    // Check for common form accessibility issues
    const formViolations = results.violations.filter(violation =>
      ['label', 'form-field-multiple-labels', 'input-button-name'].includes(violation.id)
    );

    if (formViolations.length > 0) {
      console.warn(`Form accessibility issues found: ${formViolations.length}`);
    }
  }

  /**
   * Check image accessibility (alt text)
   */
  async checkImageAccessibility(): Promise<void> {
    const results = await this.runAccessibilityAudit({ level: 'A' });

    const imageViolations = results.violations.filter(violation =>
      violation.id === 'image-alt'
    );

    if (imageViolations.length > 0) {
      throw new Error(`Image accessibility violations found: ${imageViolations.length}`);
    }
  }

  /**
   * Generate accessibility report
   */
  generateReport(results: AccessibilityResult): string {
    let report = '# Accessibility Audit Report\n\n';

    report += `## Summary\n`;
    report += `- Violations: ${results.violations.length}\n`;
    report += `- Passes: ${results.passes.length}\n`;
    report += `- Incomplete: ${results.incomplete.length}\n`;
    report += `- Inapplicable: ${results.inapplicable.length}\n\n`;

    if (results.violations.length > 0) {
      report += `## Violations\n`;
      results.violations.forEach((violation, index) => {
        report += `### ${index + 1}. ${violation.id}\n`;
        report += `- **Impact:** ${violation.impact}\n`;
        report += `- **Description:** ${violation.description}\n`;
        report += `- **Help:** ${violation.help}\n`;
        report += `- **Help URL:** ${violation.helpUrl}\n`;
        report += `- **Elements:** ${violation.nodes.length}\n\n`;
      });
    }

    return report;
  }

  /**
   * Assert no critical accessibility violations
   */
  assertNoCriticalViolations(results: AccessibilityResult, maxViolations: number = 0): void {
    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalViolations.length > maxViolations) {
      const violationDetails = criticalViolations
        .map(v => `${v.id} (${v.impact}): ${v.description}`)
        .join('\n');

      throw new Error(
        `Critical accessibility violations found (${criticalViolations.length}):\n${violationDetails}`
      );
    }
  }

  /**
   * Assert WCAG compliance level
   */
  assertWCAGCompliance(results: AccessibilityResult, level: 'A' | 'AA' | 'AAA' = 'AA'): void {
    let allowedImpacts: string[];

    switch (level) {
      case 'A':
        allowedImpacts = ['minor', 'moderate'];
        break;
      case 'AA':
        allowedImpacts = ['minor'];
        break;
      case 'AAA':
        allowedImpacts = [];
        break;
    }

    const blockingViolations = results.violations.filter(
      v => !allowedImpacts.includes(v.impact)
    );

    if (blockingViolations.length > 0) {
      const violationDetails = blockingViolations
        .map(v => `${v.id} (${v.impact}): ${v.description}`)
        .join('\n');

      throw new Error(
        `WCAG ${level} compliance violations found (${blockingViolations.length}):\n${violationDetails}`
      );
    }
  }
}

// Default accessibility configurations
export const ACCESSIBILITY_CONFIGS = {
  wcagA: { level: 'A' as const },
  wcagAA: { level: 'AA' as const },
  wcagAAA: { level: 'AAA' as const },
  criticalOnly: {
    level: 'AA' as const,
    excludeRules: ['color-contrast', 'image-alt']
  },
  formsOnly: {
    level: 'AA' as const,
    includeRules: ['label', 'form-field-multiple-labels', 'input-button-name']
  }
};