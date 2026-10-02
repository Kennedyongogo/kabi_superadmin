import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Box, Button, CircularProgress, IconButton, Popover, Stack, Typography } from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import { HOME } from "./studentPortalShared";
import { studentApi, timeAgo } from "./churchShared";

const TYPE_META = {
  church_booking: { icon: EventSeatRoundedIcon, color: "#047857", bg: "rgba(5,150,105,0.12)" },
  church_booking_cancelled: { icon: EventBusyRoundedIcon, color: "#b45309", bg: "rgba(180,83,9,0.12)" },
  church_service_cancelled: { icon: EventBusyRoundedIcon, color: "#b91c1c", bg: "rgba(185,28,28,0.1)" },
  church_absent: { icon: PersonOffRoundedIcon, color: "#b91c1c", bg: "rgba(185,28,28,0.1)" },
};

export default function StudentNotificationsBell({ sx }) {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      const res = await studentApi("/notifications/unread-count");
      setUnread(res.data.unread_count ?? 0);
    } catch {
      /* the bell is optional; stay quiet if the API is unavailable */
    }
  }, []);

  useEffect(() => {
    refreshCount();
    const t = setInterval(() => document.visibilityState === "visible" && refreshCount(), 45000);
    const onFocus = () => refreshCount();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCount]);

  const openPanel = async (e) => {
    setAnchor(e.currentTarget);
    setLoading(true);
    try {
      const res = await studentApi("/notifications?limit=30");
      setItems(res.data.notifications);
      setUnread(res.data.unread_count);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const markAll = async () => {
    try {
      await studentApi("/notifications/read-all", { method: "POST" });
      setItems((list) => list.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  };

  const openItem = async (n) => {
    if (!n.read) {
      studentApi(`/notifications/${n.id}/read`, { method: "PATCH" }).catch(() => {});
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
    }
    if (n.type?.startsWith("church")) {
      setAnchor(null);
      navigate(n.data?.service_id && n.type === "church_booking" ? `/student/church?service=${n.data.service_id}` : "/student/church");
    }
  };

  return (
    <>
      <IconButton
        onClick={openPanel}
        aria-label={unread ? `${unread} unread notifications` : "Notifications"}
        sx={{ width: 42, height: 42, borderRadius: "12px", border: `1px solid ${HOME.border}`, ...sx }}
      >
        <Badge
          badgeContent={unread}
          max={99}
          sx={{ "& .MuiBadge-badge": { bgcolor: HOME.gold, color: HOME.navyDeep, fontWeight: 800, fontFamily: HOME.fontBody } }}
        >
          <NotificationsRoundedIcon sx={{ color: HOME.navyDeep }} />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, width: 370, maxWidth: "calc(100vw - 24px)", borderRadius: "18px", border: `1px solid ${HOME.border}`, boxShadow: HOME.shadowLg, overflow: "hidden" } } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${HOME.border}` }}>
          <Box>
            <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: "1.2rem", color: HOME.navyDeep, lineHeight: 1.1 }}>Notifications</Typography>
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.72rem", color: HOME.inkSoft }}>{unread ? `${unread} unread` : "You're all caught up"}</Typography>
          </Box>
          {unread ? (
            <Button size="small" onClick={markAll} sx={{ textTransform: "none", fontFamily: HOME.fontBody, fontWeight: 700, color: HOME.green }}>
              Mark all read
            </Button>
          ) : null}
        </Stack>
        <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={24} sx={{ color: HOME.green }} />
            </Stack>
          ) : !items.length ? (
            <Stack alignItems="center" spacing={1} sx={{ py: 5, px: 3 }}>
              <NotificationsRoundedIcon sx={{ fontSize: 38, color: "rgba(27,94,168,0.25)" }} />
              <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.84rem", color: HOME.inkSoft, textAlign: "center" }}>
                Booking confirmations and updates will appear here.
              </Typography>
            </Stack>
          ) : (
            items.map((n) => {
              const meta = TYPE_META[n.type] || { icon: CampaignRoundedIcon, color: HOME.green, bg: "rgba(27,94,168,0.1)" };
              const Icon = meta.icon;
              return (
                <Box
                  key={n.id}
                  component="button"
                  type="button"
                  onClick={() => openItem(n)}
                  sx={{
                    all: "unset",
                    boxSizing: "border-box",
                    width: "100%",
                    cursor: "pointer",
                    display: "flex",
                    gap: 1.25,
                    px: 2,
                    py: 1.4,
                    borderBottom: `1px solid rgba(12,35,64,0.06)`,
                    bgcolor: n.read ? "transparent" : "rgba(200,168,64,0.08)",
                    "&:hover": { bgcolor: "rgba(27,94,168,0.05)" },
                  }}
                >
                  <Box sx={{ width: 36, height: 36, borderRadius: "11px", bgcolor: meta.bg, color: meta.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon sx={{ fontSize: 19 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
                      <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: n.read ? 700 : 800, fontSize: "0.86rem", color: HOME.navyDeep }}>{n.title}</Typography>
                      <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.68rem", color: HOME.inkSoft, flexShrink: 0 }}>{timeAgo(n.created_at)}</Typography>
                    </Stack>
                    {n.body ? (
                      <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.78rem", color: HOME.inkMuted, lineHeight: 1.45, mt: 0.25 }}>{n.body}</Typography>
                    ) : null}
                  </Box>
                  {!n.read ? <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: HOME.gold, mt: 0.75, flexShrink: 0 }} /> : null}
                </Box>
              );
            })
          )}
        </Box>
      </Popover>
    </>
  );
}
