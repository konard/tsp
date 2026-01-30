import {
  calculateMooreGridSize,
  VALID_GRID_SIZES,
} from '../src/lib/algorithms/utils.js';

console.log('VALID_GRID_SIZES:', VALID_GRID_SIZES);
console.log('\nNew calculateMooreGridSize behavior:');
for (const gs of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 20, 32, 50, 64, 100]) {
  console.log(
    `  calculateMooreGridSize(${gs}) = ${calculateMooreGridSize(gs)}`
  );
}
