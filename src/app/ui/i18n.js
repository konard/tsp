/* global window */

/**
 * Internationalization (i18n) module for TSP Visual Solver
 *
 * Supports the top 20 languages by population with flag emoji + native name.
 * Uses browser language preferences by default.
 */

/**
 * Available languages with flag emoji and native name.
 * Ordered by approximate number of speakers worldwide.
 */
export const LANGUAGES = [
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', name: 'English' },
  { code: 'zh', flag: '\u{1F1E8}\u{1F1F3}', name: '\u4E2D\u6587' },
  {
    code: 'hi',
    flag: '\u{1F1EE}\u{1F1F3}',
    name: '\u0939\u093F\u0928\u094D\u0926\u0940',
  },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', name: 'Espa\u00F1ol' },
  {
    code: 'ar',
    flag: '\u{1F1F8}\u{1F1E6}',
    name: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629',
  },
  {
    code: 'bn',
    flag: '\u{1F1E7}\u{1F1E9}',
    name: '\u09AC\u09BE\u0982\u09B2\u09BE',
  },
  { code: 'pt', flag: '\u{1F1E7}\u{1F1F7}', name: 'Portugu\u00EAs' },
  {
    code: 'ru',
    flag: '\u{1F1F7}\u{1F1FA}',
    name: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
  },
  { code: 'ja', flag: '\u{1F1EF}\u{1F1F5}', name: '\u65E5\u672C\u8A9E' },
  {
    code: 'pa',
    flag: '\u{1F1EE}\u{1F1F3}',
    name: '\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40',
  },
  { code: 'de', flag: '\u{1F1E9}\u{1F1EA}', name: 'Deutsch' },
  { code: 'jv', flag: '\u{1F1EE}\u{1F1E9}', name: 'Basa Jawa' },
  { code: 'ko', flag: '\u{1F1F0}\u{1F1F7}', name: '\uD55C\uAD6D\uC5B4' },
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', name: 'Fran\u00E7ais' },
  {
    code: 'te',
    flag: '\u{1F1EE}\u{1F1F3}',
    name: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41',
  },
  {
    code: 'mr',
    flag: '\u{1F1EE}\u{1F1F3}',
    name: '\u092E\u0930\u093E\u0920\u0940',
  },
  { code: 'tr', flag: '\u{1F1F9}\u{1F1F7}', name: 'T\u00FCrk\u00E7e' },
  {
    code: 'ta',
    flag: '\u{1F1EE}\u{1F1F3}',
    name: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD',
  },
  { code: 'vi', flag: '\u{1F1FB}\u{1F1F3}', name: 'Ti\u1EBFng Vi\u1EC7t' },
  { code: 'it', flag: '\u{1F1EE}\u{1F1F9}', name: 'Italiano' },
];

/**
 * Translation strings for all supported languages.
 */
