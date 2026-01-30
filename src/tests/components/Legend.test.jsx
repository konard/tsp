/**
 * Tests for Legend component
 */

import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import {
  Legend,
  SonarLegend,
  MooreLegend,
  BruteForceLegend,
  LegendItem,
} from '../../app/ui/components/Legend.jsx';

describe('LegendItem', () => {
  it('should render with correct color and label', () => {
    const { getByText } = render(
      <LegendItem color="#ff0000" label="Test Label" />
    );
    expect(getByText('Test Label')).toBeDefined();
  });

  it('should apply color to legend marker', () => {
    const { container } = render(
      <LegendItem color="#00ff00" label="Green Item" />
    );
    const colorDiv = container.querySelector('.legend-color');
    expect(colorDiv).toBeDefined();
    // JSDOM normalizes hex colors to rgb format
    expect(
      colorDiv.style.background === '#00ff00' ||
        colorDiv.style.background === 'rgb(0, 255, 0)'
    ).toBe(true);
  });
});

describe('SonarLegend', () => {
  it('should render base legend items', () => {
    const { getByText } = render(<SonarLegend showOptimization={false} />);
    expect(getByText('Unvisited')).toBeDefined();
    expect(getByText('In Tour')).toBeDefined();
    expect(getByText('Current')).toBeDefined();
  });

  it('should render optimization item when showOptimization is true', () => {
    const { getByText } = render(<SonarLegend showOptimization={true} />);
    expect(getByText('Optimized')).toBeDefined();
  });

  it('should not render optimization item when showOptimization is false', () => {
    const { queryByText } = render(<SonarLegend showOptimization={false} />);
    expect(queryByText('Optimized')).toBeNull();
  });
});

describe('MooreLegend', () => {
  it('should render base legend items', () => {
    const { getByText } = render(<MooreLegend showOptimization={false} />);
    expect(getByText('Visited Curve')).toBeDefined();
    expect(getByText('Unvisited Curve')).toBeDefined();
    expect(getByText('Tour Path')).toBeDefined();
    expect(getByText('Current')).toBeDefined();
  });

  it('should render optimization item when showOptimization is true', () => {
    const { getByText } = render(<MooreLegend showOptimization={true} />);
    expect(getByText('Optimized')).toBeDefined();
  });

  it('should not render optimization item when showOptimization is false', () => {
    const { queryByText } = render(<MooreLegend showOptimization={false} />);
    expect(queryByText('Optimized')).toBeNull();
  });
});

describe('BruteForceLegend', () => {
  it('should render base legend items', () => {
    const { getByText } = render(<BruteForceLegend showOptimization={false} />);
    expect(getByText('Unvisited')).toBeDefined();
    expect(getByText('In Tour')).toBeDefined();
    expect(getByText('Current')).toBeDefined();
  });

  it('should render optimization item when showOptimization is true', () => {
    const { getByText } = render(<BruteForceLegend showOptimization={true} />);
    expect(getByText('Optimized')).toBeDefined();
  });

  it('should not render optimization item when showOptimization is false', () => {
    const { queryByText } = render(
      <BruteForceLegend showOptimization={false} />
    );
    expect(queryByText('Optimized')).toBeNull();
  });
});

describe('Legend', () => {
  it('should render SonarLegend when algorithm is sonar', () => {
    const { getByText } = render(
      <Legend algorithm="sonar" showOptimization={false} />
    );
    expect(getByText('Unvisited')).toBeDefined();
    expect(getByText('In Tour')).toBeDefined();
  });

  it('should render MooreLegend when algorithm is moore', () => {
    const { getByText } = render(
      <Legend algorithm="moore" showOptimization={false} />
    );
    expect(getByText('Visited Curve')).toBeDefined();
    expect(getByText('Unvisited Curve')).toBeDefined();
  });

  it('should render BruteForceLegend when algorithm is brute-force', () => {
    const { getByText } = render(
      <Legend algorithm="brute-force" showOptimization={false} />
    );
    expect(getByText('Unvisited')).toBeDefined();
    expect(getByText('In Tour')).toBeDefined();
    expect(getByText('Current')).toBeDefined();
  });

  it('should default to MooreLegend for unknown algorithm', () => {
    const { getByText } = render(
      <Legend algorithm="unknown" showOptimization={false} />
    );
    expect(getByText('Visited Curve')).toBeDefined();
  });
});
