// ============================================================
// CENTRAL CONFIGURATION FILE
// All adjustable sizes, positions, colors, and dimensions
// are configured here for easy modification.
// ============================================================

// --- Platform Canvas Dimensions ---
export const PLATFORM_CONFIGS = {
  insta: {
    label: 'Instagram',
    width: 1080,
    height: 1080,
    icon: '📸',
  },
  linkedin: {
    label: 'LinkedIn',
    width: 1200,
    height: 627,
    icon: '💼',
  },
  twitter: {
    label: 'Twitter / X',
    width: 1600,
    height: 900,
    icon: '🐦',
  },
  ecomms: {
    label: 'E-Comms',
    width: 600,
    height: 800,
    icon: '📧',
  },
};

export const PLATFORMS = Object.keys(PLATFORM_CONFIGS);

// --- Font Configuration ---
export const FONTS = {
  title: 'CondeSansBold',        // CondeSans-Bold.otf
  subtitle: 'UniversLTStd',      // UniversLTStd.otf
  subtitleBold: 'UniversLTStdBold', // UniversLTStd-Bold.otf
};

// --- Font Color Options ---
export const FONT_COLORS = ['#FFFFFF', '#ACEAFF'];

// --- Default Text Elements (per platform) ---
// Each platform starts with 1 title and 1 subtitle, centered.
// User can add up to MAX_TITLES / MAX_SUBTITLES of each.
export const MAX_TITLES = 3;
export const MAX_SUBTITLES = 3;

// Per-platform text settings
const TEXT_SETTINGS = {
  insta: {
    title: { size: 72, minSize: 36, maxSize: 120, wrapWidthFraction: 0.75 },
    subtitle: { size: 36, minSize: 16, maxSize: 60, wrapWidthFraction: 0.75 },
  },
  linkedin: {
    title: { size: 56, minSize: 28, maxSize: 90, wrapWidthFraction: 0.70 },
    subtitle: { size: 28, minSize: 14, maxSize: 48, wrapWidthFraction: 0.70 },
  },
  twitter: {
    title: { size: 72, minSize: 36, maxSize: 120, wrapWidthFraction: 0.65 },
    subtitle: { size: 36, minSize: 18, maxSize: 60, wrapWidthFraction: 0.65 },
  },
  ecomms: {
    title: { size: 48, minSize: 24, maxSize: 80, wrapWidthFraction: 0.80 },
    subtitle: { size: 24, minSize: 12, maxSize: 40, wrapWidthFraction: 0.80 },
  },
};

export const createDefaultTextElements = (platformKey) => {
  const config = PLATFORM_CONFIGS[platformKey];
  const ts = TEXT_SETTINGS[platformKey] || TEXT_SETTINGS.insta;
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const titleWrap = Math.min(config.width * ts.title.wrapWidthFraction, 900);
  const subWrap = Math.min(config.width * ts.subtitle.wrapWidthFraction, 900);

  return [
    {
      id: 'title1',
      text: 'Title 1',
      x: centerX,
      y: centerY - ts.title.size * 0.8,
      size: ts.title.size,
      minSize: ts.title.minSize,
      maxSize: ts.title.maxSize,
      color: '#FFFFFF',
      isTitle: true,
      maxLength: 60,
      font: FONTS.title,
      isBold: true, // always bold for titles
      wrapWidth: titleWrap,
      textAlign: 'center',
    },
    {
      id: 'subtitle1',
      text: 'Subtitle 1',
      x: centerX,
      y: centerY + ts.subtitle.size * 0.8,
      size: ts.subtitle.size,
      minSize: ts.subtitle.minSize,
      maxSize: ts.subtitle.maxSize,
      color: '#FFFFFF',
      isTitle: false,
      maxLength: 90,
      font: FONTS.subtitle,
      isBold: false,
      wrapWidth: subWrap,
      textAlign: 'center',
    },
  ];
};

// --- KPMG Logo Configuration ---
// Per-platform logo widths (aspect ratio maintained automatically)
export const LOGO_CONFIG = {
  path: '/assets/KPMG_blue_logo.svg',
  // Per-platform logo width in px
  widths: {
    insta: 100,
    linkedin: 130,
    twitter: 150,
    ecomms: 80,
  },
  // Default positions per platform (top-left with padding)
  positions: {
    insta: { x: 30, y: 30 },
    linkedin: { x: 30, y: 30 },
    twitter: { x: 30, y: 30 },
    ecomms: { x: 30, y: 30 },
  },
};

// --- Draft Version Stamp ---
export const DRAFT_STAMP_CONFIG = {
  width: 150,
  height: 70,
  bgColor: '#FEFCBF',        // Light yellow
  textColor: '#EF4444',       // Red
  text: 'Draft Version',
  fontSize: 16,
  fontFamily: 'Inter, Arial, sans-serif',
  padding: 15,                // Distance from canvas edge
  position: 'top-right',      // Always top-right
  cornerRadius: 6,
};

// --- Window Motif Configuration ---
export const WINDOW_MOTIF_DEFAULTS = {
  // Initial window size as fraction of canvas (will be at least 20%)
  initialWidthFraction: 0.4,
  initialHeightFraction: 0.5,
  minCoverFraction: 0.20, // Minimum 20% of canvas area
  aspectRatio: '7:10',    // Default; switchable to '10:7'
  defaultGradient: 'dark', // 'medium', 'medium', 'light'
};

// All 3 gradient options — NO saturation, 80% opacity overlay
export const MOTIF_GRADIENTS = {
  dark: {
    label: 'Dark Blue',
    from: '#0c233c',
    to: '#00338d',
    opacity: 0.8,
  },
  medium: {
    label: 'Medium Blue',
    from: '#00338d',
    to: '#1e49e2',
    opacity: 0.8,
  },
  light: {
    label: 'Light Blue',
    from: '#1e49e2',
    to: '#00b8f5',
    opacity: 0.8,
  },
};

// --- Swoosh Configuration ---
// Per-platform swoosh dimensions (width × height in px)
export const SWOOSH_CONFIG = {
  // Number of horizontal pixel-band samples for color sampling
  sampleBandSize: 30,
  // Fraction of swoosh width that stays fully opaque (100% opacity)
  // After this fraction, opacity fades linearly to 0% at far end.
  opaqueFraction: 0.6,
  defaultSide: 'right', // 'left' or 'right'
  // Per-platform swoosh dimensions
  platforms: {
    insta: { width: 120, height: 80 },
    linkedin: { width: 180, height: 100 },
    twitter: { width: 200, height: 100 },
    ecomms: { width: 80, height: 60 },
  },
};

// --- Grid Configuration ---
export const GRID_CONFIG = {
  defaultRatio: '7:10',
  density: 15, // Increased density for smaller grid boxes
  color: 'rgba(255, 255, 255, 0.3)',
  lineWidth: 1,
};

// --- Session Storage Key ---
export const SESSION_STORAGE_KEY = 'image_content_factory_session';
