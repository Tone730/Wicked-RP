/**
 * Wicked RP — renderer process (Production v2.0)
 * Full UI logic: presence, profiles, media manager, presets, themes, settings.
 */

const DEFAULT_APP_ID = '1573677093601017927';

// ---------------------------------------------------------------- DOM refs
const els = {
  // Sidebar
  statusDot: document.getElementById('status-dot'),
  statusText: document.getElementById('status-text'),
  discordAppId: document.getElementById('discord-app-id'),
  btnConnect: document.getElementById('btn-connect'),
  btnDisconnect: document.getElementById('btn-disconnect'),
  navItems: document.querySelectorAll('.nav-item'),
  views: document.querySelectorAll('.view'),

  // Presence form
  fieldDetails: document.getElementById('field-details'),
  fieldState: document.getElementById('field-state'),
  fieldAppId: document.getElementById('field-app-id'),
  fieldStart: document.getElementById('field-start'),
  fieldEnd: document.getElementById('field-end'),
  fieldLargeImage: document.getElementById('field-large-image'),
  fieldLargeText: document.getElementById('field-large-text'),
  fieldSmallImage: document.getElementById('field-small-image'),
  fieldSmallText: document.getElementById('field-small-text'),
  fieldBtn1Label: document.getElementById('field-btn1-label'),
  fieldBtn1Url: document.getElementById('field-btn1-url'),
  fieldBtn2Label: document.getElementById('field-btn2-label'),
  fieldBtn2Url: document.getElementById('field-btn2-url'),
  fieldPartySize: document.getElementById('field-party-size'),
  fieldPartyMax: document.getElementById('field-party-max'),
  fieldMatchSecret: document.getElementById('field-match-secret'),
  fieldJoinSecret: document.getElementById('field-join-secret'),
  fieldSpectateSecret: document.getElementById('field-spectate-secret'),
  btnApply: document.getElementById('btn-apply'),
  btnApplyForm: document.getElementById('btn-apply-form'),
  btnClear: document.getElementById('btn-clear'),
  btnClearForm: document.getElementById('btn-clear-form'),
  btnPreset: document.getElementById('btn-preset'),
  presetSelect: document.getElementById('preset-select'),

  // Preview
  previewName: document.getElementById('preview-name'),
  previewState: document.getElementById('preview-state'),
  previewMeta: document.getElementById('preview-meta'),
  previewImage: document.getElementById('preview-image'),
  previewButtons: document.getElementById('preview-buttons'),
  previewStatusBadge: document.getElementById('status-badge'),

  // Media Manager
  mediaUpload: document.getElementById('media-upload'),
  mediaList: document.getElementById('media-list'),
  mediaEmpty: document.getElementById('media-empty'),
  mediaTypeFilter: document.getElementById('media-type-filter'),
  useMediaBtn: document.getElementById('use-media-btn'),

  // Profiles
  profileName: document.getElementById('profile-name'),
  btnNewProfile: document.getElementById('btn-new-profile'),
  btnSaveProfile: document.getElementById('btn-save-profile'),
  profilesList: document.getElementById('profiles-list'),
  emptyProfiles: document.getElementById('empty-profiles'),

  // Settings
  settingStartOnBoot: document.getElementById('setting-start-on-boot'),
  settingMinimizeToTray: document.getElementById('setting-minimize-to-tray'),
  settingAppId: document.getElementById('setting-app-id'),
  settingTheme: document.getElementById('setting-theme'),
  btnSaveSettings: document.getElementById('btn-save-settings'),
  themeCards: document.querySelectorAll('.theme-card'),

  // Discord portal
  btnDiscordPortal: document.getElementById('btn-discord-portal'),
};

// ---------------------------------------------------------------- state
let profiles = [];
let activeProfileId = null;
let rpcConnected = false;
let autoApplyPending = false;
let mediaList = [];
let selectedMedia = null;
let presets = [];
let currentTheme = 'dark';

