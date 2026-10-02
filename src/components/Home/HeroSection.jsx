import React, { useEffect, useState } from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import { useNavigate } from "react-router-dom";
import { BRAND } from "../../brand";
import { HOME } from "./homeShared";
import HeroUpcomingActivities from "./HeroUpcomingActivities";

const SLIDE_INTERVAL_MS = 6500;
const SLIDE_CROSSFADE_MS = 1800;

const HERO_FEATURES = [
  {
    icon: SchoolRoundedIcon,
    title: "Faith-Based Education",
    subtitle: "Rooted in Christian values",
  },
  {
    icon: MedicalServicesRoundedIcon,
    title: "Practical Training",
    subtitle: "Hands-on clinical experience",
  },
  {
    icon: FavoriteRoundedIcon,
    title: "Compassionate Care",
    subtitle: "Putting patients first",
  },
];

const HERO_STATS = [
  {
    value: "98%",
    label: "Graduate Employment Rate",
    description: "Our graduates are making a difference worldwide",
    icon: WorkOutlineRoundedIcon,
  },
  {
    value: "500+",
    label: "Healthcare Professionals Trained",
    description: "Empowering the next generation of medical leaders",
    icon: GroupsRoundedIcon,
  },
  {
    value: "15+",
    label: "Clinical Partnerships",
    description: "Collaborating with hospitals and health centres",
    icon: HandshakeRoundedIcon,
  },
];

const HERO_IMAGES = [
  { file: "kendu 1.jpg", alt: "Graduates celebrating at Kendu Adventist School of Medical Sciences" },
  { file: "kendu 2.jpg", alt: "Medical student practicing clinical skills on a training mannequin" },
  { file: "kendu 3.jpg", alt: "Students learning in a classroom at Kendu Adventist School of Medical Sciences" },
  { file: "kendu 4.jpg", alt: "School sports field and campus grounds at Kendu Adventist School of Medical Sciences" },
];

const primaryCtaSx = {
  textTransform: "uppercase",
  fontFamily: HOME.fontBody,
  fontWeight: 700,
  fontSize: { xs: "0.72rem", md: "0.76rem" },
  letterSpacing: "0.05em",
  color: "#fff",
  bgcolor: HOME.heroSplitGreen,
  borderRadius: "12px",
  px: { xs: 2, md: 2.75 },
  py: { xs: 1, md: 1.15 },
  boxShadow: "0 10px 24px rgba(27, 94, 168, 0.35)",
  transition: "transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease",
  "&:hover": {
    bgcolor: HOME.heroSplitGreenDark,
    transform: "translateY(-3px)",
    boxShadow: "0 16px 32px rgba(27, 94, 168, 0.45)",
  },
};

const secondaryCtaSx = {
  textTransform: "none",
  fontFamily: HOME.fontBody,
  fontWeight: 700,
  fontSize: { xs: "0.8rem", md: "0.85rem" },
  color: BRAND.gold,
  bgcolor: "#fff",
  border: `2px solid ${BRAND.gold}`,
  borderRadius: "12px",
  px: { xs: 2, md: 2.5 },
  py: { xs: 0.95, md: 1.05 },
  transition: "transform 0.25s ease, color 0.25s ease, border-color 0.25s ease",
  "&:hover": {
    bgcolor: "#fff",
    color: HOME.heroSplitGreen,
    borderColor: HOME.heroSplitGreen,
    transform: "translateY(-3px)",
  },
};

function heroImageSrc(filename) {
  return `/images/${encodeURIComponent(filename)}`;
}

/**
 * Desktop-only layered curved split (md+).
 * Gold rim → green curved panel → photo with matching left curve.
 * Small screens keep the stacked layout and never render this.
 */
