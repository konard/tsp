/**
 * Main entry point for TSP Visual Solver application
 */

import { createRoot } from 'react-dom/client';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { App } from './ui/App.jsx';
import './ui/styles.css';

// Mount the app with Chakra UI provider for theming support
const root = createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider value={defaultSystem}>
    <App />
  </ChakraProvider>
);
