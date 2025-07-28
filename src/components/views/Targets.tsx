import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  Alert,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  AcUnit as FreezeIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Folder as FolderIcon,
  Storage as StorageIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { 
  selectFolder, 
  addTarget, 
  loadTargets, 
  freezeTarget, 
  restoreTarget, 
  removeTarget 
} from '../../store/slices/targetsSlice';
import { addNotification } from '../../store/slices/notificationsSlice';

const Targets: React.FC = () => {
  const dispatch = useAppDispatch();
  const { targets, isLoading, statistics } = useAppSelector((state) => state.targets);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Load targets when component mounts
    dispatch(loadTargets());
  }, [dispatch]);

  const handleAddTarget = async () => {
    try {
      const folderPath = await dispatch(selectFolder()).unwrap();
      if (folderPath) {
        await dispatch(addTarget(folderPath)).unwrap();
        await dispatch(loadTargets()).unwrap();
        
        dispatch(addNotification({
          type: 'success',
          title: 'Target Added',
          message: `Successfully added ${folderPath} as a freeze target.`,
          duration: 4000,
        }));
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Failed to Add Target',
        message: window.freezeGuardAPI 
          ? `Error: ${(error as Error).message}`
          : 'Folder selection is only available in the desktop application.',
        duration: 6000,
      }));
    }
  };

  const handleRefresh = async () => {
    try {
      await dispatch(loadTargets()).unwrap();
      dispatch(addNotification({
        type: 'success',
        title: 'Refreshed',
        message: 'Target list has been refreshed.',
        duration: 2000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: `Failed to refresh targets: ${(error as Error).message}`,
        duration: 4000,
      }));
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, targetId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTarget(targetId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTarget(null);
  };

  const handleFreeze = async (targetId: string) => {
    try {
      await dispatch(freezeTarget(targetId)).unwrap();
      await dispatch(loadTargets()).unwrap();
      
      const target = targets.find(t => t.id === targetId);
      dispatch(addNotification({
        type: 'success',
        title: 'Target Frozen',
        message: `Successfully froze ${target?.name || 'target'}.`,
        duration: 4000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Freeze Failed',
        message: `Failed to freeze target: ${(error as Error).message}`,
        duration: 6000,
      }));
    }
    handleMenuClose();
  };

  const handleRestore = async (targetId: string) => {
    try {
      await dispatch(restoreTarget(targetId)).unwrap();
      await dispatch(loadTargets()).unwrap();
      
      const target = targets.find(t => t.id === targetId);
      dispatch(addNotification({
        type: 'success',
        title: 'Target Restored',
        message: `Successfully restored ${target?.name || 'target'}.`,
        duration: 4000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Restore Failed',
        message: `Failed to restore target: ${(error as Error).message}`,
        duration: 6000,
      }));
    }
    handleMenuClose();
  };

  const handleDeleteClick = (targetId: string) => {
    setTargetToDelete(targetId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (targetToDelete) {
      try {
        const target = targets.find(t => t.id === targetToDelete);
        await dispatch(removeTarget(targetToDelete)).unwrap();
        await dispatch(loadTargets()).unwrap();
        
        dispatch(addNotification({
          type: 'success',
          title: 'Target Removed',
          message: `Successfully removed ${target?.name || 'target'}.`,
          duration: 4000,
        }));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          title: 'Remove Failed',
          message: `Failed to remove target: ${(error as Error).message}`,
          duration: 6000,
        }));
      }
    }
    setDeleteDialogOpen(false);
    setTargetToDelete(null);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'frozen': return 'success';
      case 'active': return 'primary';
      case 'freezing': return 'warning';
      case 'restoring': return 'info';
      case 'error': return 'error';
      default: return 'default';
    }
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
            Freeze Targets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor your freeze targets. Add folders to protect them from changes.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTarget}
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Add Target
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.totalTargets}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Targets
                  </Typography>
                </Box>
                <FolderIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.frozenTargets}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Frozen
                  </Typography>
                </Box>
                <FreezeIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.activeTargets}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active
                  </Typography>
                </Box>
                <StorageIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatBytes(statistics.totalSize)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Size
                  </Typography>
                </Box>
                <StorageIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loading Indicator */}
      {isLoading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Targets List */}
      {targets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <FolderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                No Targets Added Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Start by adding folders or partitions that you want to protect from changes.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddTarget}
                size="large"
                sx={{
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                Add Your First Target
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {targets.map((target, index) => (
              <Grid item xs={12} md={6} lg={4} key={target.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    <CardContent>
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                          <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {target.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {target.path}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={target.status}
                            size="small"
                            color={getStatusColor(target.status) as any}
                            variant="filled"
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, target.id)}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Details */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Type:</strong> {target.type} • <strong>Size:</strong> {formatBytes(target.size)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Created:</strong> {formatDate(target.createdAt)}
                        </Typography>
                        {target.lastFrozenAt && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Last Frozen:</strong> {formatDate(target.lastFrozenAt)}
                          </Typography>
                        )}
                        {target.changeCount > 0 && (
                          <Typography variant="body2" color="warning.main">
                            <strong>Changes Detected:</strong> {target.changeCount}
                          </Typography>
                        )}
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {target.status === 'active' && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<FreezeIcon />}
                            onClick={() => handleFreeze(target.id)}
                            color="success"
                            disabled={isLoading}
                          >
                            Freeze
                          </Button>
                        )}
                        {target.status === 'frozen' && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<RestoreIcon />}
                            onClick={() => handleRestore(target.id)}
                            color="warning"
                            disabled={isLoading}
                          >
                            Restore
                          </Button>
                        )}
                        {(target.status === 'freezing' || target.status === 'restoring') && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                            <Typography variant="caption" color="text.secondary">
                              {target.status}...
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
          },
        }}
        onClick={handleAddTarget}
        disabled={isLoading}
      >
        <AddIcon />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedTarget && (
          <>
            {targets.find(t => t.id === selectedTarget)?.status === 'active' && (
              <MenuItem onClick={() => handleFreeze(selectedTarget)}>
                <FreezeIcon sx={{ mr: 1 }} />
                Freeze Target
              </MenuItem>
            )}
            {targets.find(t => t.id === selectedTarget)?.status === 'frozen' && (
              <MenuItem onClick={() => handleRestore(selectedTarget)}>
                <RestoreIcon sx={{ mr: 1 }} />
                Restore Target
              </MenuItem>
            )}
            <MenuItem onClick={() => handleDeleteClick(selectedTarget)} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Remove Target
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remove Target</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this target? This action cannot be undone.
            {targetToDelete && targets.find(t => t.id === targetToDelete)?.status === 'frozen' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This target is currently frozen. Removing it will also delete its snapshot.
              </Alert>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Targets;