import { createTheme } from "@mui/material/styles";

// Elegant Earth Tones Color Palette from Mood Board
const earthTones = {
  // Beige tones
  beige: {
    light: "#F5F1E8", // Light beige background
    main: "#E8E0D1", // Main beige
    dark: "#D4C9B5", // Darker beige
  },
  // Brown tones
  brown: {
    dark: "#3D2817", // Dark brown for text/titles
    main: "#6B4E3D", // Medium brown for logo/primary
    light: "#8B6F5E", // Lighter brown for secondary text
  },
  // Accent blues (aligned with brand.js)
  green: {
    olive: "#4A8AD4", // Light brand blue
    forest: "#1B5EA8", // Main brand blue
    light: "#7AADE0", // Soft brand blue
  },
  // Orange/Rust tones
  orange: {
    rust: "#B85C38", // Burnt orange/rust
    light: "#C97A5A", // Light rust
    dark: "#8B4225", // Dark rust
  },
};

const theme = createTheme({
  palette: {
    primary: {
      main: earthTones.brown.main, // Medium brown as primary
      light: earthTones.brown.light,
      dark: earthTones.brown.dark,
    },
    secondary: {
      main: earthTones.orange.rust, // Burnt orange as secondary
      light: earthTones.orange.light,
      dark: earthTones.orange.dark,
    },
    info: {
      main: earthTones.green.olive, // Brand blue accent
      light: earthTones.green.light,
      dark: earthTones.green.forest,
    },
    background: {
      default: earthTones.beige.light, // Light beige background
      paper: "#FFFFFF",
      dark: earthTones.brown.dark,
    },
    text: {
      primary: earthTones.brown.dark, // Dark brown for text
      secondary: "#000000", // Body / supporting copy (was earthTones.brown.light)
    },
    success: {
      main: earthTones.green.forest, // Brand blue for success accents
      light: earthTones.green.olive,
      dark: "#0E3D73",
    },
    // Custom earth tone colors for direct use
    earthTones: earthTones,
  },
  typography: {
    fontFamily: '"Cormorant Garamond", "Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      color: earthTones.brown.dark,
    },
    h2: {
      color: earthTones.brown.dark,
    },
    h3: {
      color: earthTones.brown.dark,
    },
    h4: {
      color: earthTones.brown.dark,
    },
    h5: {
      color: earthTones.brown.dark,
    },
    h6: {
      color: earthTones.brown.dark,
    },
    button: {
      textTransform: "none",
    },
    body1: {
      fontSize: "1.2rem",
    },
    body2: {
      fontSize: "1.2rem",
    },
  },
});

export { theme };
