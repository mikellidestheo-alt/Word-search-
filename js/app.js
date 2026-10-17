(function () {
  'use strict';
  const DATA = window.APP_DATA;
  const app = document.getElementById('app');

  const T = {
    en: {
      brand: 'Word Search & Sudoku',
      welcome: 'Welcome!',
      intro: 'Choose a language, pick a category and start playing. 100 word searches in each language and 100 sudoku puzzles.',
      chooseLang: 'Choose your version',
      enVersion: 'English version', elVersion: 'Greek version',
      wsCount: (n) => `${n} word searches`,
      categories: 'Word search categories',
      sudoku: 'Sudoku',
      sudokuIntro: '100 puzzles in four levels.',
      puzzles: (d, n) => `${d} of ${n} solved`,
      puzzle: 'Puzzle', home: 'Home', wordSearch: 'Word search',
      levels: { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' },
      found: (f, n) => `Found ${f} of ${n} words`,
      wsWin: 'Well done! You found all the words.',
      sdWin: 'Congratulations! Sudoku solved.',
      next: 'Next puzzle', restart: 'Restart', check: 'Check', erase: 'Erase', back: 'Back',
      allCorrect: 'Everything so far is correct.', wrongCells: (n) => `${n} cell(s) are wrong (shown in red).`,
      wsHelp: 'Drag across letters (or tap the first and last letter) to select a word.',
      sdHelp: 'Select a cell, then type or tap a number.',
      confirmRestart: 'Restart this puzzle?',
      wsLevels: ['Easy', 'Fairly easy', 'Medium', 'Hard', 'Very hard'],
      dirsBasic: 'Words go across, down and diagonally.',
      dirsBack: 'Words go in every direction — also backwards and upwards.',
      ladder: 'Puzzles get harder from 1 to 5.',
    },
    el: {
      brand: 'Κρυπτόλεξα & Sudoku',
      welcome: 'Καλώς ήρθατε!',
      intro: 'Διαλέξτε γλώσσα, μια κατηγορία και ξεκινήστε. 100 κρυπτόλεξα σε κάθε γλώσσα και 100 sudoku.',
      chooseLang: 'Διαλέξτε έκδοση',
      enVersion: 'Αγγλική έκδοση', elVersion: 'Ελληνική έκδοση',
      wsCount: (n) => `${n} κρυπτόλεξα`,
      categories: 'Κατηγορίες κρυπτόλεξων',
      sudoku: 'Sudoku',
      sudokuIntro: '100 γρίφοι σε τέσσερα επίπεδα.',
      puzzles: (d, n) => `${d} από ${n} λυμένα`,
      puzzle: 'Γρίφος', home: 'Αρχική', wordSearch: 'Κρυπτόλεξο',
      levels: { easy: 'Εύκολο', medium: 'Μέτριο', hard: 'Δύσκολο', expert: 'Πολύ δύσκολο' },
      found: (f, n) => `Βρήκατε ${f} από ${n} λέξεις`,
      wsWin: 'Μπράβο! Βρήκατε όλες τις λέξεις.',
      sdWin: 'Συγχαρητήρια! Λύσατε το sudoku.',
      next: 'Επόμενο', restart: 'Από την αρχή', check: 'Έλεγχος', erase: 'Σβήσιμο', back: 'Πίσω',
      allCorrect: 'Όλα σωστά μέχρι τώρα.', wrongCells: (n) => `${n} κελιά είναι λάθος (με κόκκινο).`,
      wsHelp: 'Σύρετε πάνω στα γράμματα (ή πατήστε το πρώτο και το τελευταίο γράμμα) για να επιλέξετε λέξη.',
      sdHelp: 'Επιλέξτε ένα κελί και πληκτρολογήστε ή πατήστε έναν αριθμό.',
      confirmRestart: 'Να ξεκινήσει ο γρίφος από την αρχή;',
      wsLevels: ['Εύκολο', 'Σχετικά εύκολο', 'Μέτριο', 'Δύσκολο', 'Πολύ δύσκολο'],
      dirsBasic: 'Οι λέξεις είναι οριζόντια, κάθετα και διαγώνια.',
      dirsBack: 'Οι λέξεις είναι προς κάθε κατεύθυνση — και ανάποδα ή προς τα πάνω.',
      ladder: 'Οι γρίφοι γίνονται πιο δύσκολοι από το 1 έως το 5.',
    },
  };

  // ---------- storage ----------
  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };
  let lang = store.get('lang', 'en');
  const done = store.get('done', {});
  const markDone = (id) => { done[id] = true; store.set('done', done); };
  const t = () => T[lang];
  // Found words are saved as the words themselves ('wsf-'), so progress survives
  // changes to a puzzle's word list. Older saves stored list positions ('ws-');
  // those are only still valid for puzzles 1-2, whose word lists never changed.
  function wsFound(p) {
    const saved = store.get('wsf-' + p.id, null);
    if (saved) return new Set(saved.filter((w) => p.words.includes(w)));
    const old = p.n <= 2 ? store.get('ws-' + p.id, []) : [];
    return new Set(old.map((i) => p.words[i]).filter(Boolean));
  }
  const wsSolved = (p) => wsFound(p).size >= p.words.length;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const catName = (c) => c[lang];
  const wsList = (cat) => DATA.wordsearch.filter((p) => p.lang === lang && (!cat || p.cat === cat));
  const crumbs = (items) => '<nav class="crumbs">' + items.map(([label, href]) =>
    href ? `<a href="${href}">${esc(label)}</a>` : esc(label)).join(' › ') + '</nav>';

  // ---------- language switch ----------
  function setLang(l) {
    lang = l;
    store.set('lang', l);
    render();
  }
  document.querySelectorAll('.lang-switch button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  // ---------- pages ----------
  function homePage() {
    const cards = DATA.categories.map((c) => {
      const list = wsList(c.id);
      const d = list.filter(wsSolved).length;
      return `<a class="card${d === list.length ? ' done' : ''}" href="#/ws/${c.id}">
        <span class="icon">${c.icon}</span><span class="title">${esc(catName(c))}</span>
        <span class="meta">${t().puzzles(d, list.length)}</span></a>`;
    }).join('');
    const levels = ['easy', 'medium', 'hard', 'expert'].map((lv) => {
      const list = DATA.sudoku.filter((s) => s.level === lv);
      const d = list.filter((s) => done['sd-' + s.id]).length;
      return `<a class="card${d === list.length ? ' done' : ''}" href="#/sudoku/${lv}">
        <span class="icon">🔢</span><span class="title">${t().levels[lv]}</span>
        <span class="meta">${t().puzzles(d, list.length)}</span></a>`;
    }).join('');
    const count = (l) => DATA.wordsearch.filter((p) => p.lang === l).length;
    app.innerHTML = `
      <h1>${t().welcome}</h1>
      <p class="sub">${t().intro}</p>
      <h2>${t().chooseLang}</h2>
      <div class="cards">
        <button class="card big${lang === 'en' ? ' done' : ''}" data-pick="en" type="button" style="text-align:left">
          <span class="icon">🇬🇧</span><span class="title">English</span><span class="meta">${t().enVersion} · ${t().wsCount(count('en'))}</span></button>
        <button class="card big${lang === 'el' ? ' done' : ''}" data-pick="el" type="button" style="text-align:left">
          <span class="icon">🇬🇷</span><span class="title">Ελληνικά</span><span class="meta">${t().elVersion} · ${t().wsCount(count('el'))}</span></button>
      </div>
      <h2>${t().categories}</h2>
      <div class="cards">${cards}</div>
      <h2>${t().sudoku}</h2>
      <p class="sub">${t().sudokuIntro}</p>
      <div class="cards">${levels}</div>`;
    app.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.pick)));
  }

  function categoryPage(catId) {
    const c = DATA.categories.find((x) => x.id === catId);
    if (!c) return homePage();
    const tiles = wsList(catId).map((p) =>
      `<a class="tile wide${wsSolved(p) ? ' done' : ''}" href="#/ws/${catId}/${p.n}">${p.n}<small>${t().wsLevels[p.n - 1]}</small></a>`).join('');
    app.innerHTML = crumbs([[t().home, '#/'], [catName(c)]]) +
      `<h1>${c.icon} ${esc(catName(c))}</h1><p class="sub">${t().ladder}</p><div class="tiles wide">${tiles}</div>`;
  }

  const COLORS = ['#e57373', '#64b5f6', '#81c784', '#ffb74d', '#ba68c8', '#4db6ac', '#f06292', '#7986cb', '#a1887f', '#90a4ae'];

  function wordSearchPage(catId, n) {
    const c = DATA.categories.find((x) => x.id === catId);
    const p = wsList(catId).find((x) => x.n === n);
    if (!c || !p) return homePage();
    const size = p.grid.length;
    const key = 'wsf-' + p.id;
    const found = new Set([...wsFound(p)].map((w) => p.words.indexOf(w)));
    const save = () => store.set(key, [...found].map((i) => p.words[i]));

    const cells = [];
    for (let r = 0; r < size; r++) for (let col = 0; col < size; col++)
      cells.push(`<div class="ws-cell" data-r="${r}" data-c="${col}">${p.grid[r][col]}</div>`);
    const nextN = n < 5 ? n + 1 : null;
    const longWords = Math.max(...p.words.map((w) => w.length)) > 10;
    const backwards = p.pos.some(([r1, c1, r2, c2]) => c2 < c1 || (c2 === c1 && r2 < r1));

    app.innerHTML = crumbs([[t().home, '#/'], [catName(c), '#/ws/' + catId], [`${t().puzzle} ${n}`]]) + `
      <h1>${c.icon} ${esc(catName(c))} — ${t().puzzle} ${n} <span class="level">${t().wsLevels[n - 1]}</span></h1>
      <p class="sub">${backwards ? t().dirsBack : t().dirsBasic} ${t().wsHelp}</p>
      <div class="ws-layout${longWords ? ' long' : ''}">
        <div class="ws-board" style="--n:${size}">
          <svg class="ws-lines" id="lines" viewBox="0 0 ${size} ${size}" aria-hidden="true"></svg>
          <div class="ws-grid" id="grid">${cells.join('')}</div>
        </div>
        <div class="ws-side">
          <ul class="ws-words" id="words">${p.words.map((w, i) => `<li data-i="${i}">${esc(w)}</li>`).join('')}</ul>
          <div class="status" id="status"></div>
          <div class="actions">
            <button class="btn" id="restart" type="button">${t().restart}</button>
            ${nextN ? `<a class="btn primary" href="#/ws/${catId}/${nextN}">${t().next}</a>` : `<a class="btn primary" href="#/">${t().home}</a>`}
          </div>
        </div>
      </div>`;

    const grid = document.getElementById('grid');
    const cellEl = (r, col) => grid.children[r * size + col];
    const lineCells = (r1, c1, r2, c2) => {
      const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
      const len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
      const out = [];
      for (let k = 0; k <= len; k++) out.push([r1 + dr * k, c1 + dc * k]);
      return out;
    };
    const straight = (a, b) => a[0] === b[0] || a[1] === b[1] || Math.abs(a[0] - b[0]) === Math.abs(a[1] - b[1]);

    function paintFound() {
      // Found words are drawn as translucent strokes so crossing words stay visible.
      let lines = '';
      p.words.forEach((w, i) => {
        const li = document.querySelector(`#words li[data-i="${i}"]`);
        li.classList.toggle('found', found.has(i));
        if (!found.has(i)) return;
        const [r1, c1, r2, c2] = p.pos[i];
        lines += `<line x1="${c1 + 0.5}" y1="${r1 + 0.5}" x2="${c2 + 0.5}" y2="${r2 + 0.5}" stroke="${COLORS[i % COLORS.length]}" />`;
      });
      document.getElementById('lines').innerHTML = lines;
      const st = document.getElementById('status');
      if (found.size === p.words.length) {
        st.textContent = t().wsWin; st.className = 'status win';
        markDone(p.id);
      } else {
        st.textContent = t().found(found.size, p.words.length); st.className = 'status';
      }
    }

    // Selection is forgiving: the line snaps to the nearest of the 8 directions
    // from the first letter and to the nearest letter along it, so a wobbly
    // finger still selects the intended word.
    let start = null, end = null, anchor = null, pointerId = null, moved = false;
    function showSel(cls) {
      grid.querySelectorAll('.sel, .miss').forEach((el) => el.classList.remove('sel', 'miss'));
      if (start && end) lineCells(start[0], start[1], end[0], end[1]).forEach(([r, col]) => cellEl(r, col).classList.add(cls || 'sel'));
    }
    // Position in cell units (fractional), measured from the grid's top-left.
    function gridPoint(e) {
      const rect = grid.getBoundingClientRect();
      return [(e.clientY - rect.top) / (rect.height / size), (e.clientX - rect.left) / (rect.width / size)];
    }
    const clampCell = (v) => Math.min(size - 1, Math.max(0, Math.floor(v)));
    function snapEnd(e) {
      const [y, x] = gridPoint(e);
      const dy = y - (start[0] + 0.5), dx = x - (start[1] + 0.5);
      if (Math.hypot(dx, dy) < 0.6) return start;
      const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
      const dr = Math.round(Math.sin(angle * Math.PI / 4)), dc = Math.round(Math.cos(angle * Math.PI / 4));
      let steps = Math.round((dx * dc + dy * dr) / (dc * dc + dr * dr));
      // Stay inside the grid.
      while (steps > 0 && (start[0] + dr * steps < 0 || start[0] + dr * steps >= size || start[1] + dc * steps < 0 || start[1] + dc * steps >= size)) steps--;
      return [start[0] + dr * steps, start[1] + dc * steps];
    }
    function tryWord() {
      const i = p.pos.findIndex(([r1, c1, r2, c2]) =>
        (r1 === start[0] && c1 === start[1] && r2 === end[0] && c2 === end[1]) ||
        (r2 === start[0] && c2 === start[1] && r1 === end[0] && c1 === end[1]));
      if (i >= 0 && !found.has(i)) {
        found.add(i);
        save();
        return true;
      }
      return i >= 0;
    }
    function finish() {
      const hit = tryWord();
      if (!hit) {
        // Briefly show the attempted letters in red so it's clear the swipe registered.
        showSel('miss');
        const s0 = start, e0 = end;
        setTimeout(() => { if (start === s0 && end === e0) { start = end = null; showSel(); } }, 450);
      } else {
        start = end = null;
        showSel();
      }
      anchor = null;
      paintFound();
    }
    grid.addEventListener('pointerdown', (e) => {
      if (pointerId !== null) return;
      e.preventDefault();
      const [y, x] = gridPoint(e);
      pointerId = e.pointerId;
      moved = false;
      try { grid.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      start = [clampCell(y), clampCell(x)];
      end = start;
      showSel();
    });
    grid.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pointerId) return;
      const next = snapEnd(e);
      if (next[0] !== start[0] || next[1] !== start[1]) moved = true;
      if (next[0] !== end[0] || next[1] !== end[1]) { end = next; showSel(); }
    });
    function release(e) {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      if (e.type === 'pointerup') { const next = snapEnd(e); if (next[0] !== start[0] || next[1] !== start[1]) { end = next; moved = true; } }
      if (moved) { finish(); return; }
      // A tap without moving: tap the first letter, then tap the last letter.
      if (anchor && (anchor[0] !== start[0] || anchor[1] !== start[1])) {
        const tapped = start;
        start = anchor;
        end = straight(anchor, tapped) ? tapped : anchor;
        if (end === anchor) { anchor = tapped; start = end = tapped; showSel(); return; }
        finish();
      } else if (anchor) {
        anchor = start = end = null; // tapping the same letter again clears it
        showSel();
      } else {
        anchor = start; // remembered until the next tap or swipe
        showSel();
      }
    }
    grid.addEventListener('pointerup', release);
    grid.addEventListener('pointercancel', release);
    // If the browser loses track of the finger, finish the swipe so the grid never gets stuck.
    grid.addEventListener('lostpointercapture', (e) => { if (e.pointerId === pointerId) release(e); });
    document.getElementById('restart').addEventListener('click', () => {
      if (!confirm(t().confirmRestart)) return;
      found.clear(); save(); paintFound();
    });
    paintFound();
  }

  function sudokuLevelPage(level) {
    if (!t().levels[level]) return homePage();
    const tiles = DATA.sudoku.filter((s) => s.level === level).map((s, i) =>
      `<a class="tile${done['sd-' + s.id] ? ' done' : ''}" href="#/sudoku/${level}/${i + 1}">${i + 1}</a>`).join('');
    app.innerHTML = crumbs([[t().home, '#/'], [`${t().sudoku} · ${t().levels[level]}`]]) +
      `<h1>🔢 ${t().sudoku} — ${t().levels[level]}</h1><p class="sub">${t().sdHelp}</p><div class="tiles">${tiles}</div>`;
  }

  function sudokuPage(level, n) {
    const list = DATA.sudoku.filter((s) => s.level === level);
    const s = list[n - 1];
    if (!s) return homePage();
    const key = 'sd-' + s.id;
    const given = [...s.puzzle].map(Number);
    let vals = store.get(key + '-v', given.slice());
    if (!Array.isArray(vals) || vals.length !== 81) vals = given.slice();
    let sel = given.indexOf(0);
    let checkMode = false;
    const nextHref = n < list.length ? `#/sudoku/${level}/${n + 1}` : '#/';

    const cells = [];
    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9);
      cells.push(`<div class="sd-cell${given[i] ? ' given' : ''}${r === 2 || r === 5 ? ' row3' : ''}${r === 8 ? ' last' : ''}" data-i="${i}"></div>`);
    }
    app.innerHTML = crumbs([[t().home, '#/'], [`${t().sudoku} · ${t().levels[level]}`, '#/sudoku/' + level], [`${t().puzzle} ${n}`]]) + `
      <h1>🔢 ${t().sudoku} — ${t().levels[level]} ${n}</h1>
      <p class="sub">${t().sdHelp}</p>
      <div class="sd-grid" id="sd">${cells.join('')}</div>
      <div class="pad" id="pad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button type="button" data-d="${d}">${d}</button>`).join('')}
        <button type="button" data-d="0" title="${t().erase}">⌫</button>
      </div>
      <div class="status" id="status"></div>
      <div class="actions">
        <button class="btn" id="check" type="button">${t().check}</button>
        <button class="btn" id="restart" type="button">${t().restart}</button>
        <a class="btn primary" href="${nextHref}">${n < list.length ? t().next : t().home}</a>
      </div>`;

    const sd = document.getElementById('sd');
    const status = document.getElementById('status');
    const peers = (a, b) => {
      const ra = Math.floor(a / 9), ca = a % 9, rb = Math.floor(b / 9), cb = b % 9;
      return ra === rb || ca === cb || (Math.floor(ra / 3) === Math.floor(rb / 3) && Math.floor(ca / 3) === Math.floor(cb / 3));
    };

    function paint() {
      for (let i = 0; i < 81; i++) {
        const el = sd.children[i];
        el.textContent = vals[i] || '';
        let conflict = false;
        if (vals[i]) for (let j = 0; j < 81; j++) if (j !== i && vals[j] === vals[i] && peers(i, j)) { conflict = true; break; }
        const wrong = checkMode && vals[i] && !given[i] && vals[i] !== +s.solution[i];
        el.classList.toggle('error', (conflict && !given[i]) || wrong);
        el.classList.toggle('selected', i === sel);
        el.classList.toggle('peer', sel >= 0 && i !== sel && peers(i, sel));
        el.classList.toggle('same', sel >= 0 && i !== sel && vals[sel] && vals[i] === vals[sel]);
      }
      if (vals.join('') === s.solution) {
        status.textContent = t().sdWin; status.className = 'status win';
        markDone(key);
      }
    }
    function setVal(d) {
      if (sel < 0 || given[sel]) return;
      vals[sel] = d;
      checkMode = false;
      status.textContent = ''; status.className = 'status';
      store.set(key + '-v', vals);
      paint();
    }
    sd.addEventListener('click', (e) => {
      const el = e.target.closest('.sd-cell');
      if (!el) return;
      sel = +el.dataset.i;
      paint();
    });
    document.getElementById('pad').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) setVal(+b.dataset.d);
    });
    function onKey(e) {
      if (!document.body.contains(sd)) { document.removeEventListener('keydown', onKey); return; }
      if (e.key >= '1' && e.key <= '9') setVal(+e.key);
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') setVal(0);
      else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        if (sel < 0) sel = 0;
        const r = Math.floor(sel / 9), c = sel % 9;
        const m = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
        sel = ((r + m[0] + 9) % 9) * 9 + ((c + m[1] + 9) % 9);
        paint();
      }
    }
    document.addEventListener('keydown', onKey);
    document.getElementById('check').addEventListener('click', () => {
      checkMode = true;
      const wrong = vals.filter((v, i) => v && !given[i] && v !== +s.solution[i]).length;
      paint();
      if (vals.join('') !== s.solution) {
        status.textContent = wrong ? t().wrongCells(wrong) : t().allCorrect;
        status.className = 'status' + (wrong ? '' : ' win');
      }
    });
    document.getElementById('restart').addEventListener('click', () => {
      if (!confirm(t().confirmRestart)) return;
      vals = given.slice(); store.del(key + '-v'); checkMode = false;
      status.textContent = ''; status.className = 'status';
      paint();
    });
    paint();
  }

  // ---------- router ----------
  function render() {
    document.documentElement.lang = lang;
    document.title = t().brand;
    document.getElementById('brand').textContent = t().brand;
    document.querySelectorAll('.lang-switch button').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (parts[0] === 'ws' && parts[1] && parts[2]) wordSearchPage(parts[1], +parts[2]);
    else if (parts[0] === 'ws' && parts[1]) categoryPage(parts[1]);
    else if (parts[0] === 'sudoku' && parts[1] && parts[2]) sudokuPage(parts[1], +parts[2]);
    else if (parts[0] === 'sudoku' && parts[1]) sudokuLevelPage(parts[1]);
    else homePage();
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  render();
})();
