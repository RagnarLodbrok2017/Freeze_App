import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  AcUnit as FreezeIcon,
  Timeline as MonitorIcon,
  Security as SecurityIcon,
  Devices as CrossPlatformIcon,
  Palette as ThemeIcon,
  Notifications as NotificationIcon,
  Email as EmailIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface AboutProps {
  open: boolean;
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ open, onClose }) => {
  const { t, isRTL } = useLanguage();

  const handleEmailClick = () => {
    window.open('mailto:ahmedrmohamed2017@gmail.com', '_blank');
  };

  const features = [
    {
      icon: <FreezeIcon />,
      text: t.featuresList.freezeTargets,
      color: 'primary',
    },
    {
      icon: <MonitorIcon />,
      text: t.featuresList.realTimeMonitoring,
      color: 'success',
    },
    {
      icon: <SecurityIcon />,
      text: t.featuresList.secureOperations,
      color: 'warning',
    },
    {
      icon: <CrossPlatformIcon />,
      text: t.featuresList.crossPlatform,
      color: 'info',
    },
    {
      icon: <ThemeIcon />,
      text: t.featuresList.darkMode,
      color: 'secondary',
    },
    {
      icon: <NotificationIcon />,
      text: t.featuresList.notifications,
      color: 'error',
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pb: 1,
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '2rem',
          fontWeight: 700,
        }}
      >
        {t.aboutTitle}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* App Description */}
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              textAlign: isRTL ? 'right' : 'left',
              lineHeight: 1.7,
              color: 'text.primary',
            }}
          >
            {t.aboutDescription}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Developer Info */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}
          >
            <Avatar
              sx={{
                width: 60,
                height: 60,
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                mr: isRTL ? 0 : 2,
                ml: isRTL ? 2 : 0,
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              AE
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                Ahmed Rezk Elnakieb
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  mb: 1,
                  justifyContent: isRTL ? 'flex-end' : 'flex-start',
                }}
              >
                <Chip
                  icon={<CodeIcon />}
                  label="Software Engineer"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<EmailIcon />}
                  label="Contact"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  onClick={handleEmailClick}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  textAlign: isRTL ? 'right' : 'left',
                  lineHeight: 1.6,
                }}
              >
                {t.developerInfo}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Features */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t.features}
          </Typography>

          <List sx={{ py: 0 }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    py: 1,
                    px: 0,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: `${feature.color}.main`,
                      minWidth: isRTL ? 'auto' : 40,
                      mr: isRTL ? 0 : 1,
                      ml: isRTL ? 1 : 0,
                    }}
                  >
                    {feature.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={feature.text}
                    sx={{
                      textAlign: isRTL ? 'right' : 'left',
                      '& .MuiListItemText-primary': {
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                </ListItem>
              </motion.div>
            ))}
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Version Info */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t.version} 1.0.0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              © 2024 Ahmed Rezk Elnakieb
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
            },
            borderRadius: 2,
            px: 3,
          }}
        >
          {t.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default About;