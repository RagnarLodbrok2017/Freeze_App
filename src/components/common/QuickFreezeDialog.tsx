import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  Box,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface QuickFreezeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedPaths: string[]) => void;
}

interface SystemFolder {
  id: string;
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
  risk: 'low' | 'medium' | 'high';
}

const QuickFreezeDialog: React.FC<QuickFreezeDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const { t, isRTL } = useLanguage();
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

  const systemFolders: SystemFolder[] = [
    {
      id: 'appdata-local',
      name: t.appData + ' (Local)',
      path: `${process.env.USERPROFILE || 'C:\\Users\\pc'}\\AppData\\Local`,
      description: 'Local application data and cache files',
      icon: <FolderIcon />,
      risk: 'medium',
    },
    {
      id: 'appdata-roaming',
      name: t.userRoaming,
      path: `${process.env.USERPROFILE || 'C:\\Users\\pc'}\\AppData\\Roaming`,
      description: 'User-specific application settings and data',
      icon: <FolderIcon />,
      risk: 'high',
    },
    {
      id: 'temp',
      name: t.tempFiles,
      path: `${process.env.TEMP || 'C:\\Users\\pc\\AppData\\Local\\Temp'}`,
      description: 'Temporary files created by applications',
      icon: <FolderIcon />,
      risk: 'low',
    },
    {
      id: 'windows-temp',
      name: t.windowsTemp,
      path: 'C:\\Windows\\Temp',
      description: 'System temporary files',
      icon: <FolderIcon />,
      risk: 'low',
    },
    {
      id: 'prefetch',
      name: t.prefetch,
      path: 'C:\\Windows\\Prefetch',
      description: 'Windows prefetch files for faster application loading',
      icon: <FolderIcon />,
      risk: 'medium',
    },
    {
      id: 'downloads',
      name: t.downloads,
      path: `${process.env.USERPROFILE || 'C:\\Users\\pc'}\\Downloads`,
      description: 'User downloads folder',
      icon: <FolderIcon />,
      risk: 'low',
    },
    {
      id: 'browser-cache-chrome',
      name: t.browserCache + ' (Chrome)',
      path: `${process.env.USERPROFILE || 'C:\\Users\\pc'}\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache`,
      description: 'Google Chrome browser cache',
      icon: <FolderIcon />,
      risk: 'low',
    },
    {
      id: 'browser-cache-edge',
      name: t.browserCache + ' (Edge)',
      path: `${process.env.USERPROFILE || 'C:\\Users\\pc'}\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache`,
      description: 'Microsoft Edge browser cache',
      icon: <FolderIcon />,
      risk: 'low',
    },
  ];

  const handleToggleFolder = (folderId: string) => {
    const folder = systemFolders.find(f => f.id === folderId);
    if (!folder) return;

    setSelectedFolders(prev => 
      prev.includes(folder.path) 
        ? prev.filter(p => p !== folder.path)
        : [...prev, folder.path]
    );
  };

  const handleSelectAll = () => {
    setSelectedFolders(systemFolders.map(f => f.path));
  };

  const handleClearSelection = () => {
    setSelectedFolders([]);
  };

  const handleConfirm = () => {
    onConfirm(selectedFolders);
    setSelectedFolders([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedFolders([]);
    onClose();
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      case 'high': return 'High Risk';
      default: return 'Unknown';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: 500,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}
      >
        <SpeedIcon />
        <Typography variant="h6" sx={{ flex: 1 }}>
          {t.quickFreeze} - {t.systemFolders}
        </Typography>
        <Chip
          label={`${selectedFolders.length} ${t.selectedItems}`}
          color="primary"
          size="small"
        />
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Select system folders to freeze quickly. These are common folders that can help improve system performance when frozen.
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mb: 2,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}
          >
            <Button
              variant="outlined"
              onClick={handleSelectAll}
              size="small"
            >
              {t.selectAll}
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearSelection}
              disabled={selectedFolders.length === 0}
              size="small"
            >
              {t.clearSelection}
            </Button>
          </Box>

          <List sx={{ maxHeight: 350, overflow: 'auto' }}>
            {systemFolders.map((folder, index) => (
              <motion.div
                key={folder.id}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <ListItem
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: selectedFolders.includes(folder.path) ? 'primary.main' : 'divider',
                    backgroundColor: selectedFolders.includes(folder.path) ? 'primary.50' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleToggleFolder(folder.id)}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={selectedFolders.includes(folder.path)}
                      onChange={() => handleToggleFolder(folder.id)}
                      color="primary"
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    {folder.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: selectedFolders.includes(folder.path) ? 600 : 500,
                          }}
                        >
                          {folder.name}
                        </Typography>
                        <Chip
                          label={getRiskText(folder.risk)}
                          size="small"
                          color={getRiskColor(folder.risk) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {folder.description}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                          {folder.path}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  />
                </ListItem>
              </motion.div>
            ))}
          </List>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> Freezing system folders may affect application performance. 
            High-risk folders should be used with caution as they may contain important user data.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleCancel} color="inherit">
          {t.cancel}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedFolders.length === 0}
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          {t.freezeSelected} ({selectedFolders.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickFreezeDialog;