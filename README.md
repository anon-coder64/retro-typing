# Retro Typing

A collection of retro arcade-themed typing games for kids (ages 6-8) to learn touch typing. Typing is the game mechanic — you type words to play, not as a separate drill.

## Games

| Game | Status | Description |
|------|--------|-------------|
| Whack-a-Mole | Ready | Moles pop up with words. Type the word to whack them before they escape. |
| Space Invaders | Ready | Enemies descend in formation. Type a word to shoot that enemy. |
| Asteroids | Ready | Rocks drift toward your ship. Type to blast. Large rocks split into smaller ones. |
| Missile Command | Ready | Missiles rain down on cities. Type to launch counter-missiles and intercept. |
| Tapper | Ready | Customers slide down bar lanes. Type the word to serve them a drink. |
| Rampage | Ready | Play as a monster smashing buildings. Type words to destroy. ROAR power-up! |

## Progression System

All games share a level system that gradually introduces more keys:

| Level | Keys | Word Length | Target WPM |
|-------|------|-------------|------------|
| 1 | Home row (asdfghjkl) | 2-3 letters | 5 WPM |
| 2 | Home row | 2-4 letters | 10 WPM |
| 3 | Home + top row | 3-5 letters | 15 WPM |
| 4 | Full alphabet | 3-6 letters | 20 WPM |
| 5 | Full alphabet, longer words | 4-7 letters | 25 WPM |

Levels unlock by earning at least 1 star on the previous level.

### Star Ratings
- 1 star: Complete enough words
- 2 stars: Meet the WPM target
- 3 stars: Meet WPM target with 90%+ accuracy

## Tech Stack

- **Phaser 3** (loaded from CDN) — browser-based game framework
- **Vanilla JavaScript** — no build tools, no bundler, no npm
- **localStorage** — high scores and progression persist in the browser
- **"Press Start 2P"** Google Font — pixel/retro aesthetic

## Running Locally

Serve the directory with any static file server:

```bash
# Python
cd /home/sysadmin/retro-typing && python3 -m http.server 8888

# Or with Node
npx serve -p 8888
```

Then open `http://localhost:8888` in a browser.

## Hosting on NixOS (Tailscale only)

Served over the Tailscale VPN — no ports opened to the LAN or internet. A systemd service runs a local Python HTTP server and exposes it via `tailscale serve`.

Add to `configuration.nix`:

```nix
# Retro Typing — serve over Tailscale only (no firewall port needed)
systemd.services."retro-typing" = {
  description = "Retro Typing static file server";
  after = [ "network.target" "tailscaled.service" ];
  wants = [ "tailscaled.service" ];
  wantedBy = [ "multi-user.target" ];
  serviceConfig = {
    Type = "simple";
    User = "sysadmin";
    ExecStartPre = "${pkgs.tailscale}/bin/tailscale serve --bg --set-path /typing http://127.0.0.1:8888";
    ExecStart = "${pkgs.python3}/bin/python3 -m http.server 8888 --bind 127.0.0.1 --directory /home/sysadmin/retro-typing";
    ExecStopPost = "${pkgs.tailscale}/bin/tailscale serve --remove /typing";
    Restart = "on-failure";
    ProtectHome = "read-only";
    ProtectSystem = "strict";
    PrivateTmp = true;
    NoNewPrivileges = true;
  };
};
```

Rebuild: `sudo nixos-rebuild switch`

Access from any device on your tailnet: `https://nixos-server.blowfish-goby.ts.net/typing`

### Quick test (no rebuild needed)

```bash
python3 -m http.server 8888 --bind 127.0.0.1 --directory /home/sysadmin/retro-typing &
tailscale serve --bg --set-path /typing http://127.0.0.1:8888
```

## Architecture

```
retro-typing/
├── index.html              # Single entry point
├── css/style.css           # Minimal styling + retro font
├── words/wordlist.js       # ~500 age-appropriate words
├── src/
│   ├── core/
│   │   ├── LevelSystem.js  # Level definitions and progression
│   │   ├── WordEngine.js   # Filters words by level, serves random words
│   │   ├── InputHandler.js # Keystroke capture and word matching
│   │   └── ScoreManager.js # Points, WPM, accuracy, localStorage
│   ├── scenes/
│   │   ├── BootScene.js    # Asset generation, loading
│   │   ├── MenuScene.js    # Game selection
│   │   ├── LevelSelectScene.js
│   │   ├── HUDScene.js     # Score/WPM/timer overlay
│   │   ├── GameOverScene.js
│   │   ├── WhackAMoleScene.js
│   │   ├── SpaceInvadersScene.js
│   │   ├── AsteroidsScene.js
│   │   ├── MissileCommandScene.js
│   │   ├── TapperScene.js
│   │   └── RampageScene.js
│   ├── config.js           # Phaser game configuration
│   └── main.js             # Bootstrap
└── assets/                 # Sprites, audio (future)
```

## Adding a New Game

1. Create `src/scenes/NewGameScene.js` following the pattern in `WhackAMoleScene.js`
2. Add a `<script>` tag in `index.html`
3. Add the scene class to the `scene` array in `src/config.js`
4. Add a menu entry in `MenuScene.js`

Each game scene uses the shared `WordEngine`, `InputHandler`, and `ScoreManager` — the game-specific code only handles spawning, animation, and game-over conditions.
