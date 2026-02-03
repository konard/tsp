/**
 * Tests for TSP CLI
 * Validates all CLI options, algorithm combinations, and output formats.
 */

import { describe, it, expect } from 'bun:test';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_PATH = join(__dirname, '..', 'cli', 'index.js');

/**
 * Run CLI command and return stdout.
 * @param {string} args - CLI arguments
 * @returns {string} stdout output
 */
const runCli = (args = '') =>
  execSync(`node ${CLI_PATH} ${args}`, {
    encoding: 'utf-8',
    timeout: 30000,
  });

/**
 * Run CLI command and return parsed JSON.
 * @param {string} args - CLI arguments
 * @returns {Object} Parsed JSON output
 */
const runCliJson = (args = '') => {
  const output = runCli(`${args} --json`);
  return JSON.parse(output);
};

/**
 * Run CLI command expecting failure, return stderr.
 * @param {string} args - CLI arguments
 * @returns {string} stderr output
 */
const runCliFail = (args = '') => {
  try {
    execSync(`node ${CLI_PATH} ${args}`, {
      encoding: 'utf-8',
      timeout: 30000,
    });
    return '';
  } catch (error) {
    return (error.stdout || '') + (error.stderr || '');
  }
};

// ============================================================
// Default Behavior
// ============================================================

describe('CLI default behavior', () => {
  it('should run with defaults (sonar, 10 points, no optimization)', () => {
    const result = runCliJson();
    expect(result.algorithm).toBe('Sonar (Radial Sweep)');
    expect(result.optimization).toBe('None');
    expect(result.points).toBe(10);
    expect(result.tour).toBeArray();
    expect(result.tour.length).toBe(10);
    expect(result.initialDistance).toBeGreaterThan(0);
    expect(result.timeMs).toBeGreaterThanOrEqual(0);
  });

  it('should produce human-readable output by default', () => {
    const output = runCli();
    expect(output).toContain('TSP Algorithms CLI');
    expect(output).toContain('Algorithm:');
    expect(output).toContain('Optimization:');
    expect(output).toContain('Points:');
    expect(output).toContain('Tour:');
    expect(output).toContain('Initial distance:');
  });
});

// ============================================================
// Algorithm Selection
// ============================================================

describe('CLI algorithm selection', () => {
  it('should run sonar algorithm', () => {
    const result = runCliJson('--algorithm sonar --num-points 5');
    expect(result.algorithm).toBe('Sonar (Radial Sweep)');
    expect(result.tour.length).toBe(5);
  });

  it('should run moore algorithm', () => {
    const result = runCliJson('--algorithm moore --num-points 5 --grid-size 8');
    expect(result.algorithm).toContain('Moore Curve');
    expect(result.tour.length).toBe(5);
  });

  it('should run comb algorithm', () => {
    const result = runCliJson('--algorithm comb --num-points 5');
    expect(result.algorithm).toContain('Comb');
    expect(result.tour.length).toBe(5);
  });

  it('should run brute-force algorithm', () => {
    const result = runCliJson('--algorithm brute-force --num-points 6');
    expect(result.algorithm).toContain('Brute-Force');
    expect(result.tour.length).toBe(6);
  });

  it('should use short alias -a for algorithm', () => {
    const result = runCliJson('-a moore -n 5 -g 8');
    expect(result.algorithm).toContain('Moore Curve');
  });

  it('should reject invalid algorithm', () => {
    const output = runCliFail('--algorithm invalid');
    expect(output).toBeTruthy();
  });
});

// ============================================================
// Optimization Selection
// ============================================================

