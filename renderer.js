/**
 * Wicked RP — renderer process (Production v2.2)
 * Full UI logic with in-app guidance, validation, activity types, and expanded features.
 */

const DEFAULT_APP_ID = '1573677093601017927';
const APP_VERSION = '2.3.0';

// ---------------------------------------------------------------- activity types
const ACTIVITY_TYPES = [
  { id: 'playing', name: 'Playing', icon: '🎮', details: 'Gaming', state: 'Playing an epic game' },
  { id: 'streaming', name: 'Streaming', icon: '🔴', details: 'Streaming', state: 'Live on Twitch', url: 'https://twitch.tv/' },
  { id: 'listening', name: 'Listening to Music', icon: '🎵', details: 'Listening to Music', state: 'Favorite playlist' },
  { id: 'watching', name: 'Watching', icon: '📺', details: 'Watching', state: 'Great movie' },
  { id: 'competing', name: 'Competing', icon: '🏆', details: 'Competing', state: 'Ranked match' },
];

// ---------------------------------------------------------------- translations (i18n)
const TRANSLATIONS = {
  en: {
    appName: 'Wicked RP',
    appTag: 'Discord Rich Presence',
    presence: 'Presence',
    media: 'Media Manager',
    profiles: 'Profiles',
    settings: 'Settings',
    connected: 'Connected to Discord',
    disconnected: 'Disconnected',
    connect: 'Connect',
    disconnect: 'Disconnect',
    appIdLabel: 'Application ID',
    appIdPlaceholder: 'e.g. 1573677093601017927',
    appIdCopyHint: 'Copy to clipboard',
    devPortalBtn: 'Dev Portal',
    devPortalTitle: 'Open Discord Developer Portal',
    devPortalDesc: 'Create your Discord application and upload custom images here.',
    activityType: 'Activity Type',
    activityName: 'Activity Name',
    activityNameReq: '*',
    details: 'Details',
    detailsPlaceholder: 'What are you doing?',
    overrideAppId: 'Override App ID',
    startTime: 'Start Time (Unix seconds)',
    startTimeHint: 'Leave blank to start now',
    endTime: 'End Time (Unix seconds)',
    endTimeHint: 'Shows a countdown when set',
    largeImageKey: 'Large Image Key',
    largeImageHint: 'Select from Media Manager or enter Discord asset key',
    largeImageText: 'Large Image Hover Text',
    smallImageKey: 'Small Image Key',
    smallImageHint: 'Small badge on the corner',
    smallImageText: 'Small Image Hover Text',
    button1Label: 'Button 1 Label',
    button1Url: 'Button 1 URL',
    button2Label: 'Button 2 Label',
    button2Url: 'Button 2 URL',
    partySize: 'Party Size',
    partyMax: 'Party Max',
    matchSecret: 'Match Secret',
    joinSecret: 'Join Secret',
    spectateSecret: 'Spectate Secret',
    applyPresence: 'Apply Presence',
    clearPresence: 'Clear Presence',
    clearAll: 'Clear All Fields',
    quickPresets: 'Quick Presets',
    applyPreset: 'Apply Preset',
    livePreview: 'Live Preview',
    online: '● Online',
    offline: '● Offline',
    saveProfile: 'Save Profile',
    newProfile: 'New Profile',
    profileNamePlaceholder: 'Enter profile name...',
    load: 'Load',
    delete: 'Delete',
    deleteConfirm: 'Delete this profile?',
    profileSaved: 'Profile saved.',
    profileLoaded: 'Profile loaded.',
    startOnBoot: 'Start on Windows Login',
    startOnBootDesc: 'Launch Wicked RP automatically when you log into Windows.',
    minimizeToTray: 'Minimize to Tray',
    minimizeToTrayDesc: 'Keep Wicked RP running in the system tray when you close the window.',
    autoApply: 'Auto-apply on Startup',
    autoApplyDesc: 'Restore your last presence when Wicked RP starts.',
    defaultAppId: 'Default Application ID',
    defaultAppIdDesc: 'Create one at the Discord Developer Portal. Custom images require a verified app.',
    language: 'Language',
    appearance: 'Appearance',
    comingSoon: 'Coming Soon',
    comingSoonDesc: 'Music bot status, server events, preset scheduler, cloud sync, and game auto-detection planned for v2.3.',
    uploadMedia: 'Upload Image/Video',
    uploadHint: 'JPG, PNG, GIF, WebP, MP4, WebM — max 25MB each',
    allMedia: 'All Media',
    imagesOnly: 'Images Only',
    videosOnly: 'Videos Only',
    useSelectedImage: 'Use Selected Image',
    noMedia: 'No media yet',
    noMediaDesc: 'Upload images or videos to use in your presence.',
    about: 'About Wicked RP',
    help: 'Help & Manual',
    discordServer: 'Discord Server',
    github: 'GitHub',
    version: 'v2.2.0',
    settingsSaved: 'Settings saved.',
    presenceApplied: 'Presence applied to Discord.',
    presenceCleared: 'Presence cleared.',
    presenceRestored: 'Last presence restored.',
    presenceUpdated: 'Presence updated.',
    pleaseEnterActivity: 'Please enter an activity name.',
    pleaseConfigureActivity: 'Please configure an activity first.',
    enterProfileName: 'Please enter a profile name.',
    failedToConnect: 'Failed to connect:',
    failedToDisconnect: 'Failed to disconnect:',
    failedToInitialize: 'Failed to initialize:',
    mediaDeleted: 'Media deleted.',
    mediaUploaded: 'Media uploaded successfully.',
    aboutTitle: 'About Wicked RP',
    aboutDesc: 'A modern, customizable Discord Rich Presence manager. Rebranded remake of Custom RP.',
    aboutVersion: 'Version 2.2.0',
    aboutAuthor: 'Wicked Development',
    aboutLicense: 'MIT License',
    aboutDiscord: 'Built with Electron and discord-rpc',
    helpTitle: 'Help & Manual',
    helpShortcuts: 'Keyboard Shortcuts',
    shortcutApply: 'Ctrl + Enter — Apply Presence',
    shortcutClear: 'Esc — Clear Presence',
    shortcutHelp: 'F1 — Open Help',
    shortcutMedia: 'Ctrl + O — Open Media Manager',
    shortcutSave: 'Ctrl + S — Save Profile',
    helpSetup: 'Setup Guide',
    helpSetup1: '1. Create a Discord Application at https://discord.com/developers/applications',
    helpSetup2: '2. Copy the Application ID and paste it into Wicked RP',
    helpSetup3: '3. Click Connect (make sure Discord desktop is running)',
    helpSetup4: '4. Configure your presence and click Apply Presence',
    helpImages: 'Custom Images',
    helpImages1: 'Images require uploading to Discord Developer Portal → Rich Presence → Art Assets',
    helpImages2: 'Copy the asset Name into the Image Key field in Wicked RP',
    exportProfiles: 'Export Profiles',
    importProfiles: 'Import Profiles',
    exportSuccess: 'Profiles exported successfully.',
    importSuccess: 'Profiles imported successfully.',
    importInvalid: 'Invalid import file.',
    skip: 'Skip',
    next: 'Next',
    finish: 'Finish',
    general: 'General',
    discord: 'Discord',
    playing: 'Playing',
    somethingAwesome: 'Something awesome',
    welcomeTitle: 'Welcome to Wicked RP',
    welcomeDesc: 'Let\'s set up your Discord Rich Presence in just a few steps.',
    step1Title: 'Connect to Discord',
    step1Desc: 'Enter your Discord Application ID to connect.',
    step1Hint: 'Get your Application ID at the Discord Developer Portal.',
    step2Title: 'Choose Your Activity',
    step2Desc: 'Pick what you\'re doing and customize how it appears on Discord.',
    step3Title: 'You\'re Ready!',
    step3Desc: 'Wicked RP is configured. Your presence will auto-restore on startup.',
    gettingStarted: 'Getting Started',
    gettingStartedDesc: 'New to Wicked RP? Follow the steps below to set up your first presence.',
    step: 'Step',
    of: 'of',
    invalidAppId: 'Please enter a valid Application ID (18-19 digits).',
    invalidStartTime: 'Please enter a valid start time (Unix seconds).',
    invalidEndTime: 'Please enter a valid end time (Unix seconds).',
    endBeforeStart: 'End time must be after start time.',
    copySuccess: 'Copied to clipboard!',
    discordNotRunning: 'Discord desktop is not running. Please start Discord first.',
    testConnection: 'Test Connection',
    testing: 'Testing...',
    connectionTested: 'Connection successful!',
    activityTypes: {
      playing: 'Playing',
      streaming: 'Streaming',
      listening: 'Listening to Music',
      watching: 'Watching',
      competing: 'Competing',
    },
  },
  es: {
    appName: 'Wicked RP',
    appTag: 'Presencia de Discord',
    presence: 'Presencia',
    media: 'Gestor de Medios',
    profiles: 'Perfiles',
    settings: 'Configuración',
    connected: 'Conectado a Discord',
    disconnected: 'Desconectado',
    connect: 'Conectar',
    disconnect: 'Desconectar',
    appIdLabel: 'ID de Aplicación',
    appIdPlaceholder: 'ej. 1573677093601017927',
    appIdCopyHint: 'Copiar al portapapeles',
    devPortalBtn: 'Portal Dev',
    devPortalTitle: 'Abrir Portal para Desarrolladores de Discord',
    devPortalDesc: 'Crea tu aplicación de Discord y sube imágenes personalizadas aquí.',
    activityType: 'Tipo de Actividad',
    activityName: 'Nombre de Actividad',
    activityNameReq: '*',
    details: 'Detalles',
    detailsPlaceholder: '¿Qué estás haciendo?',
    overrideAppId: 'Anular ID de App',
    startTime: 'Hora de Inicio (segundos Unix)',
    startTimeHint: 'Deja en blanco para comenzar ahora',
    endTime: 'Hora de Fin (segundos Unix)',
    endTimeHint: 'Muestra una cuenta regresiva cuando se configura',
    largeImageKey: 'Clave de Imagen Grande',
    largeImageHint: 'Selecciona del Gestor de Medios o ingresa una clave de activo de Discord.',
    largeImageText: 'Texto de Imagen Grande (al pasar el mouse)',
    smallImageKey: 'Clave de Imagen Pequeña',
    smallImageHint: 'Insignia pequeña en la esquina',
    smallImageText: 'Texto de Imagen Pequeña',
    button1Label: 'Etiqueta de Botón 1',
    button1Url: 'URL de Botón 1',
    button2Label: 'Etiqueta de Botón 2',
    button2Url: 'URL de Botón 2',
    partySize: 'Tamaño del Grupo',
    partyMax: 'Máximo del Grupo',
    matchSecret: 'Clave de Partido',
    joinSecret: 'Clave de Unión',
    spectateSecret: 'Clave de Espectador',
    applyPresence: 'Aplicar Presencia',
    clearPresence: 'Limpiar Presencia',
    clearAll: 'Limpiar Todos los Campos',
    quickPresets: 'Ajustes Rápidos',
    applyPreset: 'Aplicar Ajuste',
    livePreview: 'Vista Previa en Vivo',
    online: '● En Línea',
    offline: '● Desconectado',
    saveProfile: 'Guardar Perfil',
    newProfile: 'Nuevo Perfil',
    profileNamePlaceholder: 'Ingresa el nombre del perfil...',
    load: 'Cargar',
    delete: 'Eliminar',
    deleteConfirm: '¿Eliminar este perfil?',
    profileSaved: 'Perfil guardado.',
    profileLoaded: 'Perfil cargado.',
    startOnBoot: 'Iniciar al Iniciar Sesión de Windows',
    startOnBootDesc: 'Inicia Wicked RP automáticamente al iniciar sesión en Windows.',
    minimizeToTray: 'Minimizar a la Bandeja',
    minimizeToTrayDesc: 'Mantén Wicked RP ejecutándose en la bandeja del sistema al cerrar la ventana.',
    autoApply: 'Aplicar automáticamente al Inicio',
    autoApplyDesc: 'Restaura tu última presencia al iniciar Wicked RP.',
    defaultAppId: 'ID de Aplicación Predeterminada',
    defaultAppIdDesc: 'Crea uno en el Portal para Desarrolladores de Discord. Las imágenes personalizadas requieren una aplicación verificada.',
    language: 'Idioma',
    appearance: 'Apariencia',
    comingSoon: 'Próximamente',
    comingSoonDesc: 'Estado de bot de música, eventos de servidor, programador de ajustes, sincronización en la nube y detección automática de juegos planeados para v2.3.',
    uploadMedia: 'Subir Imagen/Video',
    uploadHint: 'JPG, PNG, GIF, WebP, MP4, WebM — máximo 25MB cada uno',
    allMedia: 'Todos los Medios',
    imagesOnly: 'Solo Imágenes',
    videosOnly: 'Solo Videos',
    useSelectedImage: 'Usar Imagen Seleccionada',
    noMedia: 'Sin medios aún',
    noMediaDesc: 'Sube imágenes o videos para usar en tu presencia.',
    about: 'Acerca de Wicked RP',
    help: 'Ayuda y Manual',
    discordServer: 'Servidor de Discord',
    github: 'GitHub',
    version: 'v2.2.0',
    settingsSaved: 'Configuración guardada.',
    presenceApplied: 'Presencia aplicada a Discord.',
    presenceCleared: 'Presencia limpiada.',
    presenceRestored: 'Última presencia restaurada.',
    presenceUpdated: 'Presencia actualizada.',
    pleaseEnterActivity: 'Por favor ingresa un nombre de actividad.',
    pleaseConfigureActivity: 'Por favor configura una actividad primero.',
    enterProfileName: 'Por favor ingresa un nombre de perfil.',
    failedToConnect: 'Error al conectar:',
    failedToDisconnect: 'Error al desconectar:',
    failedToInitialize: 'Error al inicializar:',
    mediaDeleted: 'Medio eliminado.',
    mediaUploaded: 'Medio subido correctamente.',
    aboutTitle: 'Acerca de Wicked RP',
    aboutDesc: 'Un gestor moderno y personalizable de Presencia de Discord. Remake rebranding de Custom RP.',
    aboutVersion: 'Versión 2.2.0',
    aboutAuthor: 'Wicked Development',
    aboutLicense: 'Licencia MIT',
    aboutDiscord: 'Construido con Electron y discord-rpc',
    helpTitle: 'Ayuda y Manual',
    helpShortcuts: 'Atajos de Teclado',
    shortcutApply: 'Ctrl + Enter — Aplicar Presencia',
    shortcutClear: 'Esc — Limpiar Presencia',
    shortcutHelp: 'F1 — Abrir Ayuda',
    shortcutMedia: 'Ctrl + O — Abrir Gestor de Medios',
    shortcutSave: 'Ctrl + S — Guardar Perfil',
    helpSetup: 'Guía de Configuración',
    helpSetup1: '1. Crea una Aplicación de Discord en https://discord.com/developers/applications',
    helpSetup2: '2. Copia el ID de Aplicación y pégalo en Wicked RP',
    helpSetup3: '3. Haz clic en Conectar (asegúrate de que Discord de escritorio esté ejecutándose)',
    helpSetup4: '4. Configura tu presencia y haz clic en Aplicar Presencia',
    helpImages: 'Imágenes Personalizadas',
    helpImages1: 'Las imágenes requieren subirse a Portal para Desarrolladores de Discord → Presencia de Discord → Recursos de Arte',
    helpImages2: 'Copia el Nombre del recurso en el campo Clave de Imagen en Wicked RP',
    exportProfiles: 'Exportar Perfiles',
    importProfiles: 'Importar Perfiles',
    exportSuccess: 'Perfiles exportados correctamente.',
    importSuccess: 'Perfiles importados correctamente.',
    importInvalid: 'Archivo de importación inválido.',
    skip: 'Saltar',
    next: 'Siguiente',
    finish: 'Finalizar',
    general: 'General',
    discord: 'Discord',
    playing: 'Jugando',
    somethingAwesome: 'Haciendo algo increíble',
    welcomeTitle: 'Bienvenido a Wicked RP',
    welcomeDesc: 'Configuraremos tu Presencia de Discord en pocos pasos.',
    step1Title: 'Conectar a Discord',
    step1Desc: 'Ingresa tu ID de Aplicación de Discord para conectarte.',
    step1Hint: 'Obtén tu ID de Aplicación en el Portal para Desarrolladores de Discord.',
    step2Title: 'Elige tu Actividad',
    step2Desc: 'Elige qué estás haciendo y personaliza cómo aparece en Discord.',
    step3Title: '¡Listo!',
    step3Desc: 'Wicked RP está configurado. Tu presencia se restaurará automáticamente al iniciar.',
    gettingStarted: 'Comenzando',
    gettingStartedDesc: '¿Nuevo en Wicked RP? Sigue los pasos a continuación para configurar tu primera presencia.',
    step: 'Paso',
    of: 'de',
    invalidAppId: 'Ingresa un ID de Aplicación válido (18-19 dígitos).',
    invalidStartTime: 'Ingresa una hora de inicio válida (segundos Unix).',
    invalidEndTime: 'Ingresa una hora de fin válida (segundos Unix).',
    endBeforeStart: 'La hora de fin debe ser después de la hora de inicio.',
    copySuccess: '¡Copiado al portapapeles!',
    discordNotRunning: 'Discord de escritorio no está en ejecución. Inicia Discord primero.',
    testConnection: 'Probar Conexión',
    testing: 'Probando...',
    connectionTested: '¡Conexión exitosa!',
    activityTypes: {
      playing: 'Jugando',
      streaming: 'Transmitiendo',
      listening: 'Escuchando Música',
      watching: 'Viendo',
      competing: 'Competiendo',
    },
  },
  fr: {
    appName: 'Wicked RP',
    appTag: 'Présence Discord',
    presence: 'Présence',
    media: 'Gestionnaire de Média',
    profiles: 'Profils',
    settings: 'Paramètres',
    connected: 'Connecté à Discord',
    disconnected: 'Déconnecté',
    connect: 'Connecter',
    disconnect: 'Déconnecter',
    appIdLabel: 'ID Application',
    appIdPlaceholder: 'ex. 1573677093601017927',
    appIdCopyHint: 'Copier dans le presse-papiers',
    devPortalBtn: 'Portail Dev',
    devPortalTitle: 'Ouvrir le Portail Développeur Discord',
    devPortalDesc: 'Créez votre application Discord et uploadez des images personnalisées ici.',
    activityType: 'Type d\'Activité',
    activityName: 'Nom d\'Activité',
    activityNameReq: '*',
    details: 'Détails',
    detailsPlaceholder: 'Que faites-vous ?',
    overrideAppId: 'Remplacer ID App',
    startTime: 'Heure de Début (secondes Unix)',
    startTimeHint: 'Laissez vide pour commencer maintenant',
    endTime: 'Heure de Fin (secondes Unix)',
    endTimeHint: 'Affiche un compte à rebours quand défini',
    largeImageKey: 'Clé Image Grande',
    largeImageHint: 'Sélectionnez depuis le Gestionnaire de Média ou entrez une clé d\'asset Discord.',
    largeImageText: 'Texte Image Grande (survol)',
    smallImageKey: 'Clé Image Petite',
    smallImageHint: 'Petit badge dans le coin',
    smallImageText: 'Texte Image Petite',
    button1Label: 'Libellé Bouton 1',
    button1Url: 'URL Bouton 1',
    button2Label: 'Libellé Bouton 2',
    button2Url: 'URL Bouton 2',
    partySize: 'Taille Groupe',
    partyMax: 'Max Groupe',
    matchSecret: 'Clé Match',
    joinSecret: 'Clé Rejoindre',
    spectateSecret: 'Clé Spectateur',
    applyPresence: 'Appliquer Présence',
    clearPresence: 'Effacer Présence',
    clearAll: 'Effacer Tous les Champs',
    quickPresets: 'Préréglages Rapides',
    applyPreset: 'Appliquer Préréglage',
    livePreview: 'Aperçu en Direct',
    online: '● En Ligne',
    offline: '● Déconnecté',
    saveProfile: 'Enregistrer Profil',
    newProfile: 'Nouveau Profil',
    profileNamePlaceholder: 'Entrez le nom du profil...',
    load: 'Charger',
    delete: 'Supprimer',
    deleteConfirm: 'Supprimer ce profil ?',
    profileSaved: 'Profil enregistré.',
    profileLoaded: 'Profil chargé.',
    startOnBoot: 'Lancer au Démarrage Windows',
    startOnBootDesc: 'Lance Wicked RP automatiquement à l\'ouverture de session Windows.',
    minimizeToTray: 'Réduire dans le Plateau',
    minimizeToTrayDesc: 'Garde Wicked RP en cours d\'exécution dans le plateau système quand vous fermez la fenêtre.',
    autoApply: 'Appliquer automatiquement au Démarrage',
    autoApplyDesc: 'Restaure votre dernière présence au démarrage de Wicked RP.',
    defaultAppId: 'ID Application Par Défaut',
    defaultAppIdDesc: 'Créez-en un sur le Portail Développeur Discord. Les images personnalisées nécessitent une application vérifiée.',
    language: 'Langue',
    appearance: 'Apparence',
    comingSoon: 'Bientôt',
    comingSoonDesc: 'État du bot musique, événements serveur, planificateur de préréglages, synchronisation cloud et détection automatique de jeux prévus pour v2.3.',
    uploadMedia: 'Télécharger Image/Vidéo',
    uploadHint: 'JPG, PNG, GIF, WebP, MP4, WebM — max 25Mo chacun',
    allMedia: 'Tous les Médias',
    imagesOnly: 'Images Seulement',
    videosOnly: 'Vidéos Seulement',
    useSelectedImage: 'Utiliser Image Sélectionnée',
    noMedia: 'Aucun média',
    noMediaDesc: 'Téléchargez des images ou vidéos à utiliser dans votre présence.',
    about: 'À propos de Wicked RP',
    help: 'Aide & Manuel',
    discordServer: 'Serveur Discord',
    github: 'GitHub',
    version: 'v2.2.0',
    settingsSaved: 'Paramètres enregistrés.',
    presenceApplied: 'Présence appliquée à Discord.',
    presenceCleared: 'Présence effacée.',
    presenceRestored: 'Dernière présence restaurée.',
    presenceUpdated: 'Présence mise à jour.',
    pleaseEnterActivity: 'Veuillez entrer un nom d\'activité.',
    pleaseConfigureActivity: 'Veuillez configurer une activité d\'abord.',
    enterProfileName: 'Veuillez entrer un nom de profil.',
    failedToConnect: 'Échec de connexion :',
    failedToDisconnect: 'Échec de déconnexion :',
    failedToInitialize: 'Échec d\'initialisation :',
    mediaDeleted: 'Média supprimé.',
    mediaUploaded: 'Média téléchargé avec succès.',
    aboutTitle: 'À propos de Wicked RP',
    aboutDesc: 'Un gestionnaire moderne et personnalisable de Présence Discord. Remake rebrandé de Custom RP.',
    aboutVersion: 'Version 2.2.0',
    aboutAuthor: 'Wicked Development',
    aboutLicense: 'Licence MIT',
    aboutDiscord: 'Construit avec Electron et discord-rpc',
    helpTitle: 'Aide & Manuel',
    helpShortcuts: 'Raccourcis Clavier',
    shortcutApply: 'Ctrl + Entrée — Appliquer Présence',
    shortcutClear: 'Eff — Effacer Présence',
    shortcutHelp: 'F1 — Ouvrir l\'Aide',
    shortcutMedia: 'Ctrl + O — Ouvrir Gestionnaire de Média',
    shortcutSave: 'Ctrl + S — Enregistrer Profil',
    helpSetup: 'Guide de Configuration',
    helpSetup1: '1. Créez une Application Discord sur https://discord.com/developers/applications',
    helpSetup2: '2. Copiez l\'ID Application et collez-le dans Wicked RP',
    helpSetup3: '3. Cliquez sur Connecter (assurez-vous que Discord bureau est en cours)',
    helpSetup4: '4. Configurez votre présence et cliquez sur Appliquer Présence',
    helpImages: 'Images Personnalisées',
    helpImages1: 'Les images nécessitent un téléchargement sur Portail Développeur Discord → Présence Discord → Assets Artistiques',
    helpImages2: 'Copiez le Nom de l\'asset dans le champ Clé Image de Wicked RP',
    exportProfiles: 'Exporter Profils',
    importProfiles: 'Importer Profils',
    exportSuccess: 'Profils exportés avec succès.',
    importSuccess: 'Profils importés avec succès.',
    importInvalid: 'Fichier d\'importation invalide.',
    skip: 'Passer',
    next: 'Suivant',
    finish: 'Terminer',
    general: 'Général',
    discord: 'Discord',
    playing: 'En train de jouer',
    somethingAwesome: 'Faisant quelque chose d\'incroyable',
    welcomeTitle: 'Bienvenue sur Wicked RP',
    welcomeDesc: 'Configurons votre Présence Discord en quelques étapes.',
    step1Title: 'Se connecter à Discord',
    step1Desc: 'Entrez votre ID Application Discord pour vous connecter.',
    step1Hint: 'Obtenez votre ID Application sur le Portail Développeur Discord.',
    step2Title: 'Choisissez votre Activité',
    step2Desc: 'Choisissez ce que vous faites et personnalisez son apparence sur Discord.',
    step3Title: 'C\'est prêt !',
    step3Desc: 'Wicked RP est configuré. Votre présence se restaurera automatiquement au démarrage.',
    gettingStarted: 'Bien démarrer',
    gettingStartedDesc: 'Nouveau sur Wicked RP ? Suivez les étapes ci-dessous pour configurer votre première présence.',
    step: 'Étape',
    of: 'sur',
    invalidAppId: 'Veuillez entrer un ID Application valide (18-19 chiffres).',
    invalidStartTime: 'Veuillez entrer une heure de début valide (secondes Unix).',
    invalidEndTime: 'Veuillez entrer une heure de fin valide (secondes Unix).',
    endBeforeStart: 'L\'heure de fin doit être après l\'heure de début.',
    copySuccess: 'Copié dans le presse-papiers !',
    discordNotRunning: 'Discord bureau n\'est pas en cours d\'exécution. Lancez Discord d\'abord.',
    testConnection: 'Tester la Connexion',
    testing: 'Test en cours...',
    connectionTested: 'Connexion réussie !',
    activityTypes: {
      playing: 'En train de jouer',
      streaming: 'En streaming',
      listening: 'En train d\'écouter de la musique',
      watching: 'En train de regarder',
      competing: 'En compétition',
    },
  },
  de: {
    appName: 'Wicked RP',
    appTag: 'Discord Anwesenheit',
    presence: 'Anwesenheit',
    media: 'Medien-Manager',
    profiles: 'Profile',
    settings: 'Einstellungen',
    connected: 'Mit Discord verbunden',
    disconnected: 'Getrennt',
    connect: 'Verbinden',
    disconnect: 'Trennen',
    appIdLabel: 'Anwendungs-ID',
    appIdPlaceholder: 'z. B. 1573677093601017927',
    appIdCopyHint: 'In Zwischenkopiere',
    devPortalBtn: 'Dev-Portal',
    devPortalTitle: 'Discord-Entwicklerportal öffnen',
    devPortalDesc: 'Erstelle deine Discord-Anwendung und lade benutzerdefinierte Bilder hier hoch.',
    activityType: 'Aktivitätstyp',
    activityName: 'Aktivitätsname',
    activityNameReq: '*',
    details: 'Details',
    detailsPlaceholder: 'Was machst du?',
    overrideAppId: 'App-ID überschreiben',
    startTime: 'Startzeit (Unix-Sekunden)',
    startTimeHint: 'Leer lassen, um jetzt zu starten',
    endTime: 'Endzeit (Unix-Sekunden)',
    endTimeHint: 'Zeigt einen Countdown an, wenn gesetzt',
    largeImageKey: 'Großer Bildschlüssel',
    largeImageHint: 'Aus Medien-Manager auswählen oder Discord-Asset-Schlüssel eingeben.',
    largeImageText: 'Großes Bild-Hover-Text',
    smallImageKey: 'Kleiner Bildschlüssel',
    smallImageHint: 'Kleines Abzeichen in der Ecke',
    smallImageText: 'Kleines Bild-Hover-Text',
    button1Label: 'Beschriftung Schaltfläche 1',
    button1Url: 'URL Schaltfläche 1',
    button2Label: 'Beschriftung Schaltfläche 2',
    button2Url: 'URL Schaltfläche 2',
    partySize: 'Gruppengröße',
    partyMax: 'Gruppen-Maximum',
    matchSecret: 'Match-Geheimnis',
    joinSecret: 'Beitreten-Geheimnis',
    spectateSecret: 'Zuschauen-Geheimnis',
    applyPresence: 'Anwesenheit anwenden',
    clearPresence: 'Anwesenheit löschen',
    clearAll: 'Alle Felder löschen',
    quickPresets: 'Schnellvoreinstellungen',
    applyPreset: 'Voreinstellung anwenden',
    livePreview: 'Live-Vorschau',
    online: '● Online',
    offline: '● Offline',
    saveProfile: 'Profil speichern',
    newProfile: 'Neues Profil',
    profileNamePlaceholder: 'Profilnamen eingeben...',
    load: 'Laden',
    delete: 'Löschen',
    deleteConfirm: 'Dieses Profil löschen?',
    profileSaved: 'Profil gespeichert.',
    profileLoaded: 'Profil geladen.',
    startOnBoot: 'Beim Windows-Login starten',
    startOnBootDesc: 'Wicked RP automatisch starten, wenn du dich bei Windows anmeldest.',
    minimizeToTray: 'In die Leiste minimieren',
    minimizeToTrayDesc: 'Wicked RP im System-Tray laufen lassen, wenn du das Fenster schließt.',
    autoApply: 'Beim Start automatisch anwenden',
    autoApplyDesc: 'Letzte Anwesenheit beim Start von Wicked RP wiederherstellen.',
    defaultAppId: 'Standard-Anwendungs-ID',
    defaultAppIdDesc: 'Erstelle eine im Discord-Entwicklerportal. Benutzerdefinierte Bilder erfordern eine verifizierte App.',
    language: 'Sprache',
    appearance: 'Erscheinungsbild',
    comingSoon: 'Demnächst',
    comingSoonDesc: 'Musik-Bot-Status, Server-Events, Voreinigstellungsplaner, Cloud-Sync und Spielerkennung geplant für v2.3.',
    uploadMedia: 'Bild/Video hochladen',
    uploadHint: 'JPG, PNG, GIF, WebP, MP4, WebM — max. 25MB pro Datei',
    allMedia: 'Alle Medien',
    imagesOnly: 'Nur Bilder',
    videosOnly: 'Nur Videos',
    useSelectedImage: 'Ausgewähltes Bild verwenden',
    noMedia: 'Noch keine Medien',
    noMediaDesc: 'Lade Bilder oder Videos hoch, um sie in deiner Anwesenheit zu verwenden.',
    about: 'Über Wicked RP',
    help: 'Hilfe & Handbuch',
    discordServer: 'Discord-Server',
    github: 'GitHub',
    version: 'v2.2.0',
    settingsSaved: 'Einstellungen gespeichert.',
    presenceApplied: 'Anwesenheit auf Discord angewendet.',
    presenceCleared: 'Anwesenheit gelöscht.',
    presenceRestored: 'Letzte Anwesenheit wiederhergestellt.',
    presenceUpdated: 'Anwesenheit aktualisiert.',
    pleaseEnterActivity: 'Bitte gib einen Aktivitätsnamen ein.',
    pleaseConfigureActivity: 'Bitte konfiguriere zuerst eine Aktivität.',
    enterProfileName: 'Bitte gib einen Profilnamen ein.',
    failedToConnect: 'Verbindung fehlgeschlagen:',
    failedToDisconnect: 'Trennen fehlgeschlagen:',
    failedToInitialize: 'Initialisierung fehlgeschlagen:',
    mediaDeleted: 'Medium gelöscht.',
    mediaUploaded: 'Medium erfolgreich hochgeladen.',
    aboutTitle: 'Über Wicked RP',
    aboutDesc: 'Ein moderner, anpassbarer Discord-Anwesenheitsmanager. Rebranding-Neuauflage von Custom RP.',
    aboutVersion: 'Version 2.2.0',
    aboutAuthor: 'Wicked Development',
    aboutLicense: 'MIT-Lizenz',
    aboutDiscord: 'Erstellt mit Electron und discord-rpc',
    helpTitle: 'Hilfe & Handbuch',
    helpShortcuts: 'Tastaturkürzel',
    shortcutApply: 'Strg + Enter — Anwesenheit anwenden',
    shortcutClear: 'Esc — Anwesenheit löschen',
    shortcutHelp: 'F1 — Hilfe öffnen',
    shortcutMedia: 'Strg + O — Medien-Manager öffnen',
    shortcutSave: 'Strg + S — Profil speichern',
    helpSetup: 'Einrichtungsanleitung',
    helpSetup1: '1. Erstelle eine Discord-Anwendung unter https://discord.com/developers/applications',
    helpSetup2: '2. Kopiere die Anwendungs-ID und füge sie in Wicked RP ein',
    helpSetup3: '3. Klicke auf Verbinden (stelle sicher, dass Discord Desktop läuft)',
    helpSetup4: '4. Konfiguriere deine Anwesenheit und klicke auf Anwesenheit anwenden',
    helpImages: 'Benutzerdefinierte Bilder',
    helpImages1: 'Bilder erfordern Upload im Discord-Entwicklerportal → Anwesenheit → Bild-Assets',
    helpImages2: 'Kopiere den Asset-Namen in das Feld Bildschlüssel in Wicked RP',
    exportProfiles: 'Profile exportieren',
    importProfiles: 'Profile importieren',
    exportSuccess: 'Profile erfolgreich exportiert.',
    importSuccess: 'Profile erfolgreich importiert.',
    importInvalid: 'Ungültige Importdatei.',
    skip: 'Überspringen',
    next: 'Weiter',
    finish: 'Fertigstellen',
    general: 'Allgemein',
    discord: 'Discord',
    playing: 'Spielt',
    somethingAwesome: 'Macht etwas Tolles',
    welcomeTitle: 'Willkommen bei Wicked RP',
    welcomeDesc: 'Richten wir deine Discord-Anwesenheit in wenigen Schritten ein.',
    step1Title: 'Mit Discord verbinden',
    step1Desc: 'Gib deine Discord-Anwendungs-ID ein, um dich zu verbinden.',
    step1Hint: 'Erhalte deine Anwendungs-ID im Discord-Entwicklerportal.',
    step2Title: 'Aktivität wählen',
    step2Desc: 'Wähle aus, was du tust, und passe an, wie es auf Discord erscheint.',
    step3Title: 'Fertig!',
    step3Desc: 'Wicked RP ist konfiguriert. Deine Anwesenheit wird beim Start automatisch wiederhergestellt.',
    gettingStarted: 'Erste Schritte',
    gettingStartedDesc: 'Neu bei Wicked RP? Folge den unten stehenden Schritten, um deine erste Präsenz zu konfigurieren.',
    step: 'Schritt',
    of: 'von',
    invalidAppId: 'Bitte gib eine gültige Anwendungs-ID ein (18-19 Ziffern).',
    invalidStartTime: 'Bitte gib eine gültige Startzeit ein (Unix-Sekunden).',
    invalidEndTime: 'Bitte gib eine gültige Endzeit ein (Unix-Sekunden).',
    endBeforeStart: 'Die Endzeit muss nach der Startzeit liegen.',
    copySuccess: 'In Zwischenkopiere!',
    discordNotRunning: 'Discord-Desktop wird nicht ausgeführt. Starte Discord zuerst.',
    testConnection: 'Verbindung testen',
    testing: 'Verbindung wird getestet...',
    connectionTested: 'Verbindung erfolgreich!',
    activityTypes: {
      playing: 'Spielt',
      streaming: 'Streamt',
      listening: 'Hört Musik',
      watching: 'Schaut',
      competing: 'Wettstreitet',
    },
  },
};

