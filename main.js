/**
 * Wicked RP — Electron main process (Production v2.1)
 * Discord Rich Presence, media server, tray, auto-startup, IPC, presets, themes,
 * window state persistence, keyboard shortcuts, about/error dialogs.
 */

const { app, BrowserWindow, ipcMain, Tray, nativeImage, shell, globalShortcut, Menu, powerMonitor } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const net = require('net');
const { execSync, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const { Client } = require('discord-rpc');
const Store = require('electron-store');
const log = require('electron-log');
const chokidar = require('chokidar');

const store = new Store();

// ---------------------------------------------------------------- constants
const DEFAULT_DISCORD_APP_ID = '1573677093601017927';
const APP_VERSION = '2.7.0';
const MEDIA_DIR = path.join(app.getPath('userData'), 'media');
const PRESETS_FILE = path.join(app.getPath('userData'), 'presets.json');
const THEMES_FILE = path.join(app.getPath('userData'), 'themes.json');
const WINDOW_STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');
const MEDIA_PORT = 47321;

// Discord IPC pipe names (Windows)
const DISCORD_PIPES = [
  { name: 'Discord', pipePattern: '\\\\?\\pipe\\discord-ipc-', types: ['stable'] },
  { name: 'Discord PTB', pipePattern: '\\\\?\\pipe\\discord-ipc-', types: ['ptb'] },
  { name: 'Discord Canary', pipePattern: '\\\\?\\pipe\\discord-ipc-', types: ['canary'] },
];

// ---------------------------------------------------------------- ensure dirs
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// ---------------------------------------------------------------- window state
function getWindowState() {
  try {
    if (fs.existsSync(WINDOW_STATE_FILE)) {
      return JSON.parse(fs.readFileSync(WINDOW_STATE_FILE, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return { x: undefined, y: undefined, width: 1100, height: 760, maximized: false };
}

function saveWindowState(win) {
  if (!win || win.isDestroyed()) return;
  const [x, y] = win.getPosition();
  const [w, h] = win.getSize();
  const state = { x, y, width: w, height: h, maximized: win.isMaximized() };
  try {
    fs.writeFileSync(WINDOW_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) { log.error('Failed to save window state:', e.message); }
}

// ---------------------------------------------------------------- app state
let mainWindow = null;
let tray = null;
let rpcClients = {}; // keyed by discordType
let rpcConnected = false;
let currentActivity = null;
let isQuitting = false;
let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
let mediaServer = null;
let mediaWatcher = null;
let globalShortcutsRegistered = false;
let activeDiscordTypes = []; // currently connected Discord types

// ---------------------------------------------------------------- Discord detection
const DISCORD_INSTANCES = [
  { id: 'discord', name: 'Discord', processName: 'Discord.exe', pipeBase: '\\\\?\\pipe\\discord-ipc-' },
  { id: 'discordptb', name: 'Discord PTB', processName: 'DiscordPTB.exe', pipeBase: '\\\\?\\pipe\\discord-ipc-' },
  { id: 'discordcanary', name: 'Discord Canary', processName: 'DiscordCanary.exe', pipeBase: '\\\\?\\pipe\\discord-ipc-' },
];

let processListCache = { at: 0, procs: [] };

// One non-blocking tasklist call, cached 4s — shared by Discord detection + game automations
async function listRunningProcesses() {
  if (Date.now() - processListCache.at < 4000) return processListCache.procs;
  try {
    const { stdout } = await execAsync('tasklist /FO CSV /NH', { encoding: 'utf8', windowsHide: true, maxBuffer: 1024 * 1024 * 4 });
    const procs = [];
    for (const line of stdout.split('\n')) {
      const m = line.match(/^"([^"]+)"/);
      if (m) procs.push(m[1].toLowerCase());
    }
    processListCache = { at: Date.now(), procs };
    return procs;
  } catch (e) {
    return processListCache.procs || [];
  }
}

async function detectRunningDiscord() {
  const procs = await listRunningProcesses();
  return DISCORD_INSTANCES
    .filter((inst) => procs.includes(inst.processName.toLowerCase()))
    .map((inst) => ({
      id: inst.id,
      name: inst.name,
      processName: inst.processName,
      pipeBase: inst.pipeBase,
      running: true,
    }));
}

async function getDiscordInstances() {
  return detectRunningDiscord();
}

function tryPipeConnect(pipeBase, pipeNum, timeout = 500) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('timeout'));
    }, timeout);
    socket.connect(pipeBase + pipeNum, 'localhost', () => {
      clearTimeout(timer);
      socket.end();
      resolve(pipeNum);
    });
    socket.on('error', () => {
      clearTimeout(timer);
      reject(new Error('connection refused'));
    });
    socket.on('timeout', () => {
      clearTimeout(timer);
      socket.destroy();
      reject(new Error('timeout'));
    });
  });
}

