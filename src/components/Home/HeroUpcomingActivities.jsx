import React, { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Typography, keyframes } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { HOME } from "./homeShared";

const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const ACCENTS = {
  gold: { bg: "rgba(200,168,64,0.95)", fg: "#1e2858", border: "rgba(255,255,255,0.35)" },
  blue: { bg: "rgba(27,94,168,0.94)", fg: "#fff", border: "rgba(255,255,255,0.28)" },
  navy: { bg: "rgba(30,40,88,0.94)", fg: "#fff", border: "rgba(200,168,64,0.45)" },
  cream: { bg: "rgba(255,255,255,0.95)", fg: "#1e2858", border: "rgba(200,168,64,0.55)" },
};

function shapeSx(shape) {
  const clip = {
    diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    hexagon: "polygon(18% 0%, 82% 0%, 100% 50%, 82% 100%, 18% 100%, 0% 50%)",
    star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  };
  const base = {
    circle: { borderRadius: "50%", width: { xs: 132, md: 158 }, minHeight: { xs: 132, md: 158 } },
    pill: { borderRadius: "999px", width: { xs: 168, md: 200 }, minHeight: { xs: 72, md: 84 } },
    rounded_square: { borderRadius: "22px", width: { xs: 148, md: 168 }, minHeight: { xs: 148, md: 168 } },
    diamond: {
      borderRadius: 0,
      clipPath: clip.diamond,
      width: { xs: 150, md: 170 },
      minHeight: { xs: 150, md: 170 },
    },
    hexagon: {
      borderRadius: 0,
      clipPath: clip.hexagon,
      width: { xs: 156, md: 176 },
      minHeight: { xs: 140, md: 158 },
    },
    oval: { borderRadius: "50%", width: { xs: 170, md: 200 }, minHeight: { xs: 110, md: 128 } },
    speech_bubble: {
      borderRadius: "20px 20px 20px 6px",
      width: { xs: 170, md: 200 },
      minHeight: { xs: 100, md: 112 },
    },
    ribbon: {
      borderRadius: "6px 22px 22px 6px",
      width: { xs: 176, md: 210 },
      minHeight: { xs: 78, md: 88 },
    },
    banner: {
      borderRadius: "10px",
      width: { xs: 190, md: 230 },
      minHeight: { xs: 70, md: 80 },
    },
    star: {
      borderRadius: 0,
      clipPath: clip.star,
      width: { xs: 150, md: 170 },
      minHeight: { xs: 150, md: 170 },
    },
  };
  return base[shape] || base.pill;
}

function positionSx(hint) {
  const map = {
    top_right: { top: { xs: 12, md: 28 }, right: { xs: 10, md: "6%" } },
    mid_right: { top: { xs: "38%", md: "42%" }, right: { xs: 8, md: "5%" } },
    bottom_right: { bottom: { xs: 88, md: 110 }, right: { xs: 10, md: "6%" } },
    top_left: { top: { xs: 12, md: 28 }, left: { xs: 10, md: "4%" } },
    mid_left: { top: { xs: "42%", md: "46%" }, left: { xs: 8, md: "3%" } },
  };
  return map[hint] || map.mid_right;
}

function FloatingShape({ item, onDismiss }) {
  const accent = ACCENTS[item.accent] || ACCENTS.gold;
  const shape = shapeSx(item.shape);
  const pos = positionSx(item.position_hint);

  return (
    <Box
      sx={{
        position: "absolute",
        ...pos,
        zIndex: 5,
        pointerEvents: "auto",
        animation: `${fadeIn} 0.55s ease both, ${floatY} 4.5s ease-in-out infinite`,
        animationDelay: "0.35s, 0.9s",
      }}
    >
      <Box
        role="dialog"
        aria-label={item.title}
        sx={{
          position: "relative",
          ...shape,
          bgcolor: accent.bg,
          color: accent.fg,
          border: `1px solid ${accent.border}`,
          boxShadow: "0 16px 36px -14px rgba(8,22,43,0.45)",
          px: 1.75,
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <IconButton
          size="small"
          aria-label="Dismiss"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(item.id);
          }}
          sx={{
            position: "absolute",
            top: 2,
            right: 2,
            color: accent.fg,
            opacity: 0.75,
            p: 0.35,
            "&:hover": { opacity: 1, bgcolor: "rgba(0,0,0,0.08)" },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 14 }} />
        </IconButton>

        <Typography
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "0.88rem", md: "0.98rem" },
            lineHeight: 1.15,
            px: 0.5,
            maxWidth: "100%",
          }}
        >
          {item.title}
        </Typography>
        {item.body ? (
          <Typography
            sx={{
              mt: 0.45,
              fontFamily: HOME.fontBody,
              fontSize: { xs: "0.68rem", md: "0.72rem" },
              lineHeight: 1.35,
              opacity: 0.9,
              px: 0.35,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.body}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

/**
 * Non-blocking floating upcoming-activity shapes for the home hero.
 * News & Events stay primary elsewhere; these only inform briefly on the hero.
 */
export default function HeroUpcomingActivities() {
  const [items, setItems] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("kendu_dismissed_upcoming_activities");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/upcoming-activities/public");
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && data.success) {
          setItems(data.data || []);
        }
      } catch {
        /* ignore — hero still works without ads */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    return items
      .filter((i) => !dismissedIds.has(i.id))
      .sort((a, b) => {
        const score = (p) => (String(p).includes("right") ? 0 : 1);
        return score(a.position_hint) - score(b.position_hint);
      })
      .slice(0, 2);
  }, [items, dismissedIds]);

  if (!ready || !visible.length) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {visible.map((item) => (
        <FloatingShape
          key={item.id}
          item={item}
          onDismiss={(id) => {
            setDismissedIds((prev) => {
              const next = new Set(prev);
              next.add(id);
              return next;
            });
          }}
        />
      ))}
    </Box>
  );
}