function HeroDesktopCurvedSplit({ children }) {
  return (
    <Box
      sx={{
        display: { xs: "none", md: "block" },
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Gold rim (slightly larger so a gold edge peeks out) */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: 0,
          bottom: "-10%",
          width: "56%",
          bgcolor: BRAND.gold,
          borderRadius: "100% 0 0 100%",
          boxShadow: `-8px 0 28px rgba(200, 168, 64, 0.4)`,
        }}
      />

      {/* Dark green curved panel */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: 0,
          bottom: "-10%",
          width: "55.2%",
          bgcolor: HOME.heroSplitGreenDark,
          borderRadius: "100% 0 0 100%",
        }}
      />

      {/* Mid green depth layer */}
      <Box
        sx={{
          position: "absolute",
          top: "-6%",
          right: 0,
          bottom: "-6%",
          width: "53.5%",
          bgcolor: HOME.heroSplitGreen,
          borderRadius: "100% 0 0 100%",
          opacity: 0.5,
        }}
      />

      {/* Photo sits inside the green curve */}
      <Box
        sx={{
          position: "absolute",
          top: 32,
          right: 0,
          bottom: 32,
          left: "47%",
          borderRadius: "100% 0 0 100%",
          overflow: "hidden",
          boxShadow: "0 32px 64px rgba(0,0,0,0.35)",
          pointerEvents: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function HeroFeatureItem({ icon: Icon, title, subtitle }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, md: 1.25 },
        flex: 1,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: { xs: 34, md: 44 },
          height: { xs: 34, md: 44 },
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(27, 94, 168, 0.09)",
          color: HOME.heroSplitGreen,
        }}
      >
        <Icon sx={{ fontSize: { xs: 18, md: 22 } }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1, pr: { xs: 0.35, md: 0 } }}>
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 800,
            fontSize: { xs: "0.58rem", md: "0.7rem" },
            color: HOME.ink,
            lineHeight: 1.2,
            mb: 0.15,
            letterSpacing: { xs: "0.01em", md: "0.03em" },
            textTransform: "uppercase",
            overflowWrap: "break-word",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontSize: { xs: "0.58rem", md: "0.68rem" },
            fontWeight: 700,
            color: HOME.inkSoft,
            lineHeight: 1.3,
            display: { xs: "-webkit-box", md: "block" },
            WebkitLineClamp: { xs: 2, md: "unset" },
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            overflowWrap: "break-word",
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}

