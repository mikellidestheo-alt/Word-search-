# Word Search & Sudoku

A simple browser game app (plain HTML/CSS/JS, no build step).

- **Word search** (round 3, hard and very hard only): 22 themes (Rivers & Lakes, Mountains & Volcanoes,
  World Landmarks, Fruit & Vegetables, Herbs & Spices, Desserts & Sweets, Drinks & Cafe, Fish & Seafood,
  Insects & Reptiles, Wild Animals, Trees & Forest, Gems & Minerals, Languages & Peoples, Dances,
  Games & Puzzles, Church & Faith, Buildings & Architecture, Newspapers & Media, Time & Calendar,
  Law & Government, Outdoors & Seasons, Communication & Inventions). Each theme has **2 hard and
  2 very hard** puzzles in **English** and **Greek** - 88 per language, 176 in total.
  Words are 5+ letters; very hard puzzles use the longest words and the biggest grids (English up to
  15x15, Greek up to 17x17), with words in all 8 directions, near-miss decoy letters, and diagonal
  words that cross other words. No word is used twice.
- **Sudoku**: 100 puzzles (25 Easy, 25 Medium, 25 Hard, 25 Expert), each with a unique solution.
- Progress is saved in the browser.

Open `index.html` in a browser, or publish with GitHub Pages (the workflow in `.github/workflows`).

## Making a new set of word searches

1. Write new themes and word lists in `tools/words.js` (about 90+ real words per theme and language).
2. Add the current round's words to `tools/retired-words.json` so they are never used again.
3. Run `node tools/generate.js`.

`tools/retired-words.json` lists every word used in earlier rounds; `tools/blocked-words.json` lists
words that are never used (obscure, awkward or plural filler). Earlier rounds' word lists are kept in
`tools/words-round1.js` and `tools/words-round2.js`.
