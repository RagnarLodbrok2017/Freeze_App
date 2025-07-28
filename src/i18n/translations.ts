export interface Translation {
  // Navigation
  dashboard: string;
  targets: string;
  operations: string;
  settings: string;
  
  // Header
  freezeGuard: string;
  notifications: string;
  
  // Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  totalTargets: string;
  frozenTargets: string;
  activeOperations: string;
  totalStorage: string;
  totalTargetsDesc: string;
  frozenTargetsDesc: string;
  activeOperationsDesc: string;
  totalStorageDesc: string;
  quickActions: string;
  addNewTarget: string;
  freezeAllActive: string;
  restoreAllFrozen: string;
  recentTargets: string;
  systemStatus: string;
  applicationMode: string;
  desktop: string;
  browser: string;
  status: string;
  ready: string;
  processing: string;
  viewAll: string;
  noTargetsYet: string;
  addFirstTarget: string;
  
  // Sidebar
  navigation: string;
  quickActionsNav: string;
  addFolder: string;
  addMultipleFolders: string;
  addPartition: string;
  freezeAll: string;
  restoreAll: string;
  noTargetsAvailable: string;
  
  // Quick Freeze
  quickFreeze: string;
  systemFolders: string;
  appData: string;
  tempFiles: string;
  prefetch: string;
  userRoaming: string;
  programFiles: string;
  windowsTemp: string;
  browserCache: string;
  downloads: string;
  freezeSelected: string;
  selectAll: string;
  clearSelection: string;
  
  // Multi-selection
  selectFolders: string;
  selectPartitions: string;
  selectedItems: string;
  addSelected: string;
  
  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  general: string;
  startWithWindows: string;
  minimizeToTray: string;
  showNotifications: string;
  checkUpdates: string;
  snapshots: string;
  snapshotDirectory: string;
  maxSnapshotAge: string;
  compressionLevel: string;
  enableEncryption: string;
  encryptionPassword: string;
  performance: string;
  maxConcurrentOps: string;
  bufferSize: string;
  enableFastMode: string;
  skipSystemFiles: string;
  monitoring: string;
  watchInterval: string;
  enableRealTimeMonitoring: string;
  monitorSubdirectories: string;
  excludePatterns: string;
  addPattern: string;
  backupRecovery: string;
  enableAutoBackup: string;
  backupInterval: string;
  maxBackupCount: string;
  backupLocation: string;
  createBackupNow: string;
  restoreFromBackup: string;
  dangerZone: string;
  dangerZoneWarning: string;
  resetAllSettings: string;
  clearAllSnapshots: string;
  resetAppData: string;
  exportSettings: string;
  saveSettings: string;
  
  // Footer
  designedBy: string;
  developerName: string;
  
  // About
  about: string;
  aboutTitle: string;
  aboutDescription: string;
  developerInfo: string;
  features: string;
  featuresList: {
    freezeTargets: string;
    realTimeMonitoring: string;
    secureOperations: string;
    crossPlatform: string;
    darkMode: string;
    notifications: string;
  };
  
  // Settings
  language: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
  
  // Common
  close: string;
  save: string;
  cancel: string;
  version: string;
  days: string;
  hours: string;
  mb: string;
  ms: string;
  
  // Notifications
  settingsLoaded: string;
  settingsSaved: string;
  settingsExported: string;
  settingsReset: string;
  
  // Dialogs
  resetSettingsTitle: string;
  resetSettingsMessage: string;
  exportSettingsTitle: string;
  exportSettingsMessage: string;
}

