# Word Search & Sudoku

A simple browser game app (plain HTML/CSS/JS, no build step).

- **Word search** (round 2): 20 themes (Countries, World Cities, Greece, Mythology, History, Space,
  Health, Tools & DIY, Farm & Village, Flowers & Garden, Birds, Feelings, Shopping & Money,
  Arts & Cinema, Science, Cooking, Action Words, Opposites, Cars & Roads, Famous People),
  5 puzzles each, in **English** and **Greek** — 100 per language, 200 word searches in total.
  Puzzles get harder from 1 to 5: short words in puzzle 1, the longest words in puzzle 5, bigger
  grids, more directions including backwards, and near-miss decoy letters. Greek climbs higher than
  English (15–18 words, grids up to 17×17). Every puzzle has diagonal words that cross other words.
  No word is used twice (1,500 English and 1,620 Greek words).
- **Sudoku**: 100 puzzles (25 Easy, 25 Medium, 25 Hard, 25 Expert), each with a unique solution.
- Progress is saved in the browser.

Open `index.html` in a browser, or publish with GitHub Pages.

## Making a new set of word searches

1. Write new themes and word lists in `tools/words.js` (about 90+ words per theme and language).
2. Run `node tools/generate.js`.

`tools/retired-words.json` lists every word used in earlier rounds; the generator never uses those
again, so a new round is always completely new. Before starting the next round, add the current
round's words to that file. Round 1's word lists are kept in `tools/words-round1.js`.
