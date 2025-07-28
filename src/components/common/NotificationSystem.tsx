import React, { useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  Box,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { removeNotification } from '../../store/slices/notificationsSlice';

function SlideTransition(props: TransitionProps & { children: React.ReactElement }) {
  return <Slide {...props} direction="left" />;
}

const NotificationSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notifications);

  // Auto-remove notifications after their duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);
        
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, dispatch]);

  const handleClose = (notificationId: string) => {
    dispatch(removeNotification(notificationId));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
      }}
    >
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              ease: 'easeOut',
            }}
            style={{ zIndex: 9999 - index }}
          >
            <Alert
              severity={notification.type}
              onClose={() => handleClose(notification.id)}
              sx={{
                width: '100%',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
                {notification.title}
              </AlertTitle>
              {notification.message}
              
              {/* Action buttons if any */}
              {notification.actions && notification.actions.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  {notification.actions.map((action, actionIndex) => (
                    <motion.button
                      key={actionIndex}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: 6,
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: '#667eea',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => {
                        // Handle action click
                        console.log(`Action clicked: ${action.action}`);
                        handleClose(notification.id);
                      }}
                    >
                      {action.label}
                    </motion.button>
                  ))}
                </Box>
              )}
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default NotificationSystem;