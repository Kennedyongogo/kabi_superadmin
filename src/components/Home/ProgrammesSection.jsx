import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Stack, keyframes, CircularProgress, IconButton, Chip } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { HOME } from "./homeShared";
import { HomeSectionShell, HomePrimaryButton } from "./homeUi";
import useBrandImageSrc from "../../hooks/useBrandImageSrc";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

// On xs the gap must equal the scroller's side padding so the neighbouring
// cards sit fully off-screen and only one card is visible at a time.
const GAP_PX = { xs: 16, sm: 16, md: 20 };

function programmeImageSrc(programme) {
  return programme?.image_url || null;
}

function formatDuration(programme) {
  if (programme?.duration) return programme.duration;
  if (programme?.duration_years) {
    const y = Number(programme.duration_years);
    return `${y} year${y === 1 ? "" : "s"}`;
  }
  return "Duration TBA";
}

function ProgrammeCard({ programme, index, onView, highlighted }) {
  const { src: imgSrc, usingLogo, onError } = useBrandImageSrc(programmeImageSrc(programme));

  return (
    <Box
      id={`programme-card-${programme.id}`}
      data-programme-id={programme.id}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "22px",
        // Keep 2px always — switching 2px↔1px caused a visible blink
        border: `2px solid ${highlighted ? HOME.gold : HOME.border}`,
        bgcolor: "#fff",
        overflow: "hidden",
        boxShadow: "0 10px 30px -18px rgba(8,22,43,0.18)",
        transition: "box-shadow 0.45s ease, border-color 0.45s ease",
        "@media (prefers-reduced-motion: no-preference)": {
          animation: `${fadeUp} 0.55s ease both`,
          animationDelay: `${Math.min(index, 8) * 0.06}s`,
        },
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: HOME.shadowMd,
          borderColor: highlighted ? HOME.gold : HOME.borderGold,
          "& .programme-photo": { transform: "scale(1.06)" },
          "& .programme-accent": { transform: "scaleX(1)" },
          "& .programme-name": { color: HOME.gold },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "5 / 4",
          overflow: "hidden",
          bgcolor: usingLogo ? "#fff" : HOME.green,
        }}
      >
        <Box
          className="programme-photo"
          component="img"
          src={imgSrc}
          alt={programme.name}
          onError={onError}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: usingLogo ? "contain" : "cover",
            objectPosition: "center",
            p: usingLogo ? { xs: 3, sm: 4 } : 0,
            display: "block",
            transition: "transform 0.5s ease",
            bgcolor: usingLogo ? "rgba(27,94,168,0.06)" : "transparent",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: usingLogo
              ? "linear-gradient(180deg, rgba(8,22,43,0.06) 0%, transparent 32%, rgba(8,22,43,0.55) 76%, rgba(8,22,43,0.9) 100%)"
              : "linear-gradient(180deg, rgba(8,22,43,0.08) 0%, transparent 34%, rgba(8,22,43,0.5) 70%, rgba(8,22,43,0.9) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Glass duration badge */}
        <Stack
          direction="row"
          spacing={0.6}
          alignItems="center"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 1,
            px: 1.25,
            py: 0.5,
            borderRadius: "999px",
            bgcolor: "rgba(8,22,43,0.45)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <AccessTimeRoundedIcon sx={{ fontSize: 14, color: HOME.gold }} />
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontWeight: 700,
              fontSize: "0.7rem",
              color: "#fff",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            {formatDuration(programme)}
          </Typography>
        </Stack>

        <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, px: 2, pb: 1.75, zIndex: 1 }}>
          <Box
            className="programme-accent"
            sx={{
              width: 44,
              height: 3,
              borderRadius: 2,
              mb: 1,
              background: HOME.goldGradient,
              transform: "scaleX(0.55)",
              transformOrigin: "left",
              transition: "transform 0.35s ease",
            }}
          />
          <Typography
            component="h3"
            className="programme-name"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.25rem", sm: "1.4rem" },
              color: "#fff",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              textShadow: "0 1px 8px rgba(0,0,0,0.35)",
              transition: "color 0.3s ease",
            }}
          >
            {programme.name}
          </Typography>
        </Box>
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ px: 2, py: 1.6, gap: 1.5, mt: "auto" }}
      >
        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(27,94,168,0.08)",
              color: HOME.green,
              flexShrink: 0,
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 17 }} />
          </Box>
          <Typography
            noWrap
            sx={{
              fontFamily: HOME.fontBody,
              fontWeight: 700,
              fontSize: "0.78rem",
              color: HOME.inkSoft,
              minWidth: 0,
            }}
          >
            Medical sciences
          </Typography>
        </Stack>
        <HomePrimaryButton
          onClick={() => onView(programme.id)}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: "1rem !important" }} />}
          sx={{ py: 0.9, px: 1.9, fontSize: "0.8rem", flexShrink: 0 }}
        >
          View details
        </HomePrimaryButton>
      </Stack>
    </Box>
  );
}