// ---------------------------------------------------------------- i18n state
let currentLang = 'en';
function t(key) {
  return TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]
    ? TRANSLATIONS[currentLang][key]
    : TRANSLATIONS.en[key] || key;
}

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  applyTranslations();
  showToast(t('settingsSaved'), 'info');
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });
  document.title = `${t('appName')} — ${t('appTag')}`;
}

// ---------------------------------------------------------------- DOM refs
const els = {
  // Sidebar
  statusDot: document.getElementById('status-dot'),
  statusText: document.getElementById('status-text'),
  discordAppId: document.getElementById('discord-app-id'),
  btnConnect: document.getElementById('btn-connect'),
  btnDisconnect: document.getElementById('btn-disconnect'),
  btnReconnect: document.getElementById('btn-reconnect'),
  btnCopyAppId: document.getElementById('btn-copy-app-id'),
  btnDevPortal: document.getElementById('btn-dev-portal'),
  btnTestConnection: document.getElementById('btn-test-connection'),
  btnCopyImageKey: document.getElementById('btn-copy-image-key'),
  mediaSearch: document.getElementById('media-search'),
  profileSearch: document.getElementById('profile-search'),
  btnClearAll: document.getElementById('btn-clear-all'),
  navItems: document.querySelectorAll('.nav-item'),
  views: document.querySelectorAll('.view'),

  // Presence form
  activityTypeSelect: document.getElementById('activity-type-select'),
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
  btnExportProfiles: document.getElementById('btn-export-profiles'),
  btnImportProfiles: document.getElementById('btn-import-profiles'),
  importFile: document.getElementById('import-file'),

  // Settings
  settingStartOnBoot: document.getElementById('setting-start-on-boot'),
  settingMinimizeToTray: document.getElementById('setting-minimize-to-tray'),
  settingAutoApply: document.getElementById('setting-auto-apply'),
  settingAppId: document.getElementById('setting-app-id'),
  settingLang: document.getElementById('setting-lang'),
  settingTheme: document.getElementById('setting-theme'),
  btnSaveSettings: document.getElementById('btn-save-settings'),
  themeCards: document.querySelectorAll('.theme-card'),

  // Modals
  aboutModal: document.getElementById('about-modal'),
  helpModal: document.getElementById('help-modal'),
  firstRunModal: document.getElementById('first-run-modal'),
  btnAbout: document.getElementById('btn-about'),
  btnHelp: document.getElementById('btn-help'),
  btnCloseAbout: document.getElementById('btn-close-about'),
  btnCloseHelp: document.getElementById('btn-close-help'),
  btnCloseFirstRun: document.getElementById('btn-close-first-run'),
  btnFirstRunNext: document.getElementById('btn-first-run-next'),
  btnFirstRunSkip: document.getElementById('btn-first-run-skip'),
  firstRunStep: document.getElementById('first-run-step'),
  firstRunAppId: document.getElementById('first-run-app-id'),
  firstRunConnect: document.getElementById('first-run-connect'),

  // Getting started
  gettingStartedCard: document.getElementById('getting-started-card'),
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
let firstRunStep = 1;
let firstRunTotal = 3;
let gettingStartedStep = 1;
let gettingStartedTotal = 3;
let discordInstances = []; // detected Discord installations
let connectedInstances = []; // currently connected Discord instances
let selectedDiscordType = 'discord'; // user's preferred Discord type

// ---------------------------------------------------------------- translations init
function initTranslations() {
  if (els.settingLang) {
    els.settingLang.addEventListener('change', (e) => {
      setLang(e.target.value);
      saveSettings({ language: e.target.value });
    });
  }
}

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

wickedRP.onNavigateTo((view) => {
  showView(view);
  if (view === 'media') loadMedia();
});

// ---------------------------------------------------------------- themes
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);

  els.themeCards.forEach((card) => {
    card.classList.toggle('active', card.dataset.theme === theme);
  });
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

