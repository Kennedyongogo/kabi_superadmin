import { alpha } from "@mui/material/styles";
import { BRAND } from "../../brand";

export {
  BRAND,
  BRAND_LOGO_SRC,
} from "../../brand";

export const HOME = {
  ...BRAND,
  cream: "#faf8f4",
  warmWhite: "#fffcf8",
  sky: "#f0f4fa",
  mist: "#e8eef6",
  ink: "#1a2638",
  inkMuted: "rgba(8, 22, 43, 0.72)",
  inkSoft: "rgba(8, 22, 43, 0.55)",
  border: "rgba(12, 35, 64, 0.1)",
  borderGold: "rgba(201, 162, 39, 0.35)",
  shadowSm: "0 8px 24px rgba(8, 22, 43, 0.08)",
  shadowMd: "0 16px 40px rgba(8, 22, 43, 0.12)",
  shadowLg: "0 24px 56px rgba(8, 22, 43, 0.16)",
  heroOverlay:
    "linear-gradient(180deg, rgba(8,22,43,0.38) 0%, rgba(8,22,43,0.12) 42%, rgba(8,22,43,0.06) 62%, rgba(8,22,43,0.32) 100%)",
  heroBackground: `linear-gradient(165deg, ${BRAND.navyDeep} 0%, ${BRAND.navy} 38%, ${BRAND.navyMid} 72%, ${BRAND.green} 100%)`,
  heroBackgroundAccent: `
    radial-gradient(ellipse 70% 55% at 88% 12%, rgba(200, 168, 64, 0.2) 0%, transparent 58%),
    radial-gradient(ellipse 55% 45% at 8% 88%, rgba(27, 94, 168, 0.25) 0%, transparent 52%)
  `,
  heroSplitWhite: "#ffffff",
  heroSplitGreen: BRAND.green,
  heroSplitGreenDark: BRAND.greenDark,
  heroSplitGreenLight: BRAND.greenLight,
  navyGradient: `linear-gradient(135deg, ${BRAND.navyDeep} 0%, ${BRAND.navy} 55%, ${BRAND.navyMid} 100%)`,
  goldGradient: `linear-gradient(135deg, ${BRAND.gold} 0%, ${BRAND.goldMuted} 100%)`,
  fontDisplay: '"Cormorant Garamond", Georgia, serif',
  fontBody: '"Plus Jakarta Sans", "Open Sans", system-ui, sans-serif',
};

export const homeSectionPadding = {
  py: { xs: 5, md: 7 },
  px: { xs: 2, sm: 3, md: 4 },
};

/** Standard body / subtitle text on public home sections */
export const homeBodyFontSize = { xs: "1rem", md: "1.15rem" };

export function homeGlassSx({ radius = 3, blur = true } = {}) {
  return {
    borderRadius: radius,
    background: blur ? "rgba(255, 255, 255, 0.08)" : "rgba(8, 22, 43, 0.62)",
    ...(blur
      ? {
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }
      : {}),
    border: "1px solid rgba(255, 255, 255, 0.16)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.28)",
  };
}

export function homeCardSx(selected = false) {
  return {
    borderRadius: 3,
    bgcolor: "#fff",
    border: `1px solid ${selected ? HOME.borderGold : HOME.border}`,
    boxShadow: selected ? HOME.shadowMd : HOME.shadowSm,
    transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      boxShadow: HOME.shadowMd,
      borderColor: HOME.borderGold,
      transform: "translateY(-4px)",
    },
  };
}

export function homePrimaryButtonSx() {
  return {
    textTransform: "none",
    fontWeight: 700,
    fontFamily: HOME.fontBody,
    borderRadius: "999px",
    px: 3,
    py: 1.25,
    fontSize: "0.95rem",
    color: HOME.navyDeep,
    background: HOME.goldGradient,
    border: "1px solid rgba(255,255,255,0.35)",
    boxShadow: `0 8px 22px ${alpha(BRAND.gold, 0.38)}`,
    "&:hover": {
      background: `linear-gradient(135deg, ${BRAND.goldMuted} 0%, ${BRAND.gold} 100%)`,
      boxShadow: `0 12px 28px ${alpha(BRAND.gold, 0.45)}`,
    },
  };
}

export function homeGhostButtonSx({ light = false } = {}) {
  return {
    textTransform: "none",
    fontWeight: 600,
    fontFamily: HOME.fontBody,
    borderRadius: "999px",
    px: 3,
    py: 1.25,
    fontSize: "0.95rem",
    color: light ? "#fff" : HOME.navy,
    borderColor: light ? "rgba(255,255,255,0.42)" : HOME.border,
    borderWidth: 1.5,
    bgcolor: light ? "rgba(255,255,255,0.08)" : "transparent",
    "&:hover": {
      borderColor: BRAND.gold,
      bgcolor: light ? "rgba(201, 162, 39, 0.14)" : "rgba(201, 162, 39, 0.08)",
      borderWidth: 1.5,
    },
  };
}