function HeroStatItem({ stat, showBorder }) {
  const Icon = stat.icon;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 0.75, sm: 1, md: 1.5 },
        px: { xs: 1, sm: 1.5, md: 2.5, lg: 3 },
        py: { xs: 1.1, md: 0 },
        borderLeft: showBorder ? "1px solid rgba(255,255,255,0.14)" : "none",
        height: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: { xs: 28, sm: 32, md: 40 },
          height: { xs: 28, sm: 32, md: 40 },
          borderRadius: "50%",
          flexShrink: 0,
          display: { xs: "none", sm: "grid" },
          placeItems: "center",
          bgcolor: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: BRAND.gold,
        }}
      >
        <Icon sx={{ fontSize: { sm: 16, md: 20 } }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
        <Typography
          sx={{
            fontFamily: HOME.fontDisplay,
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.65rem" },
            fontWeight: 700,
            color: BRAND.gold,
            lineHeight: 1,
            mb: 0.1,
          }}
        >
          {stat.value}
        </Typography>
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontSize: { xs: "0.48rem", sm: "0.52rem", md: "0.58rem" },
            fontWeight: 700,
            color: "#fff",
            letterSpacing: { xs: "0.02em", md: "0.05em" },
            textTransform: "uppercase",
            mb: 0.1,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {stat.label}
        </Typography>
        <Typography
          sx={{
            display: { xs: "none", md: "block" },
            fontFamily: HOME.fontBody,
            fontSize: { md: "0.68rem" },
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {stat.description}
        </Typography>
      </Box>
    </Box>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();
  const [slideUrls, setSlideUrls] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const urls = HERO_IMAGES.map((img) => heroImageSrc(img.file));

    Promise.all(
      urls.map(
        (src) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(src);
            image.onerror = () => resolve(null);
            image.src = src;
          })
      )
    ).then((resolved) => {
      if (cancelled) return;
      setSlideUrls(resolved.filter(Boolean));
      setActiveSlide(0);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slideUrls.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setActiveSlide((i) => (i + 1) % slideUrls.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slideUrls.length]);

  useEffect(() => {
    const heroSection = document.getElementById("hero-section");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting && entry.intersectionRatio > 0.2;
          const scrollY = window.scrollY;
          const isAtTop = scrollY <= 20;
          window.dispatchEvent(
            new CustomEvent("heroVisibilityChange", {
              detail: { isVisible: visible && isAtTop, intersectionRatio: entry.intersectionRatio, scrollY },
            })
          );
        });
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0], rootMargin: "0px" }
    );

    observer.observe(heroSection);

    const t = window.setTimeout(() => {
      const rect = heroSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      const isAtTop = window.scrollY <= 20;
      window.dispatchEvent(
        new CustomEvent("heroVisibilityChange", {
          detail: { isVisible: isInView && isAtTop, intersectionRatio: isInView ? 1 : 0, scrollY: window.scrollY },
        })
      );
    }, 200);

    return () => {
      observer.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <Box
      id="hero-section"
      sx={{
        position: "relative",
        width: "100%",
        marginTop: "-80px",
        bgcolor: "#fff",
        // Desktop: lock to viewport. Mobile: natural height so nothing is clipped.
        height: { xs: "auto", md: "100vh" },
        minHeight: { xs: "100svh", md: "100vh" },
        maxHeight: { xs: "none", md: "100vh" },
        display: "flex",
        flexDirection: "column",
        overflow: { xs: "visible", md: "hidden" },
        "@supports (height: 100svh)": {
          height: { xs: "auto", md: "100svh" },
          minHeight: { xs: "100svh", md: "100svh" },
          maxHeight: { xs: "none", md: "100svh" },
        },
      }}
    >
      {/* Main hero stage */}
      <Box
        sx={{
          position: "relative",
          flex: { xs: "1 1 auto", md: 1 },
          minHeight: { xs: 0, md: 0 },
          display: "flex",
          flexDirection: "column",
          bgcolor: { xs: "transparent", md: "#fff" },
        }}
      >
        {/* Desktop curved split + photo (hidden on small screens) */}
        <HeroDesktopCurvedSplit>
          {slideUrls.map((src, index) => {
            const imageMeta = HERO_IMAGES.find((img) => heroImageSrc(img.file) === src);
            return (
              <Box
                key={`desk-${src}`}
                component="img"
                src={src}
                alt={imageMeta?.alt ?? ""}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  opacity: index === activeSlide ? 1 : 0,
                  transition: `opacity ${SLIDE_CROSSFADE_MS}ms ease-in-out`,
                }}
              />
            );
          })}
        </HeroDesktopCurvedSplit>

        {/* Floating upcoming-activity shapes — non-blocking, hero only */}
        <HeroUpcomingActivities />

        <Box
          sx={{
            position: "relative",
            zIndex: 3,
            flex: { xs: "1 1 auto", md: 1 },
            minHeight: 0,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Left / top content */}
          <Box
            sx={{
              position: "relative",
              flex: { xs: "0 0 auto", md: "0 0 46%" },
              height: { md: "100%" },
              pt: { xs: "88px", sm: "92px", md: "108px" },
              pb: { xs: 1.5, md: 1.5 },
              pl: { xs: 2, sm: 2.5, md: "clamp(40px, 5vw, 80px)" },
              pr: { xs: 2, sm: 2.5, md: 2 },
              zIndex: 2,
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              background: {
                xs: `
                  linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%),
                  radial-gradient(circle at top left, rgba(27, 94, 168, 0.05), transparent 55%)
                `,
                md: "transparent",
              },
            }}
          >
            <Box sx={{ maxWidth: { xs: "100%", md: 500 }, width: "100%" }}>
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: { xs: "0.55rem", sm: "0.58rem", md: "0.65rem" },
                  fontWeight: 700,
                  color: BRAND.gold,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  mb: { xs: 0.75, md: 1.25 },
                }}
              >
                — Excellence in Medical Education Since 1948
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontSize: { xs: "1.55rem", sm: "1.85rem", md: "clamp(2rem, 3.2vw, 52px)" },
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: { md: "-1.5px" },
                  color: BRAND.navy,
                  mb: { xs: 1, md: 1.5 },
                }}
              >
                Shaping the Future of{" "}
                <Box component="span" sx={{ color: BRAND.gold }}>
                  Healthcare
                </Box>
              </Typography>

              <Box
                sx={{
                  width: { xs: 44, md: 56 },
                  height: 3,
                  bgcolor: HOME.heroSplitGreen,
                  borderRadius: 4,
                  mb: { xs: 1, md: 1.5 },
                }}
              />

              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: { xs: "0.78rem", sm: "0.85rem", md: "0.9rem" },
                  fontWeight: 500,
                  color: HOME.inkMuted,
                  lineHeight: 1.5,
                  maxWidth: 420,
                  display: "-webkit-box",
                  WebkitLineClamp: { xs: 3, md: 3 },
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {BRAND.name}—where faith meets excellence in clinical training, research, and
                compassionate patient care.
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: { xs: 1.5, md: 2.5 } }}
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: "1.1rem !important" }} />}
                  onClick={() =>
                    navigate("/admission/apply", { state: { from: "/", fromLabel: "Home" } })
                  }
                  sx={primaryCtaSx}
                >
                  Apply Admission
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionOutlinedIcon sx={{ fontSize: "1rem !important" }} />}
                  onClick={() => navigate("/about-us")}
                  sx={secondaryCtaSx}
                >
                  About Us
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Mobile image only — desktop uses HeroDesktopCurvedSplit */}
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              position: "relative",
              flex: "1 1 38%",
              minHeight: { xs: 180, sm: 220 },
              bgcolor: HOME.heroSplitGreenDark,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                bottom: 12,
                left: 12,
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 16px 36px rgba(0,0,0,0.28)",
                bgcolor: HOME.heroSplitGreenDark,
              }}
            >
              {slideUrls.map((src, index) => {
                const imageMeta = HERO_IMAGES.find((img) => heroImageSrc(img.file) === src);
                return (
                  <Box
                    key={`mob-${src}`}
                    component="img"
                    src={src}
                    alt={imageMeta?.alt ?? ""}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "auto"}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      opacity: index === activeSlide ? 1 : 0,
                      transition: `opacity ${SLIDE_CROSSFADE_MS}ms ease-in-out`,
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Feature card — always a horizontal row */}
        <Box
          sx={{
            position: "relative",
            zIndex: 6,
            flexShrink: 0,
            mx: { xs: 1.5, md: "clamp(32px, 5vw, 80px)" },
            mt: { xs: -1.5, md: 0 },
            mb: { xs: 1.25, md: 1 },
            bgcolor: "#fff",
            borderRadius: { xs: "18px", md: "28px" },
            pl: { xs: 1.5, md: 3 },
            pr: { xs: 2, md: 3 },
            py: { xs: 1.25, md: 1.75 },
            boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "row",
            gap: { xs: 1.25, md: 3 },
            overflow: "hidden",
          }}
        >
          {HERO_FEATURES.map((feature) => (
            <HeroFeatureItem key={feature.title} {...feature} />
          ))}
        </Box>
      </Box>

      {/* Stats bar */}
      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          flexShrink: 0,
          bgcolor: HOME.heroSplitGreenDark,
          height: { xs: 76, sm: 80, md: 88 },
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {HERO_STATS.map((stat, index) => (
          <HeroStatItem key={stat.label} stat={stat} showBorder={index > 0} />
        ))}
      </Box>
    </Box>
  );
}
