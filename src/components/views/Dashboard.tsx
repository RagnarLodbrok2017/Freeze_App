import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  AcUnit as FreezeIcon,
  Restore as RestoreIcon,
  Folder as FolderIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Speed as QuickFreezeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { selectFolder, addTarget, loadTargets, freezeTarget, restoreTarget } from '../../store/slices/targetsSlice';
import { setCurrentView } from '../../store/slices/appSlice';
import { addNotification } from '../../store/slices/notificationsSlice';
import { useLanguage } from '../../contexts/LanguageContext';
import QuickFreezeDialog from '../common/QuickFreezeDialog';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t, isRTL } = useLanguage();
  const { statistics, targets, isLoading } = useAppSelector((state) => state.targets);
  const { activeOperations, operations } = useAppSelector((state) => state.operations);
  const [quickFreezeDialogOpen, setQuickFreezeDialogOpen] = useState(false);

  const handleAddFolder = async () => {
    try {
      const folderPath = await dispatch(selectFolder()).unwrap();
      if (folderPath) {
        // Add the selected folder as a target
        await dispatch(addTarget(folderPath)).unwrap();
        // Reload targets to update the UI
        await dispatch(loadTargets()).unwrap();
        
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          title: 'Target Added',
          message: `Successfully added ${folderPath} as a freeze target.`,
          duration: 4000,
        }));
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
      // Show error notification
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

  const handleQuickFreezeConfirm = async (selectedPaths: string[]) => {
    try {
      dispatch(addNotification({
        type: 'info',
        title: 'Quick Freeze Starting',
        message: `Adding and freezing ${selectedPaths.length} system folder(s)...`,
        duration: 3000,
      }));

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Add and immediately freeze system folders
      for (const path of selectedPaths) {
        try {
          if (window.freezeGuardAPI) {
            // First add the target
            const addResult = await window.freezeGuardAPI.freezeTarget.add(path);
            if (addResult.success && addResult.data) {
              // Then freeze it immediately
              const freezeResult = await window.freezeGuardAPI.freezeTarget.freeze(addResult.data.id);
              if (freezeResult.success) {
                successCount++;
              } else {
                errorCount++;
                errors.push(`Failed to freeze ${path}: ${freezeResult.error || 'Unknown error'}`);
              }
            } else {
              errorCount++;
              errors.push(`Failed to add ${path}: ${addResult.error || 'Unknown error'}`);
            }
          } else {
            errorCount++;
            errors.push(`API not available for ${path}`);
          }
        } catch (pathError) {
          errorCount++;
          errors.push(`Error processing ${path}: ${(pathError as Error).message}`);
        }
      }

      // Reload targets to update the UI
      await dispatch(loadTargets()).unwrap();
      
      // Show appropriate notification based on results
      if (successCount > 0 && errorCount === 0) {
        dispatch(addNotification({
          type: 'success',
          title: 'Quick Freeze Complete',
          message: `Successfully froze ${successCount} system folder(s).`,
          duration: 4000,
        }));
      } else if (successCount > 0 && errorCount > 0) {
        dispatch(addNotification({
          type: 'warning',
          title: 'Quick Freeze Partially Complete',
          message: `Successfully froze ${successCount} folder(s), but ${errorCount} failed. Check console for details.`,
          duration: 6000,
        }));
        console.error('Quick freeze errors:', errors);
      } else {
        dispatch(addNotification({
          type: 'error',
          title: 'Quick Freeze Failed',
          message: `Failed to freeze all ${selectedPaths.length} folder(s). Check console for details.`,
          duration: 6000,
        }));
        console.error('Quick freeze errors:', errors);
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Quick Freeze Failed',
        message: `Error: ${(error as Error).message}`,
        duration: 5000,
      }));
      console.error('Quick freeze error:', error);
    }
  };

  const handleFreezeAll = async () => {
    const activeTargets = targets.filter(target => target.status === 'active');
    
    if (activeTargets.length === 0) {
      dispatch(addNotification({
        type: 'warning',
        title: 'No Active Targets',
        message: 'There are no active targets to freeze.',
        duration: 4000,
      }));
      return;
    }

    try {
      dispatch(addNotification({
        type: 'info',
        title: 'Freezing Targets',
        message: `Starting to freeze ${activeTargets.length} target(s)...`,
        duration: 3000,
      }));

      // Freeze all active targets
      for (const target of activeTargets) {
        await dispatch(freezeTarget(target.id)).unwrap();
      }

      // Reload targets to update the UI
      await dispatch(loadTargets()).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'Freeze Complete',
        message: `Successfully froze ${activeTargets.length} target(s).`,
        duration: 5000,
      }));
    } catch (error) {
      console.error('Failed to freeze targets:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Freeze Failed',
        message: `Failed to freeze targets: ${(error as Error).message}`,
        duration: 6000,
      }));
    }
  };

  const handleRestoreAll = async () => {
    const frozenTargets = targets.filter(target => target.status === 'frozen');
    
    if (frozenTargets.length === 0) {
      dispatch(addNotification({
        type: 'warning',
        title: 'No Frozen Targets',
        message: 'There are no frozen targets to restore.',
        duration: 4000,
      }));
      return;
    }

    try {
      dispatch(addNotification({
        type: 'info',
        title: 'Restoring Targets',
        message: `Starting to restore ${frozenTargets.length} target(s)...`,
        duration: 3000,
      }));

      // Restore all frozen targets
      for (const target of frozenTargets) {
        await dispatch(restoreTarget(target.id)).unwrap();
      }

      // Reload targets to update the UI
      await dispatch(loadTargets()).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'Restore Complete',
        message: `Successfully restored ${frozenTargets.length} target(s).`,
        duration: 5000,
      }));
    } catch (error) {
      console.error('Failed to restore targets:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Restore Failed',
        message: `Failed to restore targets: ${(error as Error).message}`,
        duration: 6000,
      }));
    }
  };

  const handleViewTargets = () => {
    dispatch(setCurrentView('targets'));
  };

  const handleViewOperations = () => {
    dispatch(setCurrentView('operations'));
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const recentTargets = targets.slice(0, 5);
  const recentOperations = operations.slice(0, 3);

  const statsCards = [
    {
      title: t.totalTargets,
      value: statistics.totalTargets,
      icon: <FolderIcon />,
      color: 'primary',
      description: t.totalTargetsDesc,
    },
    {
      title: t.frozenTargets,
      value: statistics.frozenTargets,
      icon: <FreezeIcon />,
      color: 'success',
      description: t.frozenTargetsDesc,
    },
    {
      title: t.activeOperations,
      value: activeOperations.length,
      icon: <TimelineIcon />,
      color: 'warning',
      description: t.activeOperationsDesc,
    },
    {
      title: t.totalStorage,
      value: formatBytes(statistics.totalSize),
      icon: <StorageIcon />,
      color: 'info',
      description: t.totalStorageDesc,
    },
  ];

  return (
    <>
      <Box sx={{ p: 3, height: '100%', overflow: 'auto', direction: isRTL ? 'rtl' : 'ltr' }}>
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          sx={{ mb: 4 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t.dashboardTitle}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ textAlign: isRTL ? 'right' : 'left' }}
          >
            {t.dashboardSubtitle}
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          background: `linear-gradient(45deg, ${card.color}.light, ${card.color}.main)`,
                          color: 'white',
                          mr: isRTL ? 0 : 2,
                          ml: isRTL ? 2 : 0,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          textAlign: isRTL ? 'right' : 'left',
                        }}
                      >
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: `${card.color}.main`,
                        mb: 1,
                        textAlign: isRTL ? 'right' : 'left',
                      }}
                    >
                      {card.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ textAlign: isRTL ? 'right' : 'left' }}
                    >
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3,
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {t.quickActions}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                      onClick={handleAddFolder}
                      disabled={isLoading}
                      sx={{
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                        },
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      }}
                    >
                      {isLoading ? t.processing : t.addNewTarget}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<QuickFreezeIcon />}
                      onClick={() => setQuickFreezeDialogOpen(true)}
                      sx={{ 
                        borderColor: 'secondary.main', 
                        color: 'secondary.main',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        '&:hover': {
                          borderColor: 'secondary.dark',
                          backgroundColor: 'secondary.50',
                        },
                      }}
                    >
                      {t.quickFreeze}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <FreezeIcon />}
                      onClick={handleFreezeAll}
                      disabled={statistics.activeTargets === 0 || isLoading}
                      sx={{ 
                        borderColor: 'success.main', 
                        color: 'success.main',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      }}
                    >
                      {isLoading ? t.processing : `${t.freezeAllActive} (${statistics.activeTargets})`}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <RestoreIcon />}
                      onClick={handleRestoreAll}
                      disabled={statistics.frozenTargets === 0 || isLoading}
                      sx={{ 
                        borderColor: 'warning.main', 
                        color: 'warning.main',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      }}
                    >
                      {isLoading ? t.processing : `${t.restoreAllFrozen} (${statistics.frozenTargets})`}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Recent Targets */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        textAlign: isRTL ? 'right' : 'left',
                      }}
                    >
                      {t.recentTargets}
                    </Typography>
                    <Button size="small" onClick={handleViewTargets}>
                      {t.viewAll}
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recentTargets.length > 0 ? (
                      recentTargets.map((target) => (
                        <Box
                          key={target.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: 'action.hover',
                            border: '1px solid',
                            borderColor: 'divider',
                            flexDirection: isRTL ? 'row-reverse' : 'row',
                          }}
                        >
                          <FolderIcon sx={{ 
                            mr: isRTL ? 0 : 2, 
                            ml: isRTL ? 2 : 0, 
                            color: 'text.secondary' 
                          }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{ 
                                fontWeight: 500, 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: isRTL ? 'right' : 'left',
                              }}
                            >
                              {target.name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                              {target.type} • {formatBytes(target.size)}
                            </Typography>
                          </Box>
                          <Chip
                            label={target.status}
                            size="small"
                            color={
                              target.status === 'frozen' ? 'success' :
                              target.status === 'active' ? 'primary' :
                              target.status === 'freezing' ? 'warning' :
                              target.status === 'restoring' ? 'info' :
                              target.status === 'error' ? 'error' : 'default'
                            }
                            sx={{ 
                              ml: isRTL ? 0 : 1,
                              mr: isRTL ? 1 : 0,
                            }}
                          />
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t.noTargetsYet}
                        </Typography>
                        <Button
                          size="small"
                          onClick={handleAddFolder}
                          sx={{ mt: 1 }}
                        >
                          {t.addFirstTarget}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Status Info */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3,
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {t.systemStatus}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        {t.applicationMode}
                      </Typography>
                      <Chip
                        label={window.freezeGuardAPI ? t.desktop : t.browser}
                        size="small"
                        color={window.freezeGuardAPI ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        {t.version}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        1.0.0
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        {t.status}
                      </Typography>
                      <Chip
                        label={isLoading ? t.processing : t.ready}
                        size="small"
                        color={isLoading ? 'warning' : 'success'}
                        variant="filled"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Freeze Dialog */}
      <QuickFreezeDialog
        open={quickFreezeDialogOpen}
        onClose={() => setQuickFreezeDialogOpen(false)}
        onConfirm={handleQuickFreezeConfirm}
      />
    </>
  );
};

export default Dashboard;