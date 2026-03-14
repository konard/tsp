/**
 * Main App Component for TSP Visual Solver
 *
 * Orchestrates the TSP solver application including:
 * - State management for points, algorithm steps, and animation
 * - Algorithm execution with user-selectable algorithms for side-by-side comparison
 * - Verification of optimal tour distance via lower bound and brute-force
 * - UI layout with controls and side-by-side visualizations
 */

import { useState, useEffect, useRef, useCallback } from 'react';

import { LANGUAGES, detectLanguage, t } from './i18n.js';

// Import algorithm functions from lib
import {
  calculateMooreGridSize,
  calculatePeanoGridSize,
  generateRandomPoints,
  calculateTotalDistance,
  sonarAlgorithmSteps,
  mooreAlgorithmSteps,
  uForkAlgorithmSteps,
  gosperAlgorithmSteps,
  peanoAlgorithmSteps,
  sierpinskiAlgorithmSteps,
  combAlgorithmSteps,
  sawAlgorithmSteps,
  kochAlgorithmSteps,
  spaceFillingTreeAlgorithmSteps,
  spiralAlgorithmSteps,
  bruteForceAlgorithmSteps,
  bruteForceSolution,
  calculateOptimalityRatio,
  BRUTE_FORCE_MAX_POINTS,
  // Manual drawing
  manualAlgorithmSteps,
  createManualStep,
  // Generic optimizations that can work with any tour
  zigzagOptSteps,
  twoOptSteps,
  threeOptSteps,
  kOptSteps,
  linKernighanSteps,
  lkHelsgaunSteps,
  // Verification
  verifyOptimality,
} from '../../lib/index.js';

// Import UI components
import { TSPVisualization } from './components/TSPVisualization.jsx';
import { Controls, ALGORITHM_OPTIONS } from './components/Controls.jsx';
import { Legend } from './components/Legend.jsx';
import { VisualizationPanel } from './components/VisualizationPanel.jsx';

/**
 * Get algorithm metadata using i18n translations
 */
const getAlgorithmMeta = (lang) => ({
  sonar: {
    title: t(lang, 'sonarTitle'),
    aliases: t(lang, 'sonarAliases'),
    vizType: 'sonar',
  },
  moore: {
    title: t(lang, 'mooreTitle'),
    aliases: t(lang, 'mooreAliases'),
    vizType: 'moore',
  },
  'u-fork': {
    title: t(lang, 'uForkTitle'),
    aliases: t(lang, 'uForkAliases'),
    vizType: 'u-fork',
  },
  gosper: {
    title: t(lang, 'gosperTitle'),
    aliases: t(lang, 'gosperAliases'),
    vizType: 'gosper',
  },
  peano: {
    title: t(lang, 'peanoTitle'),
    aliases: t(lang, 'peanoAliases'),
    vizType: 'peano',
  },
  sierpinski: {
    title: t(lang, 'sierpinskiTitle'),
    aliases: t(lang, 'sierpinskiAliases'),
    vizType: 'sierpinski',
  },
  comb: {
    title: t(lang, 'combTitle'),
    aliases: t(lang, 'combAliases'),
    vizType: 'comb',
  },
  saw: {
    title: t(lang, 'sawTitle'),
    aliases: t(lang, 'sawAliases'),
    vizType: 'saw',
  },
  koch: {
    title: t(lang, 'kochTitle'),
    aliases: t(lang, 'kochAliases'),
    vizType: 'koch',
  },
  'space-filling-tree': {
    title: t(lang, 'spaceFillingTreeTitle'),
    aliases: t(lang, 'spaceFillingTreeAliases'),
    vizType: 'space-filling-tree',
  },
  spiral: {
    title: t(lang, 'spiralTitle'),
    aliases: t(lang, 'spiralAliases'),
    vizType: 'spiral',
  },
  'brute-force': {
    title: t(lang, 'bruteForceTitle'),
    aliases: t(lang, 'bruteForceAliases'),
    vizType: 'brute-force',
  },
  manual: {
    title: t(lang, 'manualTitle'),
    aliases: t(lang, 'manualAliases'),
    vizType: 'manual',
  },
});

