import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { HOME, studentAuthHeaders } from "./studentPortalShared";

const cardSx = {
  bgcolor: "#fff",
  border: `1px solid ${HOME.border}`,
  borderRadius: "22px",
  boxShadow: HOME.shadowMd,
  overflow: "hidden",
};

function formatMoney(amount, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
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
          You need to clear more of your school fees before downloading your
          <strong style="color:#1B5EA8;">exam card</strong>.
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
          <hr style="border:none;border-top:1px solid rgba(27,94,168,0.12);margin:2px 0;" />
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">Total charged</span>
            <span style="font-size:0.8rem;font-weight:700;">${totalCharged}</span>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:0.74rem;font-weight:700;color:rgba(8,22,43,0.55);">Confirmed paid</span>
            <span style="font-size:0.8rem;font-weight:700;">${totalPaid}</span>
          </div>
        </div>
        <p style="margin:10px 0 0;font-size:0.74rem;line-height:1.4;color:rgba(8,22,43,0.55);">
          Make a payment under Fees, then come back and download your exam card when you reach the required share.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Go to Fees",
    cancelButtonText: "Not now",
    confirmButtonColor: HOME.green,
    cancelButtonColor: "#94a3b8",
  }).then((result) => {
    if (result.isConfirmed && typeof onGoToFees === "function") onGoToFees();
  });
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

function formatPeriodRange(start, end) {
  if (!start && !end) return null;
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return start ? fmt(start) : fmt(end);
}

