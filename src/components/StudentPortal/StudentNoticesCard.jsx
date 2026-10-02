import React, { useEffect, useState } from "react";
import { Box, Chip, Collapse, Skeleton, Stack, Typography } from "@mui/material";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import HistoryEduRoundedIcon from "@mui/icons-material/HistoryEduRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import { HOME, fadeUp, studentAuthHeaders } from "./studentPortalShared";

const CATEGORY_META = {
  news: { label: "News", color: HOME.green, icon: CampaignRoundedIcon },
  event: { label: "Event", color: "#7a5cc0", icon: EventOutlinedIcon },
  exam: { label: "Exams", color: "#b45309", icon: HistoryEduRoundedIcon },
  admission: { label: "Admissions", color: HOME.navy, icon: CampaignRoundedIcon },
  general: { label: "Notice", color: "#0e7490", icon: NotificationsNoneRoundedIcon },
};

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "news", label: "News" },
  { value: "event", label: "Events" },
  { value: "exam", label: "Exams" },
  { value: "admission", label: "Admissions" },
  { value: "general", label: "Notices" },
];

const cardSx = {
  bgcolor: "#fff",
  border: `1px solid ${HOME.border}`,
  borderRadius: "22px",
  boxShadow: HOME.shadowMd,
  overflow: "hidden",
};

function meta(cat) {
  return CATEGORY_META[cat] || CATEGORY_META.news;
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatRange(start, end) {
  const s = formatDate(start);
  if (!s) return "";
  const e = formatDate(end);
  return e && e !== s ? `${s} – ${e}` : s;
}

function isNew(item) {
  const d = new Date(item.published_at || item.created_at);
  if (Number.isNaN(d.getTime())) return false;
  return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
}

function isUpcoming(item) {
  if (!item?.event_date) return false;
  const d = new Date(item.event_date);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

function NoticeItem({ item }) {
  const [open, setOpen] = useState(false);
  const m = meta(item.category);
  const Icon = m.icon;
  const isEvent = item.category === "event" || item.category === "exam";
  const dateLabel = isEvent
    ? formatRange(item.event_date, item.event_end) ||
      formatDate(item.published_at || item.created_at)
    : formatDate(item.published_at || item.created_at);
  const hasMore = Boolean(item.body && item.body.trim());

  return (
    <Box
      onClick={() => hasMore && setOpen((o) => !o)}
      sx={{
        position: "relative",
        display: "flex",
        gap: 1.25,
        p: { xs: 1.5, sm: 1.75 },
        pl: { xs: 1.75, sm: 2 },
        borderRadius: "16px",
        border: `1px solid ${item.is_pinned ? "rgba(200,168,64,0.5)" : "rgba(27,94,168,0.1)"}`,
        bgcolor: item.is_pinned ? "rgba(200,168,64,0.06)" : "#fff",
        cursor: hasMore ? "pointer" : "default",
        transition: "box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease",
        overflow: "hidden",
        "&:hover": {
          boxShadow: HOME.shadowSm,
          transform: hasMore ? "translateY(-2px)" : "none",
          borderColor: item.is_pinned ? HOME.gold : "rgba(27,94,168,0.25)",
        },
        // Category accent bar
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: m.color,
        },
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: 40, sm: 44 },
          height: { xs: 40, sm: 44 },
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: `${m.color}14`,
          color: m.color,
        }}
      >
        <Icon sx={{ fontSize: { xs: 20, sm: 22 } }} />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 0.4 }}
        >
          <Chip
            label={m.label}
            size="small"
            sx={{
              height: 19,
              fontWeight: 800,
              fontFamily: HOME.fontBody,
              fontSize: "0.6rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#fff",
              bgcolor: m.color,
              "& .MuiChip-label": { px: 0.9 },
            }}
          />
          {isUpcoming(item) ? (
            <Chip
              label="Upcoming"
              size="small"
              sx={{
                height: 19,
                fontWeight: 800,
                fontFamily: HOME.fontBody,
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: HOME.navyDeep,
                bgcolor: HOME.goldMuted,
                "& .MuiChip-label": { px: 0.9 },
              }}
            />
          ) : isNew(item) ? (
            <Chip
              label="New"
              size="small"
              sx={{
                height: 19,
                fontWeight: 800,
                fontFamily: HOME.fontBody,
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#fff",
                bgcolor: "#b42318",
                "& .MuiChip-label": { px: 0.9 },
              }}
            />
          ) : null}
          {dateLabel ? (
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.7rem",
                fontWeight: 700,
                color: HOME.inkSoft,
              }}
            >
              {dateLabel}
            </Typography>
          ) : null}
          {item.is_pinned ? (
            <PushPinRoundedIcon sx={{ fontSize: 14, color: HOME.gold, ml: "auto !important" }} />
          ) : null}
        </Stack>

        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 700,
            fontSize: { xs: "0.92rem", sm: "0.98rem" },
            color: HOME.navyDeep,
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </Typography>

        {item.excerpt ? (
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: "0.84rem",
              lineHeight: 1.55,
              color: HOME.inkMuted,
              mt: 0.4,
              ...(open
                ? {}
                : {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }),
            }}
          >
            {item.excerpt}
          </Typography>
        ) : null}

        {hasMore ? (
          <>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: "0.86rem",
                  lineHeight: 1.65,
                  color: HOME.ink,
                  mt: 0.9,
                  pt: 0.9,
                  borderTop: "1px dashed rgba(27,94,168,0.15)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {item.body}
              </Typography>
            </Collapse>
            <Stack direction="row" spacing={0.25} alignItems="center" sx={{ mt: 0.6 }}>
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: HOME.green,
                }}
              >
                {open ? "Show less" : "Read more"}
              </Typography>
              <ExpandMoreRoundedIcon
                sx={{
                  fontSize: 17,
                  color: HOME.green,
                  transition: "transform 0.2s ease",
                  transform: open ? "rotate(180deg)" : "none",
                }}
              />
            </Stack>
          </>
        ) : null}
      </Box>
    </Box>
  );
}

