import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  AcUnit as FreezeIcon,
  Restore as RestoreIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { 
  cancelOperation, 
  clearCompletedOperations, 
  clearFailedOperations,
  clearAllOperations 
} from '../../store/slices/operationsSlice';
import { addNotification } from '../../store/slices/notificationsSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`operations-tabpanel-${index}`}
      aria-labelledby={`operations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Operations: React.FC = () => {
  const dispatch = useAppDispatch();
  const { operations, activeOperations, completedOperations, failedOperations } = useAppSelector((state) => state.operations);
  const { targets } = useAppSelector((state) => state.targets);
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [operationToCancel, setOperationToCancel] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelOperation = (operationId: string) => {
    setOperationToCancel(operationId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (operationToCancel) {
      dispatch(cancelOperation(operationToCancel));
      dispatch(addNotification({
        type: 'info',
        title: 'Operation Cancelled',
        message: 'The operation has been cancelled.',
        duration: 3000,
      }));
    }
    setCancelDialogOpen(false);
    setOperationToCancel(null);
  };

  const handleClearCompleted = () => {
    dispatch(clearCompletedOperations());
    dispatch(addNotification({
      type: 'success',
      title: 'Cleared',
      message: 'Completed operations have been cleared.',
      duration: 2000,
    }));
  };

  const handleClearFailed = () => {
    dispatch(clearFailedOperations());
    dispatch(addNotification({
      type: 'success',
      title: 'Cleared',
      message: 'Failed operations have been cleared.',
      duration: 2000,
    }));
  };

  const handleClearAll = () => {
    dispatch(clearAllOperations());
    dispatch(addNotification({
      type: 'success',
      title: 'Cleared',
      message: 'All operation history has been cleared.',
      duration: 2000,
    }));
  };

  const formatDuration = (startTime: string, endTime?: string): string => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayIcon color="primary" />;
      case 'completed': return <CompleteIcon color="success" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'pending': return <PauseIcon color="warning" />;
      default: return <InfoIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const activeOps = operations.filter(op => activeOperations.includes(op.id));
  const completedOps = operations.filter(op => completedOperations.includes(op.id));
  const failedOps = operations.filter(op => failedOperations.includes(op.id));

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
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
          }}
        >
          Operations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor freeze and restore operations. Track progress and view operation history.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {activeOperations.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active
                  </Typography>
                </Box>
                <PlayIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {completedOperations.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Completed
                  </Typography>
                </Box>
                <CompleteIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {failedOperations.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Failed
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {operations.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total
                  </Typography>
                </Box>
                <HistoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="operations tabs">
            <Tab 
              label={`Active (${activeOperations.length})`} 
              icon={<PlayIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={`Completed (${completedOperations.length})`} 
              icon={<CompleteIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={`Failed (${failedOperations.length})`} 
              icon={<ErrorIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="All History" 
              icon={<HistoryIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Active Operations */}
        <TabPanel value={tabValue} index={0}>
          {activeOps.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PlayIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Active Operations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All operations are currently idle.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activeOps.map((operation) => (
                <motion.div
                  key={operation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {operation.type === 'freeze' ? <FreezeIcon color="primary" /> : <RestoreIcon color="warning" />}
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {operation.type === 'freeze' ? 'Freezing' : 'Restoring'}: {operation.targetName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Started: {new Date(operation.startTime).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={operation.status} 
                            color={getStatusColor(operation.status) as any}
                            size="small"
                          />
                          <Tooltip title="Cancel Operation">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleCancelOperation(operation.id)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Progress */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress: {operation.filesProcessed} / {operation.totalFiles} files
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(operation.progress)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={operation.progress} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      {/* Details */}
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Current File:</strong> {operation.currentFile || 'Processing...'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Speed:</strong> {formatSpeed(operation.speed)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Data Processed:</strong> {formatBytes(operation.bytesProcessed)} / {formatBytes(operation.totalBytes)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>ETA:</strong> {operation.estimatedTimeRemaining ? `${Math.round(operation.estimatedTimeRemaining / 60)}m` : 'Calculating...'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Completed Operations */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Completed Operations</Typography>
            {completedOps.length > 0 && (
              <Button
                startIcon={<ClearIcon />}
                onClick={handleClearCompleted}
                size="small"
              >
                Clear Completed
              </Button>
            )}
          </Box>
          
          {completedOps.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CompleteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Completed Operations
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Operation</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Files</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Completed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedOps.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {operation.type === 'freeze' ? <FreezeIcon color="primary" /> : <RestoreIcon color="warning" />}
                          {operation.type === 'freeze' ? 'Freeze' : 'Restore'}
                        </Box>
                      </TableCell>
                      <TableCell>{operation.targetName}</TableCell>
                      <TableCell>{formatDuration(operation.startTime, operation.endTime)}</TableCell>
                      <TableCell>{operation.totalFiles.toLocaleString()}</TableCell>
                      <TableCell>{formatBytes(operation.totalBytes)}</TableCell>
                      <TableCell>{operation.endTime ? new Date(operation.endTime).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Failed Operations */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Failed Operations</Typography>
            {failedOps.length > 0 && (
              <Button
                startIcon={<ClearIcon />}
                onClick={handleClearFailed}
                size="small"
                color="error"
              >
                Clear Failed
              </Button>
            )}
          </Box>

          {failedOps.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CompleteIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Failed Operations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All operations completed successfully!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {failedOps.map((operation) => (
                <Alert key={operation.id} severity="error">
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {operation.type === 'freeze' ? 'Freeze' : 'Restore'} Failed: {operation.targetName}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Error:</strong> {operation.error || 'Unknown error occurred'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {new Date(operation.startTime).toLocaleString()}
                    </Typography>
                  </Box>
                </Alert>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* All History */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Operation History</Typography>
            {operations.length > 0 && (
              <Button
                startIcon={<ClearIcon />}
                onClick={handleClearAll}
                size="small"
                color="warning"
              >
                Clear All History
              </Button>
            )}
          </Box>

          {operations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Operation History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start freezing or restoring targets to see operation history.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Operation</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operations.slice().reverse().map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(operation.status)}
                          <Chip 
                            label={operation.status} 
                            color={getStatusColor(operation.status) as any}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {operation.type === 'freeze' ? <FreezeIcon color="primary" /> : <RestoreIcon color="warning" />}
                          {operation.type === 'freeze' ? 'Freeze' : 'Restore'}
                        </Box>
                      </TableCell>
                      <TableCell>{operation.targetName}</TableCell>
                      <TableCell>{new Date(operation.startTime).toLocaleString()}</TableCell>
                      <TableCell>
                        {operation.status === 'running' 
                          ? formatDuration(operation.startTime)
                          : operation.endTime 
                            ? formatDuration(operation.startTime, operation.endTime)
                            : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {operation.status === 'running' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={operation.progress} 
                              sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">
                              {Math.round(operation.progress)}%
                            </Typography>
                          </Box>
                        ) : (
                          `${Math.round(operation.progress)}%`
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Operation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this operation? This action cannot be undone and may leave the target in an inconsistent state.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Running</Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            Cancel Operation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Operations;