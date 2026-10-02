import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { HOME, studentAuthHeaders } from "./studentPortalShared";

function formatMoney(amount, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatPeriodRange(start, end) {
  if (!start && !end) return null;
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return start ? fmt(start) : fmt(end);
}

function slotDateParts(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString("en-KE", { weekday: "short" }),
    day: d.getDate(),
    month: d.toLocaleDateString("en-KE", { month: "short" }),
  };
}

function formatSlotTimeRange(startIso, endIso) {
  if (!startIso) return "—";
  const startStr = new Date(startIso).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!endIso) return startStr;
  const endStr = new Date(endIso).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startStr} – ${endStr}`;
}

function showExamFeeGateDialog({ access, onGoToFees }) {
  const required = access?.min_fee_percent ?? 0;
  const paidPct = access?.percent_paid ?? 0;
  const shortfall = access?.shortfall_percent ?? Math.max(0, required - paidPct);
  const currency = access?.currency || "KES";
  const totalCharged = formatMoney(access?.total_charged, currency);
  const totalPaid = formatMoney(access?.total_paid, currency);

  return Swal.fire({
    icon: false,
    title: "Fee requirement not met",
    html: `
      <div style="text-align:left;font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1a2638;">
        <p style="margin:0 0 10px;font-size:0.86rem;line-height:1.45;color:rgba(8,22,43,0.72);">
          You need to clear more of your school fees before unlocking your
          <strong style="color:#1B5EA8;">exam timetable</strong>.
        </p>
        <div style="display:grid;gap:6px;padding:10px 12px;border-radius:12px;background:rgba(27,94,168,0.05);border:1px solid rgba(27,94,168,0.12);">
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">Required</span>
            <span style="font-size:0.84rem;font-weight:800;color:#1B5EA8;">${required}% of fees paid</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">You have paid</span>
            <span style="font-size:0.84rem;font-weight:800;">${paidPct}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">Still needed</span>
            <span style="font-size:0.84rem;font-weight:800;color:#9a6700;">${shortfall}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;margin-top:2px;padding-top:6px;border-top:1px dashed rgba(27,94,168,0.18);">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">Paid</span>
            <span style="font-size:0.8rem;font-weight:700;">${totalPaid} of ${totalCharged}</span>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Go to Fees",
    cancelButtonText: "Close",
    confirmButtonColor: HOME.green,
    cancelButtonColor: "#8a93a8",
  }).then((result) => {
    if (result.isConfirmed && typeof onGoToFees === "function") onGoToFees();
  });
}

