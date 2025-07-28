import { createTheme } from '@mui/material/styles';

type PaletteMode = 'light' | 'dark';

export const createAppTheme = (mode: PaletteMode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#667eea',
        light: '#8fa4f3',
        dark: '#4c63d2',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#764ba2',
        light: '#9575cd',
        dark: '#512da8',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f0f23',
        paper: mode === 'light' ? '#ffffff' : '#1a1a2e',
      },
      text: {
        primary: mode === 'light' ? '#1a202c' : '#ffffff',
        secondary: mode === 'light' ? '#4a5568' : '#b0b0b0',
      },
      error: {
        main: '#e53e3e',
        light: '#fc8181',
        dark: '#c53030',
      },
      warning: {
        main: '#dd6b20',
        light: '#f6ad55',
        dark: '#c05621',
      },
      success: {
        main: '#38a169',
        light: '#68d391',
        dark: '#2f855a',
      },
      info: {
        main: '#3182ce',
        light: '#63b3ed',
        dark: '#2c5282',
      },
      ...(mode === 'dark' && {
        divider: 'rgba(255, 255, 255, 0.12)',
        action: {
          hover: 'rgba(255, 255, 255, 0.08)',
          selected: 'rgba(255, 255, 255, 0.12)',
        },
      }),
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none' as const,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: mode === 'light' 
                ? '0px 4px 12px rgba(0, 0, 0, 0.15)' 
                : '0px 4px 12px rgba(255, 255, 255, 0.1)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'light' 
              ? '0px 4px 20px rgba(0, 0, 0, 0.08)' 
              : '0px 4px 20px rgba(0, 0, 0, 0.3)',
            border: mode === 'light' 
              ? '1px solid rgba(0, 0, 0, 0.05)' 
              : '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: mode === 'light' 
                ? '0px 8px 30px rgba(0, 0, 0, 0.12)' 
                : '0px 8px 30px rgba(0, 0, 0, 0.4)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light' 
              ? '0px 4px 20px rgba(0, 0, 0, 0.08)' 
              : '0px 4px 20px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 6,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.9)' 
              : 'rgba(26, 26, 46, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: mode === 'light' 
              ? '0px 2px 10px rgba(0, 0, 0, 0.05)' 
              : '0px 2px 10px rgba(0, 0, 0, 0.3)',
            color: mode === 'light' ? '#1a202c' : '#ffffff',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRight: mode === 'light' 
              ? '1px solid rgba(0, 0, 0, 0.08)' 
              : '1px solid rgba(255, 255, 255, 0.12)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '4px 8px',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.08)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(102, 126, 234, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.16)',
              },
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' 
              ? 'rgba(0, 0, 0, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            color: mode === 'light' ? '#ffffff' : '#000000',
            borderRadius: 8,
            fontSize: '0.75rem',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: mode === 'light' 
              ? '0px 20px 60px rgba(0, 0, 0, 0.2)' 
              : '0px 20px 60px rgba(0, 0, 0, 0.5)',
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiSnackbarContent-root': {
              borderRadius: 12,
              boxShadow: mode === 'light' 
                ? '0px 8px 30px rgba(0, 0, 0, 0.15)' 
                : '0px 8px 30px rgba(0, 0, 0, 0.4)',
            },
          },
        },
      },
    },
  });
};

// Default light theme for backward compatibility
export const theme = createAppTheme('light');