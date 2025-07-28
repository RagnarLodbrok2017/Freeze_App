import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Folder as FolderIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  Storage as StorageIcon,
  Speed as PerformanceIcon,
  Backup as BackupIcon,
  RestoreFromTrash as RestoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateTheme } from '../../store/slices/appSlice';
import { addNotification } from '../../store/slices/notificationsSlice';
import { loadSettings, saveSetting } from '../../store/slices/settingsSlice';

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.app);
  
  // Settings state
  const [settings, setSettings] = useState({
    // General
    autoStart: true,
    minimizeToTray: true,
    showNotifications: true,
    checkUpdates: true,
    
    // Snapshots
    snapshotDirectory: 'C:\\FreezeGuard\\Snapshots',
    maxSnapshotAge: 30, // days
    compressionLevel: 5, // 1-9
    enableEncryption: false,
    encryptionPassword: '',
    
    // Performance
    maxConcurrentOperations: 2,
    bufferSize: 64, // MB
    enableFastMode: false,
    skipSystemFiles: true,
    
    // Monitoring
    watchInterval: 1000, // ms
    enableRealTimeMonitoring: true,
    monitorSubdirectories: true,
    excludePatterns: ['*.tmp', '*.log', 'node_modules', '.git'],
    
    // Backup
    enableAutoBackup: false,
    backupInterval: 24, // hours
    maxBackupCount: 5,
    backupLocation: 'C:\\FreezeGuard\\Backups',
  });

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [newExcludePattern, setNewExcludePattern] = useState('');

  useEffect(() => {
    // Load settings from config
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (window.freezeGuardAPI) {
        // Load all settings from Electron store
        const result = await window.freezeGuardAPI.config.getAll();
        
        if (result.success && result.data) {
          const config = result.data;
          
          // Map ConfigService schema to settings state
          setSettings(prev => ({
            ...prev,
            // General settings
            showNotifications: config.enableNotifications || prev.showNotifications,
            minimizeToTray: config.minimizeToTray !== undefined ? config.minimizeToTray : prev.minimizeToTray,
            
            // Snapshots
            snapshotDirectory: config.snapshotDirectory || prev.snapshotDirectory,
            maxSnapshotAge: config.autoCleanupDays || prev.maxSnapshotAge,
            compressionLevel: config.compressionEnabled ? 5 : 0,
            enableEncryption: config.encryptionEnabled || prev.enableEncryption,
            
            // Performance
            maxConcurrentOperations: config.maxConcurrentOperations || prev.maxConcurrentOperations,
            enableFastMode: config.performanceMode === 'performance',
            
            // Monitoring
            excludePatterns: config.excludePatterns || prev.excludePatterns,
          }));
          
          // Update theme in redux store if needed
          if (config.theme && config.theme !== theme) {
            dispatch(updateTheme(config.theme));
          }
          
          dispatch(addNotification({
            type: 'success',
            title: 'Settings Loaded',
            message: 'Settings have been loaded successfully.',
            duration: 2000,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Failed to Load Settings',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000,
      }));
    }
  };

  const saveSettings = async () => {
    try {
      if (window.freezeGuardAPI) {
        // Map settings state to ConfigService schema and save each setting
        const settingsToSave = [
          { key: 'enableNotifications', value: settings.showNotifications },
          { key: 'minimizeToTray', value: settings.minimizeToTray },
          { key: 'snapshotDirectory', value: settings.snapshotDirectory },
          { key: 'autoCleanupDays', value: settings.maxSnapshotAge },
          { key: 'compressionEnabled', value: settings.compressionLevel > 0 },
          { key: 'encryptionEnabled', value: settings.enableEncryption },
          { key: 'maxConcurrentOperations', value: settings.maxConcurrentOperations },
          { key: 'performanceMode', value: settings.enableFastMode ? 'performance' : 'balanced' },
          { key: 'excludePatterns', value: settings.excludePatterns },
          { key: 'theme', value: theme },
        ];

        // Save each setting individually
        for (const setting of settingsToSave) {
          const result = await window.freezeGuardAPI.config.set(setting.key, setting.value);
          if (!result.success) {
            throw new Error(`Failed to save ${setting.key}: ${result.error}`);
          }
        }
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your settings have been saved successfully.',
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Save Failed',
        message: `Failed to save settings: ${(error as Error).message}`,
        duration: 5000,
      }));
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(updateTheme(newTheme));
  };

  const handleResetSettings = () => {
    setSettings({
      autoStart: true,
      minimizeToTray: true,
      showNotifications: true,
      checkUpdates: true,
      snapshotDirectory: 'C:\\FreezeGuard\\Snapshots',
      maxSnapshotAge: 30,
      compressionLevel: 5,
      enableEncryption: false,
      encryptionPassword: '',
      maxConcurrentOperations: 2,
      bufferSize: 64,
      enableFastMode: false,
      skipSystemFiles: true,
      watchInterval: 1000,
      enableRealTimeMonitoring: true,
      monitorSubdirectories: true,
      excludePatterns: ['*.tmp', '*.log', 'node_modules', '.git'],
      enableAutoBackup: false,
      backupInterval: 24,
      maxBackupCount: 5,
      backupLocation: 'C:\\FreezeGuard\\Backups',
    });
    
    dispatch(addNotification({
      type: 'info',
      title: 'Settings Reset',
      message: 'All settings have been reset to defaults.',
      duration: 3000,
    }));
    
    setResetDialogOpen(false);
  };

  const handleSelectDirectory = async (settingKey: string) => {
    try {
      if (window.freezeGuardAPI) {
        const result = await window.freezeGuardAPI.fileSystem.selectFolder();
        if (result.success) {
          handleSettingChange(settingKey, result.data);
        }
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Directory Selection Failed',
        message: 'Failed to select directory.',
        duration: 3000,
      }));
    }
  };

  const addExcludePattern = () => {
    if (newExcludePattern.trim()) {
      const newPatterns = [...settings.excludePatterns, newExcludePattern.trim()];
      handleSettingChange('excludePatterns', newPatterns);
      setNewExcludePattern('');
    }
  };

  const removeExcludePattern = (index: number) => {
    const newPatterns = settings.excludePatterns.filter((_, i) => i !== index);
    handleSettingChange('excludePatterns', newPatterns);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'freeze-guard-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
    
    dispatch(addNotification({
      type: 'success',
      title: 'Settings Exported',
      message: 'Settings have been exported successfully.',
      duration: 3000,
    }));
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1,
            }}
          >
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure Freeze Guard to suit your needs and preferences.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setExportDialogOpen(true)}
          >
            Export Settings
          </Button>
          <Button
            variant="contained"
            onClick={saveSettings}
            sx={{
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    General
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoStart}
                        onChange={(e) => handleSettingChange('autoStart', e.target.checked)}
                      />
                    }
                    label="Start with Windows"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.minimizeToTray}
                        onChange={(e) => handleSettingChange('minimizeToTray', e.target.checked)}
                      />
                    }
                    label="Minimize to system tray"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showNotifications}
                        onChange={(e) => handleSettingChange('showNotifications', e.target.checked)}
                      />
                    }
                    label="Show notifications"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.checkUpdates}
                        onChange={(e) => handleSettingChange('checkUpdates', e.target.checked)}
                      />
                    }
                    label="Check for updates automatically"
                  />
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={theme}
                      label="Theme"
                      onChange={(e) => handleThemeChange(e.target.value as any)}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Snapshot Settings */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <StorageIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Snapshots
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Snapshot Directory"
                      value={settings.snapshotDirectory}
                      onChange={(e) => handleSettingChange('snapshotDirectory', e.target.value)}
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => handleSelectDirectory('snapshotDirectory')}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <FolderIcon />
                    </Button>
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Max Snapshot Age (days)"
                    type="number"
                    value={settings.maxSnapshotAge}
                    onChange={(e) => handleSettingChange('maxSnapshotAge', parseInt(e.target.value))}
                    size="small"
                  />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Compression Level: {settings.compressionLevel}
                    </Typography>
                    <Slider
                      value={settings.compressionLevel}
                      onChange={(_, value) => handleSettingChange('compressionLevel', value)}
                      min={1}
                      max={9}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableEncryption}
                        onChange={(e) => handleSettingChange('enableEncryption', e.target.checked)}
                      />
                    }
                    label="Enable encryption"
                  />
                  
                  {settings.enableEncryption && (
                    <TextField
                      fullWidth
                      label="Encryption Password"
                      type="password"
                      value={settings.encryptionPassword}
                      onChange={(e) => handleSettingChange('encryptionPassword', e.target.value)}
                      size="small"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Performance Settings */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PerformanceIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Performance
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Max Concurrent Operations"
                    type="number"
                    value={settings.maxConcurrentOperations}
                    onChange={(e) => handleSettingChange('maxConcurrentOperations', parseInt(e.target.value))}
                    size="small"
                    inputProps={{ min: 1, max: 8 }}
                  />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Buffer Size: {settings.bufferSize} MB
                    </Typography>
                    <Slider
                      value={settings.bufferSize}
                      onChange={(_, value) => handleSettingChange('bufferSize', value)}
                      min={16}
                      max={512}
                      step={16}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableFastMode}
                        onChange={(e) => handleSettingChange('enableFastMode', e.target.checked)}
                      />
                    }
                    label="Enable fast mode (less verification)"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.skipSystemFiles}
                        onChange={(e) => handleSettingChange('skipSystemFiles', e.target.checked)}
                      />
                    }
                    label="Skip system files"
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Monitoring Settings */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <NotificationsIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Monitoring
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Watch Interval (ms)"
                    type="number"
                    value={settings.watchInterval}
                    onChange={(e) => handleSettingChange('watchInterval', parseInt(e.target.value))}
                    size="small"
                    inputProps={{ min: 100, max: 10000 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableRealTimeMonitoring}
                        onChange={(e) => handleSettingChange('enableRealTimeMonitoring', e.target.checked)}
                      />
                    }
                    label="Enable real-time monitoring"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monitorSubdirectories}
                        onChange={(e) => handleSettingChange('monitorSubdirectories', e.target.checked)}
                      />
                    }
                    label="Monitor subdirectories"
                  />
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Exclude Patterns
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Add pattern"
                      value={newExcludePattern}
                      onChange={(e) => setNewExcludePattern(e.target.value)}
                      size="small"
                      onKeyPress={(e) => e.key === 'Enter' && addExcludePattern()}
                    />
                    <Button
                      variant="outlined"
                      onClick={addExcludePattern}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <AddIcon />
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {settings.excludePatterns.map((pattern, index) => (
                      <Chip
                        key={index}
                        label={pattern}
                        onDelete={() => removeExcludePattern(index)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Backup Settings */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <BackupIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Backup & Recovery
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.enableAutoBackup}
                            onChange={(e) => handleSettingChange('enableAutoBackup', e.target.checked)}
                          />
                        }
                        label="Enable automatic backups"
                      />
                      
                      {settings.enableAutoBackup && (
                        <>
                          <TextField
                            fullWidth
                            label="Backup Interval (hours)"
                            type="number"
                            value={settings.backupInterval}
                            onChange={(e) => handleSettingChange('backupInterval', parseInt(e.target.value))}
                            size="small"
                            inputProps={{ min: 1, max: 168 }}
                          />
                          
                          <TextField
                            fullWidth
                            label="Max Backup Count"
                            type="number"
                            value={settings.maxBackupCount}
                            onChange={(e) => handleSettingChange('maxBackupCount', parseInt(e.target.value))}
                            size="small"
                            inputProps={{ min: 1, max: 50 }}
                          />
                        </>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          label="Backup Location"
                          value={settings.backupLocation}
                          onChange={(e) => handleSettingChange('backupLocation', e.target.value)}
                          size="small"
                        />
                        <Button
                          variant="outlined"
                          onClick={() => handleSelectDirectory('backupLocation')}
                          sx={{ minWidth: 'auto', px: 2 }}
                        >
                          <FolderIcon />
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<BackupIcon />}
                          fullWidth
                        >
                          Create Backup Now
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<RestoreIcon />}
                          fullWidth
                        >
                          Restore from Backup
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SecurityIcon sx={{ mr: 2, color: 'error.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                    Danger Zone
                  </Typography>
                </Box>
                
                <Alert severity="warning" sx={{ mb: 3 }}>
                  These actions are irreversible. Please proceed with caution.
                </Alert>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setResetDialogOpen(true)}
                  >
                    Reset All Settings
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                  >
                    Clear All Snapshots
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                  >
                    Reset Application Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset All Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetSettings} color="error" variant="contained">
            Reset Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Confirmation Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Settings</DialogTitle>
        <DialogContent>
          <Typography>
            This will download your current settings as a JSON file. You can use this file to restore your settings later or transfer them to another installation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={exportSettings} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;