// ---------------------------------------------------------------- navigation
function showView(viewId) {
  els.views.forEach((v) => v.classList.add('hidden'));
  const view = document.getElementById(viewId);
  if (view) view.classList.remove('hidden');

  els.navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.view === viewId);
  });
}

els.navItems.forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    showView(item.dataset.view);
    if (item.dataset.view === 'media') loadMedia();
  });
});

// ---------------------------------------------------------------- themes
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);

  els.themeCards.forEach((card) => {
    card.classList.toggle('active', card.dataset.theme === theme);
  });

  // Update tray icon color hint via toast
  showToast(`Theme switched to ${theme}`, 'info');
}

function initThemes() {
  els.themeCards.forEach((card) => {
    card.addEventListener('click', () => {
      const theme = card.dataset.theme;
      applyTheme(theme);
      saveSettings({ theme });
    });
  });
}

// ---------------------------------------------------------------- presence form
function readForm() {
  const buttons = [];
  if (els.fieldBtn1Label.value.trim() || els.fieldBtn1Url.value.trim()) {
    buttons.push({ label: els.fieldBtn1Label.value.trim(), url: els.fieldBtn1Url.value.trim() });
  }
  if (els.fieldBtn2Label.value.trim() || els.fieldBtn2Url.value.trim()) {
    buttons.push({ label: els.fieldBtn2Label.value.trim(), url: els.fieldBtn2Url.value.trim() });
  }

  const activity = {
    details: els.fieldDetails.value.trim(),
    state: els.fieldState.value.trim(),
    appId: els.fieldAppId.value.trim() || null,
    startTimestamp: els.fieldStart.value ? parseInt(els.fieldStart.value, 10) * 1000 : null,
    endTimestamp: els.fieldEnd.value ? parseInt(els.fieldEnd.value, 10) * 1000 : null,
    largeImageKey: els.fieldLargeImage.value.trim() || null,
    largeImageText: els.fieldLargeText.value.trim(),
    smallImageKey: els.fieldSmallImage.value.trim() || null,
    smallImageText: els.fieldSmallText.value.trim(),
    buttons,
  };

  if (els.fieldPartySize.value || els.fieldPartyMax.value) {
    activity.partySize = els.fieldPartySize.value ? parseInt(els.fieldPartySize.value, 10) : 0;
    activity.partyMax = els.fieldPartyMax.value ? parseInt(els.fieldPartyMax.value, 10) : 0;
  }
  if (els.fieldMatchSecret.value.trim()) activity.matchSecret = els.fieldMatchSecret.value.trim();
  if (els.fieldJoinSecret.value.trim()) activity.joinSecret = els.fieldJoinSecret.value.trim();
  if (els.fieldSpectateSecret.value.trim()) activity.spectateSecret = els.fieldSpectateSecret.value.trim();

  return activity;
}

function writeForm(activity) {
  els.fieldDetails.value = activity.details || '';
  els.fieldState.value = activity.state || '';
  els.fieldAppId.value = activity.appId || '';
  els.fieldStart.value = activity.startTimestamp ? Math.floor(activity.startTimestamp / 1000) : '';
  els.fieldEnd.value = activity.endTimestamp ? Math.floor(activity.endTimestamp / 1000) : '';
  els.fieldLargeImage.value = activity.largeImageKey || '';
  els.fieldLargeText.value = activity.largeImageText || '';
  els.fieldSmallImage.value = activity.smallImageKey || '';
  els.fieldSmallText.value = activity.smallImageText || '';
  els.fieldPartySize.value = activity.partySize || '';
  els.fieldPartyMax.value = activity.partyMax || '';
  els.fieldMatchSecret.value = activity.matchSecret || '';
  els.fieldJoinSecret.value = activity.joinSecret || '';
  els.fieldSpectateSecret.value = activity.spectateSecret || '';

  if (activity.buttons && activity.buttons[0]) {
    els.fieldBtn1Label.value = activity.buttons[0].label || '';
    els.fieldBtn1Url.value = activity.buttons[0].url || '';
  }
  if (activity.buttons && activity.buttons[1]) {
    els.fieldBtn2Label.value = activity.buttons[1].label || '';
    els.fieldBtn2Url.value = activity.buttons[1].url || '';
  }
}