// ---------------------------------------------------------------- modals
function openModal(modal) {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

els.btnAbout.addEventListener('click', () => openModal(els.aboutModal));
els.btnHelp.addEventListener('click', () => openModal(els.helpModal));
els.btnCloseAbout.addEventListener('click', () => closeModal(els.aboutModal));
els.btnCloseHelp.addEventListener('click', () => closeModal(els.helpModal));
els.btnCloseFirstRun.addEventListener('click', () => closeModal(els.firstRunModal));

[els.aboutModal, els.helpModal, els.firstRunModal].forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

// ---------------------------------------------------------------- first-run wizard
function initFirstRun() {
  els.btnFirstRunNext.addEventListener('click', () => {
    if (firstRunStep < firstRunTotal) {
      firstRunStep++;
      updateFirstRunUI();
    } else {
      closeModal(els.firstRunModal);
      storeSettingsFlag('firstRunCompleted', true);
    }
  });

  els.btnFirstRunSkip.addEventListener('click', () => {
    closeModal(els.firstRunModal);
    storeSettingsFlag('firstRunCompleted', true);
  });

  els.firstRunConnect.addEventListener('click', async () => {
    const appId = els.firstRunAppId.value.trim() || DEFAULT_APP_ID;
    try {
      await wickedRP.connectDiscord(appId);
      els.firstRunConnect.textContent = t('connected');
      els.firstRunConnect.disabled = true;
      showToast('Connected to Discord!', 'success');
    } catch (err) {
      showToast(t('failedToConnect') + ' ' + err.message, 'error');
    }
  });
}

function updateFirstRunUI() {
  const stepEls = document.querySelectorAll('.first-run-step');
  stepEls.forEach((el, idx) => {
    el.classList.toggle('hidden', idx + 1 !== firstRunStep);
  });
  els.btnFirstRunNext.textContent = firstRunStep < firstRunTotal ? t('next') : t('finish');
  const counter = document.getElementById('first-run-counter');
  if (counter) counter.textContent = firstRunStep;
}

// ---------------------------------------------------------------- getting started card
function updateGettingStartedCard() {
  if (!els.gettingStartedCard) return;
  const stepEls = document.querySelectorAll('.gs-step');
  stepEls.forEach((el, idx) => {
    el.classList.toggle('gs-active', idx + 1 === gettingStartedStep);
    el.classList.toggle('gs-complete', idx + 1 < gettingStartedStep);
  });
}

function advanceGettingStarted() {
  if (gettingStartedStep < gettingStartedTotal) {
    gettingStartedStep++;
    updateGettingStartedCard();
  }
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

function validateForm(activity) {
  if (!activity.details) {
    return { valid: false, message: t('pleaseEnterActivity') };
  }
  if (activity.appId && !/^\d{18,19}$/.test(activity.appId)) {
    return { valid: false, message: t('invalidAppId') };
  }
  if (activity.startTimestamp && isNaN(activity.startTimestamp)) {
    return { valid: false, message: t('invalidStartTime') };
  }
  if (activity.endTimestamp && isNaN(activity.endTimestamp)) {
    return { valid: false, message: t('invalidEndTime') };
  }
  if (activity.startTimestamp && activity.endTimestamp && activity.endTimestamp <= activity.startTimestamp) {
    return { valid: false, message: t('endBeforeStart') };
  }
  return { valid: true, message: null };
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

  const imgKey = activity.largeImageKey;
  if (imgKey) {
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

  els.previewButtons.innerHTML = '';
  if (activity.buttons && activity.buttons.length > 0) {
    activity.buttons.forEach((b) => {
      const btn = document.createElement('span');
      btn.className = 'preview-btn';
      btn.textContent = b.label;
      els.previewButtons.appendChild(btn);
    });
  }

  if (connected) {
    els.previewStatusBadge.classList.remove('offline');
    els.previewStatusBadge.classList.add('online');
    els.previewStatusBadge.textContent = t('online');
  } else {
    els.previewStatusBadge.classList.remove('online');
    els.previewStatusBadge.classList.add('offline');
    els.previewStatusBadge.textContent = t('offline');
  }
}

function applyPresence() {
  const activity = readForm();
  const validation = validateForm(activity);
  if (!validation.valid) {
    showToast(validation.message, 'error');
    return;
  }
  wickedRP.setPresence(activity);
  updatePreview(activity, rpcConnected);
  showToast(t('presenceApplied'), 'success');
  advanceGettingStarted();
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
  els.previewStatusBadge.textContent = t('offline');
  showToast(t('presenceCleared'), 'info');
}

els.btnApply.addEventListener('click', applyPresence);
els.btnApplyForm.addEventListener('click', applyPresence);
els.btnClear.addEventListener('click', clearPresence);
els.btnClearForm.addEventListener('click', clearPresence);

// Activity type selector
els.activityTypeSelect.addEventListener('change', () => {
  const typeId = els.activityTypeSelect.value;
  const type = ACTIVITY_TYPES.find((t) => t.id === typeId);
  if (type) {
    els.fieldDetails.value = type.details;
    els.fieldState.value = type.state;
    if (type.url) {
      els.fieldBtn1Label.value = 'Watch Stream';
      els.fieldBtn1Url.value = type.url + 'example';
    }
    updatePreview(readForm(), rpcConnected);
  }
});

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

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    applyPresence();
  }
  if (e.key === 'Escape') {
    clearPresence();
  }
  if (e.key === 'F1') {
    e.preventDefault();
    openModal(els.helpModal);
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'o') {
    e.preventDefault();
    showView('media');
    loadMedia();
  }
  if (e.ctrlKey && e.key.toLowerCase() === 's') {
    e.preventDefault();
    els.btnSaveProfile.click();
  }
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
  connectedInstances = data.instances || [];
  els.statusDot.classList.toggle('connected', rpcConnected);
  els.statusDot.classList.toggle('disconnected', !rpcConnected);
  els.statusText.textContent = rpcConnected ? t('connected') : t('disconnected');
  els.btnConnect.style.display = rpcConnected ? 'none' : 'inline-flex';
  els.btnDisconnect.style.display = rpcConnected ? 'flex' : 'none';
  btnReconnect.style.display = rpcConnected ? 'none' : 'inline-flex';
  updatePreview(readForm(), rpcConnected);
  renderDiscordInstances();

  if (rpcConnected && autoApplyPending) {
    autoApplyPending = false;
    const activity = readForm();
    if (activity.details) {
      wickedRP.setPresence(activity);
      showToast(t('presenceRestored'), 'info');
    }
  }
});

