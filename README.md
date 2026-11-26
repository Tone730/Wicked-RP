# Wicked RP

**Wicked RP** is a modern, production-ready Discord Rich Presence manager — a rebranded, enhanced remake of [Custom RP](https://github.com/maximmax42/Discord-CustomRP). Set what shows on your Discord profile in real time, save multiple server profiles, manage media right in the app, and keep it running in the tray.

## Features Wicked RP Has That Custom RP Doesn't

| Feature | Description |
|---------|-------------|
| **Built-in Media Manager** | Upload and manage images/videos right in the app — no external tools needed |
| **Quick Presets** | One-click Gaming, Streaming, Working, Listening, Watching presets |
| **Multiple Profiles** | Save, load, and delete multiple presence configurations |
| **4 Themes** | Dark, Midnight, Ocean, Sunset — switch instantly |
| **Party Size** | Show current/max party members on your profile |
| **Match/Join/Spectate Secrets** | Add join/spectate buttons to your presence |
| **Auto-Reconnect** | Automatically reconnects to Discord if it restarts (exponential backoff) |
| **Auto-Restore** | Restores your last presence on startup |
| **Local Media Server** | Serves uploaded images locally for use in presence |
| **Enhanced Preview** | Real-time Discord-style preview with live updates |
| **Production Installer** | NSIS installer for Windows x64 |

## Core Features

- **Real-time presence** — Update your Discord activity instantly (details, state, timestamps, images, buttons)
- **Custom images** — Use images from the Media Manager or Discord asset keys
- **Multiple profiles** — Different presence configs for different servers/games
- **Startup + tray** — Launch on Windows login, minimize to system tray
- **Custom App ID** — Use your own Discord application

## Install

Download the latest installer from [GitHub Releases](https://github.com/Tone730/Wicked-RP/releases).

## Getting Started

1. **Download and install** Wicked RP from GitHub Releases
2. **Launch the app** (double-click `Launch-Wicked-RP.bat` or run `npm.cmd start` in dev)
3. **Make sure Discord desktop is running**
4. Enter your **Application ID** (default: `1573677093601017927`) and click **Connect**
5. Configure your presence and click **Apply Presence**
6. Check your Discord profile — your status will show there

## Adding Custom Images

Wicked RP includes a **Media Manager** where you can upload images and videos. To use them in Discord Rich Presence:

1. Upload your image in the Media Manager
2. Go to https://discord.com/developers/applications → your app → **Rich Presence → Art Assets**
3. Upload the same image there and note the **Name** you give it
4. Enter that Name in Wicked RP's **Large Image Key** field
5. Click **Apply Presence**

> Discord requires images to be uploaded to their system before they can appear in Rich Presence. This is a Discord API limitation, not something we can bypass. Text, timestamps, buttons, and party info all work without any images.

## Development

```powershell
# Install dependencies
npm.cmd install

# Run in dev mode
npm.cmd start

# Package for Windows (NSIS installer)
npm.cmd run dist
```

Output goes to `release/`.

## Project Structure

```
Wicked-RP/
├── main.js          # Electron main process (RPC, media server, tray, IPC)
├── preload.js       # Secure IPC bridge (contextBridge)
├── index.html       # UI (presence, media, profiles, settings)
├── renderer.js      # UI logic (presence, media, presets, themes, profiles)
├── style.css        # Themed glassmorphism design
├── assets/          # Brand assets
├── media/           # User-uploaded media (created on first run)
├── package.json     # App manifest + electron-builder NSIS config
├── README.md
└── LICENSE          # MIT License
```

## License

MIT License — see [LICENSE](LICENSE).

## Credits

Inspired by [Custom RP](https://github.com/maximmax42/Discord-CustomRP) by maximmax42.

Built with [Electron](https://www.electronjs.org/) and [discord-rpc](https://github.com/jaboltz/discord-rpc).