function LoadingRows() {
  return (
    <>
      {[0, 1].map((i) => (
        <Stack key={i} direction="row" spacing={1.25} sx={{ p: 1.75 }}>
          <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "12px" }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="30%" height={18} />
            <Skeleton width="80%" height={22} />
            <Skeleton width="60%" height={18} />
          </Box>
        </Stack>
      ))}
    </>
  );
}

function EmptyNotices() {
  return (
    <Box sx={{ textAlign: "center", py: { xs: 3.5, sm: 4.5 }, px: 2 }}>
      <Box
        sx={{
          width: 58,
          height: 58,
          borderRadius: "18px",
          mx: "auto",
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(27,94,168,0.08)",
          color: HOME.green,
        }}
      >
        <NotificationsNoneRoundedIcon sx={{ fontSize: 28 }} />
      </Box>
      <Typography
        sx={{
          fontFamily: HOME.fontDisplay,
          fontWeight: 700,
          fontSize: "1.05rem",
          color: HOME.navyDeep,
          mb: 0.35,
        }}
      >
        You're all caught up
      </Typography>
      <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.84rem", color: HOME.inkMuted }}>
        School announcements, exam notices and events will appear here.
      </Typography>
    </Box>
  );
}

export default function StudentNoticesCard() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/announcements/student?limit=10", {
          headers: studentAuthHeaders(),
        });
        const json = await res.json();
        if (active && res.ok && json.success) {
          setItems(Array.isArray(json.data) ? json.data : []);
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

  return (
    <Box
      sx={{
        px: { xs: 1.25, sm: 1.5, md: 2 },
        py: { xs: 2, sm: 2.5, md: 3 },
        animation: `${fadeUp} 0.55s ease 0.06s both`,
      }}
    >
      <Box sx={cardSx}>
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.5, sm: 1.75 },
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            borderBottom: "1px solid rgba(27,94,168,0.1)",
            background: "linear-gradient(135deg, rgba(27,94,168,0.07), rgba(200,168,64,0.07))",
          }}
        >
          <Box
            sx={{
              width: { xs: 38, sm: 42 },
              height: { xs: 38, sm: 42 },
              borderRadius: "12px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(145deg, ${HOME.green}, #0E3D73)`,
              color: "#fff",
              boxShadow: "0 8px 18px -8px rgba(27,94,168,0.55)",
            }}
          >
            <CampaignRoundedIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.05rem", sm: "1.15rem" },
                color: HOME.navyDeep,
                lineHeight: 1.2,
              }}
            >
              Notices &amp; announcements
            </Typography>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: { xs: "0.74rem", sm: "0.8rem" },
                color: HOME.inkMuted,
              }}
            >
              Exams, events and updates from the school
            </Typography>
          </Box>
          {items.length > 0 ? (
            <Chip
              label={items.length}
              size="small"
              sx={{
                fontWeight: 800,
                fontFamily: HOME.fontBody,
                fontSize: "0.72rem",
                color: "#fff",
                bgcolor: HOME.green,
              }}
            />
          ) : null}
        </Box>

        {/* Category tabs — pills that wrap on phones, edge-to-edge tabs on larger screens */}
        {loaded ? (
          <Box
            sx={{
              width: "100%",
              borderBottom: "1px solid rgba(27,94,168,0.1)",
              bgcolor: { xs: "rgba(27,94,168,0.05)", sm: "rgba(27,94,168,0.02)" },
              // Phone: 3-column grid so every tab stretches edge to edge
              display: { xs: "grid", sm: "flex" },
              gridTemplateColumns: { xs: "repeat(3, 1fr)" },
              gap: { xs: 1, sm: 0 },
              px: { xs: 1.25, sm: 0 },
              py: { xs: 1.5, sm: 0 },
            }}
          >
            {CATEGORY_FILTERS.map((f) => {
              const active = filter === f.value;
              const count =
                f.value === "all"
                  ? items.length
                  : items.filter((i) => i.category === f.value).length;
              return (
                <Box
                  key={f.value}
                  component="button"
                  type="button"
                  onClick={() => setFilter(f.value)}
                  sx={{
                    flex: { sm: 1 },
                    width: { xs: "100%", sm: "auto" },
                    minWidth: 0,
                    position: "relative",
                    py: { xs: 0.9, sm: 1.15 },
                    px: { xs: 0.5, sm: 0.75 },
                    outline: "none",
                    cursor: "pointer",
                    fontFamily: HOME.fontBody,
                    fontWeight: { xs: active ? 800 : 700, sm: active ? 800 : 600 },
                    fontSize: { xs: "0.76rem", sm: "0.8rem" },
                    whiteSpace: "nowrap",
                    transition:
                      "color 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                    // Phone: rounded pill chips that wrap — no scrolling needed
                    borderRadius: { xs: "999px", sm: 0 },
                    border: {
                      xs: `1.5px solid ${active ? HOME.green : "rgba(27,94,168,0.3)"}`,
                      sm: "none",
                    },
                    color: {
                      xs: active ? "#fff" : HOME.navy,
                      sm: active ? HOME.green : HOME.inkMuted,
                    },
                    bgcolor: {
                      xs: active ? HOME.green : "#fff",
                      sm: active ? "rgba(27,94,168,0.06)" : "transparent",
                    },
                    boxShadow: {
                      xs: active
                        ? "0 8px 18px -6px rgba(27,94,168,0.55)"
                        : "0 2px 8px -2px rgba(8,22,43,0.12)",
                      sm: "none",
                    },
                    "&:hover": {
                      color: { xs: active ? "#fff" : HOME.green, sm: HOME.green },
                      bgcolor: {
                        xs: active ? HOME.green : "rgba(27,94,168,0.06)",
                        sm: "rgba(27,94,168,0.04)",
                      },
                    },
                    // Desktop/tablet: gold underline indicator
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: "20%",
                      right: "20%",
                      bottom: 0,
                      height: 3,
                      borderRadius: "3px 3px 0 0",
                      bgcolor: active ? HOME.gold : "transparent",
                      transition: "background 0.2s ease",
                      display: { xs: "none", sm: "block" },
                    },
                  }}
                >
                  {f.label}
                  {count > 0 ? (
                    <Box
                      component="span"
                      sx={{
                        fontSize: { xs: "0.64rem", sm: "0.62rem" },
                        fontWeight: 800,
                        lineHeight: 1,
                        px: 0.6,
                        py: 0.3,
                        borderRadius: "999px",
                        bgcolor: {
                          xs: active ? "rgba(255,255,255,0.28)" : "rgba(27,94,168,0.12)",
                          sm: active ? HOME.green : "rgba(8,22,43,0.08)",
                        },
                        color: {
                          xs: active ? "#fff" : HOME.green,
                          sm: active ? "#fff" : HOME.inkSoft,
                        },
                        transition: "background 0.2s ease, color 0.2s ease",
                      }}
                    >
                      {count}
                    </Box>
                  ) : null}
                </Box>
              );
            })}
          </Box>
        ) : null}

        {/* Body */}
        {!loaded ? (
          <LoadingRows />
        ) : items.length === 0 ? (
          <EmptyNotices />
        ) : filtered.length === 0 ? (
          <Typography
            sx={{
              textAlign: "center",
              py: 4,
              fontFamily: HOME.fontBody,
              fontSize: "0.86rem",
              color: HOME.inkMuted,
            }}
          >
            Nothing in this category yet.
          </Typography>
        ) : (
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: { xs: 1.25, sm: 1.5 },
              alignItems: "start",
            }}
          >
            {filtered.map((item) => (
              <NoticeItem key={item.id} item={item} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
