# CLAUDE.md — Retro Typing

## Project Overview

Browser-based retro arcade typing games for kids (ages 6-8). Typing IS the game mechanic. Built with Phaser 3 + vanilla JS, no build tools.

## Architecture

- **No module system** — all files use IIFEs that attach to `window.RetroTyping` namespace
- **Script load order matters** — `index.html` loads scripts in dependency order; `main.js` must be last
- **Phaser 3.60** loaded from CDN (jsdelivr)
- **All textures are generated programmatically** in `BootScene.js` — no external sprite files yet
- **HUD runs as a parallel Phaser scene** alongside game scenes

## Key Patterns

### Adding a new game
1. Create `src/scenes/NewGameScene.js` — extend `Phaser.Scene`, use `WordEngine`, `InputHandler`, `ScoreManager` in `create()`
2. Add `<script>` tag in `index.html` before `config.js`
3. Add scene class to `scene` array in `src/config.js`
4. Add menu entry in `src/scenes/MenuScene.js`

### Word Engine
- `WordEngine.setLevel(config)` filters the global `WORD_LIST` by allowed keys and word length
- `getWordAvoidingFirstLetters()` prevents two active targets from sharing a first letter (avoids input ambiguity)
- The word list in `words/wordlist.js` is a flat array; filtering happens at runtime

### Input Handler
- Listens to `scene.input.keyboard` keydown events
- "First letter lock-on": typing the first letter of a word locks the player onto that target
- A typo mid-word resets progress and unlocks (player must restart the word)
- Emits events: `keystroke-hit`, `keystroke-miss`, `word-complete`, `miss`
- Game scenes register/unregister targets as game objects appear/disappear

### Level System
- Levels define: `allowedKeys`, `minWordLength`, `maxWordLength`, `targetWPM`
- Also carry game-specific params (e.g., `spawnInterval`, `moleVisibleTime` for Whack-a-Mole)
- Progression stored in localStorage under key `retro-typing-scores`

## Hosting

- This is a static site — serve with any HTTP server
- Target deployment: NixOS nginx on the same server that runs Docker containers, Samba, Tailscale, lldap, etc.
- Use a dedicated port (e.g., 8888) to avoid conflicts with existing services
- See README.md for the nginx config snippet

## Code Style

- Vanilla ES5-compatible JavaScript (no arrow functions, no `let`/`const` in global scope — IIFEs use them internally)
- Classes use ES6 `class` syntax inside IIFEs (Phaser requires it for scene extension)
- No linter, no formatter, no tests — keep it simple
- Game-specific tuning values (spawn intervals, timers) live in `LevelSystem.js` level configs
