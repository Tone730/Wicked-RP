/**
 * Wicked RP — preload script (Production v2.1)
 * Securely exposes IPC methods to the renderer via contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wickedRP', {
  // Settings
  getStoredSettings: () => ipcRenderer.invoke('get-stored-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // Presence
  setPresence: (activity) => ipcRenderer.invoke('set-presence', activity),
  clearPresence: () => ipcRenderer.invoke('clear-presence'),
  connectDiscord: (options) => ipcRenderer.invoke('connect-discord', options),
  disconnectDiscord: (discordType) => ipcRenderer.invoke('disconnect-discord', discordType),
  getDiscordInstances: () => ipcRenderer.invoke('get-discord-instances'),
  getConnectedInstances: () => ipcRenderer.invoke('get-connected-instances'),
  saveSelectedDiscordType: (discordType) => ipcRenderer.invoke('save-selected-discord-type', discordType),

  // Media
  getMediaList: () => ipcRenderer.invoke('get-media-list'),
  deleteMedia: (filename) => ipcRenderer.invoke('delete-media', filename),
  copyImageKey: (filename) => ipcRenderer.invoke('copy-image-key', filename),

  // Automations (idle / game detect / media now-playing)
  getAutomations: () => ipcRenderer.invoke('get-automations'),
  saveAutomations: (auto) => ipcRenderer.invoke('save-automations', auto),
  getNowPlaying: () => ipcRenderer.invoke('get-now-playing'),
  getAutomationStatus: () => ipcRenderer.invoke('get-automation-status'),
  onAutomationStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('automation-status', handler);
    return () => ipcRenderer.removeListener('automation-status', handler);
  },

  // Connection testing
  testConnection: (options) => ipcRenderer.invoke('test-connection', options),

  // Presets
  getPresets: () => ipcRenderer.invoke('get-presets'),
  savePresets: (presets) => ipcRenderer.invoke('save-presets', presets),

  // Profiles import/export
  exportProfiles: () => ipcRenderer.invoke('export-profiles'),
  importProfiles: (data) => ipcRenderer.invoke('import-profiles', data),

  // Utilities
  openUrl: (url) => ipcRenderer.invoke('open-url', url),

  // Event listeners
  onRpcStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('rpc-status', handler);
    return () => ipcRenderer.removeListener('rpc-status', handler);
  },
  onRpcError: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('rpc-error', handler);
    return () => ipcRenderer.removeListener('rpc-error', handler);
  },
  onPresenceUpdated: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('presence-updated', handler);
    return () => ipcRenderer.removeListener('presence-updated', handler);
  },
  onPresenceCleared: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('presence-cleared', handler);
    return () => ipcRenderer.removeListener('presence-cleared', handler);
  },
  onMediaUpdated: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('media-updated', handler);
    return () => ipcRenderer.removeListener('media-updated', handler);
  },
  onNavigateTo: (callback) => {
    const handler = (_event, view) => callback(view);
    ipcRenderer.on('navigate-to', handler);
    return () => ipcRenderer.removeListener('navigate-to', handler);
  },
  onDiscordInstances: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('discord-instances', handler);
    return () => ipcRenderer.removeListener('discord-instances', handler);
  },
});