async function findAvailablePipe(inst) {
  for (let i = 0; i < 10; i++) {
    try {
      await tryPipeConnect(inst.pipeBase, i);
      return i;
    } catch (e) { /* try next */ }
  }
  return null;
}

// ---------------------------------------------------------------- media server
function startMediaServer() {
  if (mediaServer) return;

  mediaServer = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${MEDIA_PORT}`);
    const filePath = path.join(MEDIA_DIR, decodeURIComponent(url.pathname.replace(/^\//, '')));

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  mediaServer.listen(MEDIA_PORT, '127.0.0.1', () => {
    log.info(`Media server running on http://127.0.0.1:${MEDIA_PORT}`);
  });

  // Handle port conflicts gracefully (e.g. a second app instance is already serving media)
  mediaServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      log.warn(`Port ${MEDIA_PORT} already in use — another instance is serving media. Continuing without local media server.`);
      mediaServer = null;
      if (mediaWatcher) {
        mediaWatcher.close();
        mediaWatcher = null;
      }
    } else {
      log.error('Media server error:', err.message);
    }
  });

  mediaWatcher = chokidar.watch(MEDIA_DIR, { ignored: /(^|[\/\\])\../ });
  mediaWatcher.on('add', (file) => broadcast('media-updated', { action: 'add', file }));
  mediaWatcher.on('unlink', (file) => broadcast('media-updated', { action: 'remove', file }));
}

function stopMediaServer() {
  if (mediaServer) {
    mediaServer.close();
    mediaServer = null;
  }
  if (mediaWatcher) {
    mediaWatcher.close();
    mediaWatcher = null;
  }
}

function getMediaList() {
  try {
    const files = fs.readdirSync(MEDIA_DIR);
    return files.map((f) => {
      const stat = fs.statSync(path.join(MEDIA_DIR, f));
      const ext = path.extname(f).toLowerCase();
      return {
        name: f,
        path: f,
        url: `http://127.0.0.1:${MEDIA_PORT}/${encodeURIComponent(f)}`,
        size: stat.size,
        mtime: stat.mtimeMs,
        isImage: ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext),
        isVideo: ['.mp4', '.webm', '.mov'].includes(ext),
      };
    });
  } catch (e) {
    return [];
  }
}

