# Wicked RP

**Wicked RP** is a customizable Discord Rich Presence manager — a rebranded, enhanced remake of [Custom RP](https://github.com/maximmax42/Discord-CustomRP). Set what shows on your Discord profile in real time, save multiple server profiles, and keep it running in the tray.

## Features

- **Real-time presence** — update your Discord activity instantly (details, state, timestamps, images, buttons)
- **Multiple profiles** — save and switch between different presence configs for different servers/games
- **Startup + tray** — launch on Windows login, minimize to system tray
- **Custom Discord App ID** — use your own Discord application for custom image assets
- **Coming soon** — music bot status, server events, preset scheduler

## Screenshots

_(Add screenshots here)_

## Install

Download the latest installer from [GitHub Releases](https://github.com/Tone730/Wicked-RP/releases).

## Development

```bash
# Install dependencies
npm.cmd install

# Run in dev mode
npm.cmd start

# Package for Windows (NSIS installer)
npm.cmd run dist

# Package to directory only
npm.cmd run pack
```

## Project Structure

```
Wicked-RP/
├── main.js          # Electron main process (Discord RPC, tray, IPC)
├── preload.js       # Secure IPC bridge (contextBridge)
├── index.html       # UI
├── renderer.js      # UI logic (presence, profiles, settings)
├── style.css        # Dark "Wicked" theme
├── assets/          # Logo, icons, tray images
├── package.json     # App manifest + build config
└── README.md
```

## Building

Uses [electron-builder](https://www.electron.build/) to produce a Windows NSIS installer:

```bash
npm.cmd run dist
```

Output goes to `release/`.

## License

MIT License — see [LICENSE](LICENSE).

## Credits

Inspired by [Custom RP](https://github.com/maximmax42/Discord-CustomRP) by maximmax42.

Built with [Electron](https://www.electronjs.org/) and [discord-rpc](https://github.com/jaboltz/discord-rpc).
