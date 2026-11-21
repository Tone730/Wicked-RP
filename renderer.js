/**
 * Wicked RP — renderer process
 * UI logic: presence form, profiles, settings, real-time preview, toast notifications.
 * All Custom RP features: activity name, details, state, timestamps, large/small images,
 * buttons, application ID, profiles, startup, minimize to tray.
 */

// ---------------------------------------------------------------- DOM refs
const els = {
  // Sidebar status
  statusDot: document.getElementById('status-dot'),
  statusText: document.getElementById('status-text'),
  statusBadge: document.getElementById('status-badge'),
  discordAppId: document.getElementById('discord-app-id'),
  btnConnect: document.getElementById('btn-connect'),
  btnDisconnect: document.getElementById('btn-disconnect'),

  // Navigation
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
  btnApply: document.getElementById('btn-apply'),
  btnApplyForm: document.getElementById('btn-apply-form'),
  btnClear: document.getElementById('btn-clear'),
  btnClearForm: document.getElementById('btn-clear-form'),

  // Discord preview
  previewName: document.getElementById('preview-name'),
  previewState: document.getElementById('preview-state'),
  previewMeta: document.getElementById('preview-meta'),
  previewImage: document.getElementById('preview-image'),
  previewButtons: document.getElementById('preview-buttons'),
  previewStatusBadge: document.getElementById('status-badge'),

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
  btnSaveSettings: document.getElementById('btn-save-settings'),
};

// ---------------------------------------------------------------- state
const DEFAULT_APP_ID = '1573677093601017927';
let profiles = [];
let activeProfileId = null;
let rpcConnected = false;
let autoApplyPending = false;

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
  });
});

// ---------------------------------------------------------------- presence form
function readForm() {
  const buttons = [];
  if (els.fieldBtn1Label.value.trim() || els.fieldBtn1Url.value.trim()) {
    buttons.push({ label: els.fieldBtn1Label.value.trim(), url: els.fieldBtn1Url.value.trim() });
  }
  if (els.fieldBtn2Label.value.trim() || els.fieldBtn2Url.value.trim()) {
    buttons.push({ label: els.fieldBtn2Label.value.trim(), url: els.fieldBtn2Url.value.trim() });
  }

  return {
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
  // Name
  els.previewName.textContent = activity.details || 'Playing';
  // State
  els.previewState.textContent = activity.state || 'Something awesome';

  // Meta line (timestamps)
  let meta = '';
  if (activity.startTimestamp) {
    const start = new Date(activity.startTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    meta = `Started ${start}`;
    if (activity.endTimestamp) {
      const end = new Date(activity.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      meta += ` • Ends ${end}`;
    }
  }
  els.previewMeta.textContent = meta;

  // Image
  if (activity.largeImageKey) {
    els.previewImage.classList.add('has-image');
    els.previewImage.style.backgroundImage = `url('https://cdn.discordapp.com/app-assets/${activity.appId || els.discordAppId.value || '0'}/${activity.largeImageKey}.png')`;
    els.previewImage.textContent = '';
  } else {
    els.previewImage.classList.remove('has-image');
    els.previewImage.style.backgroundImage = '';
    els.previewImage.textContent = 'No Image';
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

  // Status badge
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

// Real-time preview on input
const formInputs = [
  els.fieldDetails, els.fieldState, els.fieldAppId, els.fieldStart, els.fieldEnd,
  els.fieldLargeImage, els.fieldLargeText, els.fieldSmallImage, els.fieldSmallText,
  els.fieldBtn1Label, els.fieldBtn1Url, els.fieldBtn2Label, els.fieldBtn2Url,
];
formInputs.forEach((input) => {
  input.addEventListener('input', () => {
    updatePreview(readForm(), rpcConnected);
  });
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

  // Auto-apply last presence on connect
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

// ---------------------------------------------------------------- profiles
async function loadProfiles() {
  const settings = await wickedRP.getStoredSettings();
  profiles = settings.profiles || [];
  activeProfileId = settings.activeProfile || null;
  els.discordAppId.value = settings.discordAppId || DEFAULT_APP_ID;
  els.settingAppId.value = settings.discordAppId || DEFAULT_APP_ID;
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
        <button class="btn-ghost-sm profile-btn-load" data-id="${profile.id}" title="Load profile">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.34 9.45a.5.5 0 0 1-.832.83l-9.45-3.34a.5.5 0 0 1-.832-.83l3.34-9.45a.5.5 0 0 1 1.664 0l3.34 9.45a.5.5 0 0 1 .832.83z"/></svg>
          Load
        </button>
        <button class="btn-danger-sm profile-btn-delete" data-id="${profile.id}" title="Delete profile">
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
        showToast(`Loaded profile "${profile.name}".`, 'info');
      }
    });
  });

  els.profilesList.querySelectorAll('.profile-btn-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const profile = profiles.find((p) => p.id === id);
      if (!confirm(`Delete profile "${profile ? profile.name : ''}"?`)) return;
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

// ---------------------------------------------------------------- settings
async function loadSettings() {
  const settings = await wickedRP.getStoredSettings();
  els.settingStartOnBoot.checked = !!settings.startOnBoot;
  els.settingMinimizeToTray.checked = settings.minimizeToTray !== false;
  els.settingAppId.value = settings.discordAppId || '';
}

els.btnSaveSettings.addEventListener('click', async () => {
  await saveSettings({
    startOnBoot: els.settingStartOnBoot.checked,
    minimizeToTray: els.settingMinimizeToTray.checked,
    discordAppId: els.settingAppId.value.trim(),
  });
  showToast('Settings saved.', 'success');
});

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
    showView('presence');
    updatePreview(readForm(), rpcConnected);
  } catch (err) {
    console.error('Init error:', err);
    showToast('Failed to initialize: ' + err.message, 'error');
  }
})();

// Expose openUrl for inline onclick handlers
window.wickedRP = wickedRP;