// ---------------------------------------------------------------- window
function createMainWindow() {
  const state = getWindowState();

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 850,
    minHeight: 550,
    show: false,
    autoHideMenuBar: true,
    title: 'Wicked RP',
    icon: assetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Capture renderer errors so we can debug UI failures from the log
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (level >= 2) { // warning and error
      log.error(`[renderer] ${message} (${sourceId}:${line})`);
    }
  });
  mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    log.error(`[preload-error] ${preloadPath}: ${error.message}`);
  });
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    log.error(`[did-fail-load] ${errorCode} ${errorDescription} ${validatedURL}`);
  });

  mainWindow.once('ready-to-show', () => {
    if (state.maximized) mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('resize', () => saveWindowState(mainWindow));
  mainWindow.on('move', () => saveWindowState(mainWindow));

  return mainWindow;
}

function assetPath(name) {
  const p = path.join(__dirname, 'assets', name);
  return fs.existsSync(p) ? p : undefined;
}

// ---------------------------------------------------------------- Discord RPC (multi-instance)
function connectDiscord(discordType, appId) {
  if (rpcClients[discordType] && rpcClients[discordType].connected) {
    log.info(`Discord RPC already connected for ${discordType}`);
    return rpcClients[discordType];
  }

  const inst = DISCORD_INSTANCES.find((i) => i.id === discordType);
  if (!inst) {
    log.error(`Unknown Discord type: ${discordType}`);
    return null;
  }

  const client = new Client({ transport: 'ipc' });
  rpcClients[discordType] = { client, connected: false, appId };

  client.on('ready', () => {
    rpcClients[discordType].connected = true;
    rpcConnected = true;
    if (!activeDiscordTypes.includes(discordType)) activeDiscordTypes.push(discordType);
    // Capture the connected Discord account
    const user = client.user ? {
      id: client.user.id,
      username: client.user.username,
      discriminator: client.user.discriminator || '0',
      displayName: client.user.globalName || client.user.username,
    } : null;
    log.info(`Discord RPC ready for ${discordType}${user ? ` as ${user.displayName}` : ''}`);
    broadcast('rpc-status', { connected: true, discordType, appId, user, instances: getConnectedInstances() });
    if (currentActivity) {
      setActivity(currentActivity, discordType);
    }
  });

  client.on('disconnected', () => {
    rpcClients[discordType].connected = false;
    activeDiscordTypes = activeDiscordTypes.filter((t) => t !== discordType);
    log.warn(`Discord RPC disconnected for ${discordType}`);
    if (activeDiscordTypes.length === 0) {
      rpcConnected = false;
      broadcast('rpc-status', { connected: false, instances: [] });
    } else {
      broadcast('rpc-status', { connected: true, discordType, connected: false, instances: getConnectedInstances() });
    }
    scheduleReconnect();
  });

  client.on('error', (err) => {
    log.error(`Discord RPC error for ${discordType}:`, err.message);
    broadcast('rpc-error', { message: err.message, discordType });
  });

  // Find available pipe and connect
  findAvailablePipe(inst).then((pipeNum) => {
    if (pipeNum === null) {
      log.error(`No available IPC pipe for ${discordType}`);
      broadcast('rpc-error', { message: `No IPC pipe available for ${inst.name}`, discordType });
      return;
    }
    // discord-rpc uses pipe number via options
    client.login({ clientId: appId }).catch((err) => {
      log.error(`Failed to login to Discord RPC for ${discordType}:`, err.message);
      broadcast('rpc-error', { message: err.message, discordType });
      rpcClients[discordType].connected = false;
      broadcast('rpc-status', { connected: false, instances: getConnectedInstances() });
    });
  }).catch((err) => {
    log.error(`Pipe detection failed for ${discordType}:`, err.message);
  });

  return rpcClients[discordType];
}

function getConnectedInstances() {
  return activeDiscordTypes.map((t) => {
    const inst = DISCORD_INSTANCES.find((i) => i.id === t);
    return { id: t, name: inst ? inst.name : t, connected: rpcClients[t]?.connected || false };
  });
}

function setActivity(activity, discordType = null) {
  currentActivity = activity;

  const typesToUpdate = discordType ? [discordType] : activeDiscordTypes;

  for (const type of typesToUpdate) {
    const clientData = rpcClients[type];
    if (!clientData || !clientData.connected || !clientData.client) continue;

    const rpcActivity = {
      details: activity.details || '',
      state: activity.state || '',
      type: activity.type !== undefined ? activity.type : 0, // 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing
      startTimestamp: activity.startTimestamp || null,
      endTimestamp: activity.endTimestamp || null,
      largeImageKey: activity.largeImageKey || null,
      largeImageText: activity.largeImageText || '',
      smallImageKey: activity.smallImageKey || null,
      smallImageText: activity.smallImageText || '',
      instance: false,
    };

    // Streaming activity type requires a Twitch URL
    if (activity.type === 1 && activity.streamUrl) {
      rpcActivity.url = activity.streamUrl;
    }

    if (activity.buttons && activity.buttons.length > 0) {
      rpcActivity.buttons = activity.buttons.slice(0, 2).map((b) => ({
        label: b.label || '',
        url: b.url || '',
      }));
    }

    if (activity.partySize && activity.partyMax) {
      rpcActivity.party = { size: [activity.partySize, activity.partyMax] };
    }

    if (activity.matchSecret) rpcActivity.matchSecret = activity.matchSecret;
    if (activity.joinSecret) rpcActivity.joinSecret = activity.joinSecret;
    if (activity.spectateSecret) rpcActivity.spectateSecret = activity.spectateSecret;

    clientData.client.setActivity(rpcActivity).catch((err) => {
      log.error(`Failed to set activity for ${type}:`, err.message);
      broadcast('rpc-error', { message: err.message, discordType: type });
    });
  }
}

function clearActivity() {
  currentActivity = null;
  for (const type of activeDiscordTypes) {
    const clientData = rpcClients[type];
    if (clientData && clientData.connected && clientData.client) {
      clientData.client.clearActivity().catch((err) => {
        log.error(`Failed to clear activity for ${type}:`, err.message);
      });
    }
  }
}

function disconnectDiscord(discordType = null) {
  clearActivity();
  const types = discordType ? [discordType] : [...activeDiscordTypes];
  for (const type of types) {
    const clientData = rpcClients[type];
    if (clientData && clientData.client) {
      try { clientData.client.destroy(); } catch (e) { /* ignore */ }
      clientData.connected = false;
      delete rpcClients[type];
    }
  }
  activeDiscordTypes = activeDiscordTypes.filter((t) => !types.includes(t));
  rpcConnected = activeDiscordTypes.length > 0;
  broadcast('rpc-status', { connected: rpcConnected, instances: getConnectedInstances() });
}

function scheduleReconnect() {
  if (isQuitting || reconnectTimer) return;
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    log.warn('Max reconnect attempts reached');
    return;
  }
  reconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
  log.info(`Scheduling Discord RPC reconnect attempt ${reconnectAttempts} in ${delay}ms`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    log.info('Attempting Discord RPC reconnect...');
    const savedAppId = store.get('discordAppId', DEFAULT_DISCORD_APP_ID);
    const instances = getDiscordInstances();
    for (const inst of instances) {
      connectDiscord(inst.id, savedAppId);
    }
  }, delay);
}

