/**
 * Tests for VisualizationPanel component
 */

import { describe, it, expect, mock } from 'bun:test';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { VisualizationPanel } from '../../app/ui/components/VisualizationPanel.jsx';

const createDefaultProps = (overrides = {}) => ({
  selectedAlgorithm: 'sonar',
  onAlgorithmChange: mock(() => {}),
  algorithmOptions: [
    { id: 'sonar', label: 'Sonar Visit' },
    { id: 'brute-force', label: 'Brute-Force' },
  ],
  isRunning: false,
  aliases: 'Test aliases',
  distanceInfo: 'Distance: 0.00',
  visualization: <div>Viz</div>,
  stepDescription: 'Test step',
  legend: <div>Legend</div>,
  ...overrides,
});

describe('VisualizationPanel', () => {
  it('should render algorithm selector dropdown', () => {
    const { container } = render(
      <VisualizationPanel {...createDefaultProps()} />
    );
    const select = container.querySelector('.algorithm-select');
    expect(select).toBeDefined();
    expect(select.value).toBe('sonar');
  });

  it('should render aliases', () => {
    const { getByText } = render(
      <VisualizationPanel
        {...createDefaultProps({ aliases: 'Alias A, Alias B' })}
      />
    );
    expect(getByText('Alias A, Alias B')).toBeDefined();
  });

  it('should render formatted distance', () => {
    const { getByText } = render(
      <VisualizationPanel
        {...createDefaultProps({ distanceInfo: 'Distance: 123.46' })}
      />
    );
    expect(getByText('Distance: 123.46')).toBeDefined();
  });

  it('should render distance with optimality info', () => {
    const { getByText } = render(
      <VisualizationPanel
        {...createDefaultProps({
          distanceInfo: 'Distance: 15.00 (120.0% of optimal 12.50)',
        })}
      />
    );
    expect(
      getByText('Distance: 15.00 (120.0% of optimal 12.50)')
    ).toBeDefined();
  });

  it('should render distance with zero', () => {
    const { getByText } = render(
      <VisualizationPanel
        {...createDefaultProps({ distanceInfo: 'Distance: 0.00' })}
      />
    );
    expect(getByText('Distance: 0.00')).toBeDefined();
  });

  it('should render visualization content', () => {
    const { getByTestId } = render(
      <VisualizationPanel
        {...createDefaultProps({
          visualization: (
            <div data-testid="custom-viz">Custom Visualization</div>
          ),
        })}
      />
    );
    expect(getByTestId('custom-viz')).toBeDefined();
  });

  it('should render step description when provided', () => {
    const { getByText } = render(
      <VisualizationPanel
        {...createDefaultProps({
          stepDescription: 'Processing point 5 of 10',
        })}
      />
    );
    expect(getByText('Processing point 5 of 10')).toBeDefined();
  });

  it('should render default message when stepDescription is falsy', () => {
    const { getByText } = render(
      <VisualizationPanel {...createDefaultProps({ stepDescription: '' })} />
    );
    expect(getByText('Click Start to begin')).toBeDefined();
  });

  it('should render default message when stepDescription is null', () => {
    const { getByText } = render(
      <VisualizationPanel {...createDefaultProps({ stepDescription: null })} />
    );
    expect(getByText('Click Start to begin')).toBeDefined();
  });

  it('should render default message when stepDescription is undefined', () => {
    const { getByText } = render(
      <VisualizationPanel
        {...createDefaultProps({ stepDescription: undefined })}
      />
    );
    expect(getByText('Click Start to begin')).toBeDefined();
  });

  it('should render legend content', () => {
    const { getByTestId } = render(
      <VisualizationPanel
        {...createDefaultProps({
          legend: <div data-testid="custom-legend">Custom Legend</div>,
        })}
      />
    );
    expect(getByTestId('custom-legend')).toBeDefined();
  });

  it('should disable algorithm selector when running', () => {
    const { container } = render(
      <VisualizationPanel {...createDefaultProps({ isRunning: true })} />
    );
    const select = container.querySelector('.algorithm-select');
    expect(select.disabled).toBe(true);
  });

  it('should call onAlgorithmChange when algorithm is changed', () => {
    const onAlgorithmChange = mock(() => {});
    const { container } = render(
      <VisualizationPanel {...createDefaultProps({ onAlgorithmChange })} />
    );
    const select = container.querySelector('.algorithm-select');
    fireEvent.change(select, { target: { value: 'brute-force' } });
    expect(onAlgorithmChange).toHaveBeenCalledWith('brute-force');
  });
});
