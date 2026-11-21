# Wicked RP

**Wicked RP** is a modern, customizable Discord Rich Presence manager — a rebranded, enhanced remake of [Custom RP](https://github.com/maximmax42/Discord-CustomRP). Set what shows on your Discord profile in real time, save multiple server profiles, and keep it running in the tray.

## Features

| Feature | Description |
|---------|-------------|
| **Real-time presence** | Update your Discord activity instantly — details, state, timestamps, images, buttons |
| **Multiple profiles** | Save and switch between different presence configs for different servers/games |
| **Startup + tray** | Launch on Windows login, minimize to system tray |
| **Custom App ID** | Use your own Discord application for custom image assets |
| **Live preview** | See exactly how your presence will look on Discord before applying |
| **Per-presence App ID** | Override the Application ID for any presence |
| **Modern UI** | Dark glassmorphism design with smooth animations |

## Screenshots

_(Add screenshots of the new UI here)_

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
├── main.js          # Electron main process (Discord RPC, tray, IPC, auto-startup)
├── preload.js       # Secure IPC bridge (contextBridge)
├── index.html       # UI (glassmorphism design)
├── renderer.js      # UI logic (presence, profiles, settings, preview)
├── style.css        # Modern dark theme with purple accents
├── assets/          # Logo, favicon, icons
├── package.json     # App manifest + electron-builder NSIS config
├── README.md
└── LICENSE          # MIT License
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
