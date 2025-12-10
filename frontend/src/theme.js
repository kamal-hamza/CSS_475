import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#013369', // NFL Blue
      light: '#4f83cc',
      dark: '#001E3C', // Darker blue for contrast
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D50A0A', // NFL Red
      light: '#ff5131',
      dark: '#9b0000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0B1120', // Deep dark blue/black
      paper: '#131B2F',   // Slightly lighter, slightly blue-tinted paper
    },
    text: {
      primary: '#E2E8F0', // Off-white for better readability
      secondary: '#94A3B8', // Muted blue-grey
    },
    success: {
        main: '#10B981',
    },
    info: {
        main: '#3B82F6',
    },
    warning: {
        main: '#F59E0B',
    },
    error: {
        main: '#EF4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(45deg, #fff 30%, #94A3B8 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
        fontWeight: 600,
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
            scrollbarColor: "#4f83cc #0B1120",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              backgroundColor: "transparent",
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: "8px",
              backgroundColor: "#4f83cc", 
              minHeight: 24,
            },
            "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
              backgroundColor: "#013369",
            },
            "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
              backgroundColor: "#013369",
            },
            "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
              backgroundColor: "transparent",
            },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(1, 51, 105, 0.8)', // Semi-transparent
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#131B2F',
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
             transform: 'translateY(-4px)',
             boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
             border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundImage: 'none',
            }
        }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          padding: '8px 16px',
        },
        contained: {
            boxShadow: '0 4px 6px -1px rgba(1, 51, 105, 0.3)',
            '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(1, 51, 105, 0.4)',
            }
        }
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '16px',
        },
        head: {
          fontWeight: 700,
          backgroundColor: '#0F172A', // Darker shade for header
          color: '#94A3B8',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                fontWeight: 600,
                borderRadius: 8,
            }
        }
    },
     MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
  },
});

export default theme;
