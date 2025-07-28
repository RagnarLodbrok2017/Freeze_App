import React, { useState } from 'react';
import { Box, Typography, Link, IconButton, Tooltip } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import About from '../common/About';

const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleEmailClick = () => {
    window.open('mailto:ahmedrmohamed2017@gmail.com', '_blank');
  };

  const handleAboutClick = () => {
    setAboutOpen(true);
  };

  return (
    <>
      <Box
        component={motion.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          borderTop: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}
      >
        {/* Main Footer Text */}
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 400,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
          {t.designedBy}{' '}
          <Link
            component="button"
            onClick={handleEmailClick}
            sx={{
              mx: 0.5,
              color: 'transparent',
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 600,
              fontSize: '0.75rem',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transform: 'scale(1.05)',
              },
              '&:focus': {
                outline: 'none',
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              },
            }}
          >
            {t.developerName}
          </Link>
        </Typography>

        {/* About Button */}
        <Tooltip title={t.about}>
          <IconButton
            size="small"
            onClick={handleAboutClick}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                background: 'rgba(102, 126, 234, 0.08)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* About Dialog */}
      <About open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
};

export default Footer;