function updatePreview(activity, connected) {
  els.previewName.textContent = activity.details || 'Playing';
  els.previewState.textContent = activity.state || 'Something awesome';

  let meta = '';
  if (activity.startTimestamp) {
    const start = new Date(activity.startTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    meta = `Started ${start}`;
    if (activity.endTimestamp) {
      const end = new Date(activity.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      meta += ` • Ends ${end}`;
    }
  }
  if (activity.partySize && activity.partyMax) {
    meta += ` • ${activity.partySize}/${activity.partyMax}`;
  }
  els.previewMeta.textContent = meta;

  // Image
  const imgKey = activity.largeImageKey;
  if (imgKey) {
    // Check if it's a local media file
    const mediaItem = mediaList.find((m) => m.name === imgKey || m.path === imgKey);
    if (mediaItem && mediaItem.isImage) {
      els.previewImage.classList.add('has-image');
      els.previewImage.style.backgroundImage = `url('${mediaItem.url}')`;
      els.previewImage.innerHTML = '';
    } else {
      els.previewImage.classList.add('has-image');
      els.previewImage.style.backgroundImage = `url('https://cdn.discordapp.com/app-assets/${activity.appId || els.discordAppId.value || '0'}/${imgKey}.png')`;
      els.previewImage.innerHTML = '';
    }
  } else {
    els.previewImage.classList.remove('has-image');
    els.previewImage.style.backgroundImage = '';
    els.previewImage.innerHTML = '<div class="image-placeholder">No Image</div>';
  }

  // Buttons
  els.previewButtons.innerHTML = '';
  if (activity.buttons && activity.buttons.length > 0) {
    activity.buttons.forEach((b) => {
      const btn = document.createElement('span');
      btn.className = 'preview-btn';
      btn.textContent = b.label;
      els.previewButtons.appendChild(btn);
    });
  }

  // Status
  if (connected) {
    els.previewStatusBadge.classList.remove('offline');
    els.previewStatusBadge.classList.add('online');
    els.previewStatusBadge.textContent = '● Online';
  } else {
    els.previewStatusBadge.classList.remove('online');
    els.previewStatusBadge.classList.add('offline');
    els.previewStatusBadge.textContent = '● Offline';
  }
}

function applyPresence() {
  const activity = readForm();
  if (!activity.details) {
    showToast('Please enter an activity name.', 'error');
    return;
  }
  wickedRP.setPresence(activity);
  updatePreview(activity, rpcConnected);
  showToast('Presence applied to Discord.', 'success');
}

function clearPresence() {
  wickedRP.clearPresence();
  els.previewName.textContent = '—';
  els.previewState.textContent = '—';
  els.previewMeta.textContent = '';
  els.previewImage.classList.remove('has-image');
  els.previewImage.style.backgroundImage = '';
  els.previewImage.innerHTML = '<div class="image-placeholder">No Image</div>';
  els.previewButtons.innerHTML = '';
  els.previewStatusBadge.classList.remove('online');
  els.previewStatusBadge.classList.add('offline');
  els.previewStatusBadge.textContent = '● Offline';
  showToast('Presence cleared.', 'info');
}

els.btnApply.addEventListener('click', applyPresence);
els.btnApplyForm.addEventListener('click', applyPresence);
els.btnClear.addEventListener('click', clearPresence);
els.btnClearForm.addEventListener('click', clearPresence);

// Real-time preview
const formInputs = [
  els.fieldDetails, els.fieldState, els.fieldAppId, els.fieldStart, els.fieldEnd,
  els.fieldLargeImage, els.fieldLargeText, els.fieldSmallImage, els.fieldSmallText,
  els.fieldBtn1Label, els.fieldBtn1Url, els.fieldBtn2Label, els.fieldBtn2Url,
  els.fieldPartySize, els.fieldPartyMax,
];
formInputs.forEach((input) => {
  input.addEventListener('input', () => {
    updatePreview(readForm(), rpcConnected);
  });
});

// Preset apply
els.btnPreset.addEventListener('click', () => {
  const preset = presets.find((p) => p.id === els.presetSelect.value);
  if (preset) {
    writeForm(preset);
    updatePreview(preset, rpcConnected);
    showToast(`Preset "${preset.name}" loaded.`, 'info');
  }
});

// ---------------------------------------------------------------- RPC status
wickedRP.onRpcStatus((data) => {
  rpcConnected = !!data.connected;
  els.statusDot.classList.toggle('connected', rpcConnected);
  els.statusDot.classList.toggle('disconnected', !rpcConnected);
  els.statusText.textContent = rpcConnected ? 'Connected to Discord' : 'Disconnected';
  els.btnConnect.style.display = rpcConnected ? 'none' : 'inline-flex';
  els.btnDisconnect.style.display = rpcConnected ? 'flex' : 'none';
  updatePreview(readForm(), rpcConnected);

  if (rpcConnected && autoApplyPending) {
    autoApplyPending = false;
    const activity = readForm();
    if (activity.details) {
      wickedRP.setPresence(activity);
      showToast('Last presence restored.', 'info');
    }
  }
});

wickedRP.onRpcError((data) => {
  els.statusText.textContent = 'Error: ' + (data.message || 'Unknown');
  els.statusDot.classList.add('disconnected');
  els.statusDot.classList.remove('connected');
  rpcConnected = false;
  showToast('Discord RPC error: ' + (data.message || 'Unknown'), 'error');
});

wickedRP.onPresenceUpdated((data) => {
  updatePreview(data.activity, true);
  showToast('Presence updated.', 'success');
});

wickedRP.onPresenceCleared(() => {
  clearPresence();
});

// ---------------------------------------------------------------- connect / disconnect
els.btnConnect.addEventListener('click', async () => {
  const appId = els.discordAppId.value.trim();
  try {
    await wickedRP.connectDiscord(appId);
  } catch (err) {
    showToast('Failed to connect: ' + err.message, 'error');
  }
});

els.btnDisconnect.addEventListener('click', async () => {
  try {
    await wickedRP.disconnectDiscord();
  } catch (err) {
    showToast('Failed to disconnect: ' + err.message, 'error');
  }
});

// Discord portal
els.btnDiscordPortal.addEventListener('click', () => {
  wickedRP.openUrl('https://discord.com/developers/applications');
});

// ---------------------------------------------------------------- profiles
async function loadProfiles() {
  const settings = await wickedRP.getStoredSettings();
  profiles = settings.profiles || [];
  activeProfileId = settings.activeProfile || null;
  els.discordAppId.value = settings.discordAppId || DEFAULT_APP_ID;
  els.settingAppId.value = settings.discordAppId || DEFAULT_APP_ID;
  currentTheme = settings.theme || 'dark';
  applyTheme(currentTheme);
  renderProfiles();
  if (activeProfileId) {
    const profile = profiles.find((p) => p.id === activeProfileId);
    if (profile) {
      writeForm(profile.activity);
      updatePreview(profile.activity, rpcConnected);
    }
  }
}

function renderProfiles() {
  els.profilesList.innerHTML = '';
  if (profiles.length === 0) {
    els.emptyProfiles.classList.remove('hidden');
    return;
  }
  els.emptyProfiles.classList.add('hidden');

  profiles.forEach((profile) => {
    const item = document.createElement('div');
    item.className = `profile-item ${profile.id === activeProfileId ? 'active' : ''}`;
    item.innerHTML = `
      <div class="profile-info">
        <div class="profile-name">${escapeHtml(profile.name)}</div>
        <div class="profile-activity">${escapeHtml(profile.activity.details || '')}</div>
      </div>
      <div class="profile-actions">
        <button class="btn-ghost-sm profile-btn-load" data-id="${profile.id}" title="Load">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.34 9.45a.5.5 0 0 1-.832.83l-9.45-3.34a.5.5 0 0 1-.832-.83l3.34-9.45a.5.5 0 0 1 1.664 0l3.34 9.45a.5.5 0 0 1 .832.83z"/></svg>
          Load
        </button>
        <button class="btn-danger-sm profile-btn-delete" data-id="${profile.id}" title="Delete">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete
        </button>
      </div>
    `;
    els.profilesList.appendChild(item);
  });

  els.profilesList.querySelectorAll('.profile-btn-load').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      activeProfileId = id;
      const profile = profiles.find((p) => p.id === id);
      if (profile) {
        writeForm(profile.activity);
        updatePreview(profile.activity, rpcConnected);
        saveSettings({ activeProfile: id });
        renderProfiles();
        showToast(`Loaded "${profile.name}".`, 'info');
      }
    });
  });

  els.profilesList.querySelectorAll('.profile-btn-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const profile = profiles.find((p) => p.id === id);
      if (!confirm(`Delete "${profile ? profile.name : ''}"?`)) return;
      profiles = profiles.filter((p) => p.id !== id);
      if (activeProfileId === id) activeProfileId = null;
      await saveSettings({ profiles, activeProfile });
      renderProfiles();
    });
  });
}

