# Wicked RP

**Wicked RP** is a modern, production-ready Discord Rich Presence manager — a rebranded, enhanced remake of [Custom RP](https://github.com/maximmax42/Discord-CustomRP). Set what shows on your Discord profile in real time, save multiple server profiles, manage media right in the app, and keep it running in the tray.

## Everything You Need Is In-App

No external docs needed. Wicked RP includes:
- **Getting Started wizard** — walks you through setup on first launch
- **Help & Manual** (F1) — full setup guide, keyboard shortcuts, image instructions
- **About dialog** — version, license, credits
- **Tooltips** on every button and field
- **Toast notifications** for every action

## Features Wicked RP Has That Custom RP Doesn't

| Feature | Description |
|---------|-------------|
| **Getting Started Wizard** | Step-by-step onboarding on first launch |
| **Activity Types** | Playing, Streaming, Listening, Watching, Competing (one-click presets) |
| **Auto-apply on Startup** | Restores your last presence automatically |
| **Form Validation** | App ID (18-19 digits), timestamps, end-after-start checks |
| **Copy App ID** | One-click clipboard copy |
| **Dev Portal Button** | Direct link to Discord Developer Portal |
| **Discord Auto-Detection** | Automatically finds Discord, Discord PTB, and Discord Canary |
| **Multi-Discord Support** | Select which Discord version to connect to (or multiple at once) |
| **Built-in Media Manager** | Upload and manage images/videos in-app |
| **Quick Presets** | Gaming, Streaming, Working, Listening, Watching |
| **Multiple Profiles** | Save, load, delete multiple presence configs |
| **4 Themes** | Dark, Midnight, Ocean, Sunset |
| **i18n** | English, Spanish, French, German |
| **Profile Import/Export** | JSON backup and restore |
| **Window State Memory** | Remembers position, size, maximized state |
| **Auto-Reconnect** | Reconnects to Discord if it restarts (exponential backoff) |
| **Reconnect Button** | One-click reconnect when connection drops |
| **Production Installer** | NSIS installer for Windows x64 |

## All Custom RP Features ✅

| Custom RP Feature | Wicked RP |
|---|---|
| Activity name + details | ✅ |
| Start/end timestamps | ✅ |
| Large/small image keys | ✅ |
| Up to 2 buttons | ✅ |
| Custom Application ID | ✅ |
| Start on Windows login | ✅ |
| Minimize to tray | ✅ |
| Multiple profiles | ✅ |
| Translations (20+ languages) | ✅ (4 built-in: EN/ES/FR/DE) |

## Install

Download the latest installer from [GitHub Releases](https://github.com/Tone730/Wicked-RP/releases).

## Getting Started (30 seconds)

1. **Launch Wicked RP** — the Getting Started wizard opens automatically
2. **Enter your Discord Application ID** — get one at https://discord.com/developers/applications (click the **Dev Portal** button)
3. **Click Connect** — make sure Discord desktop is running
4. **Pick an Activity Type** — Playing, Streaming, Listening, Watching, or Competing
5. **Configure your presence** — details, state, timestamps, images, buttons
6. **Click Apply Presence** — your status shows on Discord immediately

## Multiple Discord Versions

Wicked RP automatically detects **Discord**, **Discord PTB**, and **Discord Canary** installations on your system. Use the **Select Discord** dropdown in the sidebar to choose which version to connect to. Wicked RP connects via Discord's IPC pipe system and will auto-reconnect if Discord restarts.

## Adding Custom Images

Wicked RP includes a **Media Manager** where you can upload images and videos. To use them in Discord Rich Presence:

1. Upload your image in the Media Manager
2. Click **Dev Portal** → go to your app → **Rich Presence → Art Assets**
3. Upload the same image and note the **Name** you give it
4. Enter that Name in Wicked RP's **Large Image Key** field
5. Click **Apply Presence**

> Discord requires images to be uploaded to their system before they can appear in Rich Presence. Text, timestamps, buttons, and party info all work without images.

## Video in Rich Presence

Discord Rich Presence **does not support video** — only static images or animated GIFs. Use an animated GIF as your Large Image Key for a moving effect.

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
├── renderer.js      # UI logic with validation, guidance, activity types
├── style.css        # Themed glassmorphism design (4 themes)
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