const translations = {
  en: {
    title: 'TSP Visual Solver',
    gridSize: 'Grid Size (N\u00D7N)',
    points: 'Points',
    max: 'max',
    animationSpeed: 'Animation Speed',
    fast: 'Fast',
    slow: 'Slow',
    newPoints: 'New Points',
    start: 'Start',
    stop: 'Stop',
    distance: 'Distance',
    ofOptimal: 'of optimal',
    ofLowerBound: 'of lower bound',
    clickStart: 'Click Start to begin',
    unvisited: 'Unvisited',
    inTour: 'In Tour',
    current: 'Current',
    optimized: 'Optimized',
    visitedCurve: 'Visited Curve',
    unvisitedCurve: 'Unvisited Curve',
    tourPath: 'Tour Path',
    sonarTitle: 'Sonar Visit Algorithm',
    sonarAliases:
      'Also known as: Radial Sweep, Angular Sort, Polar Angle Sort, Centroid-based Ordering',
    mooreTitle: 'Moore Curve Algorithm',
    mooreAliases:
      'Also known as: Space-Filling Curve, Hilbert Curve Variant, Fractal Ordering',
    bruteForceTitle: 'Brute-Force Algorithm',
    bruteForceAliases:
      'Also known as: Exhaustive Search, Exact TSP Solver, Permutation Enumeration',
    sonarVisit: 'Sonar Visit',
    mooreCurve: 'Moore Curve',
    bruteForce: 'Brute-Force',
    centroid: 'Centroid',
    modifiedEdge: 'Modified Edge',
  },
  zh: {
    title: 'TSP \u53EF\u89C6\u5316\u6C42\u89E3\u5668',
    gridSize: '\u7F51\u683C\u5927\u5C0F (N\u00D7N)',
    points: '\u70B9\u6570',
    max: '\u6700\u5927',
    animationSpeed: '\u52A8\u753B\u901F\u5EA6',
    fast: '\u5FEB',
    slow: '\u6162',
    newPoints: '\u65B0\u70B9',
    start: '\u5F00\u59CB',
    stop: '\u505C\u6B62',
    distance: '\u8DDD\u79BB',
    ofOptimal: '\u4E0E\u6700\u4F18\u89E3\u4E4B\u6BD4',
    ofLowerBound: '\u4E0E\u4E0B\u754C\u4E4B\u6BD4',
    clickStart: '\u70B9\u51FB\u201C\u5F00\u59CB\u201D\u6309\u94AE',
    unvisited: '\u672A\u8BBF\u95EE',
    inTour: '\u5DF2\u8BBF\u95EE',
    current: '\u5F53\u524D',
    optimized: '\u5DF2\u4F18\u5316',
    visitedCurve: '\u5DF2\u8BBF\u95EE\u66F2\u7EBF',
    unvisitedCurve: '\u672A\u8BBF\u95EE\u66F2\u7EBF',
    tourPath: '\u8DEF\u5F84',
    sonarTitle: '\u58F0\u7EB3\u8BBF\u95EE\u7B97\u6CD5',
    sonarAliases:
      '\u53C8\u79F0\uFF1A\u5F84\u5411\u626B\u63CF\u3001\u89D2\u5EA6\u6392\u5E8F\u3001\u6781\u89D2\u6392\u5E8F\u3001\u57FA\u4E8E\u8D28\u5FC3\u6392\u5E8F',
    mooreTitle: '\u83AB\u5C14\u66F2\u7EBF\u7B97\u6CD5',
    mooreAliases:
      '\u53C8\u79F0\uFF1A\u7A7A\u95F4\u586B\u5145\u66F2\u7EBF\u3001\u5E0C\u5C14\u4F2F\u7279\u66F2\u7EBF\u53D8\u4F53\u3001\u5206\u5F62\u6392\u5E8F',
    bruteForceTitle: '\u66B4\u529B\u7B97\u6CD5',
    bruteForceAliases:
      '\u53C8\u79F0\uFF1A\u7A77\u4E3E\u641C\u7D22\u3001\u7CBE\u786ETSP\u6C42\u89E3\u5668\u3001\u6392\u5217\u679A\u4E3E',
    sonarVisit: '\u58F0\u7EB3\u8BBF\u95EE',
    mooreCurve: '\u83AB\u5C14\u66F2\u7EBF',
    bruteForce: '\u66B4\u529B\u6C42\u89E3',
    centroid: '\u8D28\u5FC3',
    modifiedEdge: '\u4FEE\u6539\u8FB9',
  },
  hi: {
    title:
      'TSP \u0935\u093F\u091C\u0941\u0905\u0932 \u0938\u0949\u0932\u094D\u0935\u0930',
    gridSize:
      '\u0917\u094D\u0930\u093F\u0921 \u0906\u0915\u093E\u0930 (N\u00D7N)',
    points: '\u092C\u093F\u0902\u0926\u0941',
    max: '\u0905\u0927\u093F\u0915\u0924\u092E',
    animationSpeed:
      '\u090F\u0928\u093F\u092E\u0947\u0936\u0928 \u0917\u0924\u093F',
    fast: '\u0924\u0947\u091C\u093C',
    slow: '\u0927\u0940\u092E\u093E',
    newPoints: '\u0928\u090F \u092C\u093F\u0902\u0926\u0941',
    start: '\u0936\u0941\u0930\u0942',
    stop: '\u0930\u0941\u0915\u0947\u0902',
    distance: '\u0926\u0942\u0930\u0940',
    ofOptimal: '\u0907\u0937\u094D\u091F\u0924\u092E \u0915\u093E',
    ofLowerBound:
      '\u0928\u093F\u092E\u094D\u0928 \u0938\u0940\u092E\u093E \u0915\u093E',
    clickStart:
      '\u0936\u0941\u0930\u0942 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902',
    unvisited: '\u0905\u0928\u0926\u0947\u0916\u093E',
    inTour: '\u092F\u093E\u0924\u094D\u0930\u093E \u092E\u0947\u0902',
    current: '\u0935\u0930\u094D\u0924\u092E\u093E\u0928',
    optimized: '\u0905\u0928\u0941\u0915\u0942\u0932\u093F\u0924',
    visitedCurve:
      '\u0926\u0947\u0916\u0940 \u0917\u0908 \u0935\u0915\u094D\u0930',
    unvisitedCurve:
      '\u0905\u0928\u0926\u0947\u0916\u0940 \u0935\u0915\u094D\u0930',
    tourPath: '\u092F\u093E\u0924\u094D\u0930\u093E \u092A\u0925',
    sonarTitle:
      '\u0938\u094B\u0928\u093E\u0930 \u0935\u093F\u091C\u093C\u093F\u091F \u090F\u0932\u094D\u0917\u094B\u0930\u093F\u0926\u092E',
    sonarAliases:
      '\u0907\u0938\u0947 \u092F\u0939 \u092D\u0940 \u0915\u0939\u0924\u0947 \u0939\u0948\u0902: \u0930\u0947\u0921\u093F\u092F\u0932 \u0938\u094D\u0935\u0940\u092A, \u0915\u094B\u0923\u0940\u092F \u0915\u094D\u0930\u092E',
    mooreTitle:
      '\u092E\u0942\u0930 \u0935\u0915\u094D\u0930 \u090F\u0932\u094D\u0917\u094B\u0930\u093F\u0926\u092E',
    mooreAliases:
      '\u0907\u0938\u0947 \u092F\u0939 \u092D\u0940 \u0915\u0939\u0924\u0947 \u0939\u0948\u0902: \u0938\u094D\u092A\u0947\u0938-\u092B\u093F\u0932\u093F\u0902\u0917 \u0935\u0915\u094D\u0930, \u092B\u094D\u0930\u0948\u0915\u094D\u091F\u0932 \u0911\u0930\u094D\u0921\u0930\u093F\u0902\u0917',
    bruteForceTitle:
      '\u092C\u094D\u0930\u0942\u091F-\u092B\u094B\u0930\u094D\u0938 \u090F\u0932\u094D\u0917\u094B\u0930\u093F\u0926\u092E',
    bruteForceAliases:
      '\u0907\u0938\u0947 \u092F\u0939 \u092D\u0940 \u0915\u0939\u0924\u0947 \u0939\u0948\u0902: \u0938\u0902\u092A\u0942\u0930\u094D\u0923 \u0916\u094B\u091C, \u0915\u094D\u0930\u092E\u091A\u092F \u0917\u0923\u0928\u093E',
    sonarVisit:
      '\u0938\u094B\u0928\u093E\u0930 \u0935\u093F\u091C\u093C\u093F\u091F',
    mooreCurve: '\u092E\u0942\u0930 \u0935\u0915\u094D\u0930',
    bruteForce: '\u092C\u094D\u0930\u0942\u091F-\u092B\u094B\u0930\u094D\u0938',
    centroid: '\u0915\u0947\u0902\u0926\u094D\u0930\u0915',
    modifiedEdge:
      '\u0938\u0902\u0936\u094B\u0927\u093F\u0924 \u0915\u093F\u0928\u093E\u0930\u093E',
  },
  es: {
    title: 'Solucionador Visual TSP',
    gridSize: 'Tama\u00F1o de Cuadr\u00EDcula (N\u00D7N)',
    points: 'Puntos',
    max: 'm\u00E1x',
    animationSpeed: 'Velocidad de Animaci\u00F3n',
    fast: 'R\u00E1pido',
    slow: 'Lento',
    newPoints: 'Nuevos Puntos',
    start: 'Iniciar',
    stop: 'Detener',
    distance: 'Distancia',
    ofOptimal: 'del \u00F3ptimo',
    ofLowerBound: 'del l\u00EDmite inferior',
    clickStart: 'Haga clic en Iniciar para comenzar',
    unvisited: 'No visitado',
    inTour: 'En recorrido',
    current: 'Actual',
    optimized: 'Optimizado',
    visitedCurve: 'Curva visitada',
    unvisitedCurve: 'Curva no visitada',
    tourPath: 'Ruta del recorrido',
    sonarTitle: 'Algoritmo de Visita Sonar',
    sonarAliases:
      'Tambi\u00E9n conocido como: Barrido Radial, Ordenamiento Angular, Ordenamiento por \u00C1ngulo Polar',
    mooreTitle: 'Algoritmo de Curva de Moore',
    mooreAliases:
      'Tambi\u00E9n conocido como: Curva de Llenado Espacial, Variante de Hilbert, Ordenamiento Fractal',
    bruteForceTitle: 'Algoritmo de Fuerza Bruta',
    bruteForceAliases:
      'Tambi\u00E9n conocido como: B\u00FAsqueda Exhaustiva, Solucionador Exacto TSP, Enumeraci\u00F3n de Permutaciones',
    sonarVisit: 'Visita Sonar',
    mooreCurve: 'Curva de Moore',
    bruteForce: 'Fuerza Bruta',
    centroid: 'Centroide',
    modifiedEdge: 'Arista modificada',
  },
  ar: {
    title: '\u062D\u0644 TSP \u0627\u0644\u0645\u0631\u0626\u064A',
    gridSize:
      '\u062D\u062C\u0645 \u0627\u0644\u0634\u0628\u0643\u0629 (N\u00D7N)',
    points: '\u0627\u0644\u0646\u0642\u0627\u0637',
    max: '\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649',
    animationSpeed:
      '\u0633\u0631\u0639\u0629 \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u0645\u062A\u062D\u0631\u0643\u0629',
    fast: '\u0633\u0631\u064A\u0639',
    slow: '\u0628\u0637\u064A\u0621',
    newPoints: '\u0646\u0642\u0627\u0637 \u062C\u062F\u064A\u062F\u0629',
    start: '\u0628\u062F\u0621',
    stop: '\u0625\u064A\u0642\u0627\u0641',
    distance: '\u0627\u0644\u0645\u0633\u0627\u0641\u0629',
    ofOptimal: '\u0645\u0646 \u0627\u0644\u0623\u0645\u062B\u0644',
    ofLowerBound:
      '\u0645\u0646 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649',
    clickStart:
      '\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u0628\u062F\u0621',
    unvisited: '\u063A\u064A\u0631 \u0645\u0632\u0627\u0631',
    inTour: '\u0641\u064A \u0627\u0644\u062C\u0648\u0644\u0629',
    current: '\u0627\u0644\u062D\u0627\u0644\u064A',
    optimized: '\u0645\u062D\u0633\u0651\u0646',
    visitedCurve: '\u0645\u0646\u062D\u0646\u0649 \u0645\u0632\u0627\u0631',
    unvisitedCurve:
      '\u0645\u0646\u062D\u0646\u0649 \u063A\u064A\u0631 \u0645\u0632\u0627\u0631',
    tourPath: '\u0645\u0633\u0627\u0631 \u0627\u0644\u062C\u0648\u0644\u0629',
    sonarTitle:
      '\u062E\u0648\u0627\u0631\u0632\u0645\u064A\u0629 \u0632\u064A\u0627\u0631\u0629 \u0633\u0648\u0646\u0627\u0631',
    sonarAliases:
      '\u064A\u0639\u0631\u0641 \u0623\u064A\u0636\u0627\u064B \u0628\u0627\u0633\u0645: \u0627\u0644\u0645\u0633\u062D \u0627\u0644\u0634\u0639\u0627\u0639\u064A\u060C \u0627\u0644\u0641\u0631\u0632 \u0627\u0644\u0632\u0627\u0648\u064A',
    mooreTitle:
      '\u062E\u0648\u0627\u0631\u0632\u0645\u064A\u0629 \u0645\u0646\u062D\u0646\u0649 \u0645\u0648\u0631',
    mooreAliases:
      '\u064A\u0639\u0631\u0641 \u0623\u064A\u0636\u0627\u064B \u0628\u0627\u0633\u0645: \u0645\u0646\u062D\u0646\u0649 \u0645\u0644\u0621 \u0627\u0644\u0641\u0636\u0627\u0621\u060C \u0627\u0644\u0641\u0631\u0632 \u0627\u0644\u0643\u0633\u0631\u064A',
    bruteForceTitle:
      '\u062E\u0648\u0627\u0631\u0632\u0645\u064A\u0629 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u063A\u0627\u0634\u0645\u0629',
    bruteForceAliases:
      '\u064A\u0639\u0631\u0641 \u0623\u064A\u0636\u0627\u064B \u0628\u0627\u0633\u0645: \u0627\u0644\u0628\u062D\u062B \u0627\u0644\u0634\u0627\u0645\u0644\u060C \u062A\u0639\u062F\u0627\u062F \u0627\u0644\u062A\u0628\u062F\u064A\u0644\u0627\u062A',
    sonarVisit: '\u0632\u064A\u0627\u0631\u0629 \u0633\u0648\u0646\u0627\u0631',
    mooreCurve: '\u0645\u0646\u062D\u0646\u0649 \u0645\u0648\u0631',
    bruteForce: '\u0642\u0648\u0629 \u063A\u0627\u0634\u0645\u0629',
    centroid: '\u0627\u0644\u0645\u0631\u0643\u0632',
    modifiedEdge: '\u062D\u0627\u0641\u0629 \u0645\u0639\u062F\u0644\u0629',
  },
  bn: {
    title:
      'TSP \u09AD\u09BF\u099C\u09C1\u09AF\u09BC\u09BE\u09B2 \u09B8\u09B2\u09CD\u09AD\u09BE\u09B0',
    gridSize:
      '\u0997\u09CD\u09B0\u09BF\u09A1 \u0986\u0995\u09BE\u09B0 (N\u00D7N)',
    points: '\u09AA\u09AF\u09BC\u09C7\u09A8\u09CD\u099F',
    max: '\u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A',
    animationSpeed:
      '\u0985\u09CD\u09AF\u09BE\u09A8\u09BF\u09AE\u09C7\u09B6\u09A8 \u0997\u09A4\u09BF',
    fast: '\u09A6\u09CD\u09B0\u09C1\u09A4',
    slow: '\u09A7\u09C0\u09B0',
    newPoints:
      '\u09A8\u09A4\u09C1\u09A8 \u09AA\u09AF\u09BC\u09C7\u09A8\u09CD\u099F',
    start: '\u09B6\u09C1\u09B0\u09C1',
    stop: '\u09AC\u09A8\u09CD\u09A7',
    distance: '\u09A6\u09C2\u09B0\u09A4\u09CD\u09AC',
    ofOptimal: '\u0987\u09B7\u09CD\u099F\u09A4\u09AE\u09C7\u09B0',
    ofLowerBound:
      '\u09A8\u09BF\u09AE\u09CD\u09A8 \u09B8\u09C0\u09AE\u09BE\u09B0',
    clickStart:
      '\u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09A4\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C1\u09A8',
    unvisited: '\u0985\u09AA\u09B0\u09BF\u09A6\u09B0\u09CD\u09B6\u09BF\u09A4',
    inTour: '\u099F\u09C1\u09B0\u09C7',
    current: '\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8',
    optimized: '\u0985\u09AA\u09CD\u099F\u09BF\u09AE\u09BE\u0987\u099C\u09A1',
    visitedCurve:
      '\u09AA\u09B0\u09BF\u09A6\u09B0\u09CD\u09B6\u09BF\u09A4 \u09AC\u0995\u09CD\u09B0',
    unvisitedCurve:
      '\u0985\u09AA\u09B0\u09BF\u09A6\u09B0\u09CD\u09B6\u09BF\u09A4 \u09AC\u0995\u09CD\u09B0',
    tourPath: '\u099F\u09C1\u09B0 \u09AA\u09A5',
    sonarTitle:
      '\u09B8\u09CB\u09A8\u09BE\u09B0 \u09AD\u09BF\u099C\u09BF\u099F \u0985\u09CD\u09AF\u09BE\u09B2\u0997\u09B0\u09BF\u09A6\u09AE',
    sonarAliases:
      '\u098F\u099F\u09BF \u098F\u0993 \u09AA\u09B0\u09BF\u099A\u09BF\u09A4: \u09B0\u09C7\u09A1\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B8\u09C1\u0987\u09AA, \u0995\u09CB\u09A3\u09C0\u09AF\u09BC \u09B8\u09B0\u09CD\u099F',
    mooreTitle:
      '\u09AE\u09C1\u09B0 \u09AC\u0995\u09CD\u09B0 \u0985\u09CD\u09AF\u09BE\u09B2\u0997\u09B0\u09BF\u09A6\u09AE',
    mooreAliases:
      '\u098F\u099F\u09BF \u098F\u0993 \u09AA\u09B0\u09BF\u099A\u09BF\u09A4: \u09B8\u09CD\u09AA\u09C7\u09B8-\u09AB\u09BF\u09B2\u09BF\u0982 \u09AC\u0995\u09CD\u09B0, \u09AB\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BE\u09B2 \u09B8\u09B0\u09CD\u099F',
    bruteForceTitle:
      '\u09AC\u09CD\u09B0\u09C1\u099F-\u09AB\u09CB\u09B0\u09CD\u09B8 \u0985\u09CD\u09AF\u09BE\u09B2\u0997\u09B0\u09BF\u09A6\u09AE',
    bruteForceAliases:
      '\u098F\u099F\u09BF \u098F\u0993 \u09AA\u09B0\u09BF\u099A\u09BF\u09A4: \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8, \u09AA\u09BE\u09B0\u09AE\u09CD\u09AF\u09C1\u099F\u09C7\u09B6\u09A8 \u0997\u09A3\u09A8\u09BE',
    sonarVisit: '\u09B8\u09CB\u09A8\u09BE\u09B0 \u09AD\u09BF\u099C\u09BF\u099F',
    mooreCurve: '\u09AE\u09C1\u09B0 \u09AC\u0995\u09CD\u09B0',
    bruteForce: '\u09AC\u09CD\u09B0\u09C1\u099F-\u09AB\u09CB\u09B0\u09CD\u09B8',
    centroid: '\u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0',
    modifiedEdge:
      '\u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09BF\u09A4 \u09AA\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4',
  },
  pt: {
    title: 'Solucionador Visual TSP',
    gridSize: 'Tamanho da Grade (N\u00D7N)',
    points: 'Pontos',
    max: 'm\u00E1x',
    animationSpeed: 'Velocidade da Anima\u00E7\u00E3o',
    fast: 'R\u00E1pido',
    slow: 'Lento',
    newPoints: 'Novos Pontos',
    start: 'Iniciar',
    stop: 'Parar',
    distance: 'Dist\u00E2ncia',
    ofOptimal: 'do \u00F3timo',
    ofLowerBound: 'do limite inferior',
    clickStart: 'Clique em Iniciar para come\u00E7ar',
    unvisited: 'N\u00E3o visitado',
    inTour: 'No percurso',
    current: 'Atual',
    optimized: 'Otimizado',
    visitedCurve: 'Curva visitada',
    unvisitedCurve: 'Curva n\u00E3o visitada',
    tourPath: 'Caminho do percurso',
    sonarTitle: 'Algoritmo de Visita Sonar',
    sonarAliases:
      'Tamb\u00E9m conhecido como: Varredura Radial, Ordena\u00E7\u00E3o Angular, Ordena\u00E7\u00E3o por \u00C2ngulo Polar',
    mooreTitle: 'Algoritmo de Curva de Moore',
    mooreAliases:
      'Tamb\u00E9m conhecido como: Curva de Preenchimento Espacial, Variante de Hilbert, Ordena\u00E7\u00E3o Fractal',
    bruteForceTitle: 'Algoritmo de For\u00E7a Bruta',
    bruteForceAliases:
      'Tamb\u00E9m conhecido como: Busca Exaustiva, Solucionador Exato TSP, Enumera\u00E7\u00E3o de Permuta\u00E7\u00F5es',
    sonarVisit: 'Visita Sonar',
    mooreCurve: 'Curva de Moore',
    bruteForce: 'For\u00E7a Bruta',
    centroid: 'Centr\u00F3ide',
    modifiedEdge: 'Aresta modificada',
  },
  ru: {
    title:
      '\u0412\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0448\u0430\u0442\u0435\u043B\u044C TSP',
    gridSize:
      '\u0420\u0430\u0437\u043C\u0435\u0440 \u0441\u0435\u0442\u043A\u0438 (N\u00D7N)',
    points: '\u0422\u043E\u0447\u043A\u0438',
    max: '\u043C\u0430\u043A\u0441',
    animationSpeed:
      '\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0438',
    fast: '\u0411\u044B\u0441\u0442\u0440\u043E',
    slow: '\u041C\u0435\u0434\u043B\u0435\u043D\u043D\u043E',
    newPoints: '\u041D\u043E\u0432\u044B\u0435 \u0442\u043E\u0447\u043A\u0438',
    start: '\u0421\u0442\u0430\u0440\u0442',
    stop: '\u0421\u0442\u043E\u043F',
    distance: '\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435',
    ofOptimal:
      '\u043E\u0442 \u043E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0433\u043E',
    ofLowerBound:
      '\u043E\u0442 \u043D\u0438\u0436\u043D\u0435\u0439 \u0433\u0440\u0430\u043D\u0438\u0446\u044B',
    clickStart:
      '\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0421\u0442\u0430\u0440\u0442 \u0434\u043B\u044F \u043D\u0430\u0447\u0430\u043B\u0430',
    unvisited: '\u041D\u0435 \u043F\u043E\u0441\u0435\u0449\u0451\u043D',
    inTour: '\u0412 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0435',
    current: '\u0422\u0435\u043A\u0443\u0449\u0438\u0439',
    optimized:
      '\u041E\u043F\u0442\u0438\u043C\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D',
    visitedCurve:
      '\u041F\u043E\u0441\u0435\u0449\u0451\u043D\u043D\u0430\u044F \u043A\u0440\u0438\u0432\u0430\u044F',
    unvisitedCurve:
      '\u041D\u0435\u043F\u043E\u0441\u0435\u0449\u0451\u043D\u043D\u0430\u044F \u043A\u0440\u0438\u0432\u0430\u044F',
    tourPath:
      '\u041F\u0443\u0442\u044C \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0430',
    sonarTitle:
      '\u0410\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u0441\u043E\u043D\u0430\u0440\u043D\u043E\u0433\u043E \u043E\u0431\u0445\u043E\u0434\u0430',
    sonarAliases:
      '\u0422\u0430\u043A\u0436\u0435 \u0438\u0437\u0432\u0435\u0441\u0442\u0435\u043D \u043A\u0430\u043A: \u0420\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u043E\u0431\u0445\u043E\u0434, \u0423\u0433\u043B\u043E\u0432\u0430\u044F \u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430, \u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \u043F\u043E\u043B\u044F\u0440\u043D\u043E\u043C\u0443 \u0443\u0433\u043B\u0443',
    mooreTitle:
      '\u0410\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u043A\u0440\u0438\u0432\u043E\u0439 \u041C\u0443\u0440\u0430',
    mooreAliases:
      '\u0422\u0430\u043A\u0436\u0435 \u0438\u0437\u0432\u0435\u0441\u0442\u0435\u043D \u043A\u0430\u043A: \u041A\u0440\u0438\u0432\u0430\u044F \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0430, \u0424\u0440\u0430\u043A\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u0440\u044F\u0434\u043E\u043A',
    bruteForceTitle:
      '\u0410\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u043F\u043E\u043B\u043D\u043E\u0433\u043E \u043F\u0435\u0440\u0435\u0431\u043E\u0440\u0430',
    bruteForceAliases:
      '\u0422\u0430\u043A\u0436\u0435 \u0438\u0437\u0432\u0435\u0441\u0442\u0435\u043D \u043A\u0430\u043A: \u0418\u0441\u0447\u0435\u0440\u043F\u044B\u0432\u0430\u044E\u0449\u0438\u0439 \u043F\u043E\u0438\u0441\u043A, \u041F\u0435\u0440\u0435\u0431\u043E\u0440 \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043E\u043A',
    sonarVisit:
      '\u0421\u043E\u043D\u0430\u0440\u043D\u044B\u0439 \u043E\u0431\u0445\u043E\u0434',
    mooreCurve: '\u041A\u0440\u0438\u0432\u0430\u044F \u041C\u0443\u0440\u0430',
    bruteForce:
      '\u041F\u043E\u043B\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0431\u043E\u0440',
    centroid: '\u0426\u0435\u043D\u0442\u0440\u043E\u0438\u0434',
    modifiedEdge:
      '\u0418\u0437\u043C\u0435\u043D\u0451\u043D\u043D\u043E\u0435 \u0440\u0435\u0431\u0440\u043E',
  },
  ja: {
    title: 'TSP\u30D3\u30B8\u30E5\u30A2\u30EB\u30BD\u30EB\u30D0\u30FC',
    gridSize: '\u30B0\u30EA\u30C3\u30C9\u30B5\u30A4\u30BA (N\u00D7N)',
    points: '\u30DD\u30A4\u30F3\u30C8',
    max: '\u6700\u5927',
    animationSpeed: '\u30A2\u30CB\u30E1\u30FC\u30B7\u30E7\u30F3\u901F\u5EA6',
    fast: '\u901F\u3044',
    slow: '\u9045\u3044',
    newPoints: '\u65B0\u3057\u3044\u70B9',
    start: '\u958B\u59CB',
    stop: '\u505C\u6B62',
    distance: '\u8DDD\u96E2',
    ofOptimal: '\u6700\u9069\u306E',
    ofLowerBound: '\u4E0B\u754C\u306E',
    clickStart: '\u958B\u59CB\u3092\u30AF\u30EA\u30C3\u30AF',
    unvisited: '\u672A\u8A2A\u554F',
    inTour: '\u30C4\u30A2\u30FC\u4E2D',
    current: '\u73FE\u5728',
    optimized: '\u6700\u9069\u5316\u6E08\u307F',
    visitedCurve: '\u8A2A\u554F\u6E08\u307F\u66F2\u7DDA',
    unvisitedCurve: '\u672A\u8A2A\u554F\u66F2\u7DDA',
    tourPath: '\u30C4\u30A2\u30FC\u30D1\u30B9',
    sonarTitle:
      '\u30BD\u30CA\u30FC\u30D3\u30B8\u30C3\u30C8\u30A2\u30EB\u30B4\u30EA\u30BA\u30E0',
    sonarAliases:
      '\u5225\u540D: \u653E\u5C04\u72B6\u30B9\u30A4\u30FC\u30D7\u3001\u89D2\u5EA6\u30BD\u30FC\u30C8\u3001\u6975\u89D2\u30BD\u30FC\u30C8',
    mooreTitle:
      '\u30E0\u30FC\u30A2\u66F2\u7DDA\u30A2\u30EB\u30B4\u30EA\u30BA\u30E0',
    mooreAliases:
      '\u5225\u540D: \u7A7A\u9593\u5145\u586B\u66F2\u7DDA\u3001\u30D2\u30EB\u30D9\u30EB\u30C8\u66F2\u7DDA\u5909\u7A2E\u3001\u30D5\u30E9\u30AF\u30BF\u30EB\u9806\u5E8F',
    bruteForceTitle: '\u7DCF\u5F53\u308A\u30A2\u30EB\u30B4\u30EA\u30BA\u30E0',
    bruteForceAliases:
      '\u5225\u540D: \u5168\u63A2\u7D22\u3001\u6B63\u78BATSP\u30BD\u30EB\u30D0\u30FC\u3001\u9806\u5217\u5217\u6319',
    sonarVisit: '\u30BD\u30CA\u30FC\u30D3\u30B8\u30C3\u30C8',
    mooreCurve: '\u30E0\u30FC\u30A2\u66F2\u7DDA',
    bruteForce: '\u7DCF\u5F53\u308A',
    centroid: '\u91CD\u5FC3',
    modifiedEdge: '\u5909\u66F4\u3055\u308C\u305F\u8FBA',
  },
  pa: {
    title:
      'TSP \u0A35\u0A3F\u0A1C\u0A3C\u0A42\u0A05\u0A32 \u0A38\u0A4B\u0A32\u0A35\u0A30',
    gridSize:
      '\u0A17\u0A4D\u0A30\u0A3F\u0A71\u0A21 \u0A06\u0A15\u0A3E\u0A30 (N\u00D7N)',
    points: '\u0A2C\u0A3F\u0A70\u0A26\u0A42',
    max: '\u0A35\u0A71\u0A27',
    animationSpeed:
      '\u0A10\u0A28\u0A40\u0A2E\u0A47\u0A36\u0A28 \u0A38\u0A2A\u0A40\u0A21',
    fast: '\u0A24\u0A47\u0A1C\u0A3C',
    slow: '\u0A39\u0A4C\u0A32\u0A40',
    newPoints: '\u0A28\u0A35\u0A47\u0A02 \u0A2C\u0A3F\u0A70\u0A26\u0A42',
    start: '\u0A38\u0A3C\u0A41\u0A30\u0A42',
    stop: '\u0A30\u0A41\u0A15\u0A4B',
    distance: '\u0A26\u0A42\u0A30\u0A40',
    ofOptimal: '\u0A38\u0A30\u0A35\u0A4B\u0A24\u0A2E \u0A26\u0A3E',
    ofLowerBound:
      '\u0A39\u0A47\u0A20\u0A32\u0A40 \u0A38\u0A40\u0A2E\u0A3E \u0A26\u0A3E',
    clickStart:
      '\u0A38\u0A3C\u0A41\u0A30\u0A42 \u0A15\u0A30\u0A28 \u0A32\u0A08 \u0A15\u0A32\u0A3F\u0A71\u0A15 \u0A15\u0A30\u0A4B',
    unvisited: '\u0A28\u0A3E-\u0A2E\u0A41\u0A06\u0A07\u0A28\u0A3E',
    inTour: '\u0A1F\u0A42\u0A30 \u0A35\u0A3F\u0A71\u0A1A',
    current: '\u0A2E\u0A4C\u0A1C\u0A42\u0A26\u0A3E',
    optimized: '\u0A05\u0A28\u0A41\u0A15\u0A42\u0A32\u0A3F\u0A24',
    visitedCurve:
      '\u0A2E\u0A41\u0A06\u0A07\u0A28\u0A3E \u0A15\u0A40\u0A24\u0A3E \u0A35\u0A15\u0A30',
    unvisitedCurve:
      '\u0A28\u0A3E-\u0A2E\u0A41\u0A06\u0A07\u0A28\u0A3E \u0A35\u0A15\u0A30',
    tourPath: '\u0A1F\u0A42\u0A30 \u0A2A\u0A3E\u0A25',
    sonarTitle:
      '\u0A38\u0A4B\u0A28\u0A3E\u0A30 \u0A35\u0A3F\u0A1C\u0A3C\u0A3F\u0A1F \u0A10\u0A32\u0A17\u0A4B\u0A30\u0A3F\u0A26\u0A2E',
    sonarAliases:
      '\u0A07\u0A38\u0A28\u0A42\u0A70 \u0A07\u0A39 \u0A35\u0A40 \u0A15\u0A39\u0A3F\u0A70\u0A26\u0A47 \u0A39\u0A28: \u0A30\u0A47\u0A21\u0A40\u0A05\u0A32 \u0A38\u0A35\u0A40\u0A2A, \u0A15\u0A4B\u0A23\u0A40\u0A06\u0A02 \u0A38\u0A4B\u0A30\u0A1F',
    mooreTitle:
      '\u0A2E\u0A42\u0A30 \u0A35\u0A15\u0A30 \u0A10\u0A32\u0A17\u0A4B\u0A30\u0A3F\u0A26\u0A2E',
    mooreAliases:
      '\u0A07\u0A38\u0A28\u0A42\u0A70 \u0A07\u0A39 \u0A35\u0A40 \u0A15\u0A39\u0A3F\u0A70\u0A26\u0A47 \u0A39\u0A28: \u0A38\u0A2A\u0A47\u0A38-\u0A2B\u0A3F\u0A32\u0A3F\u0A70\u0A17 \u0A35\u0A15\u0A30',
    bruteForceTitle:
      '\u0A2C\u0A4D\u0A30\u0A42\u0A1F-\u0A2B\u0A4B\u0A30\u0A38 \u0A10\u0A32\u0A17\u0A4B\u0A30\u0A3F\u0A26\u0A2E',
    bruteForceAliases:
      '\u0A07\u0A38\u0A28\u0A42\u0A70 \u0A07\u0A39 \u0A35\u0A40 \u0A15\u0A39\u0A3F\u0A70\u0A26\u0A47 \u0A39\u0A28: \u0A38\u0A70\u0A2A\u0A42\u0A30\u0A28 \u0A16\u0A4B\u0A1C',
    sonarVisit:
      '\u0A38\u0A4B\u0A28\u0A3E\u0A30 \u0A35\u0A3F\u0A1C\u0A3C\u0A3F\u0A1F',
    mooreCurve: '\u0A2E\u0A42\u0A30 \u0A35\u0A15\u0A30',
    bruteForce: '\u0A2C\u0A4D\u0A30\u0A42\u0A1F-\u0A2B\u0A4B\u0A30\u0A38',
    centroid: '\u0A15\u0A47\u0A02\u0A26\u0A30',
    modifiedEdge:
      '\u0A38\u0A4B\u0A27\u0A40 \u0A15\u0A3F\u0A28\u0A3E\u0A30\u0A3E',
  },
  de: {
    title: 'TSP Visueller L\u00F6ser',
    gridSize: 'Gittergr\u00F6\u00DFe (N\u00D7N)',
    points: 'Punkte',
    max: 'max',
    animationSpeed: 'Animationsgeschwindigkeit',
    fast: 'Schnell',
    slow: 'Langsam',
    newPoints: 'Neue Punkte',
    start: 'Start',
    stop: 'Stopp',
    distance: 'Distanz',
    ofOptimal: 'des Optimums',
    ofLowerBound: 'der unteren Grenze',
    clickStart: 'Klicken Sie auf Start',
    unvisited: 'Unbesucht',
    inTour: 'In Tour',
    current: 'Aktuell',
    optimized: 'Optimiert',
    visitedCurve: 'Besuchte Kurve',
    unvisitedCurve: 'Unbesuchte Kurve',
    tourPath: 'Tourpfad',
    sonarTitle: 'Sonar-Besuchsalgorithmus',
    sonarAliases:
      'Auch bekannt als: Radialer Sweep, Winkelsortierung, Polarsortierung',
    mooreTitle: 'Moore-Kurven-Algorithmus',
    mooreAliases:
      'Auch bekannt als: Raumf\u00FCllende Kurve, Hilbert-Variante, Fraktale Sortierung',
    bruteForceTitle: 'Brute-Force-Algorithmus',
    bruteForceAliases:
      'Auch bekannt als: Ersch\u00F6pfende Suche, Exakter TSP-L\u00F6ser, Permutationsaufz\u00E4hlung',
    sonarVisit: 'Sonar-Besuch',
    mooreCurve: 'Moore-Kurve',
    bruteForce: 'Brute-Force',
    centroid: 'Schwerpunkt',
    modifiedEdge: 'Ge\u00E4nderte Kante',
  },
  jv: {
    title: 'TSP Visual Solver',
    gridSize: 'Ukuran Grid (N\u00D7N)',
    points: 'Titik',
    max: 'maks',
    animationSpeed: 'Kecepatan Animasi',
    fast: 'Cepet',
    slow: 'Alon',
    newPoints: 'Titik Anyar',
    start: 'Mulai',
    stop: 'Mandeg',
    distance: 'Jarak',
    ofOptimal: 'saka optimal',
    ofLowerBound: 'saka wates ngisor',
    clickStart: 'Klik Mulai kanggo miwiti',
    unvisited: 'Durung ditiliki',
    inTour: 'Ing tur',
    current: 'Saiki',
    optimized: 'Dioptimalake',
    visitedCurve: 'Kurva sing ditiliki',
    unvisitedCurve: 'Kurva sing durung ditiliki',
    tourPath: 'Dalan tur',
    sonarTitle: 'Algoritma Kunjungan Sonar',
    sonarAliases: 'Uga dikenal minangka: Radial Sweep, Angular Sort',
    mooreTitle: 'Algoritma Kurva Moore',
    mooreAliases: 'Uga dikenal minangka: Space-Filling Curve, Fractal Ordering',
    bruteForceTitle: 'Algoritma Brute-Force',
    bruteForceAliases:
      'Uga dikenal minangka: Pencarian Lengkap, Enumerasi Permutasi',
    sonarVisit: 'Kunjungan Sonar',
    mooreCurve: 'Kurva Moore',
    bruteForce: 'Brute-Force',
    centroid: 'Titik tengah',
    modifiedEdge: 'Pinggiran sing diowahi',
  },
  ko: {
    title: 'TSP \uC2DC\uAC01\uC801 \uD574\uACB0\uAE30',
    gridSize: '\uADF8\uB9AC\uB4DC \uD06C\uAE30 (N\u00D7N)',
    points: '\uD3EC\uC778\uD2B8',
    max: '\uCD5C\uB300',
    animationSpeed: '\uC560\uB2C8\uBA54\uC774\uC158 \uC18D\uB3C4',
    fast: '\uBE60\uB984',
    slow: '\uB290\uB9BC',
    newPoints: '\uC0C8 \uD3EC\uC778\uD2B8',
    start: '\uC2DC\uC791',
    stop: '\uC815\uC9C0',
    distance: '\uAC70\uB9AC',
    ofOptimal: '\uCD5C\uC801\uC758',
    ofLowerBound: '\uD558\uD55C\uC758',
    clickStart: '\uC2DC\uC791\uC744 \uD074\uB9AD\uD558\uC138\uC694',
    unvisited: '\uBBF8\uBC29\uBB38',
    inTour: '\uD22C\uC5B4 \uC911',
    current: '\uD604\uC7AC',
    optimized: '\uCD5C\uC801\uD654\uB428',
    visitedCurve: '\uBC29\uBB38\uD55C \uACE1\uC120',
    unvisitedCurve: '\uBBF8\uBC29\uBB38 \uACE1\uC120',
    tourPath: '\uD22C\uC5B4 \uACBD\uB85C',
    sonarTitle: '\uC18C\uB098 \uBC29\uBB38 \uC54C\uACE0\uB9AC\uC998',
    sonarAliases:
      '\uB2E4\uB978 \uC774\uB984: \uBC29\uC0AC\uD615 \uC2A4\uC704\uD504, \uAC01\uB3C4 \uC815\uB82C, \uADF9\uAC01 \uC815\uB82C',
    mooreTitle: '\uBB34\uC5B4 \uACE1\uC120 \uC54C\uACE0\uB9AC\uC998',
    mooreAliases:
      '\uB2E4\uB978 \uC774\uB984: \uACF5\uAC04 \uCC44\uC6C0 \uACE1\uC120, \uD78C\uBCA0\uB974\uD2B8 \uBCC0\uD615, \uD504\uB799\uD0C8 \uC815\uB82C',
    bruteForceTitle: '\uBE0C\uB8E8\uD2B8 \uD3EC\uC2A4 \uC54C\uACE0\uB9AC\uC998',
    bruteForceAliases:
      '\uB2E4\uB978 \uC774\uB984: \uC644\uC804 \uD0D0\uC0C9, \uC21C\uC5F4 \uC5F4\uAC70',
    sonarVisit: '\uC18C\uB098 \uBC29\uBB38',
    mooreCurve: '\uBB34\uC5B4 \uACE1\uC120',
    bruteForce: '\uBE0C\uB8E8\uD2B8 \uD3EC\uC2A4',
    centroid: '\uC911\uC2EC\uC810',
    modifiedEdge: '\uBCC0\uACBD\uB41C \uAC04\uC120',
  },
  fr: {
    title: 'Solveur Visuel TSP',
    gridSize: 'Taille de Grille (N\u00D7N)',
    points: 'Points',
    max: 'max',
    animationSpeed: "Vitesse d'Animation",
    fast: 'Rapide',
    slow: 'Lent',
    newPoints: 'Nouveaux Points',
    start: 'D\u00E9marrer',
    stop: 'Arr\u00EAter',
    distance: 'Distance',
    ofOptimal: "de l'optimal",
    ofLowerBound: 'de la borne inf\u00E9rieure',
    clickStart: 'Cliquez sur D\u00E9marrer',
    unvisited: 'Non visit\u00E9',
    inTour: 'Dans le tour',
    current: 'Actuel',
    optimized: 'Optimis\u00E9',
    visitedCurve: 'Courbe visit\u00E9e',
    unvisitedCurve: 'Courbe non visit\u00E9e',
    tourPath: 'Chemin du tour',
    sonarTitle: 'Algorithme de Visite Sonar',
    sonarAliases:
      '\u00C9galement connu sous: Balayage Radial, Tri Angulaire, Tri par Angle Polaire',
    mooreTitle: 'Algorithme de Courbe de Moore',
    mooreAliases:
      '\u00C9galement connu sous: Courbe de Remplissage, Variante de Hilbert, Tri Fractal',
    bruteForceTitle: 'Algorithme de Force Brute',
    bruteForceAliases:
      '\u00C9galement connu sous: Recherche Exhaustive, Solveur Exact TSP, \u00C9num\u00E9ration de Permutations',
    sonarVisit: 'Visite Sonar',
    mooreCurve: 'Courbe de Moore',
    bruteForce: 'Force Brute',
    centroid: 'Centro\u00EFde',
    modifiedEdge: 'Ar\u00EAte modifi\u00E9e',
  },
  te: {
    title:
      'TSP \u0C35\u0C3F\u0C1C\u0C41\u0C35\u0C32\u0C4D \u0C38\u0C4A\u0C32\u0C4D\u0C35\u0C30\u0C4D',
    gridSize:
      '\u0C17\u0C4D\u0C30\u0C3F\u0C21\u0C4D \u0C2A\u0C30\u0C3F\u0C2E\u0C3E\u0C23\u0C02 (N\u00D7N)',
    points: '\u0C2A\u0C3E\u0C2F\u0C3F\u0C02\u0C1F\u0C4D\u0C32\u0C41',
    max: '\u0C17\u0C30\u0C3F\u0C37\u0C4D\u0C1F',
    animationSpeed:
      '\u0C06\u0C28\u0C3F\u0C2E\u0C47\u0C37\u0C28\u0C4D \u0C35\u0C47\u0C17\u0C02',
    fast: '\u0C35\u0C47\u0C17\u0C02',
    slow: '\u0C28\u0C3F\u0C27\u0C3E\u0C28\u0C02',
    newPoints:
      '\u0C15\u0C4A\u0C24\u0C4D\u0C24 \u0C2A\u0C3E\u0C2F\u0C3F\u0C02\u0C1F\u0C4D\u0C32\u0C41',
    start: '\u0C2A\u0C4D\u0C30\u0C3E\u0C30\u0C02\u0C2D\u0C02',
    stop: '\u0C06\u0C2A\u0C41',
    distance: '\u0C26\u0C42\u0C30\u0C02',
    ofOptimal:
      '\u0C05\u0C24\u0C4D\u0C2F\u0C41\u0C24\u0C4D\u0C24\u0C2E \u0C2F\u0C4A\u0C15\u0C4D\u0C15',
    ofLowerBound:
      '\u0C15\u0C4D\u0C30\u0C3F\u0C02\u0C26\u0C3F \u0C39\u0C26\u0C4D\u0C26\u0C41 \u0C2F\u0C4A\u0C15\u0C4D\u0C15',
    clickStart:
      '\u0C2A\u0C4D\u0C30\u0C3E\u0C30\u0C02\u0C2D\u0C3F\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C15\u0C4D\u0C32\u0C3F\u0C15\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F',
    unvisited:
      '\u0C38\u0C02\u0C26\u0C30\u0C4D\u0C36\u0C3F\u0C02\u0C1A\u0C28\u0C3F',
    inTour: '\u0C1F\u0C42\u0C30\u0C4D\u0C32\u0C4B',
    current: '\u0C2A\u0C4D\u0C30\u0C38\u0C4D\u0C24\u0C41\u0C24\u0C02',
    optimized:
      '\u0C06\u0C2A\u0C4D\u0C1F\u0C3F\u0C2E\u0C48\u0C1C\u0C4D\u0C21\u0C4D',
    visitedCurve:
      '\u0C38\u0C02\u0C26\u0C30\u0C4D\u0C36\u0C3F\u0C02\u0C1A\u0C3F\u0C28 \u0C35\u0C15\u0C4D\u0C30\u0C02',
    unvisitedCurve:
      '\u0C38\u0C02\u0C26\u0C30\u0C4D\u0C36\u0C3F\u0C02\u0C1A\u0C28\u0C3F \u0C35\u0C15\u0C4D\u0C30\u0C02',
    tourPath: '\u0C1F\u0C42\u0C30\u0C4D \u0C2E\u0C3E\u0C30\u0C4D\u0C17\u0C02',
    sonarTitle:
      '\u0C38\u0C4B\u0C28\u0C3E\u0C30\u0C4D \u0C35\u0C3F\u0C1C\u0C3F\u0C1F\u0C4D \u0C05\u0C32\u0C4D\u0C17\u0C4B\u0C30\u0C3F\u0C26\u0C02',
    sonarAliases:
      '\u0C07\u0C24\u0C30 \u0C2A\u0C47\u0C30\u0C4D\u0C32\u0C41: \u0C30\u0C47\u0C21\u0C3F\u0C2F\u0C32\u0C4D \u0C38\u0C4D\u0C35\u0C40\u0C2A\u0C4D, \u0C06\u0C02\u0C17\u0C41\u0C32\u0C30\u0C4D \u0C38\u0C3E\u0C30\u0C4D\u0C1F\u0C4D',
    mooreTitle:
      '\u0C2E\u0C42\u0C30\u0C4D \u0C15\u0C30\u0C4D\u0C35\u0C4D \u0C05\u0C32\u0C4D\u0C17\u0C4B\u0C30\u0C3F\u0C26\u0C02',
    mooreAliases:
      '\u0C07\u0C24\u0C30 \u0C2A\u0C47\u0C30\u0C4D\u0C32\u0C41: \u0C38\u0C4D\u0C2A\u0C47\u0C38\u0C4D-\u0C2B\u0C3F\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C17\u0C4D \u0C15\u0C30\u0C4D\u0C35\u0C4D',
    bruteForceTitle:
      '\u0C2C\u0C4D\u0C30\u0C42\u0C1F\u0C4D-\u0C2B\u0C4B\u0C30\u0C4D\u0C38\u0C4D \u0C05\u0C32\u0C4D\u0C17\u0C4B\u0C30\u0C3F\u0C26\u0C02',
    bruteForceAliases:
      '\u0C07\u0C24\u0C30 \u0C2A\u0C47\u0C30\u0C4D\u0C32\u0C41: \u0C38\u0C02\u0C2A\u0C42\u0C30\u0C4D\u0C23 \u0C05\u0C28\u0C4D\u0C35\u0C47\u0C37\u0C23',
    sonarVisit:
      '\u0C38\u0C4B\u0C28\u0C3E\u0C30\u0C4D \u0C35\u0C3F\u0C1C\u0C3F\u0C1F\u0C4D',
    mooreCurve: '\u0C2E\u0C42\u0C30\u0C4D \u0C15\u0C30\u0C4D\u0C35\u0C4D',
    bruteForce:
      '\u0C2C\u0C4D\u0C30\u0C42\u0C1F\u0C4D-\u0C2B\u0C4B\u0C30\u0C4D\u0C38\u0C4D',
    centroid: '\u0C15\u0C47\u0C02\u0C26\u0C4D\u0C30\u0C15\u0C02',
    modifiedEdge:
      '\u0C2E\u0C3E\u0C30\u0C4D\u0C2A\u0C41 \u0C1A\u0C47\u0C2F\u0C2C\u0C21\u0C3F\u0C28 \u0C05\u0C02\u0C1A\u0C41',
  },
  mr: {
    title:
      'TSP \u0935\u094D\u0939\u093F\u091C\u094D\u092F\u0941\u0905\u0932 \u0938\u094B\u0932\u094D\u0935\u094D\u0939\u0930',
    gridSize:
      '\u0917\u094D\u0930\u093F\u0921 \u0906\u0915\u093E\u0930 (N\u00D7N)',
    points: '\u092C\u093F\u0902\u0926\u0942',
    max: '\u0915\u092E\u093E\u0932',
    animationSpeed:
      '\u0905\u0945\u0928\u093F\u092E\u0947\u0936\u0928 \u0935\u0947\u0917',
    fast: '\u0935\u0947\u0917\u0935\u093E\u0928',
    slow: '\u0939\u0933\u0942',
    newPoints: '\u0928\u0935\u0940\u0928 \u092C\u093F\u0902\u0926\u0942',
    start: '\u0938\u0941\u0930\u0942',
    stop: '\u0925\u093E\u0902\u092C\u093E',
    distance: '\u0905\u0902\u0924\u0930',
    ofOptimal:
      '\u0938\u0930\u094D\u0935\u094B\u0924\u094D\u0924\u092E \u091A\u0947',
    ofLowerBound:
      '\u0916\u093E\u0932\u091A\u094D\u092F\u093E \u092E\u0930\u094D\u092F\u093E\u0926\u0947\u091A\u0947',
    clickStart:
      '\u0938\u0941\u0930\u0942 \u0915\u0930\u0923\u094D\u092F\u093E\u0938\u093E\u0920\u0940 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u093E',
    unvisited: '\u092D\u0947\u091F \u0928 \u0926\u093F\u0932\u0947\u0932\u0947',
    inTour: '\u092B\u0947\u0930\u0940\u0924',
    current: '\u0938\u0927\u094D\u092F\u093E\u091A\u0947',
    optimized:
      '\u0911\u092A\u094D\u091F\u093F\u092E\u093E\u0907\u091D\u094D\u0921',
    visitedCurve:
      '\u092D\u0947\u091F \u0926\u093F\u0932\u0947\u0932\u0940 \u0935\u0915\u094D\u0930',
    unvisitedCurve:
      '\u092D\u0947\u091F \u0928 \u0926\u093F\u0932\u0947\u0932\u0940 \u0935\u0915\u094D\u0930',
    tourPath: '\u092B\u0947\u0930\u0940 \u092E\u093E\u0930\u094D\u0917',
    sonarTitle:
      '\u0938\u094B\u0928\u093E\u0930 \u092D\u0947\u091F \u0905\u0932\u094D\u0917\u094B\u0930\u093F\u0926\u092E',
    sonarAliases:
      '\u092F\u093E\u0932\u093E \u0905\u0938\u0947\u0939\u0940 \u092E\u094D\u0939\u0923\u0924\u093E\u0924: \u0930\u0947\u0921\u093F\u0905\u0932 \u0938\u094D\u0935\u0940\u092A, \u0915\u094B\u0928\u0940\u092F \u0938\u0949\u0930\u094D\u091F',
    mooreTitle:
      '\u092E\u0942\u0930 \u0935\u0915\u094D\u0930 \u0905\u0932\u094D\u0917\u094B\u0930\u093F\u0926\u092E',
    mooreAliases:
      '\u092F\u093E\u0932\u093E \u0905\u0938\u0947\u0939\u0940 \u092E\u094D\u0939\u0923\u0924\u093E\u0924: \u0938\u094D\u092A\u0947\u0938-\u092B\u093F\u0932\u093F\u0902\u0917 \u0935\u0915\u094D\u0930',
    bruteForceTitle:
      '\u092C\u094D\u0930\u0942\u091F-\u092B\u094B\u0930\u094D\u0938 \u0905\u0932\u094D\u0917\u094B\u0930\u093F\u0926\u092E',
    bruteForceAliases:
      '\u092F\u093E\u0932\u093E \u0905\u0938\u0947\u0939\u0940 \u092E\u094D\u0939\u0923\u0924\u093E\u0924: \u0938\u0902\u092A\u0942\u0930\u094D\u0923 \u0936\u094B\u0927',
    sonarVisit: '\u0938\u094B\u0928\u093E\u0930 \u092D\u0947\u091F',
    mooreCurve: '\u092E\u0942\u0930 \u0935\u0915\u094D\u0930',
    bruteForce: '\u092C\u094D\u0930\u0942\u091F-\u092B\u094B\u0930\u094D\u0938',
    centroid:
      '\u0915\u0947\u0902\u0926\u094D\u0930\u092C\u093F\u0902\u0926\u0942',
    modifiedEdge:
      '\u092C\u0926\u0932\u0932\u0947\u0932\u0940 \u0915\u093F\u0928\u093E\u0930',
  },
  tr: {
    title: 'TSP G\u00F6rsel \u00C7\u00F6z\u00FCc\u00FC',
    gridSize: 'Izgara Boyutu (N\u00D7N)',
    points: 'Noktalar',
    max: 'maks',
    animationSpeed: 'Animasyon H\u0131z\u0131',
    fast: 'H\u0131zl\u0131',
    slow: 'Yava\u015F',
    newPoints: 'Yeni Noktalar',
    start: 'Ba\u015Flat',
    stop: 'Durdur',
    distance: 'Mesafe',
    ofOptimal: 'optimalin',
    ofLowerBound: 'alt s\u0131n\u0131r\u0131n',
    clickStart: 'Ba\u015Flatmak i\u00E7in t\u0131klay\u0131n',
    unvisited: 'Ziyaret edilmemi\u015F',
    inTour: 'Turda',
    current: 'Mevcut',
    optimized: 'Optimize edilmi\u015F',
    visitedCurve: 'Ziyaret edilen e\u011Fri',
    unvisitedCurve: 'Ziyaret edilmemi\u015F e\u011Fri',
    tourPath: 'Tur yolu',
    sonarTitle: 'Sonar Ziyaret Algoritmas\u0131',
    sonarAliases:
      'Ayr\u0131ca bilinen: Radyal Tarama, A\u00E7\u0131sal S\u0131ralama, Kutupsal A\u00E7\u0131 S\u0131ralama',
    mooreTitle: 'Moore E\u011Frisi Algoritmas\u0131',
    mooreAliases:
      'Ayr\u0131ca bilinen: Alan Doldurma E\u011Frisi, Hilbert Varyant\u0131, Fraktal S\u0131ralama',
    bruteForceTitle: 'Kaba Kuvvet Algoritmas\u0131',
    bruteForceAliases:
      'Ayr\u0131ca bilinen: Kapsaml\u0131 Arama, Perm\u00FCtasyon Say\u0131m\u0131',
    sonarVisit: 'Sonar Ziyaret',
    mooreCurve: 'Moore E\u011Frisi',
    bruteForce: 'Kaba Kuvvet',
    centroid: 'A\u011F\u0131rl\u0131k merkezi',
    modifiedEdge: 'De\u011Fi\u015Ftirilen kenar',
  },
  ta: {
    title:
      'TSP \u0B95\u0BBE\u0B9F\u0BCD\u0B9A\u0BBF \u0BA4\u0BC0\u0BB0\u0BCD\u0BB5\u0BBE\u0BA9\u0BBF',
    gridSize:
      '\u0B95\u0BBF\u0BB0\u0BBF\u0B9F\u0BCD \u0B85\u0BB3\u0BB5\u0BC1 (N\u00D7N)',
    points: '\u0BAA\u0BC1\u0BB3\u0BCD\u0BB3\u0BBF\u0B95\u0BB3\u0BCD',
    max: '\u0B85\u0BA4\u0BBF\u0B95\u0BAA\u0B9F\u0BCD\u0B9A\u0BAE\u0BCD',
    animationSpeed:
      '\u0B85\u0BA9\u0BBF\u0BAE\u0BC7\u0BB7\u0BA9\u0BCD \u0BB5\u0BC7\u0B95\u0BAE\u0BCD',
    fast: '\u0BB5\u0BC7\u0B95\u0BAE\u0BCD',
    slow: '\u0BAE\u0BC6\u0BA4\u0BC1\u0BB5\u0BAE\u0BCD',
    newPoints:
      '\u0BAA\u0BC1\u0BA4\u0BBF\u0BAF \u0BAA\u0BC1\u0BB3\u0BCD\u0BB3\u0BBF\u0B95\u0BB3\u0BCD',
    start: '\u0BA4\u0BCA\u0B9F\u0B95\u0BCD\u0B95\u0BAE\u0BCD',
    stop: '\u0BA8\u0BBF\u0BB1\u0BC1\u0BA4\u0BCD\u0BA4\u0BAE\u0BCD',
    distance: '\u0BA4\u0BC2\u0BB0\u0BAE\u0BCD',
    ofOptimal: '\u0B9A\u0BBF\u0BB1\u0BA8\u0BCD\u0BA4\u0BA4\u0BBF\u0BA9\u0BCD',
    ofLowerBound:
      '\u0B95\u0BC0\u0BB4\u0BCD \u0B8E\u0BB2\u0BCD\u0BB2\u0BC8\u0BAF\u0BBF\u0BA9\u0BCD',
    clickStart:
      '\u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95 \u0B95\u0BBF\u0BB3\u0BBF\u0B95\u0BCD \u0B9A\u0BC6\u0BAF\u0BCD\u0BAF\u0BB5\u0BC1\u0BAE\u0BCD',
    unvisited:
      '\u0BAA\u0BBE\u0BB0\u0BCD\u0BB5\u0BC8\u0BAF\u0BBF\u0B9F\u0BBE\u0BA4',
    inTour:
      '\u0B9A\u0BC1\u0BB1\u0BCD\u0BB1\u0BC1\u0BB2\u0BBE\u0BB5\u0BBF\u0BB2\u0BCD',
    current:
      '\u0BA8\u0B9F\u0BAA\u0BCD\u0BAA\u0BBF\u0BB2\u0BC1\u0BB3\u0BCD\u0BB3',
    optimized:
      '\u0BAE\u0BC7\u0BAE\u0BCD\u0BAA\u0B9F\u0BC1\u0BA4\u0BCD\u0BA4\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1',
    visitedCurve:
      '\u0BAA\u0BBE\u0BB0\u0BCD\u0BB5\u0BC8\u0BAF\u0BBF\u0B9F\u0BCD\u0B9F \u0BB5\u0BB3\u0BC8\u0BB5\u0BC1',
    unvisitedCurve:
      '\u0BAA\u0BBE\u0BB0\u0BCD\u0BB5\u0BC8\u0BAF\u0BBF\u0B9F\u0BBE\u0BA4 \u0BB5\u0BB3\u0BC8\u0BB5\u0BC1',
    tourPath:
      '\u0B9A\u0BC1\u0BB1\u0BCD\u0BB1\u0BC1\u0BB2\u0BBE \u0BAA\u0BBE\u0BA4\u0BC8',
    sonarTitle:
      '\u0B9A\u0BCB\u0BA9\u0BBE\u0BB0\u0BCD \u0BAA\u0BBE\u0BB0\u0BCD\u0BB5\u0BC8 \u0B85\u0BB2\u0BCD\u0B95\u0BBE\u0BB0\u0BBF\u0BA4\u0BAE\u0BCD',
    sonarAliases:
      '\u0BAE\u0BB1\u0BCD\u0BB1 \u0BAA\u0BC6\u0BAF\u0BB0\u0BCD\u0B95\u0BB3\u0BCD: \u0BB0\u0BC7\u0B9F\u0BBF\u0BAF\u0BB2\u0BCD \u0BB8\u0BCD\u0BB5\u0BC0\u0BAA\u0BCD, \u0B95\u0BCB\u0BA3 \u0BB5\u0BB0\u0BBF\u0B9A\u0BC8\u0BAA\u0BCD\u0BAA\u0B9F\u0BC1\u0BA4\u0BCD\u0BA4\u0BB2\u0BCD',
    mooreTitle:
      '\u0BAE\u0BC2\u0BB0\u0BCD \u0BB5\u0BB3\u0BC8\u0BB5\u0BC1 \u0B85\u0BB2\u0BCD\u0B95\u0BBE\u0BB0\u0BBF\u0BA4\u0BAE\u0BCD',
    mooreAliases:
      '\u0BAE\u0BB1\u0BCD\u0BB1 \u0BAA\u0BC6\u0BAF\u0BB0\u0BCD\u0B95\u0BB3\u0BCD: \u0BB5\u0BC6\u0BB3\u0BBF \u0BA8\u0BBF\u0BB0\u0BAA\u0BCD\u0BAA\u0BC1 \u0BB5\u0BB3\u0BC8\u0BB5\u0BC1',
    bruteForceTitle:
      '\u0BAA\u0BCD\u0BB0\u0BC2\u0B9F\u0BCD-\u0BAA\u0BCB\u0BB0\u0BCD\u0B9A\u0BCD \u0B85\u0BB2\u0BCD\u0B95\u0BBE\u0BB0\u0BBF\u0BA4\u0BAE\u0BCD',
    bruteForceAliases:
      '\u0BAE\u0BB1\u0BCD\u0BB1 \u0BAA\u0BC6\u0BAF\u0BB0\u0BCD\u0B95\u0BB3\u0BCD: \u0BAE\u0BC1\u0BB4\u0BC1\u0BAE\u0BC8\u0BAF\u0BBE\u0BA9 \u0BA4\u0BC7\u0B9F\u0BB2\u0BCD',
    sonarVisit:
      '\u0B9A\u0BCB\u0BA9\u0BBE\u0BB0\u0BCD \u0BAA\u0BBE\u0BB0\u0BCD\u0BB5\u0BC8',
    mooreCurve: '\u0BAE\u0BC2\u0BB0\u0BCD \u0BB5\u0BB3\u0BC8\u0BB5\u0BC1',
    bruteForce:
      '\u0BAA\u0BCD\u0BB0\u0BC2\u0B9F\u0BCD-\u0BAA\u0BCB\u0BB0\u0BCD\u0B9A\u0BCD',
    centroid:
      '\u0BAE\u0BC8\u0BAF\u0BAA\u0BCD\u0BAA\u0BC1\u0BB3\u0BCD\u0BB3\u0BBF',
    modifiedEdge:
      '\u0BAE\u0BBE\u0BB1\u0BCD\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F \u0BB5\u0BBF\u0BB3\u0BBF\u0BAE\u0BCD\u0BAA\u0BC1',
  },
  vi: {
    title: 'Gi\u1EA3i TSP Tr\u1EF1c Quan',
    gridSize: 'K\u00EDch Th\u01B0\u1EDBc L\u01B0\u1EDBi (N\u00D7N)',
    points: '\u0110i\u1EC3m',
    max: 't\u1ED1i \u0111a',
    animationSpeed: 'T\u1ED1c \u0110\u1ED9 Ho\u1EA1t H\u00ECnh',
    fast: 'Nhanh',
    slow: 'Ch\u1EADm',
    newPoints: '\u0110i\u1EC3m M\u1EDBi',
    start: 'B\u1EAFt \u0111\u1EA7u',
    stop: 'D\u1EEBng',
    distance: 'Kho\u1EA3ng c\u00E1ch',
    ofOptimal: 'c\u1EE7a t\u1ED1i \u01B0u',
    ofLowerBound: 'c\u1EE7a c\u1EADn d\u01B0\u1EDBi',
    clickStart:
      'Nh\u1EA5n B\u1EAFt \u0111\u1EA7u \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u',
    unvisited: 'Ch\u01B0a th\u0103m',
    inTour: 'Trong tour',
    current: 'Hi\u1EC7n t\u1EA1i',
    optimized: 'T\u1ED1i \u01B0u h\u00F3a',
    visitedCurve: '\u0110\u01B0\u1EDDng cong \u0111\u00E3 th\u0103m',
    unvisitedCurve: '\u0110\u01B0\u1EDDng cong ch\u01B0a th\u0103m',
    tourPath: '\u0110\u01B0\u1EDDng tour',
    sonarTitle: 'Thu\u1EADt to\u00E1n Sonar Visit',
    sonarAliases:
      'C\u00F2n g\u1ECDi l\u00E0: Qu\u00E9t Radial, S\u1EAFp x\u1EBFp G\u00F3c, S\u1EAFp x\u1EBFp G\u00F3c C\u1EF1c',
    mooreTitle: 'Thu\u1EADt to\u00E1n \u0110\u01B0\u1EDDng cong Moore',
    mooreAliases:
      'C\u00F2n g\u1ECDi l\u00E0: \u0110\u01B0\u1EDDng cong L\u1EA5p \u0110\u1EA7y, Bi\u1EBFn th\u1EC3 Hilbert',
    bruteForceTitle: 'Thu\u1EADt to\u00E1n Brute-Force',
    bruteForceAliases:
      'C\u00F2n g\u1ECDi l\u00E0: T\u00ECm ki\u1EBFm To\u00E0n di\u1EC7n, Li\u1EC7t k\u00EA Ho\u00E1n v\u1ECB',
    sonarVisit: 'Sonar Visit',
    mooreCurve: '\u0110\u01B0\u1EDDng cong Moore',
    bruteForce: 'Brute-Force',
    centroid: 'Tr\u1ECDng t\u00E2m',
    modifiedEdge: 'C\u1EA1nh \u0111\u00E3 s\u1EEDa',
  },
  it: {
    title: 'Risolutore Visuale TSP',
    gridSize: 'Dimensione Griglia (N\u00D7N)',
    points: 'Punti',
    max: 'max',
    animationSpeed: "Velocit\u00E0 dell'Animazione",
    fast: 'Veloce',
    slow: 'Lento',
    newPoints: 'Nuovi Punti',
    start: 'Avvia',
    stop: 'Ferma',
    distance: 'Distanza',
    ofOptimal: "dell'ottimo",
    ofLowerBound: 'del limite inferiore',
    clickStart: 'Clicca Avvia per iniziare',
    unvisited: 'Non visitato',
    inTour: 'Nel tour',
    current: 'Attuale',
    optimized: 'Ottimizzato',
    visitedCurve: 'Curva visitata',
    unvisitedCurve: 'Curva non visitata',
    tourPath: 'Percorso del tour',
    sonarTitle: 'Algoritmo di Visita Sonar',
    sonarAliases:
      'Noto anche come: Scansione Radiale, Ordinamento Angolare, Ordinamento per Angolo Polare',
    mooreTitle: 'Algoritmo della Curva di Moore',
    mooreAliases:
      'Noto anche come: Curva di Riempimento Spaziale, Variante di Hilbert, Ordinamento Frattale',
    bruteForceTitle: 'Algoritmo a Forza Bruta',
    bruteForceAliases:
      'Noto anche come: Ricerca Esaustiva, Risolutore Esatto TSP, Enumerazione di Permutazioni',
    sonarVisit: 'Visita Sonar',
    mooreCurve: 'Curva di Moore',
    bruteForce: 'Forza Bruta',
    centroid: 'Baricentro',
    modifiedEdge: 'Arco modificato',
  },
};

/**
 * Detect the user's preferred language from browser settings.
 * Returns the closest matching supported language code, defaulting to 'en'.
 * @returns {string} Language code
 */
export const detectLanguage = () => {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'en';
  }

  const browserLangs = window.navigator.languages || [
    window.navigator.language || 'en',
  ];
  for (const lang of browserLangs) {
    const code = lang.split('-')[0].toLowerCase();
    if (translations[code]) {
      return code;
    }
  }
  return 'en';
};

/**
 * Get translation for a given key in the specified language.
 * Falls back to English if the key is not found.
 * @param {string} lang - Language code
 * @param {string} key - Translation key
 * @returns {string} Translated string
 */
export const t = (lang, key) => {
  const langTranslations = translations[lang] || translations.en;
  return langTranslations[key] || translations.en[key] || key;
};

export default { LANGUAGES, detectLanguage, t };