/**
 * Run the specified algorithm on the given points.
 * Returns steps array for progressive visualization.
 */
const runAlgorithmSteps = (algorithmId, points, mooreGridSize) => {
  switch (algorithmId) {
    case 'sonar':
      return sonarAlgorithmSteps(points);
    case 'moore':
      return mooreAlgorithmSteps(points, mooreGridSize);
    case 'u-fork':
      return uForkAlgorithmSteps(points, mooreGridSize);
    case 'gosper':
      return gosperAlgorithmSteps(points, mooreGridSize);
    case 'peano':
      return peanoAlgorithmSteps(points, calculatePeanoGridSize(mooreGridSize));
    case 'sierpinski':
      return sierpinskiAlgorithmSteps(points, mooreGridSize);
    case 'comb':
      return combAlgorithmSteps(points);
    case 'saw':
      return sawAlgorithmSteps(points);
    case 'koch':
      return kochAlgorithmSteps(points, mooreGridSize);
    case 'space-filling-tree':
      return spaceFillingTreeAlgorithmSteps(points, mooreGridSize);
    case 'spiral':
      return spiralAlgorithmSteps(points, mooreGridSize);
    case 'brute-force':
      return bruteForceAlgorithmSteps(points);
    case 'manual':
      return manualAlgorithmSteps(points);
    default:
      return [];
  }
};

/**
 * Check if an algorithm is execution-limited for the given number of points.
 */
const isAlgorithmLimited = (algorithmId, numPoints) =>
  algorithmId === 'brute-force' && numPoints > BRUTE_FORCE_MAX_POINTS;

/**
 * App - Main application component
 */