function SlotCard({ slot }) {
  const parts = slotDateParts(slot.starts_at);
  const navy = HOME.navyDeep || HOME.navy;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        alignItems: "flex-start",
        p: 1.35,
        borderRadius: "16px",
        bgcolor: HOME.cream,
        border: `1px solid ${HOME.border}`,
      }}
    >
      {parts ? (
        <Box
          sx={{
            flexShrink: 0,
            width: 52,
            borderRadius: "12px",
            overflow: "hidden",
            textAlign: "center",
            border: "1px solid rgba(27,94,168,0.15)",
          }}
        >
          <Box
            sx={{
              bgcolor: HOME.green,
              color: "#fff",
              fontFamily: HOME.fontBody,
              fontSize: "0.58rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              py: 0.35,
            }}
          >
            {parts.month}
          </Box>
          <Box
            sx={{
              bgcolor: "#fff",
              color: navy,
              fontFamily: HOME.fontDisplay,
              fontSize: "1.2rem",
              fontWeight: 700,
              lineHeight: 1.2,
              py: 0.45,
            }}
          >
            {parts.day}
          </Box>
          <Box
            sx={{
              bgcolor: "rgba(27,94,168,0.06)",
              color: HOME.inkSoft,
              fontFamily: HOME.fontBody,
              fontSize: "0.58rem",
              fontWeight: 700,
              py: 0.3,
            }}
          >
            {parts.weekday}
          </Box>
        </Box>
      ) : null}

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 700,
            fontSize: "0.9rem",
            color: HOME.ink,
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >
          {slot.title}
        </Typography>
        {slot.unit_code ? (
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.7rem", color: HOME.inkSoft, mb: 0.35 }}>
            {slot.unit_code}
            {slot.unit_name ? ` · ${slot.unit_name}` : ""}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: slot.venue ? 0.35 : 0 }}>
          <ScheduleRoundedIcon sx={{ fontSize: 14, color: HOME.green }} />
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.75rem", fontWeight: 600, color: HOME.inkMuted }}>
            {formatSlotTimeRange(slot.starts_at, slot.ends_at)}
          </Typography>
        </Stack>
        {slot.venue ? (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PlaceOutlinedIcon sx={{ fontSize: 14, color: HOME.gold || "#c8a840" }} />
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.72rem", color: HOME.inkSoft }}>
              {slot.venue}
            </Typography>
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}

export default function StudentExamPlan() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState(null);
  const [access, setAccess] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const navy = HOME.navyDeep || HOME.navy;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/exam-timetables/me", {
        headers: studentAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not load exam timetable");
      }
      const payload = data.data || {};
      // Support both legacy (period object) and new { access, period, locked_period } shapes
      if (payload && (payload.period !== undefined || payload.locked_period !== undefined || payload.access)) {
        setAccess(payload.access || null);
        setPeriod(payload.period || payload.locked_period || null);
      } else {
        setAccess(null);
        setPeriod(payload && payload.id ? payload : null);
      }
      setMessage(data.message || "");
    } catch (err) {
      setPeriod(null);
      setAccess(null);
      setError(err.message || "Could not load exam timetable");
      setMessage("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const eligible = !access?.is_enabled || access?.eligible === true;
  const slots = useMemo(
    () => (Array.isArray(period?.slots) ? period.slots : []),
    [period]
  );
  const periodLabel = formatPeriodRange(period?.period_start, period?.period_end);
  const required = access?.min_fee_percent ?? 0;
  const paidPct = access?.percent_paid ?? 0;

  const handleDownload = async () => {
    if (!eligible) {
      await showExamFeeGateDialog({
        access,
        onGoToFees: () => navigate("/student/fees"),
      });
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch("/api/exam-timetables/me/pdf", {
        headers: {
          ...studentAuthHeaders(),
          Accept: "application/pdf",
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403 && data.data?.access) {
          setAccess(data.data.access);
          await showExamFeeGateDialog({
            access: data.data.access,
            onGoToFees: () => navigate("/student/fees"),
          });
          return;
        }
        throw new Error(data.message || "Could not download PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "KASMS-Exam-Timetable.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress size={32} sx={{ color: HOME.green }} />
      </Box>
    );
  }

  if (error && !period) {
    return (
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Alert severity="error" sx={{ borderRadius: "14px" }} onClose={() => setError("")}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!period) {
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2,
          py: 5,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "18px",
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(27,94,168,0.08)",
            color: HOME.green,
            mb: 2,
          }}
        >
          <EventBusyRoundedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            color: HOME.ink,
            fontSize: "1.15rem",
            mb: 0.75,
          }}
        >
          No exam plan published
        </Typography>
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            color: HOME.inkSoft,
            fontSize: "0.88rem",
            maxWidth: 380,
            lineHeight: 1.5,
          }}
        >
          {message ||
            "There is no approved exam timetable for your programme, year and semester yet."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderBottom: `1px solid ${HOME.border}`,
          bgcolor: HOME.cream,
          flexShrink: 0,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: `linear-gradient(145deg, ${HOME.green} 0%, ${navy} 150%)`,
                flexShrink: 0,
              }}
            >
              <FactCheckRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  color: HOME.ink,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  lineHeight: 1.25,
                }}
              >
                {period.title}
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.78rem", mt: 0.35 }}>
                {eligible
                  ? `Year ${period.year_of_study} · Semester ${period.semester} · ${period.academic_year}${
                      periodLabel ? ` · ${periodLabel}` : ""
                    }`
                  : access?.is_enabled
                    ? `Unlocks at ${required}% fees paid · you are at ${paidPct}%`
                    : `Year ${period.year_of_study} · Semester ${period.semester} · ${period.academic_year}`}
              </Typography>
            </Box>
          </Stack>
          <Button
            size="small"
            startIcon={
              downloading ? <CircularProgress size={14} color="inherit" /> : <DownloadRoundedIcon />
            }
            onClick={() => void handleDownload()}
            disabled={downloading || (eligible && !slots.length)}
            sx={{
              textTransform: "none",
              fontFamily: HOME.fontBody,
              fontWeight: 700,
              fontSize: "0.78rem",
              color: HOME.green,
              borderRadius: "10px",
              border: "1px solid rgba(27,94,168,0.25)",
              bgcolor: "#fff",
              alignSelf: { xs: "stretch", sm: "center" },
              "&:hover": { bgcolor: "rgba(27,94,168,0.06)" },
            }}
          >
            {downloading ? "Preparing…" : eligible ? "Download PDF" : "Unlock to download"}
          </Button>
        </Stack>
      </Box>

      {error ? (
        <Alert severity="warning" sx={{ m: 2, borderRadius: "12px" }} onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: { xs: 2, sm: 2.5 },
          py: 2,
          position: "relative",
        }}
      >
        {!eligible ? (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: "14px",
              bgcolor: "rgba(27,94,168,0.04)",
              border: "1px solid rgba(27,94,168,0.12)",
            }}
          >
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.85rem",
                color: HOME.inkMuted,
                lineHeight: 1.5,
                mb: 1.25,
              }}
            >
              {access?.message ||
                `Pay at least ${required}% of your fees to unlock and download your exam timetable.`}
            </Typography>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: HOME.inkMuted,
                }}
              >
                Fee progress
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: HOME.green }}>
                {paidPct}% / {required}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, paidPct)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(27,94,168,0.1)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: paidPct >= required ? HOME.green : HOME.gold || "#c8a840",
                  borderRadius: 4,
                },
              }}
            />
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, mb: 1.25 }}>
              <Typography sx={{ fontSize: "0.75rem", color: HOME.inkMuted }}>
                Paid {formatMoney(access?.total_paid, access?.currency)}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: HOME.inkMuted }}>
                of {formatMoney(access?.total_charged, access?.currency)}
              </Typography>
            </Stack>
            <Button
              variant="contained"
              onClick={() => navigate("/student/fees")}
              sx={{
                textTransform: "none",
                fontFamily: HOME.fontBody,
                fontWeight: 800,
                bgcolor: HOME.green,
                borderRadius: "12px",
                px: 2,
                py: 1,
                "&:hover": { bgcolor: "#0E3D73" },
              }}
            >
              Go to Fees
            </Button>
          </Box>
        ) : null}

        <Box
          sx={{
            position: "relative",
            filter: eligible ? "none" : "blur(5px)",
            opacity: eligible ? 1 : 0.55,
            pointerEvents: eligible ? "auto" : "none",
            userSelect: eligible ? "auto" : "none",
          }}
        >
          {slots.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.ink, mb: 0.5 }}>
                No papers listed yet
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.85rem" }}>
                This exam plan is published but has no scheduled papers.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: HOME.inkSoft,
                  mb: 0.5,
                }}
              >
                {slots.length} paper{slots.length === 1 ? "" : "s"}
              </Typography>
              {slots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </Stack>
          )}
        </Box>

        {!eligible ? (
          <Box
            sx={{
              position: "absolute",
              left: 16,
              right: 16,
              top: "42%",
              transform: "translateY(-50%)",
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
            }}
          >
            <Stack
              alignItems="center"
              spacing={0.75}
              sx={{
                px: 2.5,
                py: 2,
                borderRadius: "16px",
                bgcolor: "rgba(8,22,43,0.72)",
                backdropFilter: "blur(6px)",
                maxWidth: 280,
              }}
            >
              <LockRoundedIcon sx={{ color: "#fff", fontSize: 28 }} />
              <Typography
                sx={{
                  color: "#fff",
                  fontFamily: HOME.fontBody,
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  textAlign: "center",
                }}
              >
                Fee requirement not met
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.78)",
                  fontFamily: HOME.fontBody,
                  fontSize: "0.75rem",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                Clear your fees to unlock the full timetable and PDF download.
              </Typography>
            </Stack>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
