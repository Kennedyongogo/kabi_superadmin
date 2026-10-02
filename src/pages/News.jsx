import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Skeleton,
  Stack,
  Typography,
  keyframes,
} from "@mui/material";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Helmet } from "react-helmet-async";
import { HOME, BRAND_LOGO_SRC } from "../components/Home/homeShared";
import {
  CATEGORY_FILTERS,
  categoryMeta,
  formatNewsDate,
  formatEventRange,
  isUpcoming,
} from "../components/News/newsShared";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

function eventDayParts(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: d.getDate(),
    month: d.toLocaleDateString(undefined, { month: "short" }),
  };
}

function NewsCard({ item, onOpen, index = 0, featured = false }) {
  const meta = categoryMeta(item.category);
  const photo = item.cover_image_url || BRAND_LOGO_SRC;
  const usingLogo = !item.cover_image_url;
  const dateLabel =
    item.category === "event" || item.category === "exam"
      ? formatEventRange(item.event_date, item.event_end) ||
        formatNewsDate(item.published_at || item.created_at)
      : formatNewsDate(item.published_at || item.created_at);

  return (
    <Box
      onClick={() => onOpen(item)}
      sx={{
        cursor: "pointer",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        borderRadius: "22px",
        overflow: "hidden",
        bgcolor: "#fff",
        border: `1px solid ${HOME.border}`,
        boxShadow: "0 12px 34px -20px rgba(8,22,43,0.22)",
        transition: "transform 0.32s ease, box-shadow 0.32s ease, border-color 0.32s ease",
        gridColumn: featured ? { xs: "auto", md: "span 2" } : "auto",
        animation: `${fadeUp} 0.55s ease both`,
        animationDelay: `${Math.min(index, 9) * 0.06}s`,
        // Gold reveal line across the top
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 2,
          background: HOME.goldGradient,
          transform: "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.35s ease",
        },
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: HOME.shadowLg,
          borderColor: HOME.borderGold,
          "&::before": { transform: "scaleX(1)" },
          "& .news-photo": { transform: "scale(1.06)" },
          "& .news-title": { color: HOME.gold },
          "& .news-cta": { gap: 1, color: "#0E3D73" },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: featured ? { xs: "16 / 9", md: "21 / 9" } : "16 / 9",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          className="news-photo"
          src={photo}
          alt=""
          sx={{
            width: "100%",
            height: "100%",
            objectFit: usingLogo ? "contain" : "cover",
            p: usingLogo ? 3 : 0,
            bgcolor: usingLogo ? "rgba(27,94,168,0.06)" : "transparent",
            transition: "transform 0.5s ease",
          }}
        />
        {/* Soft bottom fade for depth */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 65%, rgba(8,22,43,0.18) 100%)",
            pointerEvents: "none",
          }}
        />
        <Chip
          label={meta.label}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            fontWeight: 800,
            fontFamily: HOME.fontBody,
            fontSize: "0.66rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#fff",
            bgcolor: meta.color,
            boxShadow: "0 4px 12px rgba(8,22,43,0.25)",
          }}
        />
        {isUpcoming(item) ? (
          <Chip
            label="Upcoming"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              fontWeight: 800,
              fontFamily: HOME.fontBody,
              fontSize: "0.64rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: HOME.navyDeep,
              bgcolor: HOME.goldMuted,
              boxShadow: "0 4px 12px rgba(8,22,43,0.25)",
            }}
          />
        ) : null}
      </Box>
      <Box
        sx={{
          p: { xs: 2, md: featured ? 2.75 : 2.25 },
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {dateLabel ? (
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: HOME.green,
              mb: 0.75,
            }}
          >
            {dateLabel}
          </Typography>
        ) : null}
        <Typography
          className="news-title"
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            fontSize: featured
              ? { xs: "1.25rem", md: "1.55rem" }
              : { xs: "1.1rem", md: "1.2rem" },
            lineHeight: 1.2,
            color: HOME.navyDeep,
            mb: 0.75,
            transition: "color 0.25s ease",
          }}
        >
          {item.title}
        </Typography>
        {item.excerpt ? (
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: featured ? { xs: "0.9rem", md: "0.98rem" } : "0.9rem",
              lineHeight: 1.6,
              color: HOME.inkMuted,
              display: "-webkit-box",
              WebkitLineClamp: featured ? 2 : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.excerpt}
          </Typography>
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Stack
          className="news-cta"
          direction="row"
          alignItems="center"
          sx={{
            mt: 1.5,
            gap: 0.5,
            color: HOME.green,
            transition: "gap 0.25s ease, color 0.25s ease",
          }}
        >
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.85rem", fontWeight: 800 }}>
            Read more
          </Typography>
          <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />
        </Stack>
      </Box>
    </Box>
  );
}