els.btnNewProfile.addEventListener('click', () => {
  showView('presence');
  els.profileName.focus();
});

els.btnSaveProfile.addEventListener('click', async () => {
  const name = els.profileName.value.trim();
  if (!name) {
    showToast('Please enter a profile name.', 'error');
    return;
  }
  const activity = readForm();
  if (!activity.details) {
    showToast('Please configure an activity first.', 'error');
    return;
  }

  const id = 'profile-' + Date.now();
  profiles.push({ id, name, activity, createdAt: Date.now() });
  activeProfileId = id;
  els.profileName.value = '';
  await saveSettings({ profiles, activeProfile: id });
  renderProfiles();
  showToast(`Profile "${name}" saved.`, 'success');
  showView('presence');
});

// ---------------------------------------------------------------- media manager
async function loadMedia() {
  try {
    const settings = await wickedRP.getStoredSettings();
    mediaList = settings.mediaList || [];
    renderMedia();
  } catch (e) {
    showToast('Failed to load media.', 'error');
  }
}

function renderMedia() {
  els.mediaList.innerHTML = '';
  const filter = els.mediaTypeFilter.value;

  const filtered = mediaList.filter((m) => {
    if (filter === 'images') return m.isImage;
    if (filter === 'videos') return m.isVideo;
    return true;
  });

  if (filtered.length === 0) {
    els.mediaEmpty.classList.remove('hidden');
    return;
  }
  els.mediaEmpty.classList.add('hidden');

  filtered.forEach((media) => {
    const item = document.createElement('div');
    item.className = `media-item ${selectedMedia === media.name ? 'selected' : ''}`;
    item.onclick = () => {
      selectedMedia = media.name;
      renderMedia();
      els.useMediaBtn.disabled = false;
    };

    let preview = '';
    if (media.isImage) {
      preview = `<img src="${media.url}" class="media-thumb" alt="${escapeHtml(media.name)}">`;
    } else if (media.isVideo) {
      preview = `<video class="media-thumb" muted playsinline><source src="${media.url}" type="${media.isVideo ? 'video/mp4' : ''}">Your browser does not support video</video>`;
    } else {
      preview = `<div class="media-thumb media-file-icon">📄</div>`;
    }

    item.innerHTML = `
      ${preview}
      <div class="media-info">
        <div class="media-name">${escapeHtml(media.name)}</div>
        <div class="media-size">${(media.size / 1024).toFixed(1)} KB</div>
      </div>
      <button class="btn-danger-sm media-delete" data-name="${escapeHtml(media.name)}" title="Delete" onclick="event.stopPropagation(); deleteMedia('${escapeHtml(media.name)}')">×</button>
    `;
    els.mediaList.appendChild(item);
  });

  els.useMediaBtn.disabled = !selectedMedia;
}

