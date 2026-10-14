# Word Search & Sudoku

A simple browser game app (plain HTML/CSS/JS, no build step).

- **Word search**: 20 categories (Travel, Home, Food, Animals, Nature, Sports, School, Body, Clothes, Jobs,
  Music, Transport, Technology, Sea, City, Family, Hobbies, Celebrations, Colors & Shapes, Weather),
  5 puzzles of 15 words each, in **English** and **Greek** — 100 per language, 200 word searches in total.
- **Sudoku**: 100 puzzles (25 Easy, 25 Medium, 25 Hard, 25 Expert), each with a unique solution.
- Progress is saved in the browser.

Open `index.html` in a browser, or publish with GitHub Pages.

To regenerate the puzzles after editing `tools/words.js`: `node tools/generate.js`
