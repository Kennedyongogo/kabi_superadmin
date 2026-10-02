import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import { HOME, fadeUp } from "./studentPortalShared";

const primaryDark = HOME.heroSplitGreenDark || "#0E3D73";
const navy = HOME.navyDeep || HOME.navy;

const CATEGORY_META = {
  class: {
    label: "Class",
    plural: "Classes",
    accent: HOME.green,
    icon: SchoolRoundedIcon,
    empty: "You have no classes scheduled for this day.",
  },
  cat: {
    label: "CAT",
    plural: "CATs",
    accent: "#b26a00",
    icon: QuizRoundedIcon,
    empty: "You have no CATs scheduled for this day.",
  },
  exam: {
    label: "Exam",
    plural: "Exams",
    accent: navy,
    icon: FactCheckRoundedIcon,
    empty: "You have no exams scheduled for this day.",
  },
};

function parseDateKey(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day, date };
}

const formatClock = (value) =>
  new Date(value)
    .toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true })
    .toUpperCase();

function formatDuration(startsAt, endsAt) {
  const totalMinutes = Math.round(Math.max(0, new Date(endsAt) - new Date(startsAt)) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

function CountPill({ meta, count }) {
  const Icon = meta.icon;
  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{
        px: 1.4,
        py: 0.6,
        borderRadius: "999px",
        bgcolor: "rgba(255,255,255,0.14)",
        border: "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Icon sx={{ fontSize: 16, color: HOME.gold }} />
      <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 800, fontSize: "0.8rem", color: "#fff" }}>
        {count}
      </Typography>
      <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.78rem", color: "rgba(255,255,255,0.8)" }}>
        {count === 1 ? meta.label : meta.plural}
      </Typography>
    </Stack>
  );
}