wickedRP.onRpcError((data) => {
  els.statusText.textContent = t('failedToConnect') + ' ' + (data.message || 'Unknown');
  els.statusDot.classList.add('disconnected');
  els.statusDot.classList.remove('connected');
  rpcConnected = false;
  showToast(t('failedToConnect') + ' ' + (data.message || 'Unknown'), 'error');
});

wickedRP.onPresenceUpdated((data) => {
  updatePreview(data.activity, true);
  showToast(t('presenceUpdated'), 'success');
});

wickedRP.onPresenceCleared(() => {
  clearPresence();
});

// ---------------------------------------------------------------- connect / disconnect
els.btnConnect.addEventListener('click', async () => {
  const appId = els.discordAppId.value.trim();
  if (!/^\d{18,19}$/.test(appId)) {
    showToast(t('invalidAppId'), 'error');
    return;
  }
  try {
    await wickedRP.connectDiscord({ discordType: selectedDiscordType, appId });
    selectDiscordType(selectedDiscordType);
  } catch (err) {
    showToast(t('failedToConnect') + ' ' + err.message, 'error');
  }
});

els.btnDisconnect.addEventListener('click', async () => {
  try {
    await wickedRP.disconnectDiscord(selectedDiscordType);
  } catch (err) {
    showToast(t('failedToDisconnect') + ' ' + err.message, 'error');
  }
});

