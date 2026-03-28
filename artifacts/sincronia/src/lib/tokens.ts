/**
 * Design Tokens — Sincronia
 * Neo-Brutalism Romantic Theme
 */

export const tokens = {
  colors: {
    // Primary palette — Deep Burgundy (passion mature)
    burgundy: {
      50: "#FDF2F4",
      100: "#FBE2E6",
      200: "#F7C5CF",
      300: "#F19FB0",
      400: "#E87089",
      500: "#DD4A6B",
      600: "#C43354",
      700: "#A32845",
      800: "#85243D",
      900: "#4A0E1F",
    },
    
    // Secondary — Dusty Rose (soft romance)
    rose: {
      50: "#FFF5F7",
      100: "#FFE5EB",
      200: "#FFC5D5",
      300: "#FF94B2",
      400: "#FF5A85",
      500: "#FF2E6D",
      600: "#F71E5F",
      700: "#C48A9B",
      800: "#9B5C6F",
      900: "#8B3A5A",
    },
    
    // Neutral — Warm Sand (human warmth)
    sand: {
      50: "#FDFBF8",
      100: "#F9F5F0",
      200: "#F5EFE6",
      300: "#EBE0D5",
      400: "#DCC8B8",
      500: "#C9AD94",
      600: "#B0927A",
      700: "#8F7460",
      800: "#755F4F",
      900: "#5C4B3F",
    },
    
    // Accent — Electric Pink (modern energy)
    electric: {
      50: "#FFF0F5",
      100: "#FFD9E8",
      200: "#FFB0D0",
      300: "#FF7FB3",
      400: "#FF5A9B",
      500: "#FF2E6D",
      600: "#E61E5F",
      700: "#BF144F",
      800: "#991242",
      900: "#7A1238",
    },
    
    // Feedback
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  
  typography: {
    // Display — Playfair Display (elegant serif)
    display: {
      family: "'Playfair Display', Georgia, serif",
      weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    
    // Body — General Sans (modern geometric)
    body: {
      family: "'General Sans', 'Inter', system-ui, sans-serif",
      weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    
    sizes: {
      xs: "0.75rem",     // 12px
      sm: "0.875rem",    // 14px
      base: "1rem",      // 16px
      lg: "1.125rem",    // 18px
      xl: "1.25rem",     // 20px
      "2xl": "1.5rem",   // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem",  // 36px
      "5xl": "3rem",     // 48px
      "6xl": "3.75rem",  // 60px
      "7xl": "4.5rem",   // 72px
    },
    
    lineHeights: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  
  spacing: {
    0: "0",
    1: "0.25rem",   // 4px
    2: "0.5rem",    // 8px
    3: "0.75rem",   // 12px
    4: "1rem",      // 16px
    5: "1.25rem",   // 20px
    6: "1.5rem",    // 24px
    8: "2rem",      // 32px
    10: "2.5rem",   // 40px
    12: "3rem",     // 48px
    16: "4rem",     // 64px
    20: "5rem",     // 80px
    24: "6rem",     // 96px
  },
  
  radius: {
    none: "0",
    sm: "0.25rem",   // 4px
    md: "0.5rem",    // 8px
    lg: "1rem",      // 16px
    xl: "1.5rem",    // 24px
    "2xl": "2rem",   // 32px
    "3xl": "3rem",   // 48px
    full: "9999px",
  },
  
  shadow: {
    // Soft shadows (claymorphism)
    soft: {
      sm: "0 2px 8px rgba(74, 14, 31, 0.08)",
      md: "0 4px 16px rgba(74, 14, 31, 0.12)",
      lg: "0 8px 32px rgba(74, 14, 31, 0.16)",
      xl: "0 16px 48px rgba(74, 14, 31, 0.2)",
    },
    
    // Hard shadows (neo-brutalism)
    hard: {
      sm: "2px 2px 0px rgba(74, 14, 31, 1)",
      md: "4px 4px 0px rgba(74, 14, 31, 1)",
      lg: "6px 6px 0px rgba(74, 14, 31, 1)",
      xl: "8px 8px 0px rgba(74, 14, 31, 1)",
    },
    
    // Colored shadows
    colored: {
      burgundy: "0 4px 16px rgba(221, 74, 107, 0.3)",
      rose: "0 4px 16px rgba(255, 46, 109, 0.3)",
      electric: "0 4px 16px rgba(255, 46, 109, 0.4)",
    },
  },
  
  border: {
    width: {
      none: "0",
      thin: "1px",
      medium: "2px",
      thick: "4px",
    },
    
    style: {
      solid: "solid",
      double: "double",
      dashed: "dashed",
      dotted: "dotted",
    },
  },
  
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    toast: 1500,
  },
  
  motion: {
    duration: {
      micro: "100ms",
      fast: "200ms",
      normal: "300ms",
      slow: "500ms",
    },
    
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      enter: "cubic-bezier(0, 0, 0.2, 1)",
      exit: "cubic-bezier(0.4, 0, 1, 1)",
      spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },
} as const;

export type Tokens = typeof tokens;
