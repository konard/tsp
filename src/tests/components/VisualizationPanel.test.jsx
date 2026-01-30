/**
 * Tests for VisualizationPanel component
 */

import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { VisualizationPanel } from '../../app/ui/components/VisualizationPanel.jsx';

describe('VisualizationPanel', () => {
  it('should render title', () => {
    const { getByText } = render(
      <VisualizationPanel
        title="Test Algorithm"
        aliases="Test aliases"
        distanceInfo="Distance: 123.46"
        visualization={<div data-testid="viz">Visualization</div>}
        stepDescription="Test step"
        legend={<div data-testid="legend">Legend</div>}
      />
    );
    expect(getByText('Test Algorithm')).toBeDefined();
  });

  it('should render aliases', () => {
    const { getByText } = render(
      <VisualizationPanel
        title="Test Algorithm"
        aliases="Alias A, Alias B"
        distanceInfo="Distance: 100.00"
        visualization={<div>Viz</div>}
        stepDescription="Step"
        legend={<div>Legend</div>}
      />
    );
    expect(getByText('Alias A, Alias B')).toBeDefined();
  });

  it('should render formatted distance', () => {
    const { getByText } = render(
      <VisualizationPanel
        title="Test"
        aliases=""
        distanceInfo="Distance: 123.46"
        visualization={<div>Viz</div>}
        stepDescription="Step"
        legend={<div>Legend</div>}
      />
    );
    expect(getByText('Distance: 123.46')).toBeDefined();
  });

  it('should render distance with optimality info', () => {
    const { getByText } = render(
      <VisualizationPanel
        title="Test"
        aliases=""
        distanceInfo="Distance: 15.00 (120.0% of optimal 12.50)"
        visualization={<div>Viz</div>}
        stepDescription="Step"
        legend={<div>Legend</div>}
      />
    );
    expect(
      getByText('Distance: 15.00 (120.0% of optimal 12.50)')
    ).toBeDefined();
  });

  it('should render distance with zero', () => {
    const { getByText } = render(
      <VisualizationPanel
        title="Test"
        aliases=""
        distanceInfo="Distance: 0.00"
        visualization={<div>Viz</div>}
        stepDescription="Step"
        legend={<div>Legend</div>}
      />
    );
    expect(getByText('Distance: 0.00')).toBeDefined();
  });

  it('should render visualization content', () => {
    const { getByTestId } = render(
      <VisualizationPanel
        title="Test"
        aliases=""
        distanceInfo="Distance: 0.00"
        visualization={<div data-testid="custom-viz">Custom Visualization</div>}
        stepDescription="Step"
        legend={<div>Legend</div>}
      />
    );
    expect(getByTestId('custom-viz')).toBeDefined();
  });

  it('should render step description when provided', () => {
    const { getByText } = render(
      <VisualizationPanel
        title="Test"
        aliases=""
        distanceInfo="Distance: 0.00"
        visualization={<div>Viz</div>}
        stepDescription="Processing point 5 of 10"
        legend={<div>Legend</div>}
      />
    );
    expect(getByText('Processing point 5 of 10')).toBeDefined();
  });

  it('should render default message when stepDescription is falsy', () => {
    const { getByText } = render(
      <VisualizationPanel
        title="Test"
        aliases=""
        distanceInfo="Distance: 0.00"
        visualization={<div>Viz</div>}
        stepDescription=""
        legend={<div>Legend</div>}
      />
    );
    expect(getByText('Click Start to begin')).toBeDefined();
  });

  it('should render default message when stepDescription is null', () => {
    const { getByText } = render(
      <VisualizationPanel
        title="Test"
        aliases=""
        distanceInfo="Distance: 0.00"
        visualization={<div>Viz</div>}
        stepDescription={null}
        legend={<div>Legend</div>}
      />
    );
    expect(getByText('Click Start to begin')).toBeDefined();
  });

  it('should render default message when stepDescription is undefined', () => {
    const { getByText } = render(
      <VisualizationPanel
        title="Test"
        aliases=""
        distanceInfo="Distance: 0.00"
        visualization={<div>Viz</div>}
        stepDescription={undefined}
        legend={<div>Legend</div>}
      />
    );
    expect(getByText('Click Start to begin')).toBeDefined();
  });

  it('should render legend content', () => {
    const { getByTestId } = render(
      <VisualizationPanel
        title="Test"
        aliases=""
        distanceInfo="Distance: 0.00"
        visualization={<div>Viz</div>}
        stepDescription="Step"
        legend={<div data-testid="custom-legend">Custom Legend</div>}
      />
    );
    expect(getByTestId('custom-legend')).toBeDefined();
  });
});
