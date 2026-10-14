// Generates js/data.js with 200 word searches (100 English + 100 Greek)
// and 100 sudoku puzzles. Run with: node tools/generate.js
const fs = require('fs');
const path = require('path');
const W = require('./words');

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(a, rand) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

// ---------- Word search ----------
const SIZE = 12;
const WORDS_PER_PUZZLE = 15;
const ALPHA = { en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', el: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ' };
const ALL_DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
const DIRS_BY_LEVEL = [ALL_DIRS.slice(0, 3), ALL_DIRS.slice(0, 3), ALL_DIRS.slice(0, 4), ALL_DIRS.slice(0, 6), ALL_DIRS];

function countOccurrences(grid, word) {
  let n = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) for (const [dr, dc] of ALL_DIRS) {
    let k = 0;
    while (k < word.length) {
      const rr = r + dr * k, cc = c + dc * k;
      if (rr < 0 || cc < 0 || rr >= SIZE || cc >= SIZE || grid[rr][cc] !== word[k]) break;
      k++;
    }
    if (k === word.length) n++;
  }
  return n;
}

const isDiag = ([dr, dc]) => dr !== 0 && dc !== 0;
const MIN_DIAGONAL = 5; // words placed diagonally in every puzzle
const MIN_DIAGONAL_CROSSING = 3; // diagonal words that share a letter with another word
const MIN_CROSSING = 7; // words that share a letter with another word

// Every valid placement of word w in the grid using the given directions, with
// the number of letters it would share with words already placed.
function placements(grid, w, dirs) {
  const out = [];
  for (const [dr, dc] of dirs) for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const er = r + dr * (w.length - 1), ec = c + dc * (w.length - 1);
    if (er < 0 || ec < 0 || er >= SIZE || ec >= SIZE) continue;
    let shared = 0, fits = true;
    for (let k = 0; k < w.length && fits; k++) {
      const ch = grid[r + dr * k][c + dc * k];
      if (ch === w[k]) shared++;
      else if (ch !== null) fits = false;
    }
    // Sharing every letter would hide the word inside another one.
    if (fits && shared < w.length) out.push({ r, c, dr, dc, er, ec, shared });
  }
  return out;
}

function buildWordSearch(words, dirs, alpha, rand) {
  const diagDirs = dirs.filter(isDiag), straightDirs = dirs.filter((d) => !isDiag(d));
  const pick = (a) => a[Math.floor(rand() * a.length)];
  for (let attempt = 0; attempt < 500; attempt++) {
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    // Reserve some words (preferring ones short enough to fit diagonally with room) for diagonals.
    const diagWords = new Set(shuffle(words.filter((w) => w.length <= 10), rand).slice(0, MIN_DIAGONAL + 1));
    const placed = [];
    let ok = true;
    for (const w of [...words].sort((a, b) => b.length - a.length)) {
      let opts = placements(grid, w, diagWords.has(w) ? diagDirs : straightDirs);
      if (!opts.length) opts = placements(grid, w, dirs);
      if (!opts.length) { ok = false; break; }
      // Usually choose a spot that interlinks with an existing word.
      const linked = opts.filter((o) => o.shared > 0);
      const o = linked.length && rand() < 0.7 ? pick(linked) : pick(opts);
      for (let k = 0; k < w.length; k++) grid[o.r + o.dr * k][o.c + o.dc * k] = w[k];
      placed.push({ w, pos: [o.r, o.c, o.er, o.ec], diag: isDiag([o.dr, o.dc]) });
    }
    if (!ok) continue;

    const cellsOf = ([r1, c1, r2, c2]) => {
      const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1), n = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
      return [...Array(n + 1).keys()].map((k) => (r1 + dr * k) * SIZE + c1 + dc * k);
    };
    const use = new Map();
    placed.forEach((p) => cellsOf(p.pos).forEach((x) => use.set(x, (use.get(x) || 0) + 1)));
    const crossing = placed.filter((p) => cellsOf(p.pos).some((x) => use.get(x) > 1));
    if (placed.filter((p) => p.diag).length < MIN_DIAGONAL) continue;
    if (crossing.filter((p) => p.diag).length < MIN_DIAGONAL_CROSSING) continue;
    if (crossing.length < MIN_CROSSING) continue;

    for (let fill = 0; fill < 20; fill++) {
      const g = grid.map((row) => row.map((ch) => ch || alpha[Math.floor(rand() * alpha.length)]));
      // Each word must appear exactly once (palindromes are seen twice, once per direction).
      if (placed.every((p) => countOccurrences(g, p.w) === (p.w === [...p.w].reverse().join('') ? 2 : 1))) {
        const order = new Map(words.map((w, i) => [w, i]));
        placed.sort((a, b) => order.get(a.w) - order.get(b.w));
        return { grid: g.map((row) => row.join('')), words: placed.map((p) => p.w), pos: placed.map((p) => p.pos) };
      }
    }
  }
  throw new Error('Could not build word search for ' + words.join(','));
}