// Copy Application ID
if (els.btnCopyAppId) {
  els.btnCopyAppId.addEventListener('click', async () => {
    const appId = els.discordAppId.value.trim();
    if (!appId) return;
    try {
      await navigator.clipboard.writeText(appId);
      showToast(t('copySuccess'), 'success');
    } catch (err) {
      showToast('Failed to copy Application ID.', 'error');
    }
  });
}

// Discord type selector
const discordTypeSelect = document.getElementById('discord-type-select');
if (discordTypeSelect) {
  discordTypeSelect.value = selectedDiscordType;
  discordTypeSelect.addEventListener('change', (e) => {
    selectDiscordType(e.target.value);
  });
}

// Reconnect button
const btnReconnect = document.getElementById('btn-reconnect');
if (btnReconnect) {
  btnReconnect.addEventListener('click', async () => {
    const appId = els.discordAppId.value.trim();
    if (!/^\d{18,19}$/.test(appId)) {
      showToast(t('invalidAppId'), 'error');
      return;
    }
    try {
      await wickedRP.connectDiscord({ discordType: selectedDiscordType, appId });
      selectDiscordType(selectedDiscordType);
      showToast('Reconnecting to Discord...', 'info');
    } catch (err) {
      showToast(t('failedToConnect') + ' ' + err.message, 'error');
    }
  });
}

