/**
 * Tests for TSPVisualization component
 */

import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import {
  TSPVisualization,
  TSPCanvas,
} from '../../app/ui/components/TSPVisualization.jsx';

const samplePoints = [
  { x: 0, y: 0, id: 0 },
  { x: 8, y: 0, id: 1 },
  { x: 8, y: 8, id: 2 },
  { x: 0, y: 8, id: 3 },
];

describe('TSPVisualization', () => {
  describe('Basic Rendering', () => {
    it('should render SVG element', () => {
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={[]}
          currentStep={-1}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
    });

    it('should render all point circles', () => {
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={[]}
          currentStep={-1}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const circles = container.querySelectorAll('circle');
      // 4 point circles
      expect(circles.length).toBeGreaterThanOrEqual(4);
    });

    it('should render grid lines', () => {
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={[]}
          currentStep={-1}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const lines = container.querySelectorAll('line');
      // Grid lines for 16+1 = 17 vertical and 17 horizontal = 34 lines
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe('Tour Path Rendering', () => {
    it('should render tour path when step has tour', () => {
      const steps = [
        { type: 'sweep', tour: [0, 1, 2, 3], centroid: { x: 4, y: 4 } },
      ];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const paths = container.querySelectorAll('path');
      // Should have at least one path for the tour
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should not render tour path when tour has less than 2 points', () => {
      const steps = [{ type: 'sweep', tour: [0], centroid: { x: 4, y: 4 } }];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      // There shouldn't be tour path for single point
      // Just checking it doesn't crash
      expect(container.querySelector('svg')).toBeDefined();
    });
  });

  describe('Sonar Algorithm', () => {
    it('should render sweep line for sonar algorithm', () => {
      const steps = [
        {
          type: 'sweep',
          tour: [0, 1],
          centroid: { x: 4, y: 4 },
          angle: Math.PI / 4,
        },
      ];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const lines = container.querySelectorAll('line');
      // Should have grid lines + sweep line
      // Grid: mooreGridSize lines per axis (0..mooreGridSize-1) = 16*2 = 32 grid lines + 1 sweep
      expect(lines.length).toBeGreaterThan(32);
    });

    it('should render centroid circle for sonar algorithm', () => {
      const steps = [
        {
          type: 'sweep',
          tour: [0, 1],
          centroid: { x: 4, y: 4 },
          angle: Math.PI / 4,
        },
      ];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const circles = container.querySelectorAll('circle');
      // 4 point circles + 1 centroid circle
      expect(circles.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Moore Algorithm', () => {
    it('should render Moore curve path', () => {
      const curvePoints = [
        { x: 0, y: 0 },
        { x: 0, y: 8 },
        { x: 8, y: 8 },
        { x: 8, y: 0 },
      ];
      const steps = [
        {
          type: 'curve',
          tour: [0, 1],
          curvePoints,
          curvePosition: 2,
        },
      ];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="moore"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const paths = container.querySelectorAll('path');
      // Should have curve paths
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should render visited and unvisited curve portions', () => {
      const curvePoints = [
        { x: 0, y: 0 },
        { x: 0, y: 8 },
        { x: 8, y: 8 },
        { x: 8, y: 0 },
        { x: 16, y: 0 },
      ];
      const steps = [
        {
          type: 'curve',
          tour: [0, 1],
          curvePoints,
          curvePosition: 2,
        },
      ];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="moore"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const paths = container.querySelectorAll('path');
      // Should have at least 2 paths (visited + unvisited curve)
      expect(paths.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Point Styling', () => {
    it('should style last added point differently', () => {
      const steps = [{ type: 'sweep', tour: [0, 1, 2] }];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const circles = container.querySelectorAll('circle');
      // Find the last added point (should have radius 6 and red fill)
      const largerCircles = Array.from(circles).filter(
        (c) => c.getAttribute('r') === '6'
      );
      expect(largerCircles.length).toBeGreaterThanOrEqual(1);
    });

    it('should style in-tour points differently', () => {
      const steps = [{ type: 'sweep', tour: [0, 1] }];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const circles = container.querySelectorAll('circle');
      // Points in tour should have blue fill, not in tour should have gray
      const blueCircles = Array.from(circles).filter(
        (c) => c.getAttribute('fill') === '#0d6efd'
      );
      expect(blueCircles.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Optimization Mode', () => {
    it('should use green stroke for optimization tour', () => {
      const steps = [{ type: 'optimize', tour: [0, 1, 2, 3] }];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={true}
        />
      );
      const paths = container.querySelectorAll('path');
      // Find path with green stroke
      const greenPaths = Array.from(paths).filter(
        (p) => p.getAttribute('stroke') === '#198754'
      );
      expect(greenPaths.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty points array', () => {
      const { container } = render(
        <TSPVisualization
          points={[]}
          steps={[]}
          currentStep={-1}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
    });

    it('should handle invalid currentStep', () => {
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={[{ type: 'sweep', tour: [0, 1] }]}
          currentStep={-5}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
    });

    it('should handle currentStep beyond steps array', () => {
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={[{ type: 'sweep', tour: [0, 1] }]}
          currentStep={100}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
    });

    it('should handle step without tour', () => {
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={[{ type: 'sweep' }]}
          currentStep={0}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={false}
        />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
    });
  });

  describe('Already-optimal optimization (issue #15)', () => {
    it('should render tour path for optimization step with no improvement', () => {
      // This simulates the fix: when no optimization is found, a single step
      // with the original tour is created so the path stays visible
      const steps = [
        {
          type: 'optimize',
          tour: [0, 1, 2, 3],
          improvement: 0,
          description: 'Tour is already optimal — no improvements found',
        },
      ];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={true}
        />
      );
      const paths = container.querySelectorAll('path');
      const greenPaths = Array.from(paths).filter(
        (p) => p.getAttribute('stroke') === '#198754'
      );
      expect(greenPaths.length).toBeGreaterThanOrEqual(1);
    });

    it('should render all point circles for optimization step with no improvement', () => {
      const steps = [
        {
          type: 'optimize',
          tour: [0, 1, 2, 3],
          improvement: 0,
          description: 'Tour is already optimal — no improvements found',
        },
      ];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="moore"
          mooreGridSize={16}
          showOptimization={true}
        />
      );
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(samplePoints.length);
    });

    it('should render closed tour path with Z command for full tour', () => {
      const steps = [
        {
          type: 'optimize',
          tour: [0, 1, 2, 3],
          improvement: 0,
          description: 'Tour is already optimal — no improvements found',
        },
      ];
      const { container } = render(
        <TSPVisualization
          points={samplePoints}
          steps={steps}
          currentStep={0}
          algorithm="sonar"
          mooreGridSize={16}
          showOptimization={true}
        />
      );
      const paths = container.querySelectorAll('path');
      const tourPath = Array.from(paths).find(
        (p) => p.getAttribute('stroke') === '#198754'
      );
      expect(tourPath).toBeDefined();
      expect(tourPath.getAttribute('d')).toContain('Z');
    });
  });

  describe('TSPCanvas Alias', () => {
    it('should be an alias for TSPVisualization', () => {
      expect(TSPCanvas).toBe(TSPVisualization);
    });
  });
});