export const translations: Record<string, Translation> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    targets: 'Freeze Targets',
    operations: 'Operations',
    settings: 'Settings',
    
    // Header
    freezeGuard: 'Freeze Guard',
    notifications: 'Notifications',
    
    // Dashboard
    dashboardTitle: 'Dashboard',
    dashboardSubtitle: 'Monitor and manage your freeze targets from a centralized view',
    totalTargets: 'Total Targets',
    frozenTargets: 'Frozen Targets',
    activeOperations: 'Active Operations',
    totalStorage: 'Total Storage',
    totalTargetsDesc: 'Folders and partitions being monitored',
    frozenTargetsDesc: 'Targets currently in frozen state',
    activeOperationsDesc: 'Operations currently in progress',
    totalStorageDesc: 'Total size of all monitored targets',
    quickActions: 'Quick Actions',
    addNewTarget: 'Add New Target',
    freezeAllActive: 'Freeze All Active',
    restoreAllFrozen: 'Restore All Frozen',
    recentTargets: 'Recent Targets',
    systemStatus: 'System Status',
    applicationMode: 'Application Mode',
    desktop: 'Desktop',
    browser: 'Browser',
    status: 'Status',
    ready: 'Ready',
    processing: 'Processing',
    viewAll: 'View All',
    noTargetsYet: 'No targets added yet',
    addFirstTarget: 'Add Your First Target',
    
    // Sidebar
    navigation: 'Navigation',
    quickActionsNav: 'Quick Actions',
    addFolder: 'Add Folder',
    addMultipleFolders: 'Add Multiple Folders',
    addPartition: 'Add Partition',
    freezeAll: 'Freeze All',
    restoreAll: 'Restore All',
    noTargetsAvailable: 'No targets available',
    
    // Quick Freeze
    quickFreeze: 'Quick Freeze',
    systemFolders: 'System Folders',
    appData: 'AppData',
    tempFiles: 'Temp Files',
    prefetch: 'Prefetch',
    userRoaming: 'User Roaming',
    programFiles: 'Program Files',
    windowsTemp: 'Windows Temp',
    browserCache: 'Browser Cache',
    downloads: 'Downloads',
    freezeSelected: 'Freeze Selected',
    selectAll: 'Select All',
    clearSelection: 'Clear Selection',
    
    // Multi-selection
    selectFolders: 'Select Multiple Folders',
    selectPartitions: 'Select Partitions',
    selectedItems: 'Selected Items',
    addSelected: 'Add Selected',
    
    // Settings
    settingsTitle: 'Settings',
    settingsSubtitle: 'Configure Freeze Guard to suit your needs and preferences.',
    general: 'General',
    startWithWindows: 'Start with Windows',
    minimizeToTray: 'Minimize to system tray',
    showNotifications: 'Show notifications',
    checkUpdates: 'Check for updates automatically',
    snapshots: 'Snapshots',
    snapshotDirectory: 'Snapshot Directory',
    maxSnapshotAge: 'Max Snapshot Age (days)',
    compressionLevel: 'Compression Level',
    enableEncryption: 'Enable encryption',
    encryptionPassword: 'Encryption Password',
    performance: 'Performance',
    maxConcurrentOps: 'Max Concurrent Operations',
    bufferSize: 'Buffer Size',
    enableFastMode: 'Enable fast mode (less verification)',
    skipSystemFiles: 'Skip system files',
    monitoring: 'Monitoring',
    watchInterval: 'Watch Interval (ms)',
    enableRealTimeMonitoring: 'Enable real-time monitoring',
    monitorSubdirectories: 'Monitor subdirectories',
    excludePatterns: 'Exclude Patterns',
    addPattern: 'Add pattern',
    backupRecovery: 'Backup & Recovery',
    enableAutoBackup: 'Enable automatic backups',
    backupInterval: 'Backup Interval (hours)',
    maxBackupCount: 'Max Backup Count',
    backupLocation: 'Backup Location',
    createBackupNow: 'Create Backup Now',
    restoreFromBackup: 'Restore from Backup',
    dangerZone: 'Danger Zone',
    dangerZoneWarning: 'These actions are irreversible. Please proceed with caution.',
    resetAllSettings: 'Reset All Settings',
    clearAllSnapshots: 'Clear All Snapshots',
    resetAppData: 'Reset Application Data',
    exportSettings: 'Export Settings',
    saveSettings: 'Save Settings',
    
    // Footer
    designedBy: 'Designed and developed by',
    developerName: 'Elnakieb',
    
    // About
    about: 'About',
    aboutTitle: 'Freeze Guard',
    aboutDescription: 'A professional partition and folder state management application that allows you to freeze and restore file system targets with precision and security.',
    developerInfo: 'Developed by Ahmed Rezk Elnakieb, a passionate software engineer dedicated to creating innovative solutions for system management and data protection.',
    features: 'Key Features',
    featuresList: {
      freezeTargets: 'Freeze and restore folders/partitions',
      realTimeMonitoring: 'Real-time monitoring and statistics',
      secureOperations: 'Secure snapshot-based operations',
      crossPlatform: 'Cross-platform desktop application',
      darkMode: 'Beautiful dark and light themes',
      notifications: 'Smart notifications and alerts',
    },
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    
    // Common
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    version: 'Version',
    days: 'days',
    hours: 'hours',
    mb: 'MB',
    ms: 'ms',
    
    // Notifications
    settingsLoaded: 'Settings have been loaded successfully.',
    settingsSaved: 'Your settings have been saved successfully.',
    settingsExported: 'Settings have been exported successfully.',
    settingsReset: 'All settings have been reset to defaults.',
    
    // Dialogs
    resetSettingsTitle: 'Reset All Settings',
    resetSettingsMessage: 'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
    exportSettingsTitle: 'Export Settings',
    exportSettingsMessage: 'This will download your current settings as a JSON file. You can use this file to restore your settings later or transfer them to another installation.',
  },
  
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    targets: 'أهداف التجميد',
    operations: 'العمليات',
    settings: 'الإعدادات',
    
    // Header
    freezeGuard: 'فريز جارد',
    notifications: 'الإشعارات',
    
    // Dashboard
    dashboardTitle: 'لوحة التحكم',
    dashboardSubtitle: 'راقب وأدر أهداف التجميد من عرض مركزي',
    totalTargets: 'إجمالي الأهداف',
    frozenTargets: 'الأهداف المجمدة',
    activeOperations: 'العمليات النشطة',
    totalStorage: 'إجمالي التخزين',
    totalTargetsDesc: 'المجلدات والأقسام قيد المراقبة',
    frozenTargetsDesc: 'الأهداف المجمدة حالياً',
    activeOperationsDesc: 'العمليات الجارية حالياً',
    totalStorageDesc: 'الحجم الإجمالي لجميع الأهداف المراقبة',
    quickActions: 'إجراءات سريعة',
    addNewTarget: 'إضافة هدف جديد',
    freezeAllActive: 'تجميد جميع النشطة',
    restoreAllFrozen: 'استعادة جميع المجمدة',
    recentTargets: 'الأهداف الحديثة',
    systemStatus: 'حالة النظام',
    applicationMode: 'وضع التطبيق',
    desktop: 'سطح المكتب',
    browser: 'المتصفح',
    status: 'الحالة',
    ready: 'جاهز',
    processing: 'معالجة',
    viewAll: 'عرض الكل',
    noTargetsYet: 'لم يتم إضافة أهداف بعد',
    addFirstTarget: 'أضف هدفك الأول',
    
    // Sidebar
    navigation: 'التنقل',
    quickActionsNav: 'إجراءات سريعة',
    addFolder: 'إضافة مجلد',
    addMultipleFolders: 'إضافة مجلدات متعددة',
    addPartition: 'إضافة قسم',
    freezeAll: 'تجميد الكل',
    restoreAll: 'استعادة الكل',
    noTargetsAvailable: 'لا توجد أهداف متاحة',
    
    // Quick Freeze
    quickFreeze: 'تجميد سريع',
    systemFolders: 'مجلدات النظام',
    appData: 'بيانات التطبيق',
    tempFiles: 'الملفات المؤقتة',
    prefetch: 'الجلب المسبق',
    userRoaming: 'تجوال المستخدم',
    programFiles: 'ملفات البرامج',
    windowsTemp: 'مؤقت ويندوز',
    browserCache: 'ذاكرة المتصفح',
    downloads: 'التنزيلات',
    freezeSelected: 'تجميد المحدد',
    selectAll: 'تحديد الكل',
    clearSelection: 'مسح التحديد',
    
    // Multi-selection
    selectFolders: 'تحديد مجلدات متعددة',
    selectPartitions: 'تحديد الأقسام',
    selectedItems: 'العناصر المحددة',
    addSelected: 'إضافة المحدد',
    
    // Settings
    settingsTitle: 'الإعدادات',
    settingsSubtitle: 'قم بتكوين فريز جارد ليناسب احتياجاتك وتفضيلاتك.',
    general: 'عام',
    startWithWindows: 'البدء مع ويندوز',
    minimizeToTray: 'تصغير إلى شريط النظام',
    showNotifications: 'إظهار الإشعارات',
    checkUpdates: 'فحص التحديثات تلقائياً',
    snapshots: 'اللقطات',
    snapshotDirectory: 'مجلد اللقطات',
    maxSnapshotAge: 'أقصى عمر للقطة (أيام)',
    compressionLevel: 'مستوى الضغط',
    enableEncryption: 'تفعيل التشفير',
    encryptionPassword: 'كلمة مرور التشفير',
    performance: 'الأداء',
    maxConcurrentOps: 'أقصى عمليات متزامنة',
    bufferSize: 'حجم المخزن المؤقت',
    enableFastMode: 'تفعيل الوضع السري�� (تحقق أقل)',
    skipSystemFiles: 'تخطي ملفات النظام',
    monitoring: 'المراقبة',
    watchInterval: 'فترة المراقبة (مللي ثانية)',
    enableRealTimeMonitoring: 'تفعيل المراقبة في الوقت الفعلي',
    monitorSubdirectories: 'مراقبة المجلدات الفرعية',
    excludePatterns: 'أنماط الاستبعاد',
    addPattern: 'إضافة نمط',
    backupRecovery: 'النسخ الاحتياطي والاستعادة',
    enableAutoBackup: 'تفعيل النسخ الاحتياطي التلقائي',
    backupInterval: 'فترة النسخ الاحتياطي (ساعات)',
    maxBackupCount: 'أقصى عدد نسخ احتياطية',
    backupLocation: 'موقع النسخ الاحتياطي',
    createBackupNow: 'إنشاء نسخة احتياطية الآن',
    restoreFromBackup: 'استعادة من النسخة الاحتياطية',
    dangerZone: 'منطقة الخطر',
    dangerZoneWarning: 'هذه الإجراءات غير قابلة للإلغاء. يرجى المتابعة بحذر.',
    resetAllSettings: 'إعادة تعيين جميع الإعدادات',
    clearAllSnapshots: 'مسح جميع اللقطات',
    resetAppData: 'إعادة تعيين بيانات التطبيق',
    exportSettings: 'تصدير الإعدادات',
    saveSettings: 'حفظ الإعدادات',
    
    // Footer
    designedBy: 'تم التصميم والتطوير بواسطة',
    developerName: 'النقيب',
    
    // About
    about: 'حول',
    aboutTitle: 'فريز جارد',
    aboutDescription: 'تطبيق احترافي لإدارة حالة الأقسام والمجلدات يتيح لك تجميد واستعادة أهداف نظام الملفات بدقة وأمان.',
    developerInfo: 'تم تطويره بواسطة أحمد رزق النقيب، مهندس برمجيات شغوف مكرس لإنشاء حلول مبتكرة لإدارة النظام وحماية البيانات.',
    features: 'الميزات الرئيسية',
    featuresList: {
      freezeTargets: 'تجميد واستعادة المجلدات/الأقسام',
      realTimeMonitoring: 'مراقبة وإحصائيات في الوقت الفعلي',
      secureOperations: 'عمليات آمنة قائمة على اللقطات',
      crossPlatform: 'تطبيق سطح مكتب متعدد المنصات',
      darkMode: 'سمات جميلة مظلمة وفاتحة',
      notifications: 'إشعارات وتنبيهات ذكية',
    },
    
    // Settings
    language: 'اللغة',
    theme: 'السمة',
    light: 'فاتح',
    dark: 'مظلم',
    system: 'النظام',
    
    // Common
    close: 'إغلاق',
    save: 'حفظ',
    cancel: 'إلغاء',
    version: 'الإصدار',
    days: 'أيام',
    hours: 'ساعات',
    mb: 'ميجابايت',
    ms: 'مللي ثانية',
    
    // Notifications
    settingsLoaded: 'تم تحميل الإعدادات بنجاح.',
    settingsSaved: 'تم حفظ إعداداتك بنجاح.',
    settingsExported: 'تم تصدير الإعدادات بنجاح.',
    settingsReset: 'تم إعادة تعيين جميع الإعدادات إلى الافتراضية.',
    
    // Dialogs
    resetSettingsTitle: 'إعادة تعيين جميع الإعدادات',
    resetSettingsMessage: 'هل أنت متأكد من أنك تريد إعادة تعيين جميع الإعدادات إلى قيمها الافتراضية؟ لا يمكن التراجع عن هذا الإجراء.',
    exportSettingsTitle: 'تصدير الإعدادات',
    exportSettingsMessage: 'سيؤدي هذا إلى تنزيل إعداداتك الحالية كملف JSON. يمكنك استخدام هذا الملف لاستعادة إعداداتك لاحقاً أو نقلها إلى تثبيت آخر.',
  },
};