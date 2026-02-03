import { readFileSync, writeFileSync } from 'fs';

const filePath = '/tmp/gh-issue-solver-1770062898247/src/app/ui/i18n.js';
let content = readFileSync(filePath, 'utf8');

const kochData = {
  en: {
    kochTitle: "'Koch Snowflake Algorithm'",
    kochAliases: "'Also known as: Koch Curve, Snowflake Fractal, Fractal Space-Filling Curve'",
    kochSnowflake: "'Koch Snowflake'",
  },
  zh: {
    kochTitle: "'科赫雪花算法'",
    kochAliases: "'又称：科赫曲线、雪花分形、分形空间填充曲线'",
    kochSnowflake: "'科赫雪花'",
  },
  hi: {
    kochTitle: "'कोच स्नोफ्लेक एल्गोरिदम'",
    kochAliases: "'इसे यह भी कहते हैं: कोच वक्र, स्नोफ्लेक फ्रैक्टल'",
    kochSnowflake: "'कोच स्नोफ्लेक'",
  },
  es: {
    kochTitle: "'Algoritmo del Copo de Nieve de Koch'",
    kochAliases: "'También conocido como: Curva de Koch, Fractal de Copo de Nieve'",
    kochSnowflake: "'Copo de Koch'",
  },
  ar: {
    kochTitle: "'خوارزمية ندفة كوخ الثلجية'",
    kochAliases: "'يعرف أيضاً باسم: منحنى كوخ، فركتال ندفة الثلج'",
    kochSnowflake: "'ندفة كوخ'",
  },
  bn: {
    kochTitle: "'কক স্নোফ্লেক অ্যালগরিদম'",
    kochAliases: "'এটি এও পরিচিত: কক বক্র, স্নোফ্লেক ফ্র্যাক্টাল'",
    kochSnowflake: "'কক স্নোফ্লেক'",
  },
  pt: {
    kochTitle: "'Algoritmo do Floco de Neve de Koch'",
    kochAliases: "'Também conhecido como: Curva de Koch, Fractal de Floco de Neve'",
    kochSnowflake: "'Floco de Koch'",
  },
  ru: {
    kochTitle: "'Алгоритм снежинки Коха'",
    kochAliases: "'Также известен как: Кривая Коха, Фрактал снежинки'",
    kochSnowflake: "'Снежинка Коха'",
  },
  ja: {
    kochTitle: "'コッホ雪片アルゴリズム'",
    kochAliases: "'別名: コッホ曲線、雪片フラクタル'",
    kochSnowflake: "'コッホ雪片'",
  },
  pa: {
    kochTitle: "'ਕੋਚ ਸਨੋਫਲੇਕ ਐਲਗੋਰਿਦਮ'",
    kochAliases: "'ਇਸਨੂੰ ਇਹ ਵੀ ਕਹਿੰਦੇ ਹਨ: ਕੋਚ ਵਕਰ'",
    kochSnowflake: "'ਕੋਚ ਸਨੋਫਲੇਕ'",
  },
  de: {
    kochTitle: "'Koch-Schneeflocken-Algorithmus'",
    kochAliases: "'Auch bekannt als: Koch-Kurve, Schneeflocken-Fraktal'",
    kochSnowflake: "'Koch-Schneeflocke'",
  },
  jv: {
    kochTitle: "'Algoritma Koch Snowflake'",
    kochAliases: "'Uga dikenal minangka: Kurva Koch, Fraktal Snowflake'",
    kochSnowflake: "'Koch Snowflake'",
  },
  ko: {
    kochTitle: "'코흐 눈꽃 알고리즘'",
    kochAliases: "'다른 이름: 코흐 곡선, 눈꽃 프랙탈'",
    kochSnowflake: "'코흐 눈꽃'",
  },
  fr: {
    kochTitle: "'Algorithme du Flocon de Koch'",
    kochAliases: "'Également connu sous: Courbe de Koch, Fractal Flocon de Neige'",
    kochSnowflake: "'Flocon de Koch'",
  },
  te: {
    kochTitle: "'కోచ్ స్నోఫ్లేక్ అల్గోరిదం'",
    kochAliases: "'ఇతర పేర్లు: కోచ్ కర్వ్'",
    kochSnowflake: "'కోచ్ స్నోఫ్లేక్'",
  },
  mr: {
    kochTitle: "'कोच स्नोफ्लेक अल्गोरिदम'",
    kochAliases: "'याला असेही म्हणतात: कोच वक्र'",
    kochSnowflake: "'कोच स्नोफ्लेक'",
  },
  tr: {
    kochTitle: "'Koch Kar Tanesi Algoritması'",
    kochAliases: "'Ayrıca bilinen: Koch Eğrisi, Kar Tanesi Fraktalı'",
    kochSnowflake: "'Koch Kar Tanesi'",
  },
  ta: {
    kochTitle: "'கோச் ஸ்னோஃப்ளேக் அல்காரிதம்'",
    kochAliases: "'மற்ற பெயர்கள்: கோச் வளைவு'",
    kochSnowflake: "'கோச் ஸ்னோஃப்ளேக்'",
  },
  vi: {
    kochTitle: "'Thuật toán Bông tuyết Koch'",
    kochAliases: "'Còn gọi là: Đường cong Koch, Fractal Bông tuyết'",
    kochSnowflake: "'Bông tuyết Koch'",
  },
  it: {
    kochTitle: "'Algoritmo del Fiocco di Neve di Koch'",
    kochAliases: "'Noto anche come: Curva di Koch, Frattale Fiocco di Neve'",
    kochSnowflake: "'Fiocco di Koch'",
  },
};

// Split into lines for line-by-line processing
const lines = content.split('\n');
const result = [];

// Track which language block we're in
let currentLang = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect language block start (e.g., "  en: {" or "  zh: {")
  const langMatch = line.match(/^\s{2}(\w{2}):\s*\{/);
  if (langMatch && kochData[langMatch[1]]) {
    currentLang = langMatch[1];
  }

  // Insert kochTitle + kochAliases before bruteForceTitle
  if (currentLang && line.match(/^\s+bruteForceTitle/)) {
    const indent = line.match(/^(\s+)/)[1];
    const d = kochData[currentLang];
    result.push(`${indent}kochTitle: ${d.kochTitle},`);
    result.push(`${indent}kochAliases:`);
    result.push(`${indent}  ${d.kochAliases},`);
  }

  result.push(line);

  // Insert kochSnowflake after mooreCurve
  if (currentLang && line.match(/^\s+mooreCurve:/)) {
    const indent = line.match(/^(\s+)/)[1];
    const d = kochData[currentLang];
    result.push(`${indent}kochSnowflake: ${d.kochSnowflake},`);
  }
}

writeFileSync(filePath, result.join('\n'));
console.log('Done! Insertions complete.');

// Verify
const verify = readFileSync(filePath, 'utf8');
const kochTitleCount = (verify.match(/kochTitle/g) || []).length;
const kochAliasesCount = (verify.match(/kochAliases/g) || []).length;
const kochSnowflakeCount = (verify.match(/kochSnowflake/g) || []).length;
console.log(`kochTitle occurrences: ${kochTitleCount}`);
console.log(`kochAliases occurrences: ${kochAliasesCount}`);
console.log(`kochSnowflake occurrences: ${kochSnowflakeCount}`);
