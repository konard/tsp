/**
 * Main entry point for TSP Visual Solver application
 */

import { createRoot } from 'react-dom/client';
import { App } from './ui/App.jsx';
import './ui/styles.css';

// Mount the app
const root = createRoot(document.getElementById('root'));
root.render(<App />);