// Test Connection button
const btnTestConnection = document.getElementById('btn-test-connection');
if (btnTestConnection) {
  btnTestConnection.addEventListener('click', async () => {
    const appId = els.discordAppId.value.trim();
    if (!/^\d{18,19}$/.test(appId)) {
      showToast(t('invalidAppId'), 'error');
      return;
    }
    btnTestConnection.textContent = t('testing');
    btnTestConnection.disabled = true;
    try {
      const result = await wickedRP.testConnection({
        discordType: selectedDiscordType,
        appId,
      });
      if (result.success) {
        showToast(result.message || t('connectionTested'), 'success');
      } else {
        showToast(result.error || t('failedToConnect'), 'error');
      }
    } catch (err) {
      showToast(t('failedToConnect') + ' ' + err.message, 'error');
    } finally {
      btnTestConnection.textContent = t('testConnection');
      btnTestConnection.disabled = false;
    }
  });
}

// Dev portal button
if (els.btnDevPortal) {
  els.btnDevPortal.addEventListener('click', () => {
    wickedRP.openUrl('https://discord.com/developers/applications');
  });
}

// Copy Image Key button
const btnCopyImageKey = document.getElementById('btn-copy-image-key');
if (btnCopyImageKey) {
  btnCopyImageKey.addEventListener('click', async () => {
    if (!selectedMedia) {
      showToast('Please select an image first.', 'error');
      return;
    }
    try {
      const result = await wickedRP.copyImageKey(selectedMedia);
      if (result.success) {
        await navigator.clipboard.writeText(result.key);
        showToast(`Image key "${result.key}" copied!`, 'success');
        els.fieldLargeImage.value = result.key;
        updatePreview(readForm(), rpcConnected);
      } else {
        showToast('Failed to copy image key.', 'error');
      }
    } catch (err) {
      showToast('Failed to copy image key.', 'error');
    }
  });
}