function TimelineCard({ entry, index, isLast }) {
  const meta = CATEGORY_META[entry.category] || CATEGORY_META.class;
  const Icon = meta.icon;
  const now = new Date();
  const starts = new Date(entry.starts_at);
  const ends = new Date(entry.ends_at);
  const isLive = now >= starts && now <= ends;
  const isPast = now > ends;

  return (
    // useFlexGap: margin-based Stack spacing resets child margins, which was
    // swallowing the card's bottom margin between rows.
    <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} useFlexGap sx={{ position: "relative" }}>
      {/* Time rail */}
      <Stack alignItems="center" sx={{ width: { xs: 58, sm: 74 }, flexShrink: 0 }}>
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 800,
            fontSize: { xs: "0.72rem", sm: "0.8rem" },
            color: isPast ? HOME.inkSoft : meta.accent,
            whiteSpace: "nowrap",
          }}
        >
          {formatClock(entry.starts_at)}
        </Typography>
        <Box
          sx={{
            width: 14,
            height: 14,
            mt: 0.6,
            borderRadius: "50%",
            border: `3px solid ${isPast ? "rgba(12,35,64,0.2)" : meta.accent}`,
            bgcolor: isLive ? meta.accent : "#fff",
            boxShadow: isLive ? `0 0 0 5px color-mix(in srgb, ${meta.accent} 18%, transparent)` : "none",
            flexShrink: 0,
            zIndex: 1,
          }}
        />
        {!isLast ? (
          <Box
            sx={{
              flex: 1,
              width: 2,
              minHeight: 26,
              borderRadius: 2,
              background: `linear-gradient(180deg, ${isPast ? "rgba(12,35,64,0.14)" : meta.accent}44, rgba(12,35,64,0.1))`,
            }}
          />
        ) : null}
      </Stack>

      {/* Card */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          mb: isLast ? 0 : 1.6,
          position: "relative",
          borderRadius: "18px",
          overflow: "hidden",
          bgcolor: "#fff",
          border: `1px solid ${HOME.border}`,
          boxShadow: HOME.shadowSm,
          opacity: isPast ? 0.72 : 1,
          animation: `${fadeUp} 0.45s ease both`,
          animationDelay: `${Math.min(index, 8) * 0.06}s`,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: HOME.shadowMd,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 4,
            background: `linear-gradient(180deg, ${meta.accent}, ${HOME.gold})`,
          },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          sx={{ p: { xs: 1.75, sm: 2 }, pl: { xs: 2.25, sm: 2.5 } }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "13px",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: `linear-gradient(145deg, ${meta.accent} 0%, ${primaryDark} 160%)`,
                boxShadow: `0 8px 18px -8px ${meta.accent}99`,
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 21 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography
                  sx={{
                    fontFamily: HOME.fontDisplay,
                    fontWeight: 700,
                    fontSize: { xs: "1.05rem", sm: "1.15rem" },
                    color: HOME.ink,
                    lineHeight: 1.25,
                  }}
                >
                  {entry.title}
                </Typography>
                {isLive ? (
                  <Chip
                    size="small"
                    icon={<AutoAwesomeRoundedIcon sx={{ fontSize: "0.85rem !important" }} />}
                    label="Now"
                    sx={{
                      height: 22,
                      fontFamily: HOME.fontBody,
                      fontWeight: 800,
                      fontSize: "0.68rem",
                      bgcolor: meta.accent,
                      color: "#fff",
                      "& .MuiChip-icon": { color: HOME.gold },
                    }}
                  />
                ) : null}
              </Stack>
              <Chip
                size="small"
                label={meta.label}
                sx={{
                  mt: 0.6,
                  height: 22,
                  fontFamily: HOME.fontBody,
                  fontWeight: 800,
                  fontSize: "0.66rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: meta.accent,
                  bgcolor: `color-mix(in srgb, ${meta.accent} 10%, white)`,
                  border: `1px solid color-mix(in srgb, ${meta.accent} 25%, transparent)`,
                }}
              />
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "row", sm: "column" }}
            spacing={0.6}
            alignItems={{ xs: "center", sm: "flex-end" }}
            sx={{ flexShrink: 0 }}
          >
            <Stack
              direction="row"
              spacing={0.6}
              alignItems="center"
              sx={{
                px: 1.1,
                py: 0.5,
                borderRadius: "999px",
                bgcolor: `color-mix(in srgb, ${meta.accent} 10%, white)`,
                color: meta.accent,
              }}
            >
              <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />
              <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 800, fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                {formatClock(entry.starts_at)} – {formatClock(entry.ends_at)}
              </Typography>
            </Stack>
            <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.72rem", fontWeight: 700 }}>
              {formatDuration(entry.starts_at, entry.ends_at)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}