describe('CLI optimization selection', () => {
  it('should run with no optimization', () => {
    const result = runCliJson('-a sonar -o none -n 10');
    expect(result.optimization).toBe('None');
    expect(result.improvement).toBe(0);
  });

  it('should run with 2-opt optimization', () => {
    const result = runCliJson('-a sonar -o 2-opt -n 20');
    expect(result.optimization).toBe('2-opt');
    expect(result.finalDistance).toBeLessThanOrEqual(result.initialDistance);
  });

  it('should run with zigzag optimization', () => {
    const result = runCliJson('-a sonar -o zigzag -n 20');
    expect(result.optimization).toBe('Zigzag');
    expect(result.finalDistance).toBeLessThanOrEqual(result.initialDistance);
  });

  it('should run with combined optimization', () => {
    const result = runCliJson('-a sonar -o combined -n 20');
    expect(result.optimization).toBe('Combined (zigzag + 2-opt)');
    expect(result.finalDistance).toBeLessThanOrEqual(result.initialDistance);
  });

  it('should reject invalid optimization', () => {
    const output = runCliFail('-a sonar -o invalid');
    expect(output).toBeTruthy();
  });
});

// ============================================================
// Algorithm + Optimization Combinations
// ============================================================

describe('CLI algorithm + optimization combinations', () => {
  const algorithms = ['sonar', 'moore', 'comb'];
  const optimizations = ['2-opt', 'zigzag', 'combined'];

  for (const algo of algorithms) {
    for (const opt of optimizations) {
      it(`should run ${algo} + ${opt}`, () => {
        const result = runCliJson(`-a ${algo} -o ${opt} -n 15 -g 16`);
        expect(result.tour.length).toBe(15);
        expect(result.finalDistance).toBeLessThanOrEqual(
          result.initialDistance + 0.001
        );
      });
    }
  }
});

// ============================================================
// Point Generation Options
// ============================================================

describe('CLI point generation', () => {
  it('should generate specified number of points', () => {
    const result = runCliJson('-n 25');
    expect(result.points).toBe(25);
    expect(result.tour.length).toBe(25);
  });

  it('should respect grid-size parameter', () => {
    const result = runCliJson('-n 5 -g 8');
    expect(result.gridSize).toBe(8);
  });

  it('should work with large grid sizes', () => {
    const result = runCliJson('-n 50 -g 128');
    expect(result.points).toBe(50);
    expect(result.tour.length).toBe(50);
  });

  it('should handle small number of points', () => {
    const result = runCliJson('-n 2');
    expect(result.points).toBe(2);
    expect(result.tour.length).toBe(2);
  });
});

// ============================================================
// Manual Point Input
// ============================================================

describe('CLI manual point input', () => {
  it('should accept manual points', () => {
    const result = runCliJson('--points "0 0 5 5 10 2 3 8"');
    expect(result.points).toBe(4);
    expect(result.tour.length).toBe(4);
  });

  it('should work with 2 points', () => {
    const result = runCliJson('--points "0 0 10 10"');
    expect(result.points).toBe(2);
    expect(result.tour.length).toBe(2);
  });

  it('should work with many points', () => {
    const result = runCliJson(
      '--points "0 0 1 1 2 2 3 3 4 4 5 5 6 6 7 7 8 8 9 9"'
    );
    expect(result.points).toBe(10);
    expect(result.tour.length).toBe(10);
  });

  it('should work with brute-force on manual points', () => {
    const result = runCliJson('-a brute-force --points "0 0 5 5 10 2 3 8 7 7"');
    expect(result.algorithm).toContain('Brute-Force');
    expect(result.points).toBe(5);
  });

  it('should work with optimization on manual points', () => {
    const result = runCliJson(
      '-a sonar -o 2-opt --points "0 0 5 5 10 2 3 8 7 7 1 9"'
    );
    expect(result.optimization).toBe('2-opt');
    expect(result.points).toBe(6);
  });

  it('should use short alias -p for points', () => {
    const result = runCliJson('-p "0 0 5 5 10 2"');
    expect(result.points).toBe(3);
  });

  it('should fail with odd number of coordinates', () => {
    const output = runCliFail('--points "0 0 5" --json');
    expect(output).toContain('error');
  });

  it('should fail with non-numeric coordinates', () => {
    const output = runCliFail('--points "0 0 abc def" --json');
    expect(output).toContain('error');
  });

  it('should fail with only one point', () => {
    const output = runCliFail('--points "0 0" --json');
    expect(output).toContain('error');
  });
});