// Media search
const mediaSearch = document.getElementById('media-search');
if (mediaSearch) {
  mediaSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.media-item');
    items.forEach((item) => {
      const name = item.querySelector('.media-name').textContent.toLowerCase();
      item.style.display = name.includes(term) ? '' : 'none';
    });
  });
}

// Profile search
const profileSearch = document.getElementById('profile-search');
if (profileSearch) {
  profileSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.profile-item');
    items.forEach((item) => {
      const name = item.querySelector('.profile-name').textContent.toLowerCase();
      item.style.display = name.includes(term) ? '' : 'none';
    });
  });
}

// Clear All fields
const btnClearAll = document.getElementById('btn-clear-all');
if (btnClearAll) {
  btnClearAll.addEventListener('click', () => {
    if (!confirm('Clear all presence fields?')) return;
    els.fieldDetails.value = '';
    els.fieldState.value = '';
    els.fieldAppId.value = '';
    els.fieldStart.value = '';
    els.fieldEnd.value = '';
    els.fieldLargeImage.value = '';
    els.fieldLargeText.value = '';
    els.fieldSmallImage.value = '';
    els.fieldSmallText.value = '';
    els.fieldBtn1Label.value = '';
    els.fieldBtn1Url.value = '';
    els.fieldBtn2Label.value = '';
    els.fieldBtn2Url.value = '';
    els.fieldPartySize.value = '';
    els.fieldPartyMax.value = '';
    els.fieldMatchSecret.value = '';
    els.fieldJoinSecret.value = '';
    els.fieldSpectateSecret.value = '';
    updatePreview(readForm(), rpcConnected);
    showToast('All fields cleared.', 'info');
  });
}

// ---------------------------------------------------------------- profiles
async function loadProfiles() {
  const settings = await wickedRP.getStoredSettings();
  profiles = settings.profiles || [];
  activeProfileId = settings.activeProfile || null;
  els.discordAppId.value = settings.discordAppId || DEFAULT_APP_ID;
  els.settingAppId.value = settings.discordAppId || DEFAULT_APP_ID;
  currentTheme = settings.theme || 'dark';
  currentLang = settings.language || 'en';
  selectedDiscordType = settings.selectedDiscordType || 'discord';
  if (els.settingLang) els.settingLang.value = currentLang;
  applyTheme(currentTheme);
  applyTranslations();
  renderProfiles();
  await loadDiscordInstances();
  if (activeProfileId) {
    const profile = profiles.find((p) => p.id === activeProfileId);
    if (profile) {
      writeForm(profile.activity);
      updatePreview(profile.activity, rpcConnected);
    }
  }
}

// ---------------------------------------------------------------- Discord instances
async function loadDiscordInstances() {
  try {
    discordInstances = await wickedRP.getDiscordInstances();
    connectedInstances = await wickedRP.getConnectedInstances();
    renderDiscordInstances();
  } catch (e) {
    console.error('Failed to load Discord instances:', e.message);
  }
}

function renderDiscordInstances() {
  let statusEl = document.getElementById('discord-auto-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'discord-auto-status';
    statusEl.className = 'discord-auto-status';
    const statusCard = document.querySelector('.status-card');
    if (statusCard) statusCard.parentNode.insertBefore(statusEl, statusCard.nextSibling);
  }

  const runningCount = discordInstances.length;
  const connectedCount = connectedInstances.filter((i) => i.connected).length;

  if (runningCount === 0) {
    statusEl.innerHTML = '<span style="color:var(--text-dim);font-size:11px;">No Discord detected</span>';
    statusEl.style.display = 'block';
  } else {
    const names = discordInstances.map((d) => d.name).join(', ');
    const connBadge = connectedCount > 0 ? ` <span style="color:var(--success);font-weight:bold;">(${connectedCount} connected)</span>` : '';
    statusEl.innerHTML = `<span style="color:var(--text-muted);font-size:11px;">Discord: ${names}${connBadge}</span>`;
    statusEl.style.display = 'block';
  }
}

