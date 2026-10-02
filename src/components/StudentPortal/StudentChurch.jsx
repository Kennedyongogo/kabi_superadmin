import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ChurchRoundedIcon from "@mui/icons-material/ChurchRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import FitScreenRoundedIcon from "@mui/icons-material/FitScreenRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import { HOME, fadeUp } from "./studentPortalShared";
import {
  formatTime,
  formatWhen,
  printBookingSlip,
  SeatLegend,
  StudentSeatMap,
  studentApi,
} from "./churchShared";

const cardSx = {
  bgcolor: "#fff",
  border: `1px solid ${HOME.border}`,
  borderRadius: "20px",
  boxShadow: HOME.shadowSm,
  overflow: "hidden",
};

const primaryBtn = {
  textTransform: "none",
  fontFamily: HOME.fontBody,
  fontWeight: 800,
  bgcolor: HOME.green,
  color: "#fff",
  borderRadius: "12px",
  px: 2.25,
  py: 1,
  boxShadow: "0 10px 24px -12px rgba(27,94,168,0.65)",
  "&:hover": { bgcolor: HOME.greenDark },
  "&.Mui-disabled": { bgcolor: "rgba(27,94,168,0.25)", color: "#fff" },
};

const softBtn = {
  textTransform: "none",
  fontFamily: HOME.fontBody,
  fontWeight: 700,
  borderRadius: "12px",
  color: HOME.green,
  bgcolor: "rgba(27,94,168,0.07)",
  px: 1.75,
  "&:hover": { bgcolor: "rgba(27,94,168,0.14)" },
};

const MIN_ZOOM = 0.15;

const alertSx = {
  mb: { xs: 1.5, sm: 2 },
  borderRadius: "14px",
  fontFamily: HOME.fontBody,
  fontSize: { xs: "0.8rem", sm: "0.875rem" },
  alignItems: "center",
  flexWrap: { xs: "wrap", sm: "nowrap" },
  "& .MuiAlert-message": { flex: 1, minWidth: 0 },
  "& .MuiAlert-action": { ml: { xs: 0, sm: "auto" }, pl: { xs: 4.25, sm: 2 }, pt: 0, width: { xs: "100%", sm: "auto" } },
};

function DateBadge({ value }) {
  const d = new Date(value);
  return (
    <Box sx={{ width: 58, flexShrink: 0, borderRadius: "14px", overflow: "hidden", textAlign: "center", border: `1px solid ${HOME.border}` }}>
      <Box sx={{ bgcolor: HOME.navy, color: "#fff", py: 0.3 }}>
        <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em" }}>
          {d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}
        </Typography>
      </Box>
      <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: "1.6rem", color: HOME.navyDeep, lineHeight: 1.15, pt: 0.25 }}>
        {d.getDate()}
      </Typography>
      <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.6rem", fontWeight: 800, color: HOME.inkSoft, pb: 0.45 }}>
        {d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase()}
      </Typography>
    </Box>
  );
}

function AttendanceChip({ booking, past }) {
  if (booking.status === "cancelled") {
    return <Chip size="small" label="Cancelled" sx={{ fontFamily: HOME.fontBody, fontWeight: 800, fontSize: "0.68rem", height: 22, bgcolor: "rgba(100,116,139,0.12)", color: "#475569" }} />;
  }
  if (booking.attendance === "present") {
    return <Chip size="small" icon={<CheckCircleRoundedIcon />} label="Attended" sx={{ fontFamily: HOME.fontBody, fontWeight: 800, fontSize: "0.68rem", height: 22, bgcolor: "rgba(5,150,105,0.12)", color: "#047857", "& .MuiChip-icon": { color: "#047857", fontSize: 15 } }} />;
  }
  if (booking.attendance === "absent") {
    return <Chip size="small" icon={<CancelRoundedIcon />} label="Marked absent" sx={{ fontFamily: HOME.fontBody, fontWeight: 800, fontSize: "0.68rem", height: 22, bgcolor: "rgba(220,38,38,0.1)", color: "#b91c1c", "& .MuiChip-icon": { color: "#b91c1c", fontSize: 15 } }} />;
  }
  return (
    <Chip
      size="small"
      label={past ? "Not recorded" : "Booked"}
      sx={{ fontFamily: HOME.fontBody, fontWeight: 800, fontSize: "0.68rem", height: 22, bgcolor: past ? "rgba(100,116,139,0.1)" : "rgba(200,168,64,0.2)", color: past ? "#475569" : "#7a5f10" }}
    />
  );
}

