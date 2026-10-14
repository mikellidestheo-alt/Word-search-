# Word Search & Sudoku

A simple browser game app (plain HTML/CSS/JS, no build step).

- **Word search**: 20 categories (Travel, Home, Food, Animals, Nature, Sports, School, Body, Clothes, Jobs,
  Music, Transport, Technology, Sea, City, Family, Hobbies, Celebrations, Colors & Shapes, Weather),
  5 puzzles each, in **English** and **Greek** — 100 per language, 200 word searches in total.
  Puzzles get harder from 1 to 5 (bigger grids, more directions including backwards, near-miss decoy
  letters). Greek climbs higher than English: English runs 12×12 → 14×14 with 15 words; Greek runs
  12×12 → 15×15 with 15–18 words. Every puzzle has diagonal words that cross other words.
- **Sudoku**: 100 puzzles (25 Easy, 25 Medium, 25 Hard, 25 Expert), each with a unique solution.
- Progress is saved in the browser.

Open `index.html` in a browser, or publish with GitHub Pages.

To regenerate the puzzles after editing `tools/words.js`: `node tools/generate.js`