export default function StudentTimetableDay() {
  const navigate = useNavigate();
  const { dateKey } = useParams();
  const [searchParams] = useSearchParams();
  const parsed = useMemo(() => parseDateKey(dateKey), [dateKey]);
  const tabParam = searchParams.get("tab");
  const categoryKey = CATEGORY_META[tabParam] ? tabParam : "class";
  const meta = CATEGORY_META[categoryKey] || CATEGORY_META.class;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tabParam === "exam") {
      navigate("/student/timetable?tab=exam", { replace: true });
    }
  }, [tabParam, navigate]);

  const goBack = () => {
    if (!parsed) {
      navigate(`/student/timetable?tab=${categoryKey}`);
      return;
    }
    navigate(`/student/timetable?tab=${categoryKey}&year=${parsed.year}&month=${parsed.month}`);
  };

  useEffect(() => {
    if (!parsed) {
      setLoading(false);
      setError("Invalid date selected.");
      return undefined;
    }

    let active = true;
    const token = localStorage.getItem("token");
    const dayStart = new Date(parsed.year, parsed.month, parsed.day);
    const dayEnd = new Date(parsed.year, parsed.month, parsed.day + 1);

    (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/timetable/me?year=${parsed.year}&month=${parsed.month}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load your schedule");
        }
        const dayEntries = (data.data || [])
          .filter((entry) => {
            if (entry.category !== categoryKey) return false;
            const starts = new Date(entry.starts_at);
            const ends = new Date(entry.ends_at);
            return starts < dayEnd && ends > dayStart;
          })
          .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
        if (active) setEntries(dayEntries);
      } catch (requestError) {
        if (active) {
          setEntries([]);
          setError(requestError.message || "Could not load your schedule");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [parsed, categoryKey]);

  const weekdayLabel = parsed
    ? parsed.date.toLocaleDateString("en-KE", { weekday: "long" })
    : "";
  const dateLabel = parsed
    ? parsed.date.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const isToday = parsed
    ? new Date().toDateString() === parsed.date.toDateString()
    : false;

  return (
    <Box sx={{ minHeight: "calc(100vh - 68px)", bgcolor: HOME.cream }}>
      {/* Hero header — full bleed, flush under the navbar like Home */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pl: { xs: 1.25, sm: 1.5 },
          pr: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          color: "#fff",
          bgcolor: HOME.green,
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 90% at 88% 8%, rgba(200,168,64,0.25) 0%, transparent 55%)",
            pointerEvents: "none",
          },
        }}
      >
        <Stack direction="row" spacing={{ xs: 1.25, sm: 1.75 }} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
          <Tooltip title="Back to timetable">
            <IconButton
              onClick={goBack}
              sx={{
                color: "#fff",
                flexShrink: 0,
                ml: -0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: HOME.gold,
                }}
              >
                {weekdayLabel}
              </Typography>
              {isToday ? (
                <Chip
                  size="small"
                  icon={<WbSunnyRoundedIcon sx={{ fontSize: "0.85rem !important", color: `${navy} !important` }} />}
                  label="Today"
                  sx={{
                    height: 22,
                    fontFamily: HOME.fontBody,
                    fontWeight: 800,
                    fontSize: "0.68rem",
                    bgcolor: HOME.gold,
                    color: navy,
                  }}
                />
              ) : null}
            </Stack>
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "1.9rem" },
                lineHeight: 1.15,
                mt: 0.25,
              }}
            >
              {dateLabel || "Day schedule"}
            </Typography>
            <Typography sx={{ fontFamily: HOME.fontBody, color: "rgba(255,255,255,0.78)", fontSize: "0.84rem", mt: 0.5 }}>
              Your {meta.plural.toLowerCase()} for this day.
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <CountPill meta={meta} count={entries.length} />
          </Box>
        </Stack>
      </Box>

      {/* Content — edge to edge with responsive padding */}
      <Box sx={{ px: { xs: 1.5, sm: 3, lg: 4 }, py: { xs: 2, md: 2.5 } }}>
      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px", fontFamily: HOME.fontBody }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}>
          <CircularProgress sx={{ color: HOME.green }} />
        </Stack>
      ) : !error && entries.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 6, sm: 8 },
            px: 3,
            borderRadius: "22px",
            bgcolor: "#fff",
            border: `1px dashed rgba(27,94,168,0.25)`,
            boxShadow: HOME.shadowSm,
            animation: `${fadeUp} 0.45s ease both`,
          }}
        >
          <Box
            sx={{
              width: 68,
              height: 68,
              mx: "auto",
              mb: 2,
              borderRadius: "20px",
              display: "grid",
              placeItems: "center",
              color: HOME.green,
              background: "linear-gradient(145deg, rgba(27,94,168,0.1) 0%, rgba(200,168,64,0.12) 100%)",
            }}
          >
            <WbSunnyRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.ink, fontSize: "1.3rem" }}>
            Nothing scheduled
          </Typography>
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.92rem", mt: 0.75, maxWidth: 380, mx: "auto" }}>
            {meta.empty} A good time to rest or catch up on your studies.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ animation: `${fadeUp} 0.45s ease both`, animationDelay: "0.08s" }}>
          {entries.map((entry, index) => (
            <TimelineCard
              key={entry.id}
              entry={entry}
              index={index}
              isLast={index === entries.length - 1}
            />
          ))}
        </Box>
      )}
      </Box>
    </Box>
  );
}