function BookingTicket({ booking, student, onOpen, onCancel, busy }) {
  const s = booking.service;
  const started = new Date() >= new Date(s.starts_at);
  return (
    <Box
      sx={{
        ...cardSx,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        position: "relative",
        animation: `${fadeUp} 0.5s ease both`,
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(150deg, ${HOME.navyDeep}, ${HOME.navy} 55%, ${HOME.green})`,
          color: "#fff",
          px: 2.5,
          py: 2,
          minWidth: { sm: 150 },
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 2, sm: 0.5 },
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.14em", opacity: 0.75 }}>YOUR SEAT</Typography>
        <Box sx={{ bgcolor: HOME.gold, color: HOME.navyDeep, borderRadius: "14px", minWidth: 78, px: 1.5, py: 1, fontFamily: HOME.fontBody, fontWeight: 900, fontSize: "1.7rem", lineHeight: 1 }}>
          {booking.seat_label}
        </Box>
        <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", color: HOME.goldMuted }}>{booking.reference}</Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, p: 2, borderLeft: { sm: "2px dashed rgba(12,35,64,0.12)" }, borderTop: { xs: "2px dashed rgba(12,35,64,0.12)", sm: "none" } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <AttendanceChip booking={booking} />
          {s.service_type ? <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.74rem", fontWeight: 700, color: HOME.green }}>{s.service_type}</Typography> : null}
        </Stack>
        <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: "1.3rem", color: HOME.navyDeep, lineHeight: 1.2 }}>{s.title}</Typography>
        <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.5 }}>
          <ScheduleRoundedIcon sx={{ fontSize: 16, color: HOME.inkSoft }} />
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.82rem", color: HOME.inkMuted }}>
            {formatWhen(s.starts_at)}
            {s.ends_at ? ` – ${formatTime(s.ends_at)}` : ""}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          <Button size="small" startIcon={<EventSeatRoundedIcon />} onClick={() => onOpen(s.id)} sx={softBtn}>
            View on map
          </Button>
          <Button size="small" startIcon={<PrintRoundedIcon />} onClick={() => printBookingSlip({ booking, service: s, student })} sx={softBtn}>
            Booking slip
          </Button>
          {!started ? (
            <Button size="small" startIcon={busy ? <CircularProgress size={14} /> : <CloseRoundedIcon />} disabled={busy} onClick={() => onCancel(booking)} sx={{ ...softBtn, color: "#b91c1c", bgcolor: "rgba(220,38,38,0.06)", "&:hover": { bgcolor: "rgba(220,38,38,0.12)" } }}>
              Cancel
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

function ServiceCard({ service, onOpen, index }) {
  const s = service;
  const pct = s.bookable_seat_count ? Math.round((s.booked_count / s.bookable_seat_count) * 100) : 0;
  const full = s.available_count <= 0;
  const mine = s.my_booking;
  return (
    <Box
      sx={{
        ...cardSx,
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        animation: `${fadeUp} 0.5s ease both`,
        animationDelay: `${index * 0.05}s`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: HOME.shadowMd },
      }}
    >
      <Stack direction="row" spacing={1.5}>
        <DateBadge value={s.starts_at} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {s.service_type ? <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.74rem", fontWeight: 800, color: HOME.green }}>{s.service_type}</Typography> : null}
          <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: "1.2rem", color: HOME.navyDeep, lineHeight: 1.2 }}>{s.title}</Typography>
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.78rem", color: HOME.inkMuted, mt: 0.25 }}>
            {formatTime(s.starts_at)}
            {s.ends_at ? ` – ${formatTime(s.ends_at)}` : ""}
          </Typography>
        </Box>
      </Stack>
      {s.description ? (
        <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.8rem", color: HOME.inkMuted, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {s.description}
        </Typography>
      ) : null}
      <Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, pct)}
          sx={{ height: 7, borderRadius: 4, bgcolor: "rgba(27,94,168,0.1)", "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: pct >= 90 ? "#dc2626" : pct >= 65 ? "#d97706" : HOME.green } }}
        />
        <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.74rem", fontWeight: 700, color: HOME.inkSoft, mt: 0.6 }}>
          {full ? "Fully booked" : `${s.available_count} of ${s.bookable_seat_count} seats free`}
          {s.booking_open ? ` · booking closes ${formatTime(s.booking_closes_at)}` : " · booking closed"}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }} />
      {mine ? (
        <Button onClick={() => onOpen(s.id)} startIcon={<EventSeatRoundedIcon />} sx={{ ...primaryBtn, bgcolor: HOME.gold, color: HOME.navyDeep, "&:hover": { bgcolor: HOME.goldMuted } }}>
          You're in seat {mine.seat_label}
        </Button>
      ) : (
        <Button onClick={() => onOpen(s.id)} disabled={!s.booking_open || full} startIcon={s.booking_open && !full ? <EventSeatRoundedIcon /> : <LockClockRoundedIcon />} sx={primaryBtn}>
          {!s.booking_open ? "Booking closed" : full ? "Fully booked" : "Choose a seat"}
        </Button>
      )}
    </Box>
  );
}

function BookingView({ serviceId, student, onBack, onChanged }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(0.6);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);
  const fitted = useRef(false);
  const manualZoom = useRef(false);

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      try {
        const res = await studentApi(`/church/services/${serviceId}/seat-map`);
        setData(res.data);
        setError("");
        setSelected((sel) => {
          if (!sel) return sel;
          const now = res.data.layout.seats.find((x) => x.id === sel.id);
          return now && now.status === "available" ? now : null;
        });
      } catch (err) {
        if (!quiet) setError(err.message);
      }
    },
    [serviceId]
  );

  useEffect(() => {
    load();
    const t = setInterval(() => document.visibilityState === "visible" && load({ quiet: true }), 10000);
    return () => clearInterval(t);
  }, [load]);

  const fit = useCallback(() => {
    const el = boxRef.current;
    if (!el || !data) return;
    manualZoom.current = false;
    const z = (el.clientWidth - 8) / data.layout.width;
    setZoom(Math.max(MIN_ZOOM, Math.min(1.5, Math.floor(z * 100) / 100)));
  }, [data]);

  const zoomBy = (factor) => {
    manualZoom.current = true;
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(3, +(z * factor).toFixed(2))));
  };

  useEffect(() => {
    if (data && !fitted.current) {
      fitted.current = true;
      setTimeout(fit, 20);
    }
  }, [data, fit]);

  // Keep the plan fitted when the phone rotates or the window resizes, unless the student zoomed by hand.
  useEffect(() => {
    const onResize = () => !manualZoom.current && fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fit]);

  const service = data?.service;
  const mine = data?.my_booking;
  const open = service?.booking_open;
  const free = useMemo(() => (data?.layout.seats || []).filter((s) => s.status === "available").length, [data]);

  const book = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await studentApi(`/church/services/${serviceId}/bookings`, { method: "POST", body: { seat_key: selected.id } });
      const booking = res.data;
      setSelected(null);
      await load({ quiet: true });
      onChanged();
      const r = await Swal.fire({
        icon: "success",
        title: `Seat ${booking.seat_label} is yours`,
        html: `<div style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:0.9rem;line-height:1.55;color:#1a2638">
            <div style="margin:4px 0 10px">${service.title}<br/><span style="color:rgba(8,22,43,.6)">${formatWhen(service.starts_at)}</span></div>
            <div style="display:inline-block;padding:8px 14px;border-radius:12px;background:rgba(27,94,168,.07);border:1px solid rgba(27,94,168,.15)">
              Reference <b style="letter-spacing:.1em;color:#1B5EA8">${booking.reference}</b></div>
            <div style="margin-top:10px;font-size:0.78rem;color:rgba(8,22,43,.6)">A confirmation has been added to your notifications.</div></div>`,
        showCancelButton: true,
        confirmButtonText: "Booking slip",
        cancelButtonText: "Done",
        confirmButtonColor: HOME.green,
        cancelButtonColor: "#94a3b8",
        reverseButtons: true,
      });
      if (r.isConfirmed) printBookingSlip({ booking, service, student });
    } catch (err) {
      if (err.code === "SEAT_TAKEN") {
        await Swal.fire({ icon: "warning", title: "Just missed it", text: err.message, confirmButtonColor: HOME.green });
        setSelected(null);
        load({ quiet: true });
      } else {
        Swal.fire({ icon: "error", title: "Booking failed", text: err.message, confirmButtonColor: HOME.green });
        load({ quiet: true });
      }
    } finally {
      setBusy(false);
    }
  };

  const cancelMine = async () => {
    const ok = await Swal.fire({
      icon: "question",
      title: `Give up seat ${mine.seat_label}?`,
      text: "Someone else will be able to book it.",
      showCancelButton: true,
      confirmButtonText: "Cancel booking",
      cancelButtonText: "Keep my seat",
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#94a3b8",
      reverseButtons: true,
    });
    if (!ok.isConfirmed) return;
    setBusy(true);
    try {
      await studentApi(`/church/bookings/${mine.id}`, { method: "DELETE" });
      await load({ quiet: true });
      onChanged();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not cancel", text: err.message, confirmButtonColor: HOME.green });
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <Box sx={{ ...cardSx, p: 3, textAlign: "center" }}>
        <Typography sx={{ fontFamily: HOME.fontBody, color: "#b91c1c", mb: 1.5 }}>{error}</Typography>
        <Button onClick={onBack} startIcon={<ArrowBackRoundedIcon />} sx={softBtn}>
          Back to services
        </Button>
      </Box>
    );
  }
  if (!data) {
    return <Skeleton variant="rounded" height={420} sx={{ borderRadius: "20px" }} />;
  }

  return (
    <Box sx={{ animation: `${fadeUp} 0.45s ease both`, pb: selected ? 12 : 2 }}>
      <Box sx={{ ...cardSx, mb: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" spacing={{ xs: 1.25, sm: 1.5 }} alignItems="center" sx={{ p: { xs: 1.5, sm: 2.25 }, minWidth: 0 }}>
          <IconButton onClick={onBack} size="small" sx={{ border: `1px solid ${HOME.border}`, flexShrink: 0, width: { xs: 36, sm: 42 }, height: { xs: 36, sm: 42 } }} aria-label="Back">
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <DateBadge value={service.starts_at} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {service.service_type ? <Typography noWrap sx={{ fontFamily: HOME.fontBody, fontSize: { xs: "0.7rem", sm: "0.76rem" }, fontWeight: 800, color: HOME.green }}>{service.service_type}</Typography> : null}
            <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: { xs: "1.2rem", sm: "1.6rem" }, color: HOME.navyDeep, lineHeight: 1.15, overflowWrap: "anywhere" }}>{service.title}</Typography>
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: { xs: "0.76rem", sm: "0.82rem" }, color: HOME.inkMuted }}>
              {formatWhen(service.starts_at)}
              {service.ends_at ? ` – ${formatTime(service.ends_at)}` : ""}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right", flexShrink: 0, pl: { xs: 0.5, sm: 1 } }}>
            <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: { xs: "1.4rem", sm: "1.7rem" }, color: HOME.green, lineHeight: 1 }}>{free}</Typography>
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: { xs: "0.64rem", sm: "0.72rem" }, fontWeight: 700, color: HOME.inkSoft, lineHeight: 1.3 }}>
              seats
              <Box component="br" sx={{ display: { sm: "none" } }} /> free now
            </Typography>
          </Box>
        </Stack>
        {service.description ? (
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: { xs: "0.8rem", sm: "0.84rem" }, color: HOME.inkMuted, px: { xs: 1.5, sm: 2.25 }, pb: { xs: 1.5, sm: 2 }, lineHeight: 1.55 }}>{service.description}</Typography>
        ) : null}
      </Box>

      {mine ? (
        <Alert
          icon={<EventSeatRoundedIcon />}
          severity="success"
          sx={alertSx}
          action={
            <Stack direction="row" spacing={0.5}>
              <Button size="small" onClick={() => printBookingSlip({ booking: mine, service, student })} sx={{ textTransform: "none", fontWeight: 700 }}>
                Slip
              </Button>
              {open ? (
                <Button size="small" color="error" disabled={busy} onClick={cancelMine} sx={{ textTransform: "none", fontWeight: 700 }}>
                  Cancel
                </Button>
              ) : null}
            </Stack>
          }
        >
          You're booked in <b>seat {mine.seat_label}</b> · reference <b>{mine.reference}</b>. To move, cancel this seat first.
        </Alert>
      ) : !open ? (
        <Alert severity="info" icon={<LockClockRoundedIcon />} sx={alertSx}>
          Booking for this service has closed.
        </Alert>
      ) : (
        <Alert severity="info" sx={alertSx}>
          Tap a free seat, then confirm. Seats update live — if someone takes it first you'll be told straight away.
          <Box component="span" sx={{ display: { sm: "none" } }}> Zoom in with + to make seats easier to tap.</Box>
        </Alert>
      )}

      <Box sx={cardSx}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.25 }, borderBottom: "1px solid rgba(27,94,168,0.08)", gap: 1 }}
        >
          <SeatLegend sx={{ columnGap: { xs: 1.25, sm: 1.5 }, rowGap: 0.5 }} />
          <Stack direction="row" spacing={0.25} alignItems="center" justifyContent={{ xs: "space-between", sm: "flex-end" }} sx={{ flexShrink: 0 }}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => load()} aria-label="Refresh">
                <RefreshRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Stack direction="row" spacing={0.25} alignItems="center" sx={{ bgcolor: { xs: "rgba(27,94,168,0.06)", sm: "transparent" }, borderRadius: "12px", px: { xs: 0.5, sm: 0 } }}>
              <IconButton onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out" sx={{ p: { xs: 1, sm: 0.625 } }}>
                <ZoomOutRoundedIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.74rem", fontWeight: 800, color: HOME.inkSoft, width: 40, textAlign: "center" }}>{Math.round(zoom * 100)}%</Typography>
              <IconButton onClick={() => zoomBy(1.25)} aria-label="Zoom in" sx={{ p: { xs: 1, sm: 0.625 } }}>
                <ZoomInRoundedIcon fontSize="small" />
              </IconButton>
              <Tooltip title="Fit to screen">
                <IconButton onClick={fit} aria-label="Fit to screen" sx={{ p: { xs: 1, sm: 0.625 } }}>
                  <FitScreenRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
        <Box ref={boxRef} sx={{ overflow: "auto", maxHeight: { xs: "62vh", sm: "70vh" }, bgcolor: "#f8fafc", p: 0.5, WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
          <StudentSeatMap
            layout={data.layout}
            zoom={zoom}
            selectedId={selected?.id}
            onSeatClick={(seat) => {
              if (seat.status === "mine" || mine || !open) return;
              setSelected((cur) => (cur?.id === seat.id ? null : seat));
            }}
          />
        </Box>
      </Box>

      {selected ? (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1200,
            px: { xs: 1.5, sm: 3 },
            pb: "calc(12px + env(safe-area-inset-bottom))",
            pt: 1.5,
            background: "linear-gradient(180deg, rgba(250,248,244,0) 0%, rgba(250,248,244,0.96) 30%)",
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.5 }}
            alignItems="center"
            sx={{ maxWidth: 760, mx: "auto", bgcolor: HOME.navyDeep, color: "#fff", borderRadius: "18px", p: { xs: 1, sm: 1.25 }, pl: { xs: 1, sm: 1.5 }, boxShadow: HOME.shadowLg }}
          >
            <Box sx={{ bgcolor: HOME.green, borderRadius: "12px", minWidth: { xs: 48, sm: 56 }, height: { xs: 46, sm: 52 }, flexShrink: 0, display: "grid", placeItems: "center", fontFamily: HOME.fontBody, fontWeight: 900, fontSize: { xs: "1.05rem", sm: "1.2rem" }, px: 1 }}>
              {selected.label}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 800, fontSize: { xs: "0.88rem", sm: "0.95rem" } }} noWrap>
                Seat {selected.label}
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontBody, fontSize: { xs: "0.7rem", sm: "0.74rem" }, opacity: 0.75 }} noWrap>
                {selected.section || "General seating"} · {formatTime(service.starts_at)}
              </Typography>
            </Box>
            <IconButton onClick={() => setSelected(null)} sx={{ color: "rgba(255,255,255,0.7)", flexShrink: 0, p: { xs: 0.75, sm: 1 } }} aria-label="Clear selection">
              <CloseRoundedIcon />
            </IconButton>
            <Button onClick={book} disabled={busy} sx={{ ...primaryBtn, bgcolor: HOME.gold, color: HOME.navyDeep, "&:hover": { bgcolor: HOME.goldMuted }, px: { xs: 2, sm: 3 }, py: 1.25, flexShrink: 0, whiteSpace: "nowrap" }}>
              {busy ? (
                <CircularProgress size={18} sx={{ color: HOME.navyDeep }} />
              ) : (
                <>
                  Book<Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>&nbsp;this seat</Box>
                </>
              )}
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}

export default function StudentChurch({ student }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("service");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [a, b] = await Promise.all([studentApi("/church/available"), studentApi("/church/my-bookings?include_cancelled=1")]);
      setServices(a.data.services);
      setBookings(b.data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = (id) => {
    setSearchParams({ service: id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { upcoming, history } = useMemo(() => {
    const now = Date.now();
    const endOf = (s) => (s.ends_at ? new Date(s.ends_at).getTime() : new Date(s.starts_at).getTime() + 3 * 3600 * 1000);
    const up = [];
    const hist = [];
    for (const b of bookings) {
      if (!b.service) continue;
      if (b.status === "active" && endOf(b.service) > now && b.service.status === "approved") up.push(b);
      else hist.push(b);
    }
    up.sort((x, y) => new Date(x.service.starts_at) - new Date(y.service.starts_at));
    return { upcoming: up, history: hist.slice(0, 20) };
  }, [bookings]);

  const cancel = async (booking) => {
    const ok = await Swal.fire({
      icon: "question",
      title: `Give up seat ${booking.seat_label}?`,
      text: `${booking.service.title} — someone else will be able to book it.`,
      showCancelButton: true,
      confirmButtonText: "Cancel booking",
      cancelButtonText: "Keep my seat",
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#94a3b8",
      reverseButtons: true,
    });
    if (!ok.isConfirmed) return;
    setBusyId(booking.id);
    try {
      await studentApi(`/church/bookings/${booking.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not cancel", text: err.message, confirmButtonColor: HOME.green });
    } finally {
      setBusyId("");
    }
  };

  const sectionTitle = (text, sub) => (
    <Box sx={{ mb: 1.5, mt: { xs: 2.5, sm: 3 } }}>
      <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: { xs: "1.3rem", sm: "1.45rem" }, color: HOME.navyDeep, lineHeight: 1.1 }}>{text}</Typography>
      {sub ? <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.8rem", color: HOME.inkSoft }}>{sub}</Typography> : null}
    </Box>
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "calc(100vh - 68px)",
        boxSizing: "border-box",
        overflowX: "hidden",
        px: { xs: 1.5, sm: 3, lg: 4 },
        py: { xs: 2, md: 2.5 },
      }}
    >
      {activeId ? (
        <BookingView
          key={activeId}
          serviceId={activeId}
          student={student}
          onBack={() => setSearchParams({})}
          onChanged={load}
        />
      ) : (
        <>
          <Box
            sx={{
              borderRadius: "20px",
              px: { xs: 2, sm: 2.75 },
              py: { xs: 2, sm: 2.25 },
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              background: HOME.heroBackground,
              boxShadow: HOME.shadowMd,
              animation: `${fadeUp} 0.5s ease both`,
            }}
          >
            <Box sx={{ position: "absolute", right: -50, top: -60, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(200,168,64,0.18)" }} />
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: "relative", minWidth: 0 }}>
              <Box sx={{ width: { xs: 46, sm: 52 }, height: { xs: 46, sm: 52 }, flexShrink: 0, borderRadius: "16px", display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <ChurchRoundedIcon sx={{ color: HOME.gold, fontSize: { xs: 24, sm: 28 } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography component="h1" sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: { xs: "1.55rem", sm: "1.9rem" }, lineHeight: 1.1 }}>Church services</Typography>
                <Typography sx={{ fontFamily: HOME.fontBody, fontSize: { xs: "0.8rem", sm: "0.86rem" }, opacity: 0.85 }}>
                  Reserve your seat for upcoming services. One seat per service — your booking slip is your proof.
                </Typography>
              </Box>
            </Stack>
          </Box>

          {error ? (
            <Alert severity="error" sx={{ mt: 2, borderRadius: "14px" }} action={<Button onClick={load}>Retry</Button>}>
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: "20px" }} />
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: "20px" }} />
            </Stack>
          ) : (
            <>
              {upcoming.length ? (
                <>
                  {sectionTitle("Your seats", "Show the slip to an usher if asked. Attendance is checked during the service.")}
                  <Stack spacing={1.5}>
                    {upcoming.map((b) => (
                      <BookingTicket key={b.id} booking={b} student={student} onOpen={open} onCancel={cancel} busy={busyId === b.id} />
                    ))}
                  </Stack>
                </>
              ) : null}

              {sectionTitle("Upcoming services", services.length ? `${services.length} service${services.length === 1 ? "" : "s"} open` : null)}
              {services.length ? (
                <Box sx={{ display: "grid", gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" } }}>
                  {services.map((s, i) => (
                    <ServiceCard key={s.id} service={s} index={i} onOpen={open} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ ...cardSx, p: 4, textAlign: "center" }}>
                  <ChurchRoundedIcon sx={{ fontSize: 44, color: "rgba(27,94,168,0.35)" }} />
                  <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 700, color: HOME.navyDeep, mt: 1 }}>No services open for booking yet</Typography>
                  <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.82rem", color: HOME.inkSoft }}>New services appear here once the chaplaincy approves them.</Typography>
                </Box>
              )}

              {history.length ? (
                <>
                  {sectionTitle("History", "Your past bookings and attendance")}
                  <Box sx={cardSx}>
                    {history.map((b, i) => (
                      <Stack
                        key={b.id}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ px: 2, py: 1.25, borderTop: i ? "1px solid rgba(12,35,64,0.06)" : "none", opacity: b.status === "cancelled" ? 0.65 : 1 }}
                      >
                        <Box sx={{ minWidth: 48, height: 40, borderRadius: "10px", display: "grid", placeItems: "center", bgcolor: "rgba(27,94,168,0.08)", color: HOME.green, fontFamily: HOME.fontBody, fontWeight: 900, fontSize: "0.9rem", px: 0.75 }}>
                          {b.seat_label}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontFamily: HOME.fontBody, fontWeight: 700, fontSize: "0.88rem", color: HOME.navyDeep }}>{b.service.title}</Typography>
                          <Typography noWrap sx={{ fontFamily: HOME.fontBody, fontSize: "0.74rem", color: HOME.inkSoft }}>
                            {formatWhen(b.service.starts_at, { weekday: "short", month: "short", year: "numeric" })} · {b.reference}
                          </Typography>
                        </Box>
                        <AttendanceChip booking={b} past />
                      </Stack>
                    ))}
                  </Box>
                </>
              ) : null}
            </>
          )}
        </>
      )}
    </Box>
  );
}
