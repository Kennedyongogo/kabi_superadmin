import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, Chip, CircularProgress, Stack, Tooltip, IconButton, Typography, keyframes } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { Helmet } from "react-helmet-async";
import { HOME, BRAND_LOGO_SRC } from "../components/Home/homeShared";
import { HomeGhostButton } from "../components/Home/homeUi";
import {
  categoryMeta,
  formatNewsDate,
  formatEventRange,
} from "../components/News/newsShared";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Return to wherever the reader came from (home teaser or the news hub).
  // location.key is "default" only when this page was opened directly.
  const goBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/news");
    }
  };

  useEffect(() => {
    let active = true;
    window.scrollTo(0, 0);
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/announcements/public/${slug}`);
        const json = await res.json();
        if (!active) return;
        if (res.ok && json.success && json.data) {
          setItem(json.data);
        } else {
          setNotFound(true);
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <CircularProgress sx={{ color: HOME.green }} />
      </Box>
    );
  }

  if (notFound || !item) {
    return (
      <Box sx={{ textAlign: "center", py: 12, px: 2 }}>
        <Typography
          sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: "1.6rem", color: HOME.navyDeep, mb: 1 }}
        >
          Article not found
        </Typography>
        <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, mb: 3 }}>
          This post may have been removed or is no longer published.
        </Typography>
        <HomeGhostButton onClick={() => navigate("/news")}>Back to News & Events</HomeGhostButton>
      </Box>
    );
  }

  const meta = categoryMeta(item.category);
  const isEvent = item.category === "event" || item.category === "exam";
  const dateLabel = isEvent
    ? formatEventRange(item.event_date, item.event_end)
    : formatNewsDate(item.published_at || item.created_at);
  const hasImage = Boolean(item.cover_image_url);

  return (
    <Box sx={{ bgcolor: HOME.warmWhite }}>
      <Helmet>
        <title>{item.title} — KASMS News</title>
      </Helmet>

      {/* Full-bleed hero — image (or brand band) edge to edge */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          minHeight: { xs: 260, sm: 330, md: 430 },
          display: "flex",
          alignItems: "flex-end",
          background: hasImage ? HOME.navyDeep : "#fff",
        }}
      >
        {hasImage ? (
          <Box
            component="img"
            src={item.cover_image_url}
            alt=""
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : (
          <Box
            component="img"
            src={BRAND_LOGO_SRC}
            alt=""
            sx={{
              position: "absolute",
              inset: 0,
              m: "auto",
              width: { xs: 150, sm: 190, md: 230 },
              height: "auto",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Readability gradient over the image */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: hasImage
              ? "linear-gradient(180deg, rgba(20,26,58,0.35) 0%, rgba(20,26,58,0.2) 40%, rgba(20,26,58,0.85) 82%, rgba(20,26,58,0.95) 100%)"
              : "linear-gradient(180deg, transparent 45%, rgba(8,22,43,0.6) 78%, rgba(8,22,43,0.88) 100%)",
          }}
        />

        {/* Back button */}
        <Tooltip title="Go back" arrow placement="right">
          <IconButton
            aria-label="Go back"
            onClick={goBack}
            sx={{
              position: "absolute",
              top: { xs: 12, md: 20 },
              left: { xs: 12, md: 24 },
              zIndex: 2,
              color: "#fff",
              bgcolor: "rgba(8,22,43,0.35)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.28)",
              "&:hover": { bgcolor: "rgba(8,22,43,0.55)" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        {/* Title block over the image */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            px: { xs: 2, sm: 3, md: 5 },
            pb: { xs: 2.5, md: 4 },
            pt: { xs: 9, md: 10 },
            animation: `${fadeUp} 0.55s ease both`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }} flexWrap="wrap" useFlexGap>
            <Chip
              label={meta.label}
              size="small"
              sx={{
                fontWeight: 800,
                fontFamily: HOME.fontBody,
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#fff",
                bgcolor: meta.color,
                boxShadow: "0 4px 12px rgba(8,22,43,0.35)",
              }}
            />
            {dateLabel ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                {isEvent ? (
                  <EventOutlinedIcon sx={{ fontSize: 16, color: HOME.goldMuted }} />
                ) : null}
                <Typography
                  sx={{
                    fontFamily: HOME.fontBody,
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.85)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {dateLabel}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
          <Typography
            component="h1"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.7rem", sm: "2.1rem", md: "2.7rem" },
              lineHeight: 1.12,
              color: "#fff",
              maxWidth: 1000,
              textShadow: "0 2px 20px rgba(0,0,0,0.35)",
            }}
          >
            {item.title}
          </Typography>
        </Box>
      </Box>

      {/* Body — edge to edge with comfortable reading padding */}
      <Box
        sx={{
          width: "100%",
          px: { xs: 2, sm: 3, md: 5 },
          pt: { xs: 3, md: 4.5 },
          pb: { xs: 2, md: 2.5 },
          animation: `${fadeUp} 0.55s ease 0.1s both`,
        }}
      >
        {item.excerpt && item.body ? (
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: { xs: "1.02rem", md: "1.14rem" },
              lineHeight: 1.7,
              fontWeight: 600,
              color: HOME.navyDeep,
              mb: 2.5,
              pl: 2,
              borderLeft: `3px solid ${HOME.gold}`,
            }}
          >
            {item.excerpt}
          </Typography>
        ) : null}

        {item.body ? (
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: { xs: "1rem", md: "1.08rem" },
              lineHeight: 1.85,
              color: HOME.ink,
              whiteSpace: "pre-wrap",
            }}
          >
            {item.body}
          </Typography>
        ) : item.excerpt ? (
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: "1.08rem",
              lineHeight: 1.85,
              color: HOME.ink,
            }}
          >
            {item.excerpt}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
