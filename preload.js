/**
 * Wicked RP — preload script (Production v2.1)
 * Securely exposes IPC methods to the renderer via contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainApi('wickedRP', {
  // Settings
  getStoredSettings: () => ipcRenderer.invoke('get-stored-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // Presence
  setPresence: (activity) => ipcRenderer.invoke('set-presence', activity),
  clearPresence: () => ipcRenderer.invoke('clear-presence'),
  connectDiscord: (appId) => ipcRenderer.invoke('connect-discord', appId),
  disconnectDiscord: () => ipcRenderer.invoke('disconnect-discord'),

  // Media
  getMediaList: () => ipcRenderer.invoke('get-media-list'),
  deleteMedia: (filename) => ipcRenderer.invoke('delete-media', filename),
  copyImageKey: (filename) => ipcRenderer.invoke('copy-image-key', filename),

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
});
