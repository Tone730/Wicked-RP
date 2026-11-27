/**
 * Wicked RP — Electron main process (Production v2.1)
 * Discord Rich Presence, media server, tray, auto-startup, IPC, presets, themes,
 * window state persistence, keyboard shortcuts, about/error dialogs.
 */

const { app, BrowserWindow, ipcMain, Tray, nativeImage, shell, globalShortcut, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Client } = require('discord-rpc');
const Store = require('electron-store');
const log = require('electron-log');
const chokidar = require('chokidar');

const store = new Store();

// ---------------------------------------------------------------- constants
const DEFAULT_DISCORD_APP_ID = '1573677093601017927';
const APP_VERSION = '2.1.0';
const MEDIA_DIR = path.join(app.getPath('userData'), 'media');
const PRESETS_FILE = path.join(app.getPath('userData'), 'presets.json');
const THEMES_FILE = path.join(app.getPath('userData'), 'themes.json');
const WINDOW_STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');
const MEDIA_PORT = 47321;

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
let rpcClient = null;
let rpcConnected = false;
let currentActivity = null;
let isQuitting = false;
let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
let mediaServer = null;
let mediaWatcher = null;
let globalShortcutsRegistered = false;

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

// ---------------------------------------------------------------- Discord RPC
function connectDiscord(appId) {
  if (rpcClient && rpcConnected) {
    log.info('Discord RPC already connected');
    return rpcClient;
  }

  resetReconnect();

  rpcClient = new Client({ transport: 'rpc' });

  rpcClient.on('ready', () => {
    rpcConnected = true;
    resetReconnect();
    log.info('Discord RPC ready');
    broadcast('rpc-status', { connected: true, appId });
    if (currentActivity) {
      setActivity(currentActivity);
    }
  });

  rpcClient.on('disconnected', () => {
    rpcConnected = false;
    log.warn('Discord RPC disconnected');
    broadcast('rpc-status', { connected: false });
    scheduleReconnect();
  });

  rpcClient.on('error', (err) => {
    log.error('Discord RPC error:', err.message);
    broadcast('rpc-error', { message: err.message });
  });

  rpcClient.login({ clientId: appId }).catch((err) => {
    log.error('Failed to login to Discord RPC:', err.message);
    broadcast('rpc-error', { message: err.message });
    rpcConnected = false;
    broadcast('rpc-status', { connected: false });
  });

  return rpcClient;
}

function setActivity(activity) {
  currentActivity = activity;
  if (!rpcClient || !rpcConnected) {
    log.warn('Discord RPC not connected, storing activity for later');
    return;
  }

  const rpcActivity = {
    details: activity.details || '',
    state: activity.state || '',
    startTimestamp: activity.startTimestamp || null,
    endTimestamp: activity.endTimestamp || null,
    largeImageKey: activity.largeImageKey || null,
    largeImageText: activity.largeImageText || '',
    smallImageKey: activity.smallImageKey || null,
    smallImageText: activity.smallImageText || '',
    instance: false,
  };

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

  rpcClient.setActivity(rpcActivity).catch((err) => {
    log.error('Failed to set activity:', err.message);
    broadcast('rpc-error', { message: err.message });
  });
}

function clearActivity() {
  currentActivity = null;
  if (rpcClient && rpcConnected) {
    rpcClient.clearActivity().catch((err) => {
      log.error('Failed to clear activity:', err.message);
    });
  }
}

function disconnectDiscord() {
  clearActivity();
  if (rpcClient) {
    try { rpcClient.destroy(); } catch (e) { /* ignore */ }
    rpcClient = null;
  }
  rpcConnected = false;
  broadcast('rpc-status', { connected: false });
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
    connectDiscord(savedAppId);
  }, delay);
}

function resetReconnect() {
  reconnectAttempts = 0;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
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
  connectDiscord(savedAppId);

  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
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
ipcMain.on('get-stored-settings', (event) => {
  event.returnValue = {
    discordAppId: store.get('discordAppId', DEFAULT_DISCORD_APP_ID),
    profiles: store.get('profiles', []),
    activeProfile: store.get('activeProfile', null),
    startOnBoot: store.get('startOnBoot', false),
    minimizeToTray: store.get('minimizeToTray', true),
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

ipcMain.handle('connect-discord', async (event, appId) => {
  disconnectDiscord();
  connectDiscord(appId || store.get('discordAppId', DEFAULT_DISCORD_APP_ID));
  return { success: true };
});

ipcMain.handle('disconnect-discord', async (event) => {
  disconnectDiscord();
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