function selectDiscordType(type) {
  selectedDiscordType = type;
  wickedRP.saveSelectedDiscordType(type);
  renderDiscordInstances();
  showToast(`Selected ${type.charAt(0).toUpperCase() + type.slice(1)} as default Discord`, 'info');
}

// ---------------------------------------------------------------- renderProfiles (existing)

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
        <button class="btn-ghost-sm profile-btn-load" data-id="${profile.id}" title="${t('load')}">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.34 9.45a.5.5 0 0 1-.832.83l-9.45-3.34a.5.5 0 0 1-.832-.83l3.34-9.45a.5.5 0 0 1 1.664 0l3.34 9.45a.5.5 0 0 1 .832.83z"/></svg>
          ${t('load')}
        </button>
        <button class="btn-danger-sm profile-btn-delete" data-id="${profile.id}" title="${t('delete')}" onclick="event.stopPropagation(); window.deleteProfile('${escapeHtml(profile.name)}', '${profile.id}')">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          ${t('delete')}
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
        showToast(t('profileLoaded'), 'info');
      }
    });
  });
}

async function deleteProfile(name, id) {
  if (!confirm(t('deleteConfirm'))) return;
  profiles = profiles.filter((p) => p.id !== id);
  if (activeProfileId === id) activeProfileId = null;
  await saveSettings({ profiles, activeProfile });
  renderProfiles();
}

window.deleteProfile = deleteProfile;

els.btnNewProfile.addEventListener('click', () => {
  showView('presence');
  els.profileName.focus();
});

els.btnSaveProfile.addEventListener('click', async () => {
  const name = els.profileName.value.trim();
  if (!name) {
    showToast(t('enterProfileName'), 'error');
    return;
  }
  const activity = readForm();
  if (!activity.details) {
    showToast(t('pleaseConfigureActivity'), 'error');
    return;
  }

  const id = 'profile-' + Date.now();
  profiles.push({ id, name, activity, createdAt: Date.now() });
  activeProfileId = id;
  els.profileName.value = '';
  await saveSettings({ profiles, activeProfile: id });
  renderProfiles();
  showToast(t('profileSaved'), 'success');
  showView('presence');
});

// ---------------------------------------------------------------- media manager
async function loadMedia() {
  try {
    const settings = await wickedRP.getStoredSettings();
    mediaList = settings.mediaList || [];
    renderMedia();
  } catch (e) {
    showToast(t('failedToInitialize') + ': ' + e.message, 'error');
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
    let gifBadge = '';
    if (media.isImage) {
      const isGif = media.name.toLowerCase().endsWith('.gif');
      gifBadge = isGif
        ? '<div class="gif-badge">GIF</div>'
        : '';
      preview = `<img src="${media.url}" class="media-thumb" alt="${escapeHtml(media.name)}">${gifBadge}`;
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
      <div class="media-actions">
        <button class="btn-icon media-copy-key" title="Copy Image Key" onclick="event.stopPropagation(); window.copyImageKeyFromMedia('${escapeHtml(media.name)}')">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="media-delete" title="Delete" onclick="event.stopPropagation(); window.deleteMedia('${escapeHtml(media.name)}')">×</button>
      </div>
    `;
    els.mediaList.appendChild(item);
  });

  els.useMediaBtn.disabled = !selectedMedia;
}

async function deleteMedia(filename) {
  if (!confirm(`Delete "${filename}"?`)) return;
  const result = await wickedRP.deleteMedia(filename);
  if (result.success) {
    showToast(t('mediaDeleted'), 'info');
    selectedMedia = null;
    loadMedia();
  } else {
    showToast(t('failedToInitialize') + ': ' + result.error, 'error');
  }
}

window.deleteMedia = deleteMedia;

window.copyImageKeyFromMedia = async (filename) => {
  try {
    const result = await wickedRP.copyImageKey(filename);
    if (result.success) {
      await navigator.clipboard.writeText(result.key);
      showToast(`Image key "${result.key}" copied!`, 'success');
      els.fieldLargeImage.value = result.key;
      updatePreview(readForm(), rpcConnected);
    } else {
      showToast('Failed to copy image key.', 'error');
    }
  } catch (err) {
    showToast('Failed to copy image key.', 'error');
  }
};

els.mediaUpload.addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files.length) return;

  showToast(t('mediaUploaded'), 'success');
  e.target.value = '';
});

els.useMediaBtn.addEventListener('click', () => {
  if (!selectedMedia) return;
  els.fieldLargeImage.value = selectedMedia;
  updatePreview(readForm(), rpcConnected);
  showView('presence');
  showToast(`Selected image: ${selectedMedia}`, 'success');
});

els.mediaTypeFilter.addEventListener('change', renderMedia);

// ---------------------------------------------------------------- import/export profiles
els.btnExportProfiles.addEventListener('click', async () => {
  const result = await wickedRP.exportProfiles();
  if (!result.success) {
    showToast(t('importInvalid'), 'error');
    return;
  }
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wicked-rp-profiles-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('exportSuccess'), 'success');
});

els.importFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      const result = await wickedRP.importProfiles(data);
      if (result.success) {
        showToast(t('importSuccess'), 'success');
        await loadProfiles();
      } else {
        showToast(t('importInvalid'), 'error');
      }
    } catch (err) {
      showToast(t('importInvalid'), 'error');
    }
    e.target.value = '';
  };
  reader.readAsText(file);
});

els.btnImportProfiles.addEventListener('click', () => {
  els.importFile.click();
});

// ---------------------------------------------------------------- settings
async function loadSettings() {
  const settings = await wickedRP.getStoredSettings();
  els.settingStartOnBoot.checked = !!settings.startOnBoot;
  els.settingMinimizeToTray.checked = settings.minimizeToTray !== false;
  els.settingAutoApply.checked = settings.autoApply !== false;
  els.settingAppId.value = settings.discordAppId || DEFAULT_APP_ID;
  currentTheme = settings.theme || 'dark';
  currentLang = settings.language || 'en';
  if (els.settingLang) els.settingLang.value = currentLang;
  applyTheme(currentTheme);
  applyTranslations();
}

els.btnSaveSettings.addEventListener('click', async () => {
  await saveSettings({
    startOnBoot: els.settingStartOnBoot.checked,
    minimizeToTray: els.settingMinimizeToTray.checked,
    autoApply: els.settingAutoApply.checked,
    discordAppId: els.settingAppId.value.trim(),
    language: els.settingLang ? els.settingLang.value : 'en',
  });
  showToast(t('settingsSaved'), 'success');
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
    setTimeout(() => toast.remove(), 3000);
  }, 3000);
}

function storeSettingsFlag(key, value) {
  // Store in memory for this session; persisted via settings save
}

// ---------------------------------------------------------------- init
(async () => {
  try {
    autoApplyPending = true;
    await loadSettings();
    await loadProfiles();
    await loadPresetsData();
    initThemes();
    initTranslations();
    showView('presence');
    updatePreview(readForm(), rpcConnected);
    updateGettingStartedCard();

    // Initialize activity type selector
    els.activityTypeSelect.innerHTML = ACTIVITY_TYPES.map(
      (a) => `<option value="${a.id}">${a.icon} ${t('activityTypes')[a.id]}</option>`
    ).join('');

    // Check if first run
    const settings = await wickedRP.getStoredSettings();
    if (profiles.length === 0 && !settings.firstRunCompleted) {
      openModal(els.firstRunModal);
      initFirstRun();
    } else if (profiles.length === 0) {
      // Show getting started card
      els.gettingStartedCard.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Init error:', err);
    showToast(t('failedToInitialize') + ': ' + err.message, 'error');
  }
})();

window.wickedRP = wickedRP;
