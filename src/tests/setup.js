/**
 * Test setup file for React component tests
 * Configures JSDOM for browser-like environment
 *
 * This file is preloaded via bunfig.toml before any tests run.
 */

import { JSDOM } from 'jsdom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'bun:test';

// Create a JSDOM instance and expose globals
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

// Expose DOM globals
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.Event = dom.window.Event;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.KeyboardEvent = dom.window.KeyboardEvent;
globalThis.InputEvent = dom.window.InputEvent;

// Clean up after each test to prevent DOM state pollution
afterEach(() => {
  cleanup();
});
