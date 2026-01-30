/**
 * Tests for Controls component
 *
 * Note: Input change event handlers are tested in e2e tests as JSDOM doesn't
 * properly support React's synthetic event system. Unit tests focus on rendering
 * and structure verification.
 */

import { describe, it, expect, mock } from 'bun:test';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Controls } from '../../app/ui/components/Controls.jsx';

const createDefaultProps = (overrides = {}) => ({
  gridSize: 16,
  setGridSize: mock(() => {}),
  numPoints: 15,
  setNumPoints: mock(() => {}),
  speed: 500,
  setSpeed: mock(() => {}),
  mooreGridSize: 16,
  isRunning: false,
  canOptimize: false,
  onGeneratePoints: mock(() => {}),
  onStart: mock(() => {}),
  onStop: mock(() => {}),
  onOptimize: mock(() => {}),
  pointsCount: 15,
  ...overrides,
});

describe('Controls', () => {
  describe('Grid Size Selector', () => {
    it('should render grid size dropdown with correct value', () => {
      const props = createDefaultProps();
      const { getByRole } = render(<Controls {...props} />);
      const select = getByRole('combobox');
      expect(select).toBeDefined();
      expect(select.value).toBe('16');
    });

    it('should show valid Moore curve size options', () => {
      const props = createDefaultProps();
      const { getByRole } = render(<Controls {...props} />);
      const select = getByRole('combobox');
      const options = Array.from(select.querySelectorAll('option'));
      const values = options.map((o) => o.value);
      expect(values).toEqual(['2', '4', '8', '16', '32', '64']);
    });

    it('should be disabled when running', () => {
      const props = createDefaultProps({ isRunning: true });
      const { getByRole } = render(<Controls {...props} />);
      const select = getByRole('combobox');
      expect(select.disabled).toBe(true);
    });

    it('should be enabled when not running', () => {
      const props = createDefaultProps({ isRunning: false });
      const { getByRole } = render(<Controls {...props} />);
      const select = getByRole('combobox');
      expect(select.disabled).toBe(false);
    });
  });

  describe('Points Input', () => {
    it('should render points input with correct value', () => {
      const props = createDefaultProps();
      const { getByRole } = render(<Controls {...props} />);
      const pointsInput = getByRole('spinbutton');
      expect(pointsInput).toBeDefined();
      expect(pointsInput.value).toBe('15');
    });

    it('should have correct min attribute', () => {
      const props = createDefaultProps();
      const { getByRole } = render(<Controls {...props} />);
      const pointsInput = getByRole('spinbutton');
      expect(pointsInput.min).toBe('3');
    });

    it('should be disabled when running', () => {
      const props = createDefaultProps({ isRunning: true });
      const { getByRole } = render(<Controls {...props} />);
      const pointsInput = getByRole('spinbutton');
      expect(pointsInput.disabled).toBe(true);
    });
  });

  describe('Speed Slider', () => {
    it('should render speed slider', () => {
      const props = createDefaultProps();
      const { getByRole } = render(<Controls {...props} />);
      const slider = getByRole('slider');
      expect(slider.value).toBe('500');
    });

    it('should have correct min and max attributes', () => {
      const props = createDefaultProps();
      const { getByRole } = render(<Controls {...props} />);
      const slider = getByRole('slider');
      expect(slider.min).toBe('50');
      expect(slider.max).toBe('1000');
    });

    it('should display Fast and Slow labels', () => {
      const props = createDefaultProps();
      const { getByText } = render(<Controls {...props} />);
      expect(getByText('Fast')).toBeDefined();
      expect(getByText('Slow')).toBeDefined();
    });
  });

  describe('New Points Button', () => {
    it('should render New Points button', () => {
      const props = createDefaultProps();
      const { getByText } = render(<Controls {...props} />);
      expect(getByText('New Points')).toBeDefined();
    });

    it('should call onGeneratePoints when clicked', () => {
      const onGeneratePoints = mock(() => {});
      const props = createDefaultProps({ onGeneratePoints });
      const { getByText } = render(<Controls {...props} />);
      fireEvent.click(getByText('New Points'));
      expect(onGeneratePoints).toHaveBeenCalled();
    });

    it('should be disabled when running', () => {
      const props = createDefaultProps({ isRunning: true });
      const { getByText } = render(<Controls {...props} />);
      const button = getByText('New Points');
      expect(button.disabled).toBe(true);
    });
  });

  describe('Start Button', () => {
    it('should render Start button when not running', () => {
      const props = createDefaultProps();
      const { getByText } = render(<Controls {...props} />);
      expect(getByText('Start')).toBeDefined();
    });

    it('should call onStart when clicked', () => {
      const onStart = mock(() => {});
      const props = createDefaultProps({ onStart });
      const { getByText } = render(<Controls {...props} />);
      fireEvent.click(getByText('Start'));
      expect(onStart).toHaveBeenCalled();
    });

    it('should be disabled when no points', () => {
      const props = createDefaultProps({ pointsCount: 0 });
      const { getByText } = render(<Controls {...props} />);
      const button = getByText('Start');
      expect(button.disabled).toBe(true);
    });
  });

  describe('Stop Button', () => {
    it('should render Stop button when running', () => {
      const props = createDefaultProps({ isRunning: true });
      const { getByText } = render(<Controls {...props} />);
      expect(getByText('Stop')).toBeDefined();
    });

    it('should call onStop when clicked', () => {
      const onStop = mock(() => {});
      const props = createDefaultProps({ isRunning: true, onStop });
      const { getByText } = render(<Controls {...props} />);
      fireEvent.click(getByText('Stop'));
      expect(onStop).toHaveBeenCalled();
    });

    it('should not render Start button when running', () => {
      const props = createDefaultProps({ isRunning: true });
      const { queryByText } = render(<Controls {...props} />);
      expect(queryByText('Start')).toBeNull();
    });
  });

  describe('Optimization Buttons', () => {
    it('should render 2-opt and Zigzag buttons when canOptimize is true', () => {
      const props = createDefaultProps({ canOptimize: true });
      const { getByText } = render(<Controls {...props} />);
      expect(getByText('2-opt')).toBeDefined();
      expect(getByText('Zigzag')).toBeDefined();
    });

    it('should not render optimization buttons when canOptimize is false', () => {
      const props = createDefaultProps({ canOptimize: false });
      const { queryByText } = render(<Controls {...props} />);
      expect(queryByText('2-opt')).toBeNull();
      expect(queryByText('Zigzag')).toBeNull();
    });

    it('should call onOptimize with "2-opt" when 2-opt clicked', () => {
      const onOptimize = mock(() => {});
      const props = createDefaultProps({ canOptimize: true, onOptimize });
      const { getByText } = render(<Controls {...props} />);
      fireEvent.click(getByText('2-opt'));
      expect(onOptimize).toHaveBeenCalledWith('2-opt');
    });

    it('should call onOptimize with "zigzag" when Zigzag clicked', () => {
      const onOptimize = mock(() => {});
      const props = createDefaultProps({ canOptimize: true, onOptimize });
      const { getByText } = render(<Controls {...props} />);
      fireEvent.click(getByText('Zigzag'));
      expect(onOptimize).toHaveBeenCalledWith('zigzag');
    });

    it('should highlight active optimization button', () => {
      const props = createDefaultProps({
        canOptimize: true,
        activeOptimization: '2-opt',
      });
      const { getByText } = render(<Controls {...props} />);
      const twoOptBtn = getByText('2-opt');
      expect(twoOptBtn.className).toContain('btn-active');
    });
  });
});
