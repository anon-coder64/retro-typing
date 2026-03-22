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
- Also carry game-specific params per game (e.g., `spawnInterval`/`moleVisibleTime` for Whack-a-Mole, `invaderSpeed`/`invaderDescentRate` for Space Invaders, etc.)
- Progression stored in localStorage under key `retro-typing-scores`
- Each game has independent level unlock progression

### Games (all 5 complete)
- **WhackAMoleScene** — 3x3 hole grid, moles pop up with timed visibility, lives system
- **SpaceInvadersScene** — Formation grid that moves/descends, bullet animation on word complete, wave respawn
- **AsteroidsScene** — Ship in center, rocks drift inward from edges, large asteroids split into 2 smaller ones
- **MissileCommandScene** — Missiles target random alive cities, trail rendering, counter-missile intercept animation
- **TapperScene** — Multiple bar lanes, customers slide left-to-right, mug slide animation on serve

### Texture Generation
- All sprites are generated programmatically in `BootScene.generateTextures()`
- Do NOT use `fillStar()` or `fillEllipse()` — they don't exist in the CDN Phaser build
- Use `fillRoundedRect`, `fillCircle`, `fillRect`, and manual `beginPath/moveTo/lineTo/fillPath` instead

## Hosting

- This is a static site — serve with any HTTP server
- Deployed via Tailscale (`tailscale serve`) on the NixOS home server — no firewall ports opened
- Local Python HTTP server on 127.0.0.1:8888, exposed at `/typing` path over Tailscale HTTPS
- See README.md for the NixOS systemd service config

## Code Style

- Vanilla ES5-compatible JavaScript (no arrow functions, no `let`/`const` in global scope — IIFEs use them internally)
- Classes use ES6 `class` syntax inside IIFEs (Phaser requires it for scene extension)
- No linter, no formatter, no tests — keep it simple
- Game-specific tuning values (spawn intervals, timers) live in `LevelSystem.js` level configs