async function deleteMedia(filename) {
  if (!confirm(`Delete "${filename}"?`)) return;
  const result = await wickedRP.deleteMedia(filename);
  if (result.success) {
    showToast('Media deleted.', 'info');
    selectedMedia = null;
    loadMedia();
  } else {
    showToast('Failed to delete: ' + result.error, 'error');
  }
}

window.deleteMedia = deleteMedia;

els.mediaUpload.addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files.length) return;

  // In this Electron app, we handle file upload via a hidden input + save
  // Since we can't directly write to userData from renderer, we use a different approach:
  // We'll show a message explaining how to add media files
  showToast('Select files, then they will appear in the media folder.', 'info');

  // For now, show instructions
  const fileNames = Array.from(files).map((f) => f.name).join(', ');
  showToast(`Selected: ${fileNames}. Copy these files to your Wicked RP media folder to use them.`, 'info');

  // Open the media folder
  try {
    await wickedRP.openUrl(`file://${pathMediaDir()}`);
  } catch (err) {
    // ignore
  }
});

function pathMediaDir() {
  // Return the media directory path for the user
  return 'Check your Wicked RP app data folder for the media directory';
}

els.useMediaBtn.addEventListener('click', () => {
  if (!selectedMedia) return;
  els.fieldLargeImage.value = selectedMedia;
  updatePreview(readForm(), rpcConnected);
  showView('presence');
  showToast(`Selected image: ${selectedMedia}`, 'success');
});