// ============================================================
// Verification
// ============================================================

describe('CLI verification', () => {
  it('should include verification in human output when --verify is used', () => {
    const output = runCli('-a sonar -n 5 --verify');
    expect(output).toContain('Verification');
    expect(output).toContain('Lower bound:');
    expect(output).toContain('Gap:');
    expect(output).toContain('Optimal:');
  });

  it('should include verification in JSON when --verify is used', () => {
    const result = runCliJson('-a sonar -n 5 --verify');
    expect(result.verification).toBeDefined();
    expect(result.verification.lowerBound).toBeGreaterThan(0);
    expect(typeof result.verification.isOptimal).toBe('boolean');
    expect(typeof result.verification.gapPercent).toBe('number');
  });

  it('should not include verification when --verify is not used', () => {
    const result = runCliJson('-a sonar -n 5');
    expect(result.verification).toBeUndefined();
  });
});

// ============================================================
// JSON Output
// ============================================================

describe('CLI JSON output', () => {
  it('should produce valid JSON', () => {
    const output = runCli('--json');
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('should include all expected fields', () => {
    const result = runCliJson('-a sonar -o 2-opt -n 10');
    expect(result).toHaveProperty('algorithm');
    expect(result).toHaveProperty('optimization');
    expect(result).toHaveProperty('points');
    expect(result).toHaveProperty('gridSize');
    expect(result).toHaveProperty('tour');
    expect(result).toHaveProperty('initialDistance');
    expect(result).toHaveProperty('finalDistance');
    expect(result).toHaveProperty('improvement');
    expect(result).toHaveProperty('timeMs');
  });

  it('should produce JSON error on failure', () => {
    const output = runCliFail('--points "0 0 5" --json');
    expect(output).toContain('error');
  });
});

// ============================================================
// Help Output
// ============================================================

describe('CLI help', () => {
  it('should show help with --help', () => {
    // --help exits with code 0, but yargs writes to stdout then calls process.exit
    // We use runCliFail to capture both stdout and stderr from the exit
    let output;
    try {
      output = runCli('--help');
    } catch (error) {
      // yargs calls process.exit(0) which may throw in some runtimes
      output = (error.stdout || '') + (error.stderr || '');
    }
    expect(output).toContain('--algorithm');
    expect(output).toContain('--optimization');
    expect(output).toContain('--num-points');
    expect(output).toContain('--points');
    expect(output).toContain('--json');
  });
});

// ============================================================
// Brute-Force Limits
// ============================================================

describe('CLI brute-force limits', () => {
  it('should reject brute-force with too many points', () => {
    const output = runCliFail('-a brute-force -n 15 --json');
    expect(output).toContain('error');
  });

  it('should work with maximum allowed brute-force points', () => {
    const result = runCliJson('-a brute-force -n 10');
    expect(result.algorithm).toContain('Brute-Force');
    expect(result.tour.length).toBe(10);
  });
});

// ============================================================
// Tour Validity
// ============================================================

describe('CLI tour validity', () => {
  it('should produce tour visiting all points exactly once', () => {
    const result = runCliJson('-n 20');
    const tour = result.tour;
    expect(tour.length).toBe(20);
    const unique = new Set(tour);
    expect(unique.size).toBe(20);
    for (const idx of tour) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(20);
    }
  });

  it('should produce valid tour with optimization', () => {
    const result = runCliJson('-a moore -o combined -n 15 -g 16');
    const tour = result.tour;
    expect(tour.length).toBe(15);
    const unique = new Set(tour);
    expect(unique.size).toBe(15);
  });
});
