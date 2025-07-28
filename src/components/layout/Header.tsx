import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AcUnit as FreezeIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { toggleSidebar, setCurrentView } from '../../store/slices/appSlice';
import { useLanguage } from '../../contexts/LanguageContext';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { sidebarOpen, currentView } = useAppSelector((state) => state.app);
  const { statistics } = useAppSelector((state) => state.targets);
  const { notifications } = useAppSelector((state) => state.notifications);
  const { activeOperations } = useAppSelector((state) => state.operations);

  const unreadNotifications = notifications.length;
  const activeOperationsCount = activeOperations.length;

  const handleMenuClick = () => {
    dispatch(toggleSidebar());
  };

  const handleSettingsClick = () => {
    dispatch(setCurrentView('settings'));
  };

  const handleNotificationsClick = () => {
    // Could open notifications panel
  };

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      className="titlebar-drag"
    >
      <Toolbar sx={{ minHeight: '64px !important', px: 2 }}>
        {/* Menu Button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuClick}
          className="titlebar-no-drag"
          sx={{
            mr: isRTL ? 0 : 2,
            ml: isRTL ? 2 : 0,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo and Title */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: isRTL ? 0 : 3,
            ml: isRTL ? 3 : 0,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
          <FreezeIcon
            sx={{
              fontSize: 32,
              mr: isRTL ? 0 : 1,
              ml: isRTL ? 1 : 0,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t.freezeGuard}
          </Typography>
        </Box>

        {/* Statistics Chips */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          sx={{ 
            display: 'flex', 
            gap: 1, 
            mr: 'auto',
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
          <Chip
            label={`${statistics.totalTargets} ${t.targets}`}
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              fontWeight: 500,
            }}
          />
          <Chip
            label={`${statistics.frozenTargets} ${t.frozenTargets}`}
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
          {activeOperationsCount > 0 && (
            <Chip
              label={`${activeOperationsCount} ${t.activeOperations}`}
              size="small"
              color="warning"
              variant="filled"
              sx={{
                fontWeight: 500,
                animation: 'pulse 2s infinite',
              }}
            />
          )}
        </Box>

        {/* Action Buttons */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
          className="titlebar-no-drag"
        >
          {/* Language Selector */}
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={language}
              onChange={handleLanguageChange}
              variant="outlined"
              sx={{
                color: 'inherit',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '& .MuiSelect-icon': {
                  color: 'inherit',
                },
                height: 36,
              }}
            >
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="ar">AR</MenuItem>
            </Select>
          </FormControl>

          {/* Notifications */}
          <Tooltip title={t.notifications}>
            <IconButton
              color="inherit"
              onClick={handleNotificationsClick}
              sx={{
                position: 'relative',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <NotificationsIcon />
              {unreadNotifications > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'error.main',
                    animation: 'pulse 2s infinite',
                  }}
                />
              )}
            </IconButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title={t.settings}>
            <IconButton
              color="inherit"
              onClick={handleSettingsClick}
              sx={{
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1) rotate(90deg)',
                },
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;