import React from 'react';
import {
  Backdrop,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../hooks/redux';

const LoadingOverlay: React.FC = () => {
  const { isLoading } = useAppSelector((state) => state.app);
  const { isLoading: targetsLoading } = useAppSelector((state) => state.targets);
  const { isLoading: settingsLoading } = useAppSelector((state) => state.settings);

  const showLoading = isLoading || targetsLoading || settingsLoading;

  if (!showLoading) return null;

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
      }}
      open={showLoading}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 4,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#667eea',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          Loading...
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            maxWidth: 300,
          }}
        >
          Please wait while we initialize the application
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;