const wordsearch = [];
let seed;
for (const [li, lang] of ['en', 'el'].entries()) {
  for (const [ci, cat] of W.categories.entries()) {
    // Seeds keep the original 10 categories' puzzles unchanged when categories are added.
    seed = ci < 10 ? 1000 + li * 60 + ci * 6 : 3000 + li * 1000 + ci * 6;
    const pool = shuffle([...new Set(W[lang][cat.id].map(norm))].filter((w) => w.length <= SIZE), rng(seed++));
    for (let i = 0; i < 5; i++) {
      const words = [];
      const rev = (w) => [...w].reverse().join('');
      const clash = (a, b) => a.includes(b) || b.includes(a) || a.includes(rev(b)) || b.includes(rev(a));
      for (let k = 0; words.length < WORDS_PER_PUZZLE; k++) {
        const w = pool[(i * 6 + k) % pool.length];
        if (!words.some((x) => clash(x, w))) words.push(w);
      }
      const p = buildWordSearch(words, DIRS_BY_LEVEL[i], ALPHA[lang], rng(seed++));
      wordsearch.push({ id: `${lang}-${cat.id}-${i + 1}`, lang, cat: cat.id, n: i + 1, ...p });
    }
  }
}

// ---------- Sudoku ----------
function candidates(b, i) {
  const r = Math.floor(i / 9), c = i % 9, br = r - (r % 3), bc = c - (c % 3);
  const used = new Set();
  for (let k = 0; k < 9; k++) {
    used.add(b[r * 9 + k]); used.add(b[k * 9 + c]);
    used.add(b[(br + Math.floor(k / 3)) * 9 + bc + (k % 3)]);
  }
  const out = [];
  for (let d = 1; d <= 9; d++) if (!used.has(d)) out.push(d);
  return out;
}
function countSolutions(b, limit) {
  let best = -1, bestC = null;
  for (let i = 0; i < 81; i++) if (b[i] === 0) {
    const c = candidates(b, i);
    if (c.length === 0) return 0;
    if (!bestC || c.length < bestC.length) { best = i; bestC = c; if (c.length === 1) break; }
  }
  if (best === -1) return 1;
  let n = 0;
  for (const d of bestC) {
    b[best] = d;
    n += countSolutions(b, limit - n);
    if (n >= limit) break;
  }
  b[best] = 0;
  return n;
}
function fillGrid(b, rand) {
  const i = b.indexOf(0);
  if (i === -1) return true;
  for (const d of shuffle(candidates(b, i), rand)) {
    b[i] = d;
    if (fillGrid(b, rand)) return true;
  }
  b[i] = 0;
  return false;
}
function makeSudoku(targetClues, rand) {
  const sol = Array(81).fill(0);
  fillGrid(sol, rand);
  const puz = sol.slice();
  let clues = 81;
  for (const i of shuffle([...Array(81).keys()], rand)) {
    if (clues <= targetClues) break;
    const keep = puz[i];
    puz[i] = 0;
    if (countSolutions(puz.slice(), 2) !== 1) puz[i] = keep; else clues--;
  }
  return { puzzle: puz.join(''), solution: sol.join(''), clues };
}

const LEVELS = [['easy', 40], ['medium', 33], ['hard', 28], ['expert', 24]];
const sudoku = [];
seed = 5000;
for (const [level, clues] of LEVELS) {
  for (let i = 0; i < 25; i++) {
    const s = makeSudoku(clues, rng(seed++));
    sudoku.push({ id: sudoku.length + 1, level, puzzle: s.puzzle, solution: s.solution });
  }
}

const categories = W.categories;
const out = '// Generated by tools/generate.js — do not edit by hand.\n' +
  'window.APP_DATA = ' + JSON.stringify({ categories, wordsearch, sudoku }) + ';\n';
fs.writeFileSync(path.join(__dirname, '..', 'js', 'data.js'), out);
console.log(`word searches: ${wordsearch.length}, sudoku: ${sudoku.length}`);
