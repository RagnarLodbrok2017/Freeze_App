import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as TargetsIcon,
  Timeline as OperationsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  PlayArrow as FreezeAllIcon,
  Restore as RestoreAllIcon,
  ChevronLeft as ChevronLeftIcon,
  FolderOpen as MultiFolderIcon,
  Storage as PartitionIcon,
  Speed as QuickFreezeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setCurrentView, toggleSidebar } from '../../store/slices/appSlice';
import { selectFolder } from '../../store/slices/targetsSlice';
import { addNotification } from '../../store/slices/notificationsSlice';
import { useLanguage } from '../../contexts/LanguageContext';
import MultiFolderSelector from '../common/MultiFolderSelector';
import QuickFreezeDialog from '../common/QuickFreezeDialog';

const SIDEBAR_WIDTH = 280;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  view: 'dashboard' | 'targets' | 'operations' | 'settings';
  badge?: number;
}

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t, isRTL } = useLanguage();
  const { sidebarOpen, currentView } = useAppSelector((state) => state.app);
  const { statistics } = useAppSelector((state) => state.targets);
  const { activeOperations } = useAppSelector((state) => state.operations);

  const [multiFolderDialogOpen, setMultiFolderDialogOpen] = useState(false);
  const [partitionDialogOpen, setPartitionDialogOpen] = useState(false);
  const [quickFreezeDialogOpen, setQuickFreezeDialogOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: <DashboardIcon />,
      view: 'dashboard',
    },
    {
      id: 'targets',
      label: t.targets,
      icon: <TargetsIcon />,
      view: 'targets',
      badge: statistics.totalTargets,
    },
    {
      id: 'operations',
      label: t.operations,
      icon: <OperationsIcon />,
      view: 'operations',
      badge: activeOperations.length,
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <SettingsIcon />,
      view: 'settings',
    },
  ];

  const handleNavigationClick = (view: typeof currentView) => {
    dispatch(setCurrentView(view));
  };

  const handleAddFolder = async () => {
    try {
      await dispatch(selectFolder()).unwrap();
    } catch (error) {
      console.error('Failed to select folder:', error);
    }
  };

  const handleMultiFolderConfirm = async (selectedPaths: string[]) => {
    try {
      // Add multiple folders as targets
      for (const path of selectedPaths) {
        if (window.freezeGuardAPI) {
          await window.freezeGuardAPI.freezeTarget.add(path);
        }
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Multiple Targets Added',
        message: `Successfully added ${selectedPaths.length} folder(s) as freeze targets.`,
        duration: 4000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Failed to Add Targets',
        message: `Error: ${(error as Error).message}`,
        duration: 5000,
      }));
    }
  };

  const handlePartitionConfirm = async (selectedPaths: string[]) => {
    try {
      // Add partitions as targets
      for (const path of selectedPaths) {
        if (window.freezeGuardAPI) {
          await window.freezeGuardAPI.freezeTarget.add(path);
        }
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Partitions Added',
        message: `Successfully added ${selectedPaths.length} partition(s) as freeze targets.`,
        duration: 4000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Failed to Add Partitions',
        message: `Error: ${(error as Error).message}`,
        duration: 5000,
      }));
    }
  };

  const handleQuickFreezeConfirm = async (selectedPaths: string[]) => {
    try {
      // Add and immediately freeze system folders
      for (const path of selectedPaths) {
        if (window.freezeGuardAPI) {
          const addResult = await window.freezeGuardAPI.freezeTarget.add(path);
          if (addResult.success && addResult.data) {
            await window.freezeGuardAPI.freezeTarget.freeze(addResult.data.id);
          }
        }
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Quick Freeze Complete',
        message: `Successfully froze ${selectedPaths.length} system folder(s).`,
        duration: 4000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Quick Freeze Failed',
        message: `Error: ${(error as Error).message}`,
        duration: 5000,
      }));
    }
  };

  const handleFreezeAll = () => {
    // TODO: Implement freeze all functionality
    console.log('Freeze all targets');
  };

  const handleRestoreAll = () => {
    // TODO: Implement restore all functionality
    console.log('Restore all targets');
  };

  const quickActions = [
    {
      id: 'add-folder',
      label: t.addFolder,
      icon: <AddIcon />,
      onClick: handleAddFolder,
      color: 'primary' as const,
    },
    {
      id: 'add-multiple-folders',
      label: t.addMultipleFolders,
      icon: <MultiFolderIcon />,
      onClick: () => setMultiFolderDialogOpen(true),
      color: 'primary' as const,
    },
    {
      id: 'add-partition',
      label: t.addPartition,
      icon: <PartitionIcon />,
      onClick: () => setPartitionDialogOpen(true),
      color: 'info' as const,
    },
    {
      id: 'quick-freeze',
      label: t.quickFreeze,
      icon: <QuickFreezeIcon />,
      onClick: () => setQuickFreezeDialogOpen(true),
      color: 'secondary' as const,
    },
    {
      id: 'freeze-all',
      label: t.freezeAll,
      icon: <FreezeAllIcon />,
      onClick: handleFreezeAll,
      color: 'success' as const,
      disabled: statistics.activeTargets === 0,
    },
    {
      id: 'restore-all',
      label: t.restoreAll,
      icon: <RestoreAllIcon />,
      onClick: handleRestoreAll,
      color: 'warning' as const,
      disabled: statistics.frozenTargets === 0,
    },
  ];

  return (
    <>
      <Drawer
        variant="persistent"
        anchor={isRTL ? "right" : "left"}
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            border: 'none',
          },
        }}
      >
        <Box sx={{ overflow: 'auto', height: '100%', py: 2 }}>
          {/* Collapse Button */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: isRTL ? 'flex-start' : 'flex-end', 
            px: 1, 
            mb: 2 
          }}>
            <IconButton
              onClick={() => dispatch(toggleSidebar())}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  color: 'primary.main',
                },
                transform: isRTL ? 'rotate(180deg)' : 'none',
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>

          {/* Navigation */}
          <Box sx={{ px: 1 }}>
            <Typography
              variant="overline"
              sx={{
                px: 2,
                py: 1,
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: 1,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t.navigation}
            </Typography>
            <List sx={{ py: 0 }}>
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ListItemButton
                    selected={currentView === item.view}
                    onClick={() => handleNavigationClick(item.view)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      '&.Mui-selected': {
                        background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: currentView === item.view ? 'primary.main' : 'text.secondary',
                        minWidth: 40,
                        mr: isRTL ? 0 : 1,
                        ml: isRTL ? 1 : 0,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        textAlign: isRTL ? 'right' : 'left',
                        '& .MuiListItemText-primary': {
                          fontWeight: currentView === item.view ? 600 : 500,
                          color: currentView === item.view ? 'primary.main' : 'text.primary',
                        },
                      }}
                    />
                    {item.badge !== undefined && item.badge > 0 && (
                      <Chip
                        label={item.badge}
                        size="small"
                        color={currentView === item.view ? 'primary' : 'default'}
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          ml: isRTL ? 0 : 1,
                          mr: isRTL ? 1 : 0,
                        }}
                      />
                    )}
                  </ListItemButton>
                </motion.div>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 2, mx: 2 }} />

          {/* Quick Actions */}
          <Box sx={{ px: 1 }}>
            <Typography
              variant="overline"
              sx={{
                px: 2,
                py: 1,
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: 1,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t.quickActionsNav}
            </Typography>
            <List sx={{ py: 0 }}>
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (navigationItems.length + index) * 0.1 }}
                >
                  <Tooltip
                    title={action.disabled ? t.noTargetsAvailable : ''}
                    placement={isRTL ? "left" : "right"}
                  >
                    <span>
                      <ListItemButton
                        onClick={action.onClick}
                        disabled={action.disabled}
                        sx={{
                          borderRadius: 2,
                          mx: 1,
                          mb: 0.5,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          '&:hover': {
                            backgroundColor: `${action.color}.50`,
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5,
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: action.disabled ? 'text.disabled' : `${action.color}.main`,
                            minWidth: 40,
                            mr: isRTL ? 0 : 1,
                            ml: isRTL ? 1 : 0,
                          }}
                        >
                          {action.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={action.label}
                          sx={{
                            textAlign: isRTL ? 'right' : 'left',
                            '& .MuiListItemText-primary': {
                              fontWeight: 500,
                              fontSize: '0.875rem',
                              color: action.disabled ? 'text.disabled' : `${action.color}.main`,
                            },
                          }}
                        />
                      </ListItemButton>
                    </span>
                  </Tooltip>
                </motion.div>
              ))}
            </List>
          </Box>

          {/* Statistics Summary */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            sx={{
              mt: 'auto',
              mx: 2,
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: 'text.primary',
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t.systemStatus}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }}>
                <Typography variant="caption" color="text.secondary">
                  {t.totalTargets}
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {statistics.totalTargets}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }}>
                <Typography variant="caption" color="text.secondary">
                  {t.frozenTargets}
                </Typography>
                <Typography variant="caption" fontWeight={600} color="success.main">
                  {statistics.frozenTargets}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }}>
                <Typography variant="caption" color="text.secondary">
                  {t.activeOperations}
                </Typography>
                <Typography variant="caption" fontWeight={600} color="warning.main">
                  {activeOperations.length}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Multi-Folder Selection Dialog */}
      <MultiFolderSelector
        open={multiFolderDialogOpen}
        onClose={() => setMultiFolderDialogOpen(false)}
        onConfirm={handleMultiFolderConfirm}
        type="folders"
      />

      {/* Partition Selection Dialog */}
      <MultiFolderSelector
        open={partitionDialogOpen}
        onClose={() => setPartitionDialogOpen(false)}
        onConfirm={handlePartitionConfirm}
        type="partitions"
      />

      {/* Quick Freeze Dialog */}
      <QuickFreezeDialog
        open={quickFreezeDialogOpen}
        onClose={() => setQuickFreezeDialogOpen(false)}
        onConfirm={handleQuickFreezeConfirm}
      />
    </>
  );
};

export default Sidebar;