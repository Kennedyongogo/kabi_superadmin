import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import { HOME, fadeUp, studentAuthHeaders } from "./studentPortalShared";

const CR80_RATIO = 85.6 / 53.98;

function formatMoney(amount, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function showMealFeeGateDialog({ access, onGoToFees }) {
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
          <strong style="color:#1B5EA8;">meal card</strong>.
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
          Make a payment under Fees, then come back and download your meal card when you reach the required share.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Go to Fees",
    cancelButtonText: "Not now",
    confirmButtonColor: HOME.green,
    cancelButtonColor: "#94a3b8",
    reverseButtons: true,
    focusConfirm: true,
    width: 420,
    padding: "1.1em 1.15em 1em",
  }).then((result) => {
    if (result.isConfirmed && typeof onGoToFees === "function") onGoToFees();
  });
}

function formatShortDate(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function showDownloadLimitDialog(allowance) {
  const used = allowance?.used ?? 0;
  const allowed = allowance?.allowed ?? allowance?.max_downloads ?? 0;
  const until = formatShortDate(allowance?.range_end);
  return Swal.fire({
    icon: "info",
    title: "Download limit reached",
    html: `
      <div style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1a2638;font-size:0.86rem;line-height:1.5;">
        <p style="margin:0 0 8px;">You have used <strong>${used} of ${allowed}</strong> meal card downloads${until ? ` allowed until <strong>${until}</strong>` : ""}.</p>
        <p style="margin:0;color:rgba(8,22,43,0.65);">Keep using your current printed card. If you lost it, ask the school administration to allow another download.</p>
      </div>
    `,
    confirmButtonText: "OK",
    confirmButtonColor: HOME.green,
    width: 420,
  });
}

function initials(name) {
  return String(name || "S")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Current calendar month → three columns of ~10 days each (1–10, 11–20, 21–end). */
function buildMonthDayColumns(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const chunk = Math.ceil(daysInMonth / 3) || 10;
  const columns = [];
  for (let i = 0; i < days.length; i += chunk) {
    columns.push(days.slice(i, i + chunk));
  }
  while (columns.length < 3) columns.push([]);
  const monthLabel = date.toLocaleDateString("en-KE", { month: "long", year: "numeric" });
  return { monthLabel, columns: columns.slice(0, 3), daysInMonth };
}

function MealMarkBox({ served = false }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: { xs: 8, sm: 10 },
        height: { xs: 8, sm: 10 },
        borderRadius: "2px",
        border: `1px solid ${HOME.green}`,
        bgcolor: served ? HOME.green : "#fff",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {served ? <CheckRoundedIcon sx={{ fontSize: { xs: 7, sm: 9 } }} /> : null}
    </Box>
  );
}

/** Back of CR80 meal card — month grid with B / L / S boxes; served meals are filled. */
function MealCardBack({ referenceDate, served = {} }) {
  const { monthLabel, columns } = useMemo(
    () => buildMonthDayColumns(referenceDate || new Date()),
    [referenceDate]
  );

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        bgcolor: "#f7f4ef",
        border: "1px solid rgba(27,94,168,0.18)",
        boxShadow: "0 18px 40px -18px rgba(27,94,168,0.45)",
        fontFamily: HOME.fontBody,
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          height: { xs: 28, sm: 32 },
          bgcolor: HOME.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.1,
          color: "#fff",
        }}
      >
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 800,
            fontSize: { xs: "0.55rem", sm: "0.62rem" },
            letterSpacing: "0.1em",
          }}
        >
          MEAL LOG
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "0.58rem", sm: "0.68rem" },
            fontWeight: 800,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          {monthLabel}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: { xs: 0.35, sm: 0.55 },
          px: { xs: 0.55, sm: 0.75 },
          pt: { xs: 0.45, sm: 0.55 },
          pb: { xs: 0.4, sm: 0.5 },
        }}
      >
        {columns.map((days, colIdx) => (
          <Box
            key={`col-${colIdx}`}
            sx={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              borderRadius: "6px",
              border: "1px solid rgba(27,94,168,0.12)",
              bgcolor: "rgba(255,255,255,0.72)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.1fr) repeat(3, minmax(0,1fr))",
                alignItems: "center",
                px: 0.35,
                py: 0.25,
                bgcolor: "rgba(14,61,115,0.92)",
                color: "#fff",
              }}
            >
              {["#", "B", "L", "S"].map((h) => (
                <Typography
                  key={h}
                  sx={{
                    fontSize: { xs: "0.42rem", sm: "0.5rem" },
                    fontWeight: 800,
                    textAlign: "center",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                  }}
                >
                  {h}
                </Typography>
              ))}
            </Box>
            <Box
              sx={{
                flex: 1,
                py: 0.15,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-evenly",
              }}
            >
              {days.map((day) => (
                <Box
                  key={day}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1.1fr) repeat(3, minmax(0,1fr))",
                    alignItems: "center",
                    px: 0.3,
                    py: { xs: 0.05, sm: 0.08 },
                    minHeight: { xs: 11, sm: 13 },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.48rem", sm: "0.56rem" },
                      fontWeight: 800,
                      color: HOME.navyDeep || "#1e2858",
                      textAlign: "center",
                      lineHeight: 1,
                    }}
                  >
                    {day}
                  </Typography>
                  {["B", "L", "S"].map((meal) => (
                    <Box key={meal} sx={{ display: "grid", placeItems: "center" }}>
                      <MealMarkBox served={Boolean(served[String(day)]?.[meal])} />
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          px: 1,
          py: 0.35,
          bgcolor: "#0E3D73",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: "0.42rem", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
          B breakfast · L lunch · S supper
        </Typography>
        <Typography sx={{ fontSize: "0.42rem", fontWeight: 800, color: HOME.gold }}>
          Filled = served
        </Typography>
      </Box>
    </Box>
  );
}

/** Visual CR80 meal card (preview). */
function MealCardFace({ card, cardVersion }) {
  if (!card) return null;
  const yearLine = [
    card.year_of_study ? `Y${card.year_of_study}` : null,
    card.semester ? `Sem ${card.semester}` : null,
    card.academic_year || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        bgcolor: "#f7f4ef",
        border: "1px solid rgba(27,94,168,0.18)",
        boxShadow: "0 18px 40px -18px rgba(27,94,168,0.45)",
        fontFamily: HOME.fontBody,
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        pl: "13px",
      }}
    >
      <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, bgcolor: HOME.green }} />
      <Box
        sx={{
          position: "absolute",
          left: 10,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: HOME.gold,
        }}
      />

      <Box
        sx={{
          flexShrink: 0,
          height: { xs: 34, sm: 40 },
          bgcolor: HOME.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.25,
          color: "#fff",
        }}
      >
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            fontWeight: 800,
            fontSize: { xs: "0.6rem", sm: "0.68rem" },
            letterSpacing: "0.12em",
          }}
        >
          MEAL CARD
        </Typography>
        <Typography sx={{ fontSize: { xs: "0.55rem", sm: "0.62rem" }, fontWeight: 700, opacity: 0.9 }}>
          KASMS
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 1.25 }}
        sx={{
          flex: 1,
          minHeight: 0,
          px: 1.25,
          pt: { xs: 0.85, sm: 1.1 },
          pb: { xs: 0.85, sm: 1 },
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            width: { xs: "26%", sm: "28%" },
            maxWidth: 92,
            alignSelf: "stretch",
            borderRadius: "8px",
            border: `1.5px solid ${HOME.green}`,
            overflow: "hidden",
            bgcolor: "rgba(27,94,168,0.08)",
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          {card.profile_image_url ? (
            <Box
              component="img"
              src={card.profile_image_url}
              alt=""
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.1rem", sm: "1.35rem" },
                color: HOME.green,
              }}
            >
              {initials(card.full_name)}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            minWidth: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: { xs: 0.35, sm: 0.15 },
            overflow: "hidden",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.55rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "rgba(8,22,43,0.45)",
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            Full name
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "0.82rem", sm: "1.05rem" },
              color: HOME.navyDeep || "#1e2858",
              lineHeight: 1.15,
              mb: { xs: 0.35, sm: 0.65 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {card.full_name}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.55rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "rgba(8,22,43,0.45)",
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            Admission no.
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontWeight: 800,
              fontSize: { xs: "0.82rem", sm: "0.95rem" },
              color: HOME.green,
              lineHeight: 1.2,
              mb: { xs: 0.35, sm: 0.65 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {card.admission_number || "—"}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.55rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "rgba(8,22,43,0.45)",
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            Programme
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontWeight: 700,
              fontSize: { xs: "0.65rem", sm: "0.72rem" },
              color: "rgba(8,22,43,0.78)",
              lineHeight: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: { xs: 1, sm: 2 },
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {card.programme_name || "—"}
          </Typography>
        </Box>

        <Box
          aria-label="Unique QR code printed on the downloaded card"
          sx={{
            alignSelf: "flex-start",
            flexShrink: 0,
            width: { xs: 50, sm: 70 },
            aspectRatio: "1 / 1",
            borderRadius: "8px",
            border: "1px solid #c5d4e8",
            bgcolor: "#fff",
            display: "grid",
            placeItems: "center",
            alignContent: "center",
            gap: 0.25,
            color: "rgba(11,31,58,0.55)",
          }}
        >
          <QrCode2RoundedIcon sx={{ fontSize: { xs: 30, sm: 42 }, color: "#0b1f3a", opacity: 0.35 }} />
          <Typography
            sx={{
              fontSize: { xs: "0.38rem", sm: "0.46rem" },
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            On PDF
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          flexShrink: 0,
          minHeight: { xs: 40, sm: 46 },
          bgcolor: "#0E3D73",
          color: "#fff",
          px: 1.25,
          py: 0.65,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: "0.55rem", sm: "0.62rem" }, fontWeight: 700, opacity: 0.9 }} noWrap>
            {yearLine || "Student meal access"}
          </Typography>
          <Typography sx={{ fontSize: "0.55rem", color: HOME.gold, fontWeight: 700 }}>
            Issued {card.issued_on || "—"}
            {cardVersion ? ` · Card #${cardVersion}` : ""}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          <Typography sx={{ fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.08em" }}>
            VALID
          </Typography>
          <Typography sx={{ fontSize: "0.58rem", color: HOME.gold, fontWeight: 700 }}>
            {card.valid_label || "Current term"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/** 3D flip wrapper — paid students can flip to the monthly B/L/S log. */
function FlippableMealCard({ card, canFlip, served, cardVersion }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!canFlip) setFlipped(false);
  }, [canFlip]);

  const toggle = () => {
    if (!canFlip) return;
    setFlipped((v) => !v);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 420 }}>
      <Box
        role={canFlip ? "button" : undefined}
        tabIndex={canFlip ? 0 : undefined}
        aria-label={canFlip ? (flipped ? "Show meal card front" : "Show meal log back") : undefined}
        onClick={toggle}
        onKeyDown={(e) => {
          if (!canFlip) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        sx={{
          width: "100%",
          aspectRatio: `${CR80_RATIO}`,
          perspective: "1200px",
          cursor: canFlip ? "pointer" : "default",
          outline: "none",
          "&:focus-visible": canFlip
            ? {
                boxShadow: `0 0 0 3px rgba(27,94,168,0.35)`,
                borderRadius: "12px",
              }
            : undefined,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transition: "transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <MealCardFace card={card} cardVersion={cardVersion} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <MealCardBack served={served} />
          </Box>
        </Box>
      </Box>
      {canFlip ? (
        <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="center" sx={{ mt: 1 }}>
          <SyncRoundedIcon sx={{ fontSize: 14, color: HOME.green }} />
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: "0.72rem",
              fontWeight: 700,
              color: HOME.inkMuted,
            }}
          >
            {flipped ? "Tap to show front" : "Tap card to flip — month meal log (B / L / S)"}
          </Typography>
        </Stack>
      ) : null}
    </Box>
  );
}

export default function StudentMealCard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [access, setAccess] = useState(null);
  const [card, setCard] = useState(null);
  const [lockedCard, setLockedCard] = useState(null);
  const [allowance, setAllowance] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [served, setServed] = useState({});
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async ({ soft = false } = {}) => {
    if (soft) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/meals/card", { headers: studentAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load meal card");
      setAccess(data.data?.access || null);
      setCard(data.data?.card || null);
      setLockedCard(data.data?.locked_card || null);
      setAllowance(data.data?.allowance || null);
      setActiveCard(data.data?.active_card || null);
      setServed(data.data?.served_this_month || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const downloadPdf = async () => {
    if (!access?.eligible) {
      await showMealFeeGateDialog({
        access,
        onGoToFees: () => navigate("/student/fees"),
      });
      return;
    }
    if (limitReached) {
      showDownloadLimitDialog(allowance);
      return;
    }
    if (activeCard) {
      const remainingLine =
        allowance?.limited && allowance.remaining != null
          ? `<p style="margin:10px 0 0;font-size:0.8rem;color:rgba(8,22,43,0.6);">This uses 1 of your ${allowance.remaining} remaining download${allowance.remaining === 1 ? "" : "s"}.</p>`
          : "";
      const confirm = await Swal.fire({
        icon: "warning",
        title: "Replace your meal card?",
        html: `<p style="margin:0;font-size:0.88rem;line-height:1.5;">Downloading creates a new card with a new QR code. Your current card <strong>#${activeCard.version}</strong> will stop working at the cafeteria. Meals already served stay on your record.</p>${remainingLine}`,
        showCancelButton: true,
        confirmButtonText: "Download new card",
        cancelButtonText: "Cancel",
        confirmButtonColor: HOME.green,
        cancelButtonColor: "#94a3b8",
        reverseButtons: true,
      });
      if (!confirm.isConfirmed) return;
    }
    setDownloading(true);
    try {
      const res = await fetch("/api/meals/card/pdf", { headers: studentAuthHeaders() });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403 && data.code === "download_limit") {
          setAllowance(data.data?.allowance || allowance);
          showDownloadLimitDialog(data.data?.allowance || allowance);
          return;
        }
        if (res.status === 403 && data.data?.access) {
          setAccess(data.data.access);
          setCard(null);
          await showMealFeeGateDialog({
            access: data.data.access,
            onGoToFees: () => navigate("/student/fees"),
          });
          return;
        }
        throw new Error(data.message || "Could not download meal card");
      }
      const blob = await res.blob();
      const adm = card?.admission_number || "student";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `KASMS-MealCard-${adm}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      load({ soft: true });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Download failed",
        text: err.message,
        confirmButtonColor: HOME.green,
      });
    } finally {
      setDownloading(false);
    }
  };

  const eligible = access?.eligible === true;
  const limitReached = Boolean(allowance?.limited && allowance.remaining <= 0);
  const preview = eligible ? card : lockedCard;
  const required = access?.min_fee_percent ?? 0;
  const paidPct = access?.percent_paid ?? 0;

  return (
    <Box
      sx={{
        mx: { xs: 1.5, sm: 2, md: 3 },
        mt: 2.5,
        mb: 1,
        animation: `${fadeUp} 0.55s ease both`,
        animationDelay: "0.08s",
      }}
    >
      <Box
        sx={{
          bgcolor: "#fff",
          border: `1px solid ${HOME.border}`,
          borderRadius: "22px",
          boxShadow: HOME.shadowMd,
          overflow: "hidden",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          sx={{
            px: { xs: 1.75, sm: 2.25 },
            py: 1.5,
            borderBottom: "1px solid rgba(27,94,168,0.08)",
            bgcolor: "rgba(27,94,168,0.03)",
          }}
        >
          <Stack direction="row" spacing={1.1} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(27,94,168,0.1)",
                color: HOME.green,
              }}
            >
              <RestaurantRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  color: HOME.ink,
                  lineHeight: 1.15,
                }}
              >
                Meal card
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.75rem", color: HOME.inkMuted }}>
                {eligible
                  ? "Ready to present at the cafeteria — flip for this month’s meal log"
                  : access?.is_enabled
                    ? `Unlocks at ${required}% fees paid · you are at ${paidPct}%`
                    : "Your digital cafeteria pass"}
              </Typography>
            </Box>
          </Stack>

          <Button
            size="small"
            startIcon={refreshing ? <CircularProgress size={14} color="inherit" /> : <RefreshRoundedIcon />}
            onClick={() => load({ soft: true })}
            disabled={refreshing || loading}
            sx={{
              textTransform: "none",
              fontFamily: HOME.fontBody,
              fontWeight: 700,
              color: HOME.green,
              borderRadius: "10px",
              alignSelf: { xs: "flex-start", sm: "center" },
            }}
          >
            Refresh
          </Button>
        </Stack>

        {refreshing ? (
          <LinearProgress
            sx={{
              height: 3,
              bgcolor: "rgba(27,94,168,0.08)",
              "& .MuiLinearProgress-bar": { bgcolor: HOME.green },
            }}
          />
        ) : null}

        <Box sx={{ p: { xs: 1.75, sm: 2.25 } }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }} onClose={() => setError("")}>
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems="center">
              <Skeleton variant="rounded" sx={{ width: "100%", maxWidth: 420, aspectRatio: `${CR80_RATIO}` }} />
              <Skeleton variant="rounded" height={120} sx={{ flex: 1, width: "100%", borderRadius: "14px" }} />
            </Stack>
          ) : (
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2.5}
              alignItems={{ md: "center" }}
              justifyContent="space-between"
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 420,
                  filter: eligible ? "none" : "grayscale(0.35)",
                  opacity: eligible ? 1 : 0.72,
                }}
              >
                <FlippableMealCard
                  card={preview}
                  canFlip={eligible}
                  served={eligible ? served : {}}
                  cardVersion={eligible ? activeCard?.version : null}
                />
                {!eligible ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      aspectRatio: `${CR80_RATIO}`,
                      borderRadius: "12px",
                      bgcolor: "rgba(8,22,43,0.38)",
                      display: "grid",
                      placeItems: "center",
                      px: 2,
                      pointerEvents: "none",
                    }}
                  >
                    <Stack alignItems="center" spacing={0.75}>
                      <LockRoundedIcon sx={{ color: "#fff", fontSize: 28 }} />
                      <Typography
                        sx={{
                          color: "#fff",
                          fontFamily: HOME.fontBody,
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          textAlign: "center",
                        }}
                      >
                        Fee requirement not met
                      </Typography>
                    </Stack>
                  </Box>
                ) : null}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                {eligible ? (
                  <Stack spacing={1.5}>
                    <Typography
                      sx={{
                        fontFamily: HOME.fontBody,
                        fontSize: "0.88rem",
                        color: HOME.inkMuted,
                        lineHeight: 1.5,
                      }}
                    >
                      Your meal card is unlocked. The printed PDF carries your unique QR code, which the
                      cafeteria scans at each meal. Flip the preview to see this month’s Breakfast, Lunch and
                      Supper served so far.
                    </Typography>

                    {allowance?.limited ? (
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: "12px",
                          bgcolor: limitReached ? "rgba(154,103,0,0.07)" : "rgba(27,94,168,0.04)",
                          border: `1px solid ${limitReached ? "rgba(154,103,0,0.25)" : "rgba(27,94,168,0.12)"}`,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              color: HOME.inkMuted,
                            }}
                          >
                            Downloads left
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.9rem",
                              color: limitReached ? "#9a6700" : HOME.green,
                            }}
                          >
                            {Math.max(0, allowance.remaining)} of {allowance.allowed}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: "0.74rem", color: HOME.inkMuted, mt: 0.5, lineHeight: 1.4 }}>
                          {limitReached
                            ? "You have reached the download limit. Ask the school administration if you need another copy."
                            : `Limit applies from ${formatShortDate(allowance.range_start)} to ${formatShortDate(allowance.range_end)}.`}
                        </Typography>
                      </Box>
                    ) : null}

                    {activeCard ? (
                      <Stack direction="row" spacing={0.75} alignItems="flex-start">
                        <InfoOutlinedIcon sx={{ fontSize: 16, color: HOME.inkMuted, mt: "2px" }} />
                        <Typography sx={{ fontSize: "0.74rem", color: HOME.inkMuted, lineHeight: 1.45 }}>
                          Card #{activeCard.version} is active. A new download replaces it and older printed copies
                          stop working.
                        </Typography>
                      </Stack>
                    ) : null}

                    <Button
                      variant="contained"
                      startIcon={
                        downloading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <DownloadRoundedIcon />
                        )
                      }
                      onClick={downloadPdf}
                      disabled={downloading || limitReached}
                      sx={{
                        alignSelf: { xs: "center", sm: "flex-start" },
                        textTransform: "none",
                        fontFamily: HOME.fontBody,
                        fontWeight: 800,
                        bgcolor: HOME.green,
                        borderRadius: "12px",
                        px: 2.25,
                        py: 1.1,
                        boxShadow: "0 10px 24px -12px rgba(27,94,168,0.65)",
                        "&:hover": { bgcolor: "#0E3D73" },
                      }}
                    >
                      {downloading
                        ? "Preparing PDF…"
                        : limitReached
                          ? "Download limit reached"
                          : activeCard
                            ? "Download new meal card PDF"
                            : "Download meal card PDF"}
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={1.25}>
                    <Typography
                      sx={{
                        fontFamily: HOME.fontBody,
                        fontSize: "0.88rem",
                        color: HOME.inkMuted,
                        lineHeight: 1.5,
                      }}
                    >
                      {access?.message ||
                        `Pay at least ${required}% of your fees to unlock and download your meal card.`}
                    </Typography>

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "14px",
                        bgcolor: "rgba(27,94,168,0.04)",
                        border: "1px solid rgba(27,94,168,0.12)",
                      }}
                    >
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
                            bgcolor: paidPct >= required ? HOME.green : HOME.gold,
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography sx={{ fontSize: "0.75rem", color: HOME.inkMuted }}>
                          Paid {formatMoney(access?.total_paid, access?.currency)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: HOME.inkMuted }}>
                          of {formatMoney(access?.total_charged, access?.currency)}
                        </Typography>
                      </Stack>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => navigate("/student/fees")}
                      sx={{
                        alignSelf: "flex-start",
                        textTransform: "none",
                        fontFamily: HOME.fontBody,
                        fontWeight: 800,
                        bgcolor: HOME.green,
                        borderRadius: "12px",
                        px: 2.25,
                        py: 1.1,
                        "&:hover": { bgcolor: "#0E3D73" },
                      }}
                    >
                      Go to Fees
                    </Button>
                  </Stack>
                )}
              </Box>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