function resetReconnect() {
  reconnectAttempts = 0;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

// ---------------------------------------------------------------- Automations
// Idle presence, game auto-detection, and keyless media (Spotify/YouTube/etc)
// now-playing presence — inspired by Vencord's CustomRPC + Discord game activity.

let automations = store.get('automations', {
  gameDetect: false,
  gameRules: [],              // [{ id, process, details, state, largeImageKey }]
  idleDetect: false,
  idleThresholdMin: 10,       // minutes
  idleActivity: { details: 'Away', state: 'Idle — AFK' },
  mediaDetect: false,
  mediaTemplate: '🎵 {title}',
  mediaUseStateArtist: true,
});

let automationState = {
  mode: 'manual',             // manual | game | idle | media
  savedManual: null,          // activity to restore when automation ends
  gameMatchId: null,
  mediaTrackKey: null,
  isIdle: false,
};

let smtcUnavailable = false;  // stop retrying SMTC if WinRT isn't available

function saveAutomationsStore() {
  store.set('automations', automations);
}

function buildRuleActivity(rule) {
  return {
    details: rule.details || rule.process,
    state: rule.state || '',
    type: 0,
    largeImageKey: rule.largeImageKey || null,
    largeImageText: rule.details || '',
  };
}

function buildMediaActivity(track) {
  const tpl = automations.mediaTemplate || '🎵 {title}';
  const details = tpl
    .replace(/\{title\}/g, track.title || '')
    .replace(/\{artist\}/g, track.artist || '')
    .replace(/\{album\}/g, track.album || '')
    .slice(0, 128);
  const act = {
    details,
    state: automations.mediaUseStateArtist && !tpl.includes('{artist}') ? (track.artist || '').slice(0, 128) : '',
    type: 2, // LISTENING TO
  };
  return act;
}

// Keyless Windows now-playing via SMTC (System Media Transport Controls).
// Reads whatever is playing: Spotify, browsers, YouTube in Chrome, etc. No API keys.
async function getNowPlaying() {
  if (process.platform !== 'win32' || smtcUnavailable) return null;
  const ps = `
    Add-Type -AssemblyName System.Runtime.WindowsRuntime | Out-Null
    $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1' })[0]
    function Await($WinRtTask, $ResultType) {
      $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
      $netTask = $asTask.Invoke($null, @($WinRtTask))
      $netTask.Wait(-1) | Out-Null
      $netTask.Result
    }
    try {
      $mgr = Await ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])
      $s = $mgr.GetCurrentSession()
      if ($s) {
        $props = Await ($s.TryGetMediaPropertiesAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])
        Write-Output ("OK|" + $props.Title + "|" + $props.Artist + "|" + $props.Album)
      } else { Write-Output "NONE|" }
    } catch { Write-Output ("ERR|" + $_.Exception.Message) }
  `;
  const encoded = Buffer.from(ps, 'utf16le').toString('base64');
  try {
    const { stdout } = await execAsync(`powershell -NoProfile -EncodedCommand ${encoded}`, { encoding: 'utf8', windowsHide: true, timeout: 8000 });
    const line = (stdout || '').split('\n').find((l) => l.startsWith('OK|') || l.startsWith('NONE|') || l.startsWith('ERR|'));
    if (!line) return null;
    if (line.startsWith('ERR|')) {
      log.warn('SMTC error:', line.slice(4).trim());
      return null;
    }
    if (line.startsWith('NONE|')) return null;
    const [, title = '', artist = '', album = ''] = line.split('|');
    if (!title.trim()) return null;
    return { title: title.trim(), artist: artist.trim(), album: album.trim() };
  } catch (e) {
    // WinRT not available (rare) — disable to avoid log spam
    smtcUnavailable = true;
    log.warn('Now-playing detection unavailable:', e.message);
    return null;
  }
}

let automationBusy = false;

async function automationTick() {
  if (isQuitting || automationBusy) return;
  if (!rpcConnected) return;
  automationBusy = true;
  try {
    const a = automations;
    const idleSec = (powerMonitor.getSystemIdleTime && process.platform === 'win32') ? powerMonitor.getSystemIdleTime() : 0;
    const idleHit = a.idleDetect && idleSec >= (a.idleThresholdMin || 10) * 60;

    // ---- IDLE (highest priority) --------------------------------------
    if (idleHit && !automationState.isIdle) {
      if (automationState.mode === 'manual') automationState.savedManual = currentActivity;
      automationState.isIdle = true;
      automationState.mode = 'idle';
      setActivity({ details: a.idleActivity.details || 'Away', state: a.idleActivity.state || '', type: 0 });
      broadcast('automation-status', { mode: 'idle', isIdle: true });
    } else if (!idleHit && automationState.isIdle) {
      automationState.isIdle = false;
      automationState.mode = 'manual';
      automationState.gameMatchId = null;
      automationState.mediaTrackKey = null; // let game/media re-apply on next tick
      if (automationState.savedManual) {
        setActivity(automationState.savedManual);
        broadcast('automation-status', { mode: 'manual', isIdle: false });
      }
    }

    if (automationState.isIdle) return; // idle overrides everything

    // ---- GAME AUTO-DETECT ---------------------------------------------
    if (a.gameDetect && a.gameRules.length > 0) {
      const procs = await listRunningProcesses();
      const rule = a.gameRules.find((r) => r.process && procs.includes(r.process.toLowerCase()));
      if (rule && automationState.mode !== 'game') {
        if (automationState.mode === 'manual') automationState.savedManual = currentActivity;
        automationState.mode = 'game';
        automationState.gameMatchId = rule.id;
        setActivity(buildRuleActivity(rule));
        log.info(`Automation: game detected — ${rule.process}`);
        broadcast('automation-status', { mode: 'game', game: rule.details || rule.process });
      } else if (!rule && automationState.mode === 'game') {
        automationState.mode = 'manual';
        automationState.gameMatchId = null;
        automationState.mediaTrackKey = null; // media re-applies next tick
        if (automationState.savedManual) {
          setActivity(automationState.savedManual);
          broadcast('automation-status', { mode: 'manual' });
        }
      }
    }

    // ---- MEDIA NOW-PLAYING --------------------------------------------
    if (a.mediaDetect && automationState.mode !== 'game') {
      const track = await getNowPlaying();
      if (track && track.title !== automationState.mediaTrackKey) {
        if (automationState.mode === 'manual') automationState.savedManual = currentActivity;
        automationState.mediaTrackKey = track.title;
        automationState.mode = 'media';
        setActivity(buildMediaActivity(track));
        log.info(`Automation: now playing — ${track.title} by ${track.artist}`);
        broadcast('automation-status', { mode: 'media', track });
      } else if (!track && automationState.mode === 'media') {
        automationState.mode = 'manual';
        automationState.mediaTrackKey = null;
        if (automationState.savedManual) {
          setActivity(automationState.savedManual);
          broadcast('automation-status', { mode: 'manual' });
        }
      }
    }
  } catch (err) {
    log.warn('Automation tick error (non-fatal):', err.message);
  } finally {
    automationBusy = false;
  }
}

// ---------------------------------------------------------------- broadcast
function broadcast(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

// ---------------------------------------------------------------- tray
function createTray() {
  const trayPath = assetPath('tray.png');
  const trayImage = trayPath ? nativeImage.createFromPath(trayPath) : nativeImage.createEmpty();

  tray = new Tray(trayImage);
  tray.setToolTip('Wicked RP');

  const updateTrayMenu = () => {
    const template = [
      { label: 'Show Wicked RP', click: () => { if (mainWindow) mainWindow.show(); } },
      { type: 'separator' },
      { label: rpcConnected ? 'Disconnect Discord' : 'Connect Discord', click: () => {
          if (rpcConnected) disconnectDiscord();
          else connectDiscord(store.get('discordAppId', DEFAULT_DISCORD_APP_ID));
        }},
      { type: 'separator' },
      { label: 'Media Manager', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.webContents.send('navigate-to', 'media'); } } },
      { label: 'Profiles', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.webContents.send('navigate-to', 'profiles'); } } },
      { type: 'separator' },
      { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
    ];
    tray.setContextMenu(Menu.buildFromTemplate(template));
  };

  updateTrayMenu();

  ipcMain.on('update-tray-menu', () => {
    updateTrayMenu();
  });

  tray.on('double-click', () => {
    if (mainWindow) mainWindow.show();
  });
}

