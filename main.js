/**
 * Wicked RP — Electron main process
 * Handles Discord Rich Presence, window lifecycle, tray, auto-startup, and IPC.
 */

const { app, BrowserWindow, ipcMain, Tray, nativeImage, shell, globalShortcut } = require('electron');
const path = require('path');
const { Client } = require('discord-rpc');
const Store = require('electron-store');
const log = require('electron-log');

const store = new Store();

// ---------------------------------------------------------------- app state
let mainWindow = null;
let tray = null;
let rpcClient = null;
let rpcConnected = false;
let currentActivity = null;
let isQuitting = false;

// Discord application ID (public placeholder — users can override in settings)
const DEFAULT_DISCORD_APP_ID = '1166482936243925032';

// ---------------------------------------------------------------- window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 700,
    minHeight: 500,
    show: false,
    autoHideMenuBar: true,
    title: 'Wicked RP',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// ---------------------------------------------------------------- Discord RPC
function connectDiscord(appId) {
  if (rpcClient && rpcConnected) {
    log.info('Discord RPC already connected');
    return rpcClient;
  }

  rpcClient = new Client({ transport: 'rpc' });

  rpcClient.on('ready', () => {
    rpcConnected = true;
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
    rpcClient.destroy();
    rpcClient = null;
  }
  rpcConnected = false;
  broadcast('rpc-status', { connected: false });
}

// ---------------------------------------------------------------- IPC broadcast to renderer
function broadcast(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

// ---------------------------------------------------------------- tray
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray.png');
  const trayImage = nativeImage.createFromPath(iconPath);

  tray = new Tray(trayImage);
  tray.setToolTip('Wicked RP');

  const contextMenu = [
    { label: 'Show Wicked RP', click: () => { if (mainWindow) mainWindow.show(); } },
    { type: 'separator' },
    { label: 'Disconnect Discord', click: () => { disconnectDiscord(); broadcast('presence-cleared'); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
  ];

  tray.setContextMenu(require('electron').Menu.buildFromTemplate(contextMenu));

  tray.on('double-click', () => {
    if (mainWindow) mainWindow.show();
  });
}

// ---------------------------------------------------------------- app lifecycle
app.whenReady().then(() => {
  createMainWindow();
  createTray();

  // Restore last app ID from settings
  const savedAppId = store.get('discordAppId', DEFAULT_DISCORD_APP_ID);
  connectDiscord(savedAppId);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', (e) => {
  // Keep running (tray app) — don't quit on window close on Windows/Linux
  if (process.platform !== 'darwin') {
    e.preventDefault();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  disconnectDiscord();
});

// ---------------------------------------------------------------- IPC handlers
ipcMain.on('get-stored-settings', (event) => {
  event.returnValue = {
    discordAppId: store.get('discordAppId', DEFAULT_DISCORD_APP_ID),
    profiles: store.get('profiles', []),
    activeProfile: store.get('activeProfile', null),
    startOnBoot: store.get('startOnBoot', false),
    minimizeToTray: store.get('minimizeToTray', true),
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

// Minimize to tray instead of closing
ipcMain.on('minimize-to-tray', () => {
  if (mainWindow) mainWindow.hide();
});
