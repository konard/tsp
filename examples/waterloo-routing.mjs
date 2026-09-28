import {
  branchAndCut,
  solveTspRelaxation,
  solveDirectedTsp,
  zoneAndMoatLowerBound,
} from '../src/lib/algorithms/index.js';

const points = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 100, y: 0 },
  { x: 101, y: 0 },
  { x: 100, y: 1 },
];
const degree = solveTspRelaxation(points, { cuts: 'none' });
const subtour = solveTspRelaxation(points, { cuts: 'full' });
const packing = zoneAndMoatLowerBound(points);
const proof = branchAndCut(points);
console.log({
  degreeBound: degree.lowerBound,
  subtourBound: subtour.lowerBound,
  packingBound: packing.lowerBound,
  tour: proof.tour,
  distance: proof.distance,
  isOptimal: proof.isOptimal,
});

const travelTimes = [
  [0, 2, 5, 3, 6],
  [3, 0, 4, 2, 5],
  [4, 2, 0, 5, 1],
  [2, 1, 4, 0, 3],
  [5, 4, 2, 1, 0],
];
const route = solveDirectedTsp(travelTimes, {
  zones: ['Depot', 'A-1.1A', 'B-1.1A', 'A-1.1A', 'B-1.1A'],
  precedence: [['A-1.1A', 'B-1.1A']],
  exact: true,
});
console.log({ directedTour: route.tour, travelTime: route.distance });
