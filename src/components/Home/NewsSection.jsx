import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip, Stack, Typography, keyframes } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { HOME, BRAND_LOGO_SRC } from "./homeShared";
import { HomeSectionShell, HomePrimaryButton } from "./homeUi";
import {
  categoryMeta,
  formatNewsDate,
  formatEventRange,
  isUpcoming,
} from "../News/newsShared";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
`;

function itemDateLabel(item) {
  return item.category === "event" || item.category === "exam"
    ? formatEventRange(item.event_date, item.event_end) ||
        formatNewsDate(item.published_at || item.created_at)
    : formatNewsDate(item.published_at || item.created_at);
}

function CategoryChip({ item, small = false }) {
  const meta = categoryMeta(item.category);
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{
        height: small ? 20 : 24,
        fontWeight: 800,
        fontFamily: HOME.fontBody,
        fontSize: small ? "0.6rem" : "0.66rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#fff",
        bgcolor: meta.color,
        "& .MuiChip-label": { px: small ? 0.9 : 1.1 },
      }}
    />
  );
}

function UpcomingChip({ small = false }) {
  return (
    <Chip
      icon={<EventOutlinedIcon sx={{ fontSize: "13px !important", color: "#141a3a !important" }} />}
      label="Upcoming"
      size="small"
      sx={{
        height: small ? 20 : 24,
        fontWeight: 800,
        fontFamily: HOME.fontBody,
        fontSize: small ? "0.6rem" : "0.66rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: HOME.navyDeep,
        bgcolor: HOME.goldMuted,
        "& .MuiChip-label": { px: small ? 0.9 : 1.1 },
      }}
    />
  );
}

/** Big featured story — image fills the card, text floats over a navy gradient */
function FeaturedCard({ item, onOpen }) {
  const photo = item.cover_image_url || BRAND_LOGO_SRC;
  const usingLogo = !item.cover_image_url;

  return (
    <Box
      onClick={() => onOpen(item)}
      sx={{
        position: "relative",
        cursor: "pointer",
        borderRadius: "24px",
        overflow: "hidden",
        minHeight: { xs: 320, sm: 380, md: "100%" },
        display: "flex",
        alignItems: "flex-end",
        border: `1px solid ${HOME.border}`,
        boxShadow: "0 20px 50px -26px rgba(8,22,43,0.4)",
        transition: "transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
        animation: `${fadeUp} 0.6s ease both`,
        "&:hover": {
          transform: "translateY(-6px)",
          borderColor: HOME.borderGold,
          boxShadow: "0 28px 60px -26px rgba(8,22,43,0.5)",
          "& .featured-photo": { transform: "scale(1.06)" },
          "& .featured-cta": { gap: 1.2, color: HOME.goldMuted },
        },
      }}
    >
      <Box
        component="img"
        className="featured-photo"
        src={photo}
        alt=""
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: usingLogo ? "contain" : "cover",
          p: usingLogo ? { xs: 5, md: 8 } : 0,
          bgcolor: usingLogo ? "rgba(27,94,168,0.06)" : "transparent",
          transition: "transform 0.5s ease",
        }}
      />
      {/* Readability gradient */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(20,26,58,0.15) 0%, rgba(20,26,58,0.25) 45%, rgba(20,26,58,0.88) 82%, rgba(20,26,58,0.96) 100%)",
        }}
      />
      {/* Gold corner glow */}
      <Box
        sx={{
          position: "absolute",
          top: -70,
          right: -70,
          width: 190,
          height: 190,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,168,64,0.35) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", p: { xs: 2.5, sm: 3, md: 3.5 }, width: "100%" }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1.25 }}>
          <CategoryChip item={item} />
          {isUpcoming(item) ? <UpcomingChip /> : null}
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: "0.74rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {itemDateLabel(item)}
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.95rem" },
            lineHeight: 1.15,
            color: "#fff",
            mb: 1,
            textShadow: "0 2px 18px rgba(0,0,0,0.35)",
          }}
        >
          {item.title}
        </Typography>
        {item.excerpt ? (
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: { xs: "0.9rem", md: "0.98rem" },
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.85)",
              maxWidth: 560,
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.excerpt}
          </Typography>
        ) : null}
        <Stack
          className="featured-cta"
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ color: HOME.gold, transition: "gap 0.25s ease, color 0.25s ease", gap: 0.6 }}
        >
          <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 800, fontSize: "0.9rem" }}>
            Read the full story
          </Typography>
          <ArrowForwardRoundedIcon sx={{ fontSize: 19 }} />
        </Stack>
      </Box>
    </Box>
  );
}

/** Compact side story — thumbnail + text on a glass panel */
function SideCard({ item, onOpen, index }) {
  const photo = item.cover_image_url || BRAND_LOGO_SRC;
  const usingLogo = !item.cover_image_url;

  return (
    <Box
      onClick={() => onOpen(item)}
      sx={{
        cursor: "pointer",
        display: "flex",
        gap: 1.75,
        p: { xs: 1.5, md: 1.75 },
        borderRadius: "20px",
        bgcolor: "#fff",
        border: `1px solid ${HOME.border}`,
        boxShadow: "0 10px 30px -20px rgba(8,22,43,0.25)",
        transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        animation: `${fadeUp} 0.6s ease both`,
        animationDelay: `${0.12 + index * 0.1}s`,
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: HOME.borderGold,
          boxShadow: HOME.shadowMd,
          "& .side-photo": { transform: "scale(1.08)" },
          "& .side-title": { color: HOME.gold },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          flexShrink: 0,
          width: { xs: 96, sm: 116, md: 126 },
          borderRadius: "14px",
          overflow: "hidden",
          alignSelf: "stretch",
          minHeight: 96,
          bgcolor: usingLogo ? "rgba(27,94,168,0.06)" : "rgba(8,22,43,0.08)",
        }}
      >
        <Box
          component="img"
          className="side-photo"
          src={photo}
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: usingLogo ? "contain" : "cover",
            p: usingLogo ? 1.75 : 0,
            transition: "transform 0.45s ease",
          }}
        />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.6 }}>
          <CategoryChip item={item} small />
          {isUpcoming(item) ? <UpcomingChip small /> : null}
        </Stack>
        <Typography
          className="side-title"
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "1rem", md: "1.08rem" },
            lineHeight: 1.25,
            color: HOME.navyDeep,
            transition: "color 0.25s ease",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 0.5,
          }}
        >
          {item.title}
        </Typography>
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: HOME.inkSoft,
          }}
        >
          {itemDateLabel(item)}
        </Typography>
      </Box>
      <Box
        sx={{
          alignSelf: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: { xs: 28, sm: 32 },
          height: { xs: 28, sm: 32 },
          borderRadius: "50%",
          flexShrink: 0,
          border: `1px solid ${HOME.border}`,
          bgcolor: "rgba(27,94,168,0.06)",
          color: HOME.green,
        }}
      >
        <ArrowForwardRoundedIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
      </Box>
    </Box>
  );
}

export default function NewsSection() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/announcements/public?limit=3");
        const json = await res.json();
        if (active && res.ok && json.success) {
          setItems(Array.isArray(json.data) ? json.data.slice(0, 3) : []);
        }
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Hide the whole section until there is something to show
  if (!loaded || items.length === 0) return null;

  const [featured, ...rest] = items;
  const openItem = (i) => navigate(`/news/${i.slug}`);

  return (
    <HomeSectionShell id="news" bg={{ bgcolor: HOME.cream }}>
      {/* Ambient background accents */}
      <Box
        sx={{
          position: "absolute",
          top: -140,
          right: "-6%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,168,64,0.1) 0%, transparent 62%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -160,
          left: "-8%",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(27,94,168,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          width: "100%",
          px: { xs: 2, sm: 2.5, md: 3 },
          pt: { xs: 1, md: 1.5 },
          pb: { xs: 1.25, md: 2 },
        }}
      >
        {/* Header row: title left, CTA right */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: { xs: 3, md: 4 }, animation: `${fadeUp} 0.55s ease both` }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
              <Box sx={{ width: 34, height: 2.5, borderRadius: 2, bgcolor: HOME.gold }} />
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: HOME.green,
                }}
              >
                Latest updates
              </Typography>
            </Stack>
            <Typography
              component="h2"
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.9rem", sm: "2.3rem", md: "2.6rem" },
                lineHeight: 1.08,
                color: HOME.navyDeep,
                mb: 0.75,
              }}
            >
              News &{" "}
              <Box component="span" sx={{ color: HOME.gold }}>
                Events
              </Box>
            </Typography>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: { xs: "0.92rem", md: "1rem" },
                lineHeight: 1.6,
                color: HOME.inkMuted,
                maxWidth: 520,
              }}
            >
              Stay in the loop with announcements, upcoming events and academic notices.
            </Typography>
          </Box>
        </Stack>

        {/* Featured + side stories */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: rest.length > 0 ? "7fr 5fr" : "1fr" },
            gap: { xs: 2, md: 2.5 },
            alignItems: "stretch",
          }}
        >
          <FeaturedCard item={featured} onOpen={openItem} />
          {rest.length > 0 ? (
            <Stack spacing={{ xs: 2, md: 2.5 }} justifyContent="stretch">
              {rest.map((item, idx) => (
                <SideCard key={item.id} item={item} onOpen={openItem} index={idx} />
              ))}
              {/* Mini CTA panel completes the column */}
              <Box
                onClick={() => navigate("/news")}
                sx={{
                  cursor: "pointer",
                  flex: 1,
                  minHeight: 86,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  px: { xs: 2, md: 2.5 },
                  py: 1.75,
                  borderRadius: "20px",
                  border: "1.5px dashed rgba(200,168,64,0.55)",
                  background: "rgba(200,168,64,0.08)",
                  transition: "background 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
                  animation: `${fadeUp} 0.6s ease both`,
                  animationDelay: "0.32s",
                  "&:hover": {
                    background: "rgba(200,168,64,0.14)",
                    borderColor: HOME.gold,
                    transform: "translateY(-3px)",
                    "& .cta-arrow": { transform: "translateX(4px)" },
                  },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: HOME.fontDisplay,
                      fontWeight: 700,
                      fontSize: { xs: "1.02rem", md: "1.1rem" },
                      color: HOME.navyDeep,
                      lineHeight: 1.2,
                    }}
                  >
                    More stories & upcoming events
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: HOME.fontBody,
                      fontSize: "0.8rem",
                      color: HOME.inkMuted,
                      mt: 0.35,
                    }}
                  >
                    Browse the full news & events hub
                  </Typography>
                </Box>
                <Box
                  className="cta-arrow"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: HOME.goldGradient,
                    color: HOME.navyDeep,
                    transition: "transform 0.25s ease",
                  }}
                >
                  <ArrowForwardRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
            </Stack>
          ) : null}
        </Box>

        {/* Mobile CTA */}
        <Stack alignItems="center" sx={{ mt: 3, display: { xs: "flex", sm: "none" } }}>
          <HomePrimaryButton endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/news")} fullWidth>
            View all news & events
          </HomePrimaryButton>
        </Stack>
      </Box>
    </HomeSectionShell>
  );
}
