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
  ListItemSecondaryAction,
  Checkbox,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Storage as PartitionIcon,
  Delete as DeleteIcon,
  SelectAll as SelectAllIcon,
  ClearAll as ClearAllIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface MultiFolderSelectorProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedPaths: string[]) => void;
  type: 'folders' | 'partitions';
}

const MultiFolderSelector: React.FC<MultiFolderSelectorProps> = ({
  open,
  onClose,
  onConfirm,
  type,
}) => {
  const { t, isRTL } = useLanguage();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);

  const handleSelectPath = async () => {
    try {
      if (window.freezeGuardAPI) {
        const result = type === 'folders' 
          ? await window.freezeGuardAPI.fileSystem.selectMultipleFolders()
          : await window.freezeGuardAPI.fileSystem.selectPartitions();
        
        if (result.success && result.data) {
          const newPaths = Array.isArray(result.data) ? result.data : [result.data];
          setAvailablePaths(prev => {
            const combined = [...prev, ...newPaths];
            return Array.from(new Set(combined));
          });
        }
      }
    } catch (error) {
      console.error('Failed to select paths:', error);
    }
  };

  const handleToggleSelection = (path: string) => {
    setSelectedPaths(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const handleSelectAll = () => {
    setSelectedPaths([...availablePaths]);
  };

  const handleClearSelection = () => {
    setSelectedPaths([]);
  };

  const handleRemovePath = (path: string) => {
    setAvailablePaths(prev => prev.filter(p => p !== path));
    setSelectedPaths(prev => prev.filter(p => p !== path));
  };

  const handleConfirm = () => {
    onConfirm(selectedPaths);
    setSelectedPaths([]);
    setAvailablePaths([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedPaths([]);
    setAvailablePaths([]);
    onClose();
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
          minHeight: 400,
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
        {type === 'folders' ? <FolderIcon /> : <PartitionIcon />}
        <Typography variant="h6" sx={{ flex: 1 }}>
          {type === 'folders' ? t.selectFolders : t.selectPartitions}
        </Typography>
        <Chip
          label={`${selectedPaths.length} ${t.selectedItems}`}
          color="primary"
          size="small"
        />
      </DialogTitle>

      <DialogContent>
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
              startIcon={<AddIcon />}
              onClick={handleSelectPath}
              sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
            >
              {type === 'folders' ? t.addFolder : t.addPartition}
            </Button>
            <Button
              variant="outlined"
              startIcon={<SelectAllIcon />}
              onClick={handleSelectAll}
              disabled={availablePaths.length === 0}
              sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
            >
              {t.selectAll}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearAllIcon />}
              onClick={handleClearSelection}
              disabled={selectedPaths.length === 0}
              sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
            >
              {t.clearSelection}
            </Button>
          </Box>

          {availablePaths.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                {type === 'folders' 
                  ? 'No folders selected. Click "Add Folder" to browse for folders.'
                  : 'No partitions selected. Click "Add Partition" to select partitions.'
                }
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {availablePaths.map((path, index) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <ListItem
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: selectedPaths.includes(path) ? 'primary.main' : 'divider',
                      backgroundColor: selectedPaths.includes(path) ? 'primary.50' : 'transparent',
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={selectedPaths.includes(path)}
                        onChange={() => handleToggleSelection(path)}
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemIcon>
                      {type === 'folders' ? <FolderIcon /> : <PartitionIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={path}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                          fontWeight: selectedPaths.includes(path) ? 600 : 400,
                        },
                      }}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Remove">
                        <IconButton
                          edge="end"
                          onClick={() => handleRemovePath(path)}
                          size="small"
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleCancel} color="inherit">
          {t.cancel}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedPaths.length === 0}
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          {t.addSelected} ({selectedPaths.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MultiFolderSelector;