function SkeletonCard() {
  return (
    <Box
      sx={{
        borderRadius: "22px",
        overflow: "hidden",
        bgcolor: "#fff",
        border: `1px solid ${HOME.border}`,
      }}
    >
      <Skeleton variant="rectangular" sx={{ width: "100%", aspectRatio: "16 / 9", height: "auto" }} />
      <Box sx={{ p: 2.25 }}>
        <Skeleton width="36%" height={18} />
        <Skeleton width="88%" height={28} />
        <Skeleton width="70%" height={20} />
        <Skeleton width="28%" height={18} sx={{ mt: 1 }} />
      </Box>
    </Box>
  );
}

export default function News() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/announcements/public");
        const json = await res.json();
        if (active && res.ok && json.success) {
          setItems(Array.isArray(json.data) ? json.data : []);
        }
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter]
  );

  const upcoming = useMemo(
    () => items.filter(isUpcoming).slice(0, 4),
    [items]
  );

  const openItem = (item) => navigate(`/news/${item.slug}`);

  return (
    <Box sx={{ bgcolor: HOME.warmWhite, minHeight: "100vh" }}>
      <Helmet>
        <title>News & Events — KASMS</title>
      </Helmet>

      {/* Header — compact */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${HOME.green} 0%, #0E3D73 100%)`,
          py: { xs: 1.75, md: 2.25 },
        }}
      >
        {/* Decorative accents */}
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -30,
            width: 160,
            height: 160,
            borderRadius: "50%",
            bgcolor: "rgba(200,168,64,0.14)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            left: "20%",
            width: 150,
            height: 150,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "relative",
            px: { xs: 2, md: 3 },
            maxWidth: 1180,
            mx: "auto",
            textAlign: "center",
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.35rem", md: "1.7rem" },
              lineHeight: 1.15,
              color: "#fff",
              mb: 0.4,
            }}
          >
            News &{" "}
            <Box component="span" sx={{ color: HOME.goldMuted }}>
              Events
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: { xs: "0.78rem", md: "0.86rem" },
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.85)",
              maxWidth: 520,
              mx: "auto",
            }}
          >
            Announcements, upcoming events and academic notices from KASMS.
          </Typography>
        </Box>
      </Box>

      {/* Category tabs — edge-to-edge */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "#fff",
          borderBottom: `1px solid ${HOME.border}`,
          boxShadow: "0 6px 18px -14px rgba(8,22,43,0.25)",
        }}
      >
        <Box
          sx={{
            width: "100%",
            // Phone: pill grid (3 on top, 2 stretched below) — no scrolling
            display: { xs: "grid", sm: "flex" },
            gridTemplateColumns: { xs: "repeat(6, 1fr)" },
            gap: { xs: 1, sm: 0 },
            px: { xs: 1.25, sm: 0 },
            py: { xs: 1.5, sm: 0 },
            bgcolor: { xs: "rgba(27,94,168,0.05)", sm: "transparent" },
          }}
        >
          {CATEGORY_FILTERS.map((f, index) => {
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
                  gridColumn: { xs: index < 3 ? "span 2" : "span 3", sm: "auto" },
                  width: { xs: "100%", sm: "auto" },
                  minWidth: 0,
                  position: "relative",
                  py: { xs: 0.9, sm: 1.45 },
                  px: { xs: 0.5, sm: 1 },
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: HOME.fontBody,
                  fontWeight: { xs: active ? 800 : 700, sm: active ? 800 : 600 },
                  fontSize: { xs: "0.76rem", sm: "0.88rem" },
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                  transition:
                    "color 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.6,
                  // Phone: pill styling; desktop: flat tab
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
                    sm: active ? "rgba(27,94,168,0.05)" : "transparent",
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
                    left: "18%",
                    right: "18%",
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
                      fontSize: { xs: "0.64rem", sm: "0.66rem" },
                      fontWeight: 800,
                      lineHeight: 1,
                      px: 0.7,
                      py: 0.35,
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
      </Box>

      <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2.5, md: 3.5 } }}>
        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: { xs: 2, md: 2.5 },
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </Box>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Upcoming events strip */}
            {filter === "all" && upcoming.length > 0 ? (
              <Box
                sx={{
                  mb: { xs: 3, md: 4 },
                  p: { xs: 1.75, md: 2.25 },
                  borderRadius: "22px",
                  border: "1px solid rgba(200,168,64,0.35)",
                  background:
                    "linear-gradient(135deg, rgba(200,168,64,0.08) 0%, rgba(27,94,168,0.05) 100%)",
                  animation: `${fadeUp} 0.5s ease both`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.75 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `linear-gradient(145deg, ${HOME.green}, #0E3D73)`,
                      color: "#fff",
                      boxShadow: "0 6px 14px -6px rgba(27,94,168,0.55)",
                    }}
                  >
                    <EventOutlinedIcon sx={{ fontSize: 19 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: HOME.fontDisplay,
                      fontWeight: 700,
                      fontSize: { xs: "1.1rem", md: "1.2rem" },
                      color: HOME.navyDeep,
                    }}
                  >
                    Upcoming events
                  </Typography>
                  <Box sx={{ flex: 1, height: 1.5, bgcolor: "rgba(200,168,64,0.35)", borderRadius: 1 }} />
                </Stack>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: `repeat(${Math.min(upcoming.length, 4)}, 1fr)`,
                    },
                    gap: { xs: 1.25, md: 1.5 },
                  }}
                >
                  {upcoming.map((ev, idx) => {
                    const parts = eventDayParts(ev.event_date);
                    return (
                      <Box
                        key={ev.id}
                        onClick={() => openItem(ev)}
                        sx={{
                          cursor: "pointer",
                          p: { xs: 1.5, md: 1.75 },
                          borderRadius: "18px",
                          bgcolor: "#fff",
                          border: `1px solid ${HOME.border}`,
                          display: "flex",
                          gap: 1.5,
                          alignItems: "center",
                          transition:
                            "box-shadow 0.28s ease, transform 0.28s ease, border-color 0.28s ease",
                          animation: `${fadeUp} 0.5s ease both`,
                          animationDelay: `${0.08 + idx * 0.07}s`,
                          "&:hover": {
                            boxShadow: HOME.shadowMd,
                            transform: "translateY(-3px)",
                            borderColor: HOME.borderGold,
                            "& .event-arrow": { transform: "translateX(3px)", opacity: 1 },
                          },
                        }}
                      >
                        {/* Calendar date block */}
                        <Box
                          sx={{
                            flexShrink: 0,
                            width: 52,
                            borderRadius: "14px",
                            overflow: "hidden",
                            textAlign: "center",
                            border: "1px solid rgba(27,94,168,0.18)",
                            boxShadow: "0 4px 10px -4px rgba(27,94,168,0.3)",
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: HOME.green,
                              color: "#fff",
                              fontFamily: HOME.fontBody,
                              fontSize: "0.6rem",
                              fontWeight: 800,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              py: 0.3,
                            }}
                          >
                            {parts ? parts.month : "TBA"}
                          </Box>
                          <Box
                            sx={{
                              bgcolor: "#fff",
                              color: HOME.navyDeep,
                              fontFamily: HOME.fontDisplay,
                              fontSize: "1.35rem",
                              fontWeight: 700,
                              lineHeight: 1.3,
                            }}
                          >
                            {parts ? parts.day : "—"}
                          </Box>
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            sx={{
                              fontFamily: HOME.fontBody,
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              color: HOME.green,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              mb: 0.25,
                            }}
                          >
                            {formatEventRange(ev.event_date, ev.event_end)}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: HOME.fontBody,
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              color: HOME.navyDeep,
                              lineHeight: 1.3,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {ev.title}
                          </Typography>
                        </Box>
                        <ArrowForwardRoundedIcon
                          className="event-arrow"
                          sx={{
                            fontSize: 18,
                            color: HOME.green,
                            opacity: 0.45,
                            flexShrink: 0,
                            transition: "transform 0.25s ease, opacity 0.25s ease",
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ) : null}

            {filtered.length === 0 ? (
              <Typography
                sx={{
                  textAlign: "center",
                  py: 6,
                  fontFamily: HOME.fontBody,
                  color: HOME.inkMuted,
                }}
              >
                Nothing in this category yet.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: { xs: 2, md: 2.5 },
                }}
              >
                {filtered.map((item, index) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    onOpen={openItem}
                    index={index}
                    featured={index === 0}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

function EmptyState() {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "20px",
          mx: "auto",
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(27,94,168,0.1)",
          color: HOME.green,
        }}
      >
        <CampaignOutlinedIcon sx={{ fontSize: 34 }} />
      </Box>
      <Typography
        sx={{
          fontFamily: HOME.fontDisplay,
          fontWeight: 700,
          fontSize: "1.3rem",
          color: HOME.navyDeep,
          mb: 0.5,
        }}
      >
        No news yet
      </Typography>
      <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted }}>
        Check back soon for the latest updates and events.
      </Typography>
    </Box>
  );
}