function NavArrow({ direction, onClick, disabled }) {
  return (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous programmes" : "Next programmes"}
      sx={{
        width: { xs: 40, md: 48 },
        height: { xs: 40, md: 48 },
        flexShrink: 0,
        bgcolor: HOME.green,
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 10px 28px -10px rgba(27,94,168,0.55)",
        "&:hover": { bgcolor: "#0E3D73" },
        "&.Mui-disabled": {
          bgcolor: "rgba(27,94,168,0.25)",
          color: "rgba(255,255,255,0.7)",
        },
      }}
    >
      {direction === "prev" ? (
        <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
      ) : (
        <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
      )}
    </IconButton>
  );
}

export default function ProgrammesSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollerRef = useRef(null);
  const highlightTimerRef = useRef(null);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  // Arrows activate whenever the cards overflow the visible area:
  // one card per view on phones, two on tablets, three on desktop.
  const [carouselEnabled, setCarouselEnabled] = useState(false);

  const updateArrowState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      setCarouselEnabled(false);
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 4) {
      setCarouselEnabled(false);
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    setCarouselEnabled(true);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/programmes?is_active=true&limit=100");
        const json = await res.json();
        if (!active) return;
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Could not load programmes");
        }
        setProgrammes(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load programmes");
          setProgrammes([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrowState();
    el.addEventListener("scroll", updateArrowState, { passive: true });
    window.addEventListener("resize", updateArrowState);
    return () => {
      el.removeEventListener("scroll", updateArrowState);
      window.removeEventListener("resize", updateArrowState);
    };
  }, [programmes, loading, updateArrowState]);

  // Restore carousel position + highlight after returning from programme detail
  useEffect(() => {
    const highlightId = location.state?.highlightProgrammeId;
    const scrollTo = location.state?.scrollTo;
    if (!highlightId && scrollTo !== "programmes") return;
    if (loading || !programmes.length) return;

    const section = document.getElementById("programmes");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const focusCard = () => {
      const card = highlightId
        ? document.getElementById(`programme-card-${highlightId}`)
        : null;
      const scroller = scrollerRef.current;
      if (card && scroller) {
        const scrollerRect = scroller.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const cardOffset =
          cardRect.left - scrollerRect.left + scroller.scrollLeft;
        const target =
          cardOffset - Math.max(0, (scroller.clientWidth - cardRect.width) / 2);
        scroller.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
      } else if (card) {
        card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
      if (highlightId) {
        setHighlightedId(String(highlightId));
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => setHighlightedId(null), 4200);
      }
      // Clear one-shot navigation state so refresh / revisit doesn't re-trigger
      navigate(location.pathname + location.hash, { replace: true, state: {} });
    };

    const t = window.setTimeout(focusCard, 120);
    return () => window.clearTimeout(t);
  }, [loading, programmes, location.state, location.pathname, location.hash, navigate]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const scrollByPage = (dir) => {
    if (!carouselEnabled) return;
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.92;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <HomeSectionShell
      id="programmes"
      bg={{ bgcolor: HOME.cream }}
      sx={{
        width: "100%",
        pt: { xs: 2.5, md: 3.5 },
        pb: { xs: 1, md: 1.25 },
        px: 0,
      }}
    >
      <Box
        sx={{
          width: "100%",
          px: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 2, md: 2.5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Chip
          label="Academics"
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            height: 28,
            mb: { xs: 1.25, md: 1.5 },
            bgcolor: "rgba(201, 162, 39, 0.12)",
            color: HOME.navyDeep,
            border: `1px solid ${HOME.borderGold}`,
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: { xs: 1.25, md: 1.5 },
            width: "100%",
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "2.85rem" },
              lineHeight: 1.1,
              color: HOME.navyDeep,
            }}
          >
            Our{" "}
            <Box component="span" sx={{ color: HOME.gold }}>
              programmes
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.5,
              color: HOME.inkMuted,
              textAlign: "center",
              px: { xs: 1, md: 0 },
              maxWidth: { xs: "100%", md: "none" },
              whiteSpace: { md: "nowrap" },
            }}
          >
            Explore the academic programmes offered at Kendu Adventist School of Medical Sciences.
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: HOME.green }} />
        </Box>
      ) : error ? (
        <Typography sx={{ color: HOME.inkMuted, py: 4, textAlign: "center", px: 2 }}>{error}</Typography>
      ) : programmes.length === 0 ? (
        <Typography sx={{ color: HOME.inkMuted, py: 4, textAlign: "center", px: 2 }}>
          Programmes will appear here once they are published.
        </Typography>
      ) : (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5, md: 2 },
            px: { xs: 1.5, sm: 2.5, md: 3.5 },
          }}
        >
          <NavArrow
            direction="prev"
            disabled={!carouselEnabled || !canPrev}
            onClick={() => scrollByPage(-1)}
          />

          <Box
            ref={scrollerRef}
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              gap: { xs: `${GAP_PX.xs}px`, sm: `${GAP_PX.sm}px`, md: `${GAP_PX.md}px` },
              overflowX: carouselEnabled ? "auto" : "hidden",
              overflowY: "hidden",
              scrollSnapType: carouselEnabled ? "x mandatory" : "none",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              pb: 1,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {programmes.map((p, i) => (
              <Box
                key={p.id}
                sx={{
                  flex: {
                    xs: "0 0 calc(100% - 0px)",
                    sm: `0 0 calc((100% - ${GAP_PX.sm}px) / 2)`,
                    md: `0 0 calc((100% - ${GAP_PX.md * 2}px) / 3)`,
                  },
                  minWidth: {
                    xs: "calc(100% - 0px)",
                    sm: `calc((100% - ${GAP_PX.sm}px) / 2)`,
                    md: `calc((100% - ${GAP_PX.md * 2}px) / 3)`,
                  },
                  maxWidth: {
                    xs: "calc(100% - 0px)",
                    sm: `calc((100% - ${GAP_PX.sm}px) / 2)`,
                    md: `calc((100% - ${GAP_PX.md * 2}px) / 3)`,
                  },
                  scrollSnapAlign: "start",
                }}
              >
                <ProgrammeCard
                  programme={p}
                  index={i}
                  highlighted={highlightedId != null && String(highlightedId) === String(p.id)}
                  onView={(programmeId) =>
                    navigate(`/programmes/${programmeId}`, {
                      state: {
                        from: "/",
                        fromLabel: "Programmes",
                        fromSection: "programmes",
                      },
                    })
                  }
                />
              </Box>
            ))}
          </Box>

          <NavArrow
            direction="next"
            disabled={!carouselEnabled || !canNext}
            onClick={() => scrollByPage(1)}
          />
        </Box>
      )}
    </HomeSectionShell>
  );
}
