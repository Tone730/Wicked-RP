/**
 * Wicked RP — renderer process
 * UI logic: presence form, profiles, settings, real-time preview.
 */

const APP_ID_STORAGE_KEY = 'discordAppId';

// ---------------------------------------------------------------- DOM refs
const els = {
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
  btnClear: document.getElementById('btn-clear'),

  // Preview
  previewTitle: document.getElementById('preview-title'),
  previewState: document.getElementById('preview-state'),
  previewTimestamps: document.getElementById('preview-timestamps'),
  previewButtons: document.getElementById('preview-buttons'),
  previewImage: document.getElementById('preview-image'),
  previewLive: document.getElementById('preview-live'),

  // Profiles
  profileName: document.getElementById('profile-name'),
  btnSaveProfile: document.getElementById('btn-save-profile'),
  profilesList: document.getElementById('profiles-list'),
  emptyProfiles: document.getElementById('empty-profiles'),

  // Settings
  settingStartOnBoot: document.getElementById('setting-start-on-boot'),
  settingMinimizeToTray: document.getElementById('setting-minimize-to-tray'),
  btnSaveSettings: document.getElementById('btn-save-settings'),
};

// ---------------------------------------------------------------- state
let profiles = [];
let activeProfileId = null;

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
  els.previewTitle.textContent = activity.details || 'My Activity';
  els.previewState.textContent = activity.state || 'Doing something awesome';

  // Timestamps
  if (activity.startTimestamp) {
    const start = new Date(activity.startTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    els.previewTimestamps.textContent = `Started ${start}`;
    if (activity.endTimestamp) {
      const end = new Date(activity.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      els.previewTimestamps.textContent += ` • Ends ${end}`;
    }
  } else {
    els.previewTimestamps.textContent = '';
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

  // Image
  if (activity.largeImageKey) {
    els.previewImage.innerHTML = `<div class="preview-image-thumb">[IMG: ${activity.largeImageKey}]</div>`;
  } else {
    els.previewImage.innerHTML = '<div class="preview-image-placeholder">No image</div>';
  }

  // Live indicator
  if (connected) {
    els.previewLive.classList.add('live');
    els.previewLive.textContent = '● LIVE';
  } else {
    els.previewLive.classList.remove('live');
    els.previewLive.textContent = '○ OFFLINE';
  }
}

els.btnApply.addEventListener('click', async () => {
  const activity = readForm();
  if (!activity.details) {
    alert('Please enter an activity name.');
    return;
  }
  try {
    await wickedRP.setPresence(activity);
    updatePreview(activity, true);
  } catch (err) {
    alert('Failed to apply presence: ' + err.message);
  }
});

els.btnClear.addEventListener('click', async () => {
  try {
    await wickedRP.clearPresence();
    els.previewTitle.textContent = '—';
    els.previewState.textContent = '—';
    els.previewTimestamps.textContent = '';
    els.previewButtons.innerHTML = '';
    els.previewImage.innerHTML = '<div class="preview-image-placeholder">No image</div>';
    els.previewLive.classList.remove('live');
    els.previewLive.textContent = '○ CLEARED';
  } catch (err) {
    alert('Failed to clear presence: ' + err.message);
  }
});

// Real-time preview on input
const formInputs = [
  els.fieldDetails, els.fieldState, els.fieldStart, els.fieldEnd,
  els.fieldLargeImage, els.fieldLargeText, els.fieldSmallImage, els.fieldSmallText,
  els.fieldBtn1Label, els.fieldBtn1Url, els.fieldBtn2Label, els.fieldBtn2Url,
];
formInputs.forEach((input) => {
  input.addEventListener('input', () => {
    updatePreview(readForm(), els.statusDot.classList.contains('connected'));
  });
});

// ---------------------------------------------------------------- RPC status
wickedRP.onRpcStatus((data) => {
  const connected = !!data.connected;
  els.statusDot.classList.toggle('connected', connected);
  els.statusDot.classList.toggle('disconnected', !connected);
  els.statusText.textContent = connected ? 'Connected to Discord' : 'Disconnected';
  els.btnConnect.style.display = connected ? 'none' : 'inline-block';
  els.btnDisconnect.style.display = connected ? 'inline-block' : 'none';
  updatePreview(readForm(), connected);
});

wickedRP.onRpcError((data) => {
  els.statusText.textContent = 'Error: ' + (data.message || 'Unknown');
  els.statusDot.classList.add('disconnected');
  els.statusDot.classList.remove('connected');
});

wickedRP.onPresenceUpdated((data) => {
  updatePreview(data.activity, true);
});

wickedRP.onPresenceCleared(() => {
  els.previewTitle.textContent = '—';
  els.previewState.textContent = '—';
  els.previewTimestamps.textContent = '';
  els.previewButtons.innerHTML = '';
  els.previewImage.innerHTML = '<div class="preview-image-placeholder">No image</div>';
  els.previewLive.classList.remove('live');
  els.previewLive.textContent = '○ CLEARED';
});

// ---------------------------------------------------------------- connect / disconnect
els.btnConnect.addEventListener('click', async () => {
  const appId = els.discordAppId.value.trim();
  try {
    await wickedRP.connectDiscord(appId);
  } catch (err) {
    alert('Failed to connect: ' + err.message);
  }
});

els.btnDisconnect.addEventListener('click', async () => {
  try {
    await wickedRP.disconnectDiscord();
  } catch (err) {
    alert('Failed to disconnect: ' + err.message);
  }
});

// ---------------------------------------------------------------- profiles
async function loadProfiles() {
  const settings = await wickedRP.getStoredSettings();
  profiles = settings.profiles || [];
  activeProfileId = settings.activeProfile || null;
  els.discordAppId.value = settings.discordAppId || '';
  renderProfiles();
  if (activeProfileId) {
    const profile = profiles.find((p) => p.id === activeProfileId);
    if (profile) {
      writeForm(profile.activity);
      updatePreview(profile.activity, els.statusDot.classList.contains('connected'));
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
        <button class="btn-sm profile-btn-load" data-id="${profile.id}">Load</button>
        <button class="btn-sm profile-btn-delete" data-id="${profile.id}">Delete</button>
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
        updatePreview(profile.activity, els.statusDot.classList.contains('connected'));
        saveSettings({ activeProfile: id });
        renderProfiles();
      }
    });
  });

  els.profilesList.querySelectorAll('.profile-btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (!confirm('Delete this profile?')) return;
      profiles = profiles.filter((p) => p.id !== id);
      if (activeProfileId === id) activeProfileId = null;
      saveSettings({ profiles, activeProfile });
      renderProfiles();
    });
  });
}

