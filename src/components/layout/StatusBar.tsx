import React from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../hooks/redux';

const StatusBar: React.FC = () => {
  const { activeOperations, operations } = useAppSelector((state) => state.operations);
  const { statistics } = useAppSelector((state) => state.targets);

  // Get the most recent active operation for progress display
  const currentOperation = operations.find(op => activeOperations.includes(op.id));

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        height: 32,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 2,
        fontSize: '0.75rem',
        position: 'relative',
      }}
    >
      {/* Current Operation Progress */}
      {currentOperation && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {currentOperation.type === 'freeze' ? 'Freezing' : 'Restoring'}: {currentOperation.targetName}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={currentOperation.progress}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: currentOperation.type === 'freeze' 
                    ? 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
                },
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 35 }}>
              {Math.round(currentOperation.progress)}%
            </Typography>
          </Box>

          {/* Operation Details */}
          {currentOperation.speed > 0 && (
            <Tooltip title="Transfer Speed">
              <Chip
                icon={<SpeedIcon />}
                label={formatSpeed(currentOperation.speed)}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Tooltip>
          )}

          {currentOperation.estimatedTimeRemaining && (
            <Tooltip title="Estimated Time Remaining">
              <Typography variant="caption" color="text.secondary">
                ETA: {formatTime(currentOperation.estimatedTimeRemaining)}
              </Typography>
            </Tooltip>
          )}

          <Box sx={{ width: 1, height: 16, backgroundColor: 'divider', mx: 1 }} />
        </>
      )}

      {/* Centered Frozen Status */}
      <Box sx={{ 
        position: 'absolute', 
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Tooltip title="Frozen Targets">
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: statistics.frozenTargets > 0 ? 'success.main' : 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            {statistics.frozenTargets} Frozen
          </Typography>
        </Tooltip>
      </Box>

      {/* System Statistics */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
        <Tooltip title="Total Storage Used">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StorageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {formatBytes(statistics.totalSize)}
            </Typography>
          </Box>
        </Tooltip>

        <Tooltip title="Active Targets">
          <Chip
            label={`${statistics.activeTargets} Active`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Tooltip>

        {statistics.totalChanges > 0 && (
          <Tooltip title="Total Changes Detected">
            <Chip
              label={`${statistics.totalChanges} Changes`}
              size="small"
              color="warning"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Tooltip>
        )}

        {/* Application Status */}
        <Tooltip title="Application Status">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                animation: activeOperations.length > 0 ? 'pulse 2s infinite' : 'none',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {activeOperations.length > 0 ? 'Processing' : 'Ready'}
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default StatusBar;