async function downloadMyExamTimetablePdf(title) {
  const res = await fetch("/api/exam-timetables/me/pdf", {
    headers: {
      ...studentAuthHeaders(),
      Accept: "application/pdf",
    },
  });
  if (!res.ok) {
    let message = "Could not download PDF";
    let access = null;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
      if (data?.data?.access) access = data.data.access;
    } catch {
      /* binary or empty */
    }
    const err = new Error(message);
    err.status = res.status;
    err.access = access;
    throw err;
  }
  const blob = await res.blob();
  const safeSlug =
    String(title || "exam-timetable")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 72) || "exam-timetable";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `KASMS-Exam-Timetable-${safeSlug}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadMyExamCardPdf() {
  const res = await fetch("/api/exam-timetables/me/card/pdf", {
    headers: {
      ...studentAuthHeaders(),
      Accept: "application/pdf",
    },
  });
  if (!res.ok) {
    let message = "Could not download exam card";
    let access = null;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
      if (data?.data?.access) access = data.data.access;
    } catch {
      /* binary or empty */
    }
    const err = new Error(message);
    err.status = res.status;
    err.access = access;
    throw err;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "KASMS-ExamCard.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function ExamSlotTile({ slot }) {
  const parts = slotDateParts(slot.starts_at);
  const navy = HOME.navyDeep || HOME.navy;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        alignItems: "flex-start",
        p: 1.25,
        borderRadius: "16px",
        bgcolor: HOME.cream,
        border: "1px solid rgba(27,94,168,0.1)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          borderColor: "rgba(27,94,168,0.28)",
          boxShadow: "0 8px 22px -10px rgba(27,94,168,0.35)",
          transform: "translateY(-2px)",
        },
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
            boxShadow: "0 4px 12px -6px rgba(27,94,168,0.3)",
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
            fontSize: "0.84rem",
            color: HOME.ink,
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >
          {slot.title}
        </Typography>
        {slot.unit_code ? (
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.68rem", color: HOME.inkSoft, mb: 0.35 }}>
            {slot.unit_code}
            {slot.unit_name ? ` · ${slot.unit_name}` : ""}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: slot.venue ? 0.35 : 0 }}>
          <ScheduleRoundedIcon sx={{ fontSize: 13, color: HOME.green }} />
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.72rem", fontWeight: 600, color: HOME.inkMuted }}>
            {formatSlotTimeRange(slot.starts_at, slot.ends_at)}
          </Typography>
        </Stack>
        {slot.venue ? (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PlaceOutlinedIcon sx={{ fontSize: 13, color: HOME.gold }} />
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.7rem",
                color: HOME.inkSoft,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {slot.venue}
            </Typography>
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <Box
      sx={{
        ...cardSx,
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        py: { xs: 5, sm: 6 },
      }}
    >
      {icon}
      <Typography
        sx={{
          fontFamily: HOME.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          color: HOME.ink,
          mb: 1,
          mt: 2,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: HOME.fontBody,
          fontSize: "0.9rem",
          color: HOME.inkMuted,
          maxWidth: 420,
          lineHeight: 1.55,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}

export default function StudentExamTimetable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(null);
  const [access, setAccess] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState(null);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPeriod(null);
    setAccess(null);
    setEmptyMessage(null);
    try {
      const res = await fetch("/api/exam-timetables/me", {
        headers: studentAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load exam timetable");

      const payload = data.data || {};
      // API returns { access, period, locked_period }; older clients may get a bare period
      if (
        payload &&
        (payload.period !== undefined ||
          payload.locked_period !== undefined ||
          payload.access !== undefined)
      ) {
        setAccess(payload.access || null);
        const nextPeriod = payload.period || payload.locked_period || null;
        setPeriod(nextPeriod);
        if (!nextPeriod) {
          setEmptyMessage(
            data.message ||
              "No exam timetable has been published for your programme, year and semester yet."
          );
        }
      } else if (payload && payload.id) {
        setAccess(null);
        setPeriod(payload);
      } else {
        setEmptyMessage(
          data.message ||
            "No exam timetable has been published for your programme, year and semester yet."
        );
      }
    } catch (err) {
      setError(err.message || "Failed to load exam timetable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDownloadPdf = async () => {
    if (!period) return;
    setDownloading(true);
    try {
      await downloadMyExamTimetablePdf(period.title);
    } catch (err) {
      if (err.status === 403 && err.access) {
        setAccess(err.access);
        await showExamFeeGateDialog({
          access: err.access,
          onGoToFees: () => navigate("/student/fees"),
        });
      } else {
        setError(err.message || "Could not download PDF");
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCard = async () => {
    if (!period) return;
    setDownloadingCard(true);
    try {
      await downloadMyExamCardPdf();
    } catch (err) {
      if (err.status === 403 && err.access) {
        setAccess(err.access);
        await showExamFeeGateDialog({
          access: err.access,
          onGoToFees: () => navigate("/student/fees"),
        });
      } else {
        setError(err.message || "Could not download exam card");
      }
    } finally {
      setDownloadingCard(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          ...cardSx,
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress size={32} sx={{ color: HOME.green }} />
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, fontSize: "0.88rem" }}>
            Loading your exam timetable…
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<FactCheckRoundedIcon sx={{ fontSize: 48, color: "rgba(185,28,28,0.45)" }} />}
        title="Could not load exam timetable"
        message={error}
      />
    );
  }

  if (!period) {
    return (
      <EmptyState
        icon={<FactCheckRoundedIcon sx={{ fontSize: 48, color: "rgba(27,94,168,0.35)" }} />}
        title="No exam timetable yet"
        message={
          emptyMessage ||
          "No exam timetable has been published for your programme, year and semester yet. Check back after the academic office releases it."
        }
      />
    );
  }

  const slots = Array.isArray(period.slots) ? period.slots : [];
  const periodLabel = formatPeriodRange(period.period_start, period.period_end);
  const navy = HOME.navyDeep || HOME.navy;
  const yearLabel = period.year_of_study ?? period.year ?? "—";
  const semesterLabel = period.semester ?? "—";
  const cohortLabel = `Year ${yearLabel} · Semester ${semesterLabel}`;
  const feeLocked = Boolean(access?.is_enabled && access?.eligible !== true);

  return (
    <Box sx={{ ...cardSx, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          position: "relative",
          px: { xs: 2.25, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          background: `linear-gradient(135deg, ${HOME.green} 0%, ${navy} 100%)`,
          color: "#fff",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -20,
            width: 140,
            height: 140,
            borderRadius: "50%",
            bgcolor: "rgba(200,168,64,0.15)",
          }}
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ position: "relative" }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
              <Box sx={{ width: 28, height: 2.5, borderRadius: 2, bgcolor: HOME.gold }} />
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {period.programme_name ? `${period.programme_name} · ` : ""}
                {cohortLabel}
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.15rem", sm: "1.35rem" },
                color: "#fff",
                lineHeight: 1.2,
                mb: periodLabel ? 1 : 0,
              }}
            >
              {period.title}
            </Typography>
            {periodLabel ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <EventAvailableRoundedIcon sx={{ fontSize: 16, color: HOME.gold }} />
                <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                  {periodLabel}
                </Typography>
              </Stack>
            ) : null}
            {period.academic_year ? (
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.75)",
                  mt: 0.75,
                }}
              >
                Academic year {period.academic_year}
              </Typography>
            ) : null}
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "flex-start" } }}
          >
            <Button
              variant="outlined"
              startIcon={downloading ? <CircularProgress size={14} color="inherit" /> : <DownloadRoundedIcon />}
              onClick={() => void handleDownloadPdf()}
              disabled={downloading || downloadingCard}
              sx={{
                textTransform: "none",
                fontFamily: HOME.fontBody,
                fontWeight: 700,
                fontSize: "0.8rem",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.45)",
                borderRadius: "12px",
                px: 1.75,
                py: 0.85,
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.18)",
                  borderColor: "rgba(255,255,255,0.65)",
                },
              }}
            >
              {downloading ? "Preparing PDF…" : "Download PDF"}
            </Button>
            <Button
              variant="contained"
              startIcon={
                downloadingCard ? <CircularProgress size={14} color="inherit" /> : <BadgeRoundedIcon />
              }
              onClick={() => void handleDownloadCard()}
              disabled={downloading || downloadingCard}
              sx={{
                textTransform: "none",
                fontFamily: HOME.fontBody,
                fontWeight: 700,
                fontSize: "0.8rem",
                color: HOME.green,
                bgcolor: HOME.gold,
                borderRadius: "12px",
                px: 1.75,
                py: 0.85,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#d4b44a",
                  boxShadow: "none",
                },
              }}
            >
              {downloadingCard ? "Preparing card…" : "Download exam card"}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {feeLocked ? (
        <Box
          sx={{
            px: { xs: 2.25, sm: 3 },
            py: 1.25,
            bgcolor: "rgba(154,103,0,0.08)",
            borderBottom: "1px solid rgba(154,103,0,0.18)",
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.8rem", color: "#9a6700", fontWeight: 600 }}>
            Fee requirement not met yet
            {access?.min_fee_percent != null
              ? ` · need ${access.min_fee_percent}% paid (you are at ${access.percent_paid ?? 0}%)`
              : ""}
            . You can view the schedule; downloads unlock after you clear the required fees.
          </Typography>
        </Box>
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: { xs: 2.25, sm: 3 },
          py: { xs: 2, sm: 2.5 },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(145deg, ${HOME.green}, ${HOME.heroSplitGreenDark})`,
              color: "#fff",
              boxShadow: "0 6px 14px -6px rgba(27,94,168,0.5)",
            }}
          >
            <CalendarMonthRoundedIcon sx={{ fontSize: 19 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: "1rem", color: HOME.ink, lineHeight: 1.2 }}>
              Exam schedule
            </Typography>
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.75rem", color: HOME.inkSoft }}>
              {slots.length} paper{slots.length === 1 ? "" : "s"} scheduled
            </Typography>
          </Box>
        </Stack>

        {slots.length === 0 ? (
          <Box
            sx={{
              py: 4,
              px: 2,
              borderRadius: "16px",
              bgcolor: HOME.cream,
              border: "1px dashed rgba(27,94,168,0.22)",
              textAlign: "center",
            }}
          >
            <FactCheckRoundedIcon sx={{ fontSize: 36, color: "rgba(27,94,168,0.3)", mb: 1 }} />
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.88rem", color: HOME.inkMuted }}>
              Your exam timetable is published but no papers are listed yet.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: { xs: 1, sm: 1.25 },
            }}
          >
            {slots.map((slot) => (
              <ExamSlotTile key={slot.id} slot={slot} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