const App = () => {
  const [gridSize, setGridSize] = useState(16);
  const [numPoints, setNumPoints] = useState(15);
  const [points, setPoints] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [activeOptimization, setActiveOptimization] = useState(null);

  // Algorithm selection state
  const [leftAlgorithm, setLeftAlgorithm] = useState('sonar');
  const [rightAlgorithm, setRightAlgorithm] = useState('moore');

  // Tree edges visibility toggle (for space-filling-tree legend interaction)
  const [showTreeEdges, setShowTreeEdges] = useState(true);
  const toggleTreeEdges = useCallback(() => {
    setShowTreeEdges((prev) => !prev);
  }, []);

  // Manual drawing state: tracks tours being built by clicking points
  const [leftManualTour, setLeftManualTour] = useState([]);
  const [rightManualTour, setRightManualTour] = useState([]);

  // Calculate Moore grid size - this is the unified grid both algorithms use
  const mooreGridSize = calculateMooreGridSize(gridSize);
  const maxPoints = mooreGridSize * mooreGridSize;

  // Left panel state
  const [leftSteps, setLeftSteps] = useState([]);
  const [leftOptSteps, setLeftOptSteps] = useState([]);
  const [leftCurrentStep, setLeftCurrentStep] = useState(-1);

  // Right panel state
  const [rightSteps, setRightSteps] = useState([]);
  const [rightOptSteps, setRightOptSteps] = useState([]);
  const [rightCurrentStep, setRightCurrentStep] = useState(-1);

  // Verification state
  const [optimalResult, setOptimalResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  const animationRef = useRef(null);

  // Enforce points limit when grid size changes (Issue #5)
  useEffect(() => {
    if (numPoints > maxPoints) {
      setNumPoints(Math.max(3, maxPoints));
    }
  }, [maxPoints, numPoints]);

  const generatePoints = useCallback(() => {
    const actualNumPoints = Math.min(numPoints, maxPoints);
    const newPoints = generateRandomPoints(mooreGridSize, actualNumPoints);
    setPoints(newPoints);
    setLeftSteps([]);
    setLeftOptSteps([]);
    setLeftCurrentStep(-1);
    setRightSteps([]);
    setRightOptSteps([]);
    setRightCurrentStep(-1);
    setIsRunning(false);
    setShowOptimization(false);
    setActiveOptimization(null);
    setOptimalResult(null);
    setVerificationResult(null);
    setLeftManualTour([]);
    setRightManualTour([]);
  }, [mooreGridSize, numPoints, maxPoints]);

  useEffect(() => {
    generatePoints();
  }, []);

  // Compute optimal tour when points change (brute-force for small sets)
  useEffect(() => {
    if (points.length >= 2 && points.length <= BRUTE_FORCE_MAX_POINTS) {
      const result = bruteForceSolution(points);
      setOptimalResult(result);
    } else {
      setOptimalResult(null);
    }
  }, [points]);

  // Compute lower-bound verification when points change
  useEffect(() => {
    if (points.length >= 2) {
      // We use a dummy distance of 0 — we just need the lower bound value
      const result = verifyOptimality(0, points);
      setVerificationResult(result);
    } else {
      setVerificationResult(null);
    }
  }, [points]);

  // Issue #8: Check if either algorithm is limited
  const startDisabled =
    isAlgorithmLimited(leftAlgorithm, points.length) ||
    isAlgorithmLimited(rightAlgorithm, points.length);

  const startDisabledReason = startDisabled
    ? `Brute-Force limited to ${BRUTE_FORCE_MAX_POINTS} points (current: ${points.length})`
    : '';

  const startSolution = useCallback(() => {
    if (points.length === 0 || startDisabled) return;

    const newLeftSteps = runAlgorithmSteps(
      leftAlgorithm,
      points,
      mooreGridSize
    );
    const newRightSteps = runAlgorithmSteps(
      rightAlgorithm,
      points,
      mooreGridSize
    );

    setLeftSteps(newLeftSteps);
    setRightSteps(newRightSteps);
    setLeftCurrentStep(0);
    setRightCurrentStep(0);
    setShowOptimization(false);
    setActiveOptimization(null);
    setLeftOptSteps([]);
    setRightOptSteps([]);
    setLeftManualTour([]);
    setRightManualTour([]);

    // For manual algorithms, don't start animation — user draws interactively
    const bothManual =
      leftAlgorithm === 'manual' && rightAlgorithm === 'manual';
    const leftManual = leftAlgorithm === 'manual';
    const rightManual = rightAlgorithm === 'manual';

    if (bothManual) {
      // Both manual: no animation needed
      setIsRunning(false);
    } else if (leftManual || rightManual) {
      // One side is manual, the other runs normally
      setIsRunning(true);
    } else {
      setIsRunning(true);
    }
  }, [points, mooreGridSize, leftAlgorithm, rightAlgorithm, startDisabled]);

  const stopAnimation = useCallback(() => {
    setIsRunning(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  // Manual drawing: handle point click for building tour
  const handleManualPointClick = useCallback(
    (side, pointIndex) => {
      const algorithm = side === 'left' ? leftAlgorithm : rightAlgorithm;
      if (algorithm !== 'manual') return;

      const manualTour = side === 'left' ? leftManualTour : rightManualTour;
      const setManualTour =
        side === 'left' ? setLeftManualTour : setRightManualTour;
      const setSteps = side === 'left' ? setLeftSteps : setRightSteps;
      const setCurrentStep =
        side === 'left' ? setLeftCurrentStep : setRightCurrentStep;

      // Don't add if already in tour or tour is complete
      if (manualTour.includes(pointIndex)) return;
      if (manualTour.length >= points.length) return;

      const newTour = [...manualTour, pointIndex];
      setManualTour(newTour);

      // Update the steps to reflect the new tour state
      const newStep = createManualStep(newTour, points.length);
      setSteps([newStep]);
      setCurrentStep(0);
    },
    [
      leftAlgorithm,
      rightAlgorithm,
      leftManualTour,
      rightManualTour,
      points.length,
    ]
  );

  // Undo last point in manual tour
  const handleManualUndo = useCallback(
    (side) => {
      const manualTour = side === 'left' ? leftManualTour : rightManualTour;
      const setManualTour =
        side === 'left' ? setLeftManualTour : setRightManualTour;
      const setSteps = side === 'left' ? setLeftSteps : setRightSteps;
      const setCurrentStep =
        side === 'left' ? setLeftCurrentStep : setRightCurrentStep;

      if (manualTour.length === 0) return;

      const newTour = manualTour.slice(0, -1);
      setManualTour(newTour);

      const newStep = createManualStep(newTour, points.length);
      setSteps([newStep]);
      setCurrentStep(0);
    },
    [leftManualTour, rightManualTour, points.length]
  );

  // Download SVG of the current tour
  const handleDownloadSvg = (side) => {
    const step = side === 'left' ? getLeftStep() : getRightStep();
    if (!step?.tour || step.tour.length < 2) return;

    const tour = step.tour;
    const svgSize = 400;
    const svgPadding = 20;
    const displayGrid = mooreGridSize - 1;
    const svgScale = (svgSize - 2 * svgPadding) / displayGrid;

    const toCoord = (p) => ({
      x: svgPadding + p.x * svgScale,
      y: svgPadding + p.y * svgScale,
    });

    // Build path data
    const tourCoords = tour.map((idx) => toCoord(points[idx]));
    let pathD = tourCoords
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ');
    if (tour.length === points.length) {
      pathD += ' Z';
    }

    // Build point circles
    const circles = points
      .map((pt) => {
        const c = toCoord(pt);
        return `<circle cx="${c.x}" cy="${c.y}" r="4" fill="black"/>`;
      })
      .join('\n    ');

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
  <rect width="${svgSize}" height="${svgSize}" fill="white"/>
  <path d="${pathD}" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <g>
    ${circles}
  </g>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tsp-tour.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Issue #6: Get the current tour for a side (considering optimization)
  const getCurrentTour = useCallback(
    (side) => {
      if (side === 'left') {
        if (showOptimization && leftOptSteps.length > 0) {
          return leftOptSteps[leftOptSteps.length - 1]?.tour || [];
        }
        return leftSteps.length > 0
          ? leftSteps[leftSteps.length - 1]?.tour || []
          : [];
      }
      if (showOptimization && rightOptSteps.length > 0) {
        return rightOptSteps[rightOptSteps.length - 1]?.tour || [];
      }
      return rightSteps.length > 0
        ? rightSteps[rightSteps.length - 1]?.tour || []
        : [];
    },
    [showOptimization, leftOptSteps, rightOptSteps, leftSteps, rightSteps]
  );

  const startOptimization = useCallback(
    (method) => {
      // Issue #6: Use current tour (possibly already optimized)
      const leftTour = getCurrentTour('left');
      const rightTour = getCurrentTour('right');
      if (leftTour.length === 0 || rightTour.length === 0) return;

      const optFnMap = {
        '2-opt': twoOptSteps,
        '3-opt': threeOptSteps,
        'k-opt': kOptSteps,
        'lin-kernighan': linKernighanSteps,
        lkh: lkHelsgaunSteps,
        zigzag: zigzagOptSteps,
      };
      const optFn = optFnMap[method] || twoOptSteps;
      let newLeftOptSteps = optFn(points, leftTour);
      let newRightOptSteps = optFn(points, rightTour);

      const optimalDistance = optimalResult?.distance;
      const methodLabelMap = {
        '2-opt': '2-opt',
        '3-opt': '3-opt',
        'k-opt': 'k-opt',
        'lin-kernighan': 'LK',
        lkh: 'LKH',
        zigzag: 'Zigzag',
      };
      const methodLabel = methodLabelMap[method] || method;

      // When optimization finds no improvements, create a step with
      // comparison to the true optimal distance (if available)
      if (newLeftOptSteps.length === 0) {
        const leftDist = calculateTotalDistance(leftTour, points);
        let description;
        if (optimalDistance && Math.abs(leftDist - optimalDistance) < 0.001) {
          description = `${methodLabel}: Tour is already optimal (verified)`;
        } else if (optimalDistance) {
          const ratio = calculateOptimalityRatio(leftDist, optimalDistance);
          description = `${methodLabel}: No improvements found (${((ratio - 1) * 100).toFixed(1)}% above optimal)`;
        } else {
          // Use lower-bound verification for larger instances
          const verification = verifyOptimality(leftDist, points);
          if (verification.isOptimal) {
            description = `${methodLabel}: Tour is already optimal (verified by ${verification.method} bound)`;
          } else {
            description = `${methodLabel}: No improvements found (${verification.gapPercent.toFixed(1)}% above lower bound)`;
          }
        }
        newLeftOptSteps = [
          {
            type: 'optimize',
            tour: [...leftTour],
            improvement: 0,
            description,
          },
        ];
      }
      if (newRightOptSteps.length === 0) {
        const rightDist = calculateTotalDistance(rightTour, points);
        let description;
        if (optimalDistance && Math.abs(rightDist - optimalDistance) < 0.001) {
          description = `${methodLabel}: Tour is already optimal (verified)`;
        } else if (optimalDistance) {
          const ratio = calculateOptimalityRatio(rightDist, optimalDistance);
          description = `${methodLabel}: No improvements found (${((ratio - 1) * 100).toFixed(1)}% above optimal)`;
        } else {
          const verification = verifyOptimality(rightDist, points);
          if (verification.isOptimal) {
            description = `${methodLabel}: Tour is already optimal (verified by ${verification.method} bound)`;
          } else {
            description = `${methodLabel}: No improvements found (${verification.gapPercent.toFixed(1)}% above lower bound)`;
          }
        }
        newRightOptSteps = [
          {
            type: 'optimize',
            tour: [...rightTour],
            improvement: 0,
            description,
          },
        ];
      }

      setLeftOptSteps(newLeftOptSteps);
      setRightOptSteps(newRightOptSteps);
      setLeftCurrentStep(0);
      setRightCurrentStep(0);
      setShowOptimization(true);
      setActiveOptimization(method);
      setIsRunning(true);
    },
    [points, getCurrentTour, optimalResult]
  );

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const currentLeftSteps = showOptimization ? leftOptSteps : leftSteps;
    const currentRightSteps = showOptimization ? rightOptSteps : rightSteps;

    const leftDone = leftCurrentStep >= currentLeftSteps.length - 1;
    const rightDone = rightCurrentStep >= currentRightSteps.length - 1;

    if (leftDone && rightDone) {
      setIsRunning(false);
      return;
    }

    animationRef.current = setTimeout(() => {
      if (!leftDone) {
        setLeftCurrentStep((prev) =>
          Math.min(prev + 1, currentLeftSteps.length - 1)
        );
      }
      if (!rightDone) {
        setRightCurrentStep((prev) =>
          Math.min(prev + 1, currentRightSteps.length - 1)
        );
      }
    }, speed);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [
    isRunning,
    leftCurrentStep,
    rightCurrentStep,
    speed,
    showOptimization,
    leftSteps,
    rightSteps,
    leftOptSteps,
    rightOptSteps,
  ]);

  const getLeftStep = () => {
    const steps = showOptimization ? leftOptSteps : leftSteps;
    return steps[leftCurrentStep];
  };

  const getRightStep = () => {
    const steps = showOptimization ? rightOptSteps : rightSteps;
    return steps[rightCurrentStep];
  };

  const calculateLeftDistance = () => {
    const step = getLeftStep();
    if (!step?.tour || step.tour.length < 2) return 0;
    return calculateTotalDistance(step.tour, points);
  };

  const calculateRightDistance = () => {
    const step = getRightStep();
    if (!step?.tour || step.tour.length < 2) return 0;
    return calculateTotalDistance(step.tour, points);
  };

  // Check if manual tours are complete
  const leftManualComplete =
    leftAlgorithm === 'manual' && leftManualTour.length === points.length;
  const rightManualComplete =
    rightAlgorithm === 'manual' && rightManualTour.length === points.length;

  // A side is "done" if it's a regular algorithm that finished, or a manual tour that is complete
  const leftSideDone =
    leftAlgorithm === 'manual'
      ? leftManualComplete
      : leftSteps.length > 0 &&
        (showOptimization
          ? leftCurrentStep >= leftOptSteps.length - 1
          : leftCurrentStep >= leftSteps.length - 1);
  const rightSideDone =
    rightAlgorithm === 'manual'
      ? rightManualComplete
      : rightSteps.length > 0 &&
        (showOptimization
          ? rightCurrentStep >= rightOptSteps.length - 1
          : rightCurrentStep >= rightSteps.length - 1);

  // Issue #6: canOptimize when both sides are done and not running
  const solutionComplete = leftSideDone && rightSideDone && !isRunning;

  const canOptimize = solutionComplete;

  // Whether each side is in manual drawing mode (started but not complete)
  const leftIsManualDrawing =
    leftAlgorithm === 'manual' && leftSteps.length > 0 && !leftManualComplete;
  const rightIsManualDrawing =
    rightAlgorithm === 'manual' &&
    rightSteps.length > 0 &&
    !rightManualComplete;

  // Whether SVG download is available for each side
  const leftCanDownloadSvg =
    leftSteps.length > 0 && getLeftStep()?.tour?.length >= 2;
  const rightCanDownloadSvg =
    rightSteps.length > 0 && getRightStep()?.tour?.length >= 2;

  // Issue #1: Format distance info with % of optimal and exact length
  const formatDistanceInfo = (dist) => {
    const distLabel = t(lang, 'distance');
    if (dist === 0) {
      return `${distLabel}: \u2014`;
    }
    if (optimalResult) {
      const pct = ((dist / optimalResult.distance) * 100).toFixed(1);
      return `${distLabel}: ${dist.toFixed(2)} (${pct}% ${t(lang, 'ofOptimal')} ${optimalResult.distance.toFixed(2)})`;
    }
    if (verificationResult) {
      const lb = verificationResult.lowerBound;
      if (lb > 0) {
        const pct = ((dist / lb) * 100).toFixed(1);
        return `${distLabel}: ${dist.toFixed(2)} (${pct}% ${t(lang, 'ofLowerBound')} ${lb.toFixed(2)})`;
      }
    }
    return `${distLabel}: ${dist.toFixed(2)}`;
  };

  // Dark/light theme state - default to system preference
  const [theme, setTheme] = useState(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Language state - default to browser preference
  const [lang, setLang] = useState(detectLanguage);

  // Apply theme to document root for CSS custom properties
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const algorithmMeta = getAlgorithmMeta(lang);
  const leftMeta = algorithmMeta[leftAlgorithm];
  const rightMeta = algorithmMeta[rightAlgorithm];

  // Map algorithm ids to i18n keys
  const algorithmLabelKeys = {
    sonar: 'sonarVisit',
    moore: 'mooreCurve',
    'u-fork': 'uForkCurve',
    gosper: 'gosperCurve',
    peano: 'peanoCurve',
    sierpinski: 'sierpinskiCurve',
    comb: 'combScan',
    saw: 'selfAvoidingWalk',
    koch: 'kochSnowflake',
    'space-filling-tree': 'spaceFillingTree',
    spiral: 'doubleSpiral',
    'brute-force': 'bruteForce',
    manual: 'manualDrawing',
  };

  // Translated algorithm options
  const translatedAlgorithmOptions = ALGORITHM_OPTIONS.map((opt) => ({
    ...opt,
    label: t(lang, algorithmLabelKeys[opt.id]),
  }));

  // Filtered options for algorithm selects (exclude the other side's selection)
  const leftAlgorithmOptions = translatedAlgorithmOptions.filter(
    (opt) => opt.id !== rightAlgorithm
  );
  const rightAlgorithmOptions = translatedAlgorithmOptions.filter(
    (opt) => opt.id !== leftAlgorithm
  );

  return (
    <div className="app">
      <div className="app-header">
        <div className="language-selector">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
        <h1>{t(lang, 'title')}</h1>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '\u{263E}' : '\u{2600}'}
        </button>
      </div>

      <Controls
        gridSize={gridSize}
        setGridSize={setGridSize}
        numPoints={numPoints}
        setNumPoints={setNumPoints}
        speed={speed}
        setSpeed={setSpeed}
        mooreGridSize={mooreGridSize}
        isRunning={isRunning}
        canOptimize={canOptimize}
        activeOptimization={activeOptimization}
        onGeneratePoints={generatePoints}
        onStart={startSolution}
        onStop={stopAnimation}
        onOptimize={startOptimization}
        pointsCount={points.length}
        startDisabled={startDisabled}
        startDisabledReason={startDisabledReason}
        lang={lang}
      />

      <div className="visualization-container">
        <VisualizationPanel
          selectedAlgorithm={leftAlgorithm}
          onAlgorithmChange={setLeftAlgorithm}
          algorithmOptions={leftAlgorithmOptions}
          isRunning={isRunning}
          aliases={leftMeta.aliases}
          distanceInfo={formatDistanceInfo(calculateLeftDistance())}
          visualization={
            <TSPVisualization
              points={points}
              steps={showOptimization ? leftOptSteps : leftSteps}
              currentStep={leftCurrentStep}
              algorithm={leftMeta.vizType}
              mooreGridSize={mooreGridSize}
              showOptimization={showOptimization}
              showTreeEdges={showTreeEdges}
              onPointClick={
                leftIsManualDrawing
                  ? (idx) => handleManualPointClick('left', idx)
                  : undefined
              }
              manualTour={
                leftAlgorithm === 'manual' ? leftManualTour : undefined
              }
            />
          }
          stepDescription={getLeftStep()?.description}
          defaultStepText={t(lang, 'clickStart')}
          legend={
            <Legend
              algorithm={leftMeta.vizType}
              showOptimization={showOptimization}
              lang={lang}
              showTreeEdges={showTreeEdges}
              onToggleTreeEdges={toggleTreeEdges}
            />
          }
          isManualDrawing={leftIsManualDrawing}
          onManualUndo={() => handleManualUndo('left')}
          canDownloadSvg={leftCanDownloadSvg}
          onDownloadSvg={() => handleDownloadSvg('left')}
        />

        <VisualizationPanel
          selectedAlgorithm={rightAlgorithm}
          onAlgorithmChange={setRightAlgorithm}
          algorithmOptions={rightAlgorithmOptions}
          isRunning={isRunning}
          aliases={rightMeta.aliases}
          distanceInfo={formatDistanceInfo(calculateRightDistance())}
          visualization={
            <TSPVisualization
              points={points}
              steps={showOptimization ? rightOptSteps : rightSteps}
              currentStep={rightCurrentStep}
              algorithm={rightMeta.vizType}
              mooreGridSize={mooreGridSize}
              showOptimization={showOptimization}
              showTreeEdges={showTreeEdges}
              onPointClick={
                rightIsManualDrawing
                  ? (idx) => handleManualPointClick('right', idx)
                  : undefined
              }
              manualTour={
                rightAlgorithm === 'manual' ? rightManualTour : undefined
              }
            />
          }
          stepDescription={getRightStep()?.description}
          defaultStepText={t(lang, 'clickStart')}
          legend={
            <Legend
              algorithm={rightMeta.vizType}
              showOptimization={showOptimization}
              lang={lang}
              showTreeEdges={showTreeEdges}
              onToggleTreeEdges={toggleTreeEdges}
            />
          }
          isManualDrawing={rightIsManualDrawing}
          onManualUndo={() => handleManualUndo('right')}
          canDownloadSvg={rightCanDownloadSvg}
          onDownloadSvg={() => handleDownloadSvg('right')}
        />
      </div>
    </div>
  );
};

export { App };
export default App;
