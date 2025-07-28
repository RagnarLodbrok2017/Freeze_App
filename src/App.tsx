import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Alert, Fab, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { initializeApp, toggleSidebar } from './store/slices/appSlice';
import { loadTargets } from './store/slices/targetsSlice';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import Footer from './components/layout/Footer';
import NotificationSystem from './components/common/NotificationSystem';
import LoadingOverlay from './components/common/LoadingOverlay';
import { LanguageProvider } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const { isInitialized, sidebarOpen } = useAppSelector((state) => state.app);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize the application
        await dispatch(initializeApp()).unwrap();
        await dispatch(loadTargets()).unwrap();

        // Setup IPC listeners only if we're in Electron
        if (window.freezeGuardAPI) {
          const handleMenuAction = async (action: string) => {
            try {
              switch (action) {
                case 'add-folder':
                  // 实现添加文件夹逻辑
                  const result = await window.freezeGuardAPI.fileSystem.selectFolder();
                  if (result.success && result.data) {
                    await window.freezeGuardAPI.freezeTarget.add(result.data);
                    await dispatch(loadTargets()).unwrap();
                  }
                  break;
                  
                case 'freeze-all':
                  // 实现冻结所有目标
                  const allTargetsForFreeze = await window.freezeGuardAPI.freezeTarget.getAll();
                  if (allTargetsForFreeze.success && allTargetsForFreeze.data) {
                    const activeTargets = allTargetsForFreeze.data.filter(
                      (target: any) => target.status === 'active'
                    );
                    
                    for (const target of activeTargets) {
                      await window.freezeGuardAPI.freezeTarget.freeze(target.id);
                    }
                    
                    await dispatch(loadTargets()).unwrap();
                  }
                  break;
                  
                case 'restore-all':
                  // 实现恢复所有目标
                  const allTargetsForRestore = await window.freezeGuardAPI.freezeTarget.getAll();
                  if (allTargetsForRestore.success && allTargetsForRestore.data) {
                    const frozenTargets = allTargetsForRestore.data.filter(
                      (target: any) => target.status === 'frozen'
                    );
                    
                    for (const target of frozenTargets) {
                      await window.freezeGuardAPI.freezeTarget.restore(target.id);
                    }
                    
                    await dispatch(loadTargets()).unwrap();
                  }
                  break;
              }
            } catch (error) {
              console.error(`Failed to handle menu action ${action}:`, error);
            }
          };

          // Listen for menu events
          window.freezeGuardAPI.on('menu:add-folder', () => handleMenuAction('add-folder'));
          window.freezeGuardAPI.on('menu:freeze-all', () => handleMenuAction('freeze-all'));
          window.freezeGuardAPI.on('menu:restore-all', () => handleMenuAction('restore-all'));
        }
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize application');
      }
    };

    initApp();

    return () => {
      // Cleanup listeners
      if (window.freezeGuardAPI) {
        window.freezeGuardAPI.removeAllListeners('menu:add-folder');
        window.freezeGuardAPI.removeAllListeners('menu:freeze-all');
        window.freezeGuardAPI.removeAllListeners('menu:restore-all');
      }
    };
  }, [dispatch]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Application Error
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Sidebar />
        </motion.div>

        {/* Main Content */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px 0 0 0',
            margin: '0 8px 8px 0',
            boxShadow: theme.palette.mode === 'light' 
              ? '0 10px 40px rgba(0, 0, 0, 0.1)' 
              : '0 10px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Container
            maxWidth={false}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 24px 0 24px',
              overflow: 'hidden',
            }}
          >
            <MainContent />
          </Container>
          
          {/* Footer */}
          <Footer />
        </Box>
      </Box>

      {/* Global Components */}
      <NotificationSystem />
      <LoadingOverlay />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;