els.mediaTypeFilter.addEventListener('change', renderMedia);

// ---------------------------------------------------------------- settings
async function loadSettings() {
  const settings = await wickedRP.getStoredSettings();
  els.settingStartOnBoot.checked = !!settings.startOnBoot;
  els.settingMinimizeToTray.checked = settings.minimizeToTray !== false;
  els.settingAppId.value = settings.discordAppId || DEFAULT_APP_ID;
  currentTheme = settings.theme || 'dark';
  applyTheme(currentTheme);
}

els.btnSaveSettings.addEventListener('click', async () => {
  await saveSettings({
    startOnBoot: els.settingStartOnBoot.checked,
    minimizeToTray: els.settingMinimizeToTray.checked,
    discordAppId: els.settingAppId.value.trim(),
  });
  showToast('Settings saved.', 'success');
});

// ---------------------------------------------------------------- presets
async function loadPresetsData() {
  presets = await wickedRP.getPresets();
  els.presetSelect.innerHTML = presets.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
}

// ---------------------------------------------------------------- helpers
async function saveSettings(partial) {
  const settings = await wickedRP.getStoredSettings();
  const merged = { ...settings, ...partial };
  await wickedRP.saveSettings(merged);
  if (merged.profiles) profiles = merged.profiles;
  if (merged.activeProfile !== undefined) activeProfileId = merged.activeProfile;
  if (merged.discordAppId !== undefined) els.discordAppId.value = merged.discordAppId;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---------------------------------------------------------------- init
(async () => {
  try {
    autoApplyPending = true;
    await loadSettings();
    await loadProfiles();
    await loadPresetsData();
    initThemes();
    showView('presence');
    updatePreview(readForm(), rpcConnected);
  } catch (err) {
    console.error('Init error:', err);
    showToast('Failed to initialize: ' + err.message, 'error');
  }
})();

window.wickedRP = wickedRP;