els.btnSaveProfile.addEventListener('click', async () => {
  const name = els.profileName.value.trim();
  if (!name) {
    alert('Please enter a profile name.');
    return;
  }
  const activity = readForm();
  if (!activity.details) {
    alert('Please configure an activity first.');
    return;
  }

  const id = 'profile-' + Date.now();
  profiles.push({ id, name, activity, createdAt: Date.now() });
  activeProfileId = id;
  els.profileName.value = '';
  saveSettings({ profiles, activeProfile: id });
  renderProfiles();

  // Switch to presence view so user can see it applied
  showView('presence');
});

// ---------------------------------------------------------------- settings
async function loadSettings() {
  const settings = await wickedRP.getStoredSettings();
  els.settingStartOnBoot.checked = !!settings.startOnBoot;
  els.settingMinimizeToTray.checked = settings.minimizeToTray !== false;
}

els.btnSaveSettings.addEventListener('click', async () => {
  await saveSettings({
    startOnBoot: els.settingStartOnBoot.checked,
    minimizeToTray: els.settingMinimizeToTray.checked,
    discordAppId: els.discordAppId.value.trim(),
  });
  alert('Settings saved.');
});

// ---------------------------------------------------------------- helpers
async function saveSettings(partial) {
  const settings = await wickedRP.getStoredSettings();
  const merged = { ...settings, ...partial };
  await wickedRP.saveSettings(merged);
  if (merged.profiles) profiles = merged.profiles;
  if (merged.activeProfile !== undefined) activeProfileId = merged.activeProfile;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---------------------------------------------------------------- init
(async () => {
  try {
    await loadSettings();
    await loadProfiles();
    showView('presence');
  } catch (err) {
    console.error('Init error:', err);
    alert('Failed to load settings: ' + err.message);
  }
})();

// Expose openUrl for inline onclick handlers
window.wickedRP = wickedRP;
