import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Link,
} from "@mui/material";
import {
  Facebook,
  LinkedIn,
  ArrowForwardRounded,
  PhoneRounded,
  PlaceOutlined,
  AccessTimeOutlined,
  EmailOutlined,
} from "@mui/icons-material";
import BrandLogoMark from "../common/BrandLogoMark";
import { HOME } from "../Home/homeShared";

const TikTokIcon = ({ sx, ...props }) => (
  <Box
    component="svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    sx={{ width: 18, height: 18, ...sx }}
    {...props}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </Box>
);

const FOOTER_LINKS = [
  { label: "Home", path: "/" },
  { label: "Programmes", path: "/", sectionId: "programmes" },
  { label: "About Us", path: "/about-us" },
  { label: "News & Events", path: "/news" },
  { label: "Brochures", path: "/brochures" },
  { label: "Student Portal", path: "/login" },
];

const SOCIAL = [
  { icon: <Facebook fontSize="small" />, color: "#1877f2", label: "Facebook" },
  { icon: <LinkedIn fontSize="small" />, color: "#0077b5", label: "LinkedIn" },
  { icon: <TikTokIcon />, color: "#fff", label: "TikTok" },
];

const sectionLabelSx = {
  fontWeight: 800,
  fontSize: "0.68rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: HOME.goldMuted,
  mb: 1,
};

const bodySx = {
  color: "rgba(255,255,255,0.85)",
  fontWeight: 500,
  fontSize: "0.85rem",
  lineHeight: 1.55,
};

function goToLink(navigate, link) {
  if (link.sectionId) {
    if (window.location.pathname === "/") {
      const section = document.getElementById(link.sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    navigate("/");
    window.setTimeout(() => {
      document.getElementById(link.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return;
  }
  navigate(link.path);
}

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        background: `linear-gradient(145deg, #0E3D73 0%, ${HOME.green} 48%, #2B7BC4 100%)`,
        color: "rgba(255,255,255,0.88)",
        fontFamily: HOME.fontBody,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          px: { xs: 1.5, sm: 2 },
          py: { xs: 2.75, md: 3.25 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1.3fr 0.7fr 1fr 1.1fr 0.8fr",
            },
            gap: { xs: 2.5, md: 2.25 },
            width: "100%",
            alignItems: "start",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, mb: 1 }}>
              <BrandLogoMark
                size={40}
                sx={{ height: 40, width: 40, flexShrink: 0 }}
                imgSx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "0.88rem", sm: "0.95rem", md: "1.02rem" },
                  color: "#fff",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                {HOME.name}
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontWeight: 600,
                fontSize: "0.78rem",
                color: HOME.goldMuted,
                lineHeight: 1.4,
              }}
            >
              Shaping skilled, compassionate healthcare professionals
            </Typography>
          </Box>

          <Box>
            <Typography sx={sectionLabelSx}>Quick links</Typography>
            <Stack spacing={0.75}>
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={`${link.label}-${link.sectionId || link.path}`}
                  component="button"
                  onClick={() => goToLink(navigate, link)}
                  underline="none"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.35,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    transition: "color 0.2s ease",
                    "&:hover": { color: HOME.goldMuted },
                  }}
                >
                  {link.label}
                  <ArrowForwardRounded sx={{ fontSize: 14, opacity: 0.6 }} />
                </Link>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography sx={sectionLabelSx}>Got questions? Call us</Typography>
            <Link
              href="tel:+2540711954609"
              underline="none"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.95rem",
                "&:hover": { color: HOME.goldMuted },
              }}
            >
              <PhoneRounded sx={{ fontSize: 18, color: HOME.goldMuted }} />
              +254 0711 954609
            </Link>
          </Box>

          <Box>
            <Typography sx={sectionLabelSx}>Contact info</Typography>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <PlaceOutlined sx={{ fontSize: 18, color: HOME.goldMuted, mt: 0.15 }} />
                <Typography sx={bodySx}>Kendu, Kenya, 20-40301</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <AccessTimeOutlined sx={{ fontSize: 18, color: HOME.goldMuted, mt: 0.15 }} />
                <Box>
                  <Typography sx={bodySx}>Monday – Friday: 9:00–20:00</Typography>
                  <Typography sx={bodySx}>Saturday: 11:00–15:00</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <EmailOutlined sx={{ fontSize: 18, color: HOME.goldMuted, mt: 0.15 }} />
                <Link
                  href="mailto:kendunursing@yahoo.com"
                  underline="hover"
                  sx={{ ...bodySx, color: "#fff", fontWeight: 600 }}
                >
                  kendunursing@yahoo.com
                </Link>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", md: "flex-end" },
              textAlign: { xs: "left", md: "right" },
              justifySelf: { md: "end" },
            }}
          >
            <Typography sx={{ ...sectionLabelSx, width: { md: "100%" }, textAlign: { md: "right" } }}>
              Follow us
            </Typography>
            <Stack direction="row" spacing={0.75} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
              {SOCIAL.map((social) => (
                <IconButton
                  key={social.label}
                  aria-label={social.label}
                  size="small"
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "rgba(255,255,255,0.9)",
                    transition: "all 0.22s ease",
                    "&:hover": {
                      bgcolor: social.color,
                      borderColor: social.color,
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }} />

        <Stack
          direction="column"
          spacing={0.35}
          alignItems="center"
          justifyContent="center"
          sx={{ width: "100%" }}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8rem", textAlign: "center" }}>
            © {year} {HOME.name}. All rights reserved.
          </Typography>
          <Typography
            sx={{
              color: HOME.goldMuted,
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.02em",
              textAlign: "center",
            }}
          >
            Developed by Carlvyne Technologies Ltd
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