// ---------------------------------------------------------------- app lifecycle
app.whenReady().then(() => {
  startMediaServer();
  createMainWindow();
  createTray();

  const savedAppId = store.get('discordAppId', DEFAULT_DISCORD_APP_ID);
  const savedType = store.get('selectedDiscordType', 'discord');

  // Auto-detect and connect to Discord (never crash the app on RPC errors)
  try {
    const instances = getDiscordInstances();
    if (instances.length > 0) {
      const typeToConnect = instances.find((i) => i.id === savedType) ? savedType : instances[0].id;
      connectDiscord(typeToConnect, savedAppId);
    } else {
      log.info('No Discord instances detected. Will auto-connect when Discord starts.');
    }
  } catch (err) {
    log.error('Auto-connect failed (app continues running):', err.message);
  }

  // Continuously monitor for Discord — auto-connect as soon as it opens
  setInterval(async () => {
    if (isQuitting) return;
    try {
      const instances = await getDiscordInstances();
      const runningIds = instances.map((i) => i.id);
      // Tell the renderer which Discords are open
      broadcast('discord-instances', { running: runningIds, connected: getConnectedInstances() });

      // If a Discord is open but we're not connected, connect automatically
      if (activeDiscordTypes.length === 0 && runningIds.length > 0) {
        const typeToConnect = runningIds.includes(savedType) ? savedType : runningIds[0];
        connectDiscord(typeToConnect, store.get('discordAppId', DEFAULT_DISCORD_APP_ID));
      }
      // Clean up dead connections (Discord closed but event didn't fire)
      for (const type of [...activeDiscordTypes]) {
        if (!runningIds.includes(type)) {
          disconnectDiscord(type);
        }
      }
      // Automations: idle presence, game auto-detect, media now-playing
      await automationTick();
    } catch (err) {
      // Never crash from monitoring
    }
  }, 5000);

  // Presence keep-alive (Vencord-style): re-send activity every 5 minutes so it never drops
  setInterval(() => {
    if (isQuitting) return;
    try {
      if (currentActivity && rpcConnected) {
        setActivity(currentActivity);
        log.info('Presence keep-alive re-sent');
      }
    } catch (err) {
      // ignore
    }
  }, 5 * 60 * 1000);

  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Global crash protection — log and keep running
process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection (app continues running):', reason);
});
process.on('uncaughtException', (err) => {
  log.error('Uncaught exception (app continues running):', err.message);
});

