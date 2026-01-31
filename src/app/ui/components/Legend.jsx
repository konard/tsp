/**
 * Legend Component
 *
 * Displays the color legend for TSP visualizations.
 * Different legends for Sonar and Moore algorithms.
 */

import { t } from '../i18n.js';

/**
 * LegendItem - Single legend entry
 *
 * @param {Object} props
 * @param {string} props.color - Background color for the legend marker
 * @param {string} props.label - Text label for the legend entry
 */
const LegendItem = ({ color, label }) => (
  <div className="legend-item">
    <div className="legend-color" style={{ background: color }}></div>
    <span>{label}</span>
  </div>
);

/**
 * SonarLegend - Legend for Sonar algorithm visualization
 *
 * @param {Object} props
 * @param {boolean} props.showOptimization - Whether showing optimization phase
 * @param {string} props.lang - Language code
 */
const SonarLegend = ({ showOptimization, lang = 'en' }) => (
  <div className="legend">
    <LegendItem color="#6c757d" label={t(lang, 'unvisited')} />
    <LegendItem color="#0d6efd" label={t(lang, 'inTour')} />
    <LegendItem color="#dc3545" label={t(lang, 'current')} />
    <LegendItem color="rgba(128, 0, 128, 0.3)" label={t(lang, 'centroid')} />
    {showOptimization && (
      <LegendItem color="#198754" label={t(lang, 'modifiedEdge')} />
    )}
  </div>
);

/**
 * MooreLegend - Legend for Moore Curve algorithm visualization
 *
 * @param {Object} props
 * @param {boolean} props.showOptimization - Whether showing optimization phase
 * @param {string} props.lang - Language code
 */
const MooreLegend = ({ showOptimization, lang = 'en' }) => (
  <div className="legend">
    <LegendItem
      color="rgba(34, 197, 94, 0.6)"
      label={t(lang, 'visitedCurve')}
    />
    <LegendItem
      color="rgba(156, 163, 175, 0.5)"
      label={t(lang, 'unvisitedCurve')}
    />
    <LegendItem color="#0d6efd" label={t(lang, 'tourPath')} />
    <LegendItem color="#dc3545" label={t(lang, 'current')} />
    {showOptimization && (
      <LegendItem color="#198754" label={t(lang, 'modifiedEdge')} />
    )}
  </div>
);

/**
 * BruteForceLegend - Legend for Brute-Force algorithm visualization
 *
 * @param {Object} props
 * @param {boolean} props.showOptimization - Whether showing optimization phase
 * @param {string} props.lang - Language code
 */
const BruteForceLegend = ({ showOptimization, lang = 'en' }) => (
  <div className="legend">
    <LegendItem color="#6c757d" label={t(lang, 'unvisited')} />
    <LegendItem color="#0d6efd" label={t(lang, 'inTour')} />
    <LegendItem color="#dc3545" label={t(lang, 'current')} />
    {showOptimization && (
      <LegendItem color="#198754" label={t(lang, 'modifiedEdge')} />
    )}
  </div>
);

/**
 * Legend - Generic legend component
 *
 * @param {Object} props
 * @param {string} props.algorithm - Algorithm type ('sonar', 'moore', or 'brute-force')
 * @param {boolean} props.showOptimization - Whether showing optimization phase
 * @param {string} props.lang - Language code
 */
const Legend = ({ algorithm, showOptimization, lang = 'en' }) => {
  if (algorithm === 'sonar') {
    return <SonarLegend showOptimization={showOptimization} lang={lang} />;
  }
  if (algorithm === 'brute-force') {
    return <BruteForceLegend showOptimization={showOptimization} lang={lang} />;
  }
  return <MooreLegend showOptimization={showOptimization} lang={lang} />;
};

export { Legend, SonarLegend, MooreLegend, BruteForceLegend, LegendItem };
export default Legend;