app.on('window-all-closed', (e) => {
  if (process.platform !== 'darwin') {
    e.preventDefault();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  if (globalShortcutsRegistered) {
    globalShortcut.unregisterAll();
    globalShortcutsRegistered = false;
  }
  stopMediaServer();
  disconnectDiscord();
});
function registerGlobalShortcuts() {
  if (globalShortcutsRegistered) return;
  try {
    globalShortcut.register('CommandOrControl+Shift+D', () => {
      if (mainWindow) mainWindow.webContents.send('toggle-devtools');
    });
    globalShortcutsRegistered = true;
  } catch (e) { log.warn('Failed to register global shortcuts:', e.message); }
}

// ---------------------------------------------------------------- presets
function loadPresets() {
  try {
    if (fs.existsSync(PRESETS_FILE)) {
      return JSON.parse(fs.readFileSync(PRESETS_FILE, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return [
    { id: 'gaming', name: 'Gaming', details: 'Gaming', state: 'Playing an epic game', largeImageKey: null },
    { id: 'streaming', name: 'Streaming', details: 'Streaming', state: 'Live on Twitch', largeImageKey: null },
    { id: 'working', name: 'Working', details: 'Working', state: 'Being productive', largeImageKey: null },
    { id: 'listening', name: 'Listening to Music', details: 'Listening to Music', state: 'Favorite playlist', largeImageKey: null },
    { id: 'watching', name: 'Watching', details: 'Watching', state: 'Great movie', largeImageKey: null },
  ];
}

function savePresets(presets) {
  try {
    fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
  } catch (e) { log.error('Failed to save presets:', e.message); }
}

// ---------------------------------------------------------------- IPC handlers
ipcMain.handle('get-stored-settings', async () => {
  return {
    discordAppId: store.get('discordAppId', DEFAULT_DISCORD_APP_ID),
    profiles: store.get('profiles', []),
    activeProfile: store.get('activeProfile', null),
    startOnBoot: store.get('startOnBoot', false),
    minimizeToTray: store.get('minimizeToTray', true),
    autoApply: store.get('autoApply', true),
    theme: store.get('theme', 'dark'),
    language: store.get('language', 'en'),
    mediaList: getMediaList(),
    appVersion: APP_VERSION,
  };
});

ipcMain.handle('save-settings', async (event, settings) => {
  if (settings.discordAppId !== undefined) store.set('discordAppId', settings.discordAppId);
  if (settings.profiles !== undefined) store.set('profiles', settings.profiles);
  if (settings.activeProfile !== undefined) store.set('activeProfile', settings.activeProfile);
  if (settings.startOnBoot !== undefined) {
    store.set('startOnBoot', settings.startOnBoot);
    app.setLoginItemSettings({ openAtLogin: settings.startOnBoot });
  }
  if (settings.minimizeToTray !== undefined) store.set('minimizeToTray', settings.minimizeToTray);
  if (settings.autoApply !== undefined) store.set('autoApply', settings.autoApply);
  if (settings.theme !== undefined) store.set('theme', settings.theme);
  if (settings.language !== undefined) store.set('language', settings.language);
  return { success: true };
});

ipcMain.handle('set-presence', async (event, activity) => {
  setActivity(activity);
  broadcast('presence-updated', { activity });
  return { success: true };
});

ipcMain.handle('clear-presence', async (event) => {
  clearActivity();
  broadcast('presence-cleared');
  return { success: true };
});

ipcMain.handle('connect-discord', async (event, { discordType, appId }) => {
  const targetType = discordType || store.get('selectedDiscordType', 'discord');
  const targetAppId = appId || store.get('discordAppId', DEFAULT_DISCORD_APP_ID);
  connectDiscord(targetType, targetAppId);
  return { success: true };
});

ipcMain.handle('disconnect-discord', async (event, discordType) => {
  disconnectDiscord(discordType);
  return { success: true };
});

ipcMain.handle('get-discord-instances', async (event) => {
  return getDiscordInstances();
});

ipcMain.handle('get-connected-instances', async (event) => {
  return getConnectedInstances();
});

ipcMain.handle('get-automations', async () => {
  return automations;
});

ipcMain.handle('save-automations', async (event, auto) => {
  automations = { ...automations, ...auto };
  // Reset automation state so new settings take effect on next tick
  automationState.gameMatchId = null;
  automationState.mediaTrackKey = null;
  saveAutomationsStore();
  return { success: true };
});

ipcMain.handle('get-now-playing', async () => {
  return getNowPlaying();
});

ipcMain.handle('get-automation-status', async () => {
  return { mode: automationState.mode, isIdle: automationState.isIdle };
});

ipcMain.handle('test-connection', async (event, { discordType, appId }) => {
  const targetType = discordType || store.get('selectedDiscordType', 'discord');
  const targetAppId = appId || store.get('discordAppId', DEFAULT_DISCORD_APP_ID);
  
  // Check if Discord is running
  const instances = getDiscordInstances();
  const running = instances.find((i) => i.id === targetType);
  if (!running) {
    return { success: false, error: `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} is not running. Please start Discord first.` };
  }

  // Try to connect
  try {
    const clientData = rpcClients[targetType];
    if (clientData && clientData.connected) {
      return { success: true, message: 'Already connected to Discord!' };
    }
    
    // Attempt a temporary connection
    connectDiscord(targetType, targetAppId);
    
    // Wait briefly to see if it connects
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const updated = rpcClients[targetType];
    if (updated && updated.connected) {
      return { success: true, message: 'Connection successful!' };
    }
    
    return { success: false, error: 'Connection timed out. Make sure Discord is running and try again.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('copy-image-key', async (event, filename) => {
  // Return the filename as the image key (without extension for Discord asset key)
  const key = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  return { success: true, key, filename };
});

ipcMain.handle('save-selected-discord-type', async (event, discordType) => {
  store.set('selectedDiscordType', discordType);
  return { success: true };
});

ipcMain.handle('open-url', async (event, url) => {
  await shell.openExternal(url);
  return { success: true };
});

ipcMain.handle('get-media-list', async (event) => {
  return getMediaList();
});

ipcMain.handle('delete-media', async (event, filename) => {
  try {
    const filePath = path.join(MEDIA_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, error: 'File not found' };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('get-presets', async (event) => {
  return loadPresets();
});

ipcMain.handle('save-presets', async (event, presets) => {
  savePresets(presets);
  return { success: true };
});

ipcMain.handle('export-profiles', async (event) => {
  try {
    const settings = store.store;
    const profiles = settings.profiles || [];
    const activeProfile = settings.activeProfile || null;
    return { success: true, profiles, activeProfile, exportedAt: new Date().toISOString(), version: APP_VERSION };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('import-profiles', async (event, data) => {
  try {
    if (!data || !Array.isArray(data.profiles)) {
      return { success: false, error: 'Invalid import data' };
    }
    const existing = store.get('profiles', []);
    const merged = [...existing, ...data.profiles];
    store.set('profiles', merged);
    if (data.activeProfile) store.set('activeProfile', data.activeProfile);
    return { success: true, imported: data.profiles.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.on('minimize-to-tray', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('navigate-to', (event, view) => {
  if (mainWindow) mainWindow.webContents.send('navigate-to', view);
});
