import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { BRAND_LOGO_SRC } from "../../brand";
import { HOME, fadeUp } from "./studentPortalShared";

const formatMoney = (amount, currency = "KES") =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const formatMethod = (method) => {
  const labels = {
    mpesa: "M-Pesa",
    bank: "Bank transfer",
    cash: "Cash",
    card: "Card",
    other: "Other",
  };
  return labels[method] || method || "—";
};

function ReceiptDetailRow({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={1.5}
      sx={{
        py: 0.85,
        px: 1.25,
        borderRadius: "10px",
        bgcolor: "rgba(27,94,168,0.03)",
      }}
    >
      <Typography
        sx={{
          fontFamily: HOME.fontBody,
          color: HOME.inkSoft,
          fontSize: "0.72rem",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: HOME.fontBody,
          color: HOME.navyDeep,
          fontSize: "0.78rem",
          fontWeight: 700,
          textAlign: "right",
          overflowWrap: "anywhere",
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}

function ReceiptPreviewCard({ payment, student, summary }) {
  const receiptNo = payment?.provider_receipt || payment?.reference || "—";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 560,
        mx: "auto",
        my: { xs: 1.5, sm: 2 },
        px: { xs: 1.5, sm: 2 },
      }}
    >
      <Box
        sx={{
          bgcolor: "#fff",
          border: `1px solid ${HOME.border}`,
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: HOME.shadowSm,
        }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              component="img"
              src={BRAND_LOGO_SRC}
              alt="Kendu"
              sx={{ height: 42, width: "auto", objectFit: "contain", flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  color: HOME.navyDeep,
                  fontSize: { xs: "0.82rem", sm: "0.92rem" },
                  lineHeight: 1.25,
                }}
              >
                Kendu Adventist School of Medical Sciences
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.68rem" }}>
                Train where care meets calling
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            mx: 2,
            mb: 1.5,
            py: 1,
            px: 1.5,
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${HOME.green} 0%, ${HOME.navyDeep} 140%)`,
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontFamily: HOME.fontBody, color: "rgba(255,255,255,0.85)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>
            OFFICIAL FEE PAYMENT RECEIPT
          </Typography>
          <Typography sx={{ fontFamily: HOME.fontDisplay, color: "#fff", fontWeight: 700, fontSize: "0.95rem", mt: 0.25, overflowWrap: "anywhere" }}>
            {receiptNo}
          </Typography>
        </Box>

        <Box
          sx={{
            mx: 2,
            mb: 1.75,
            p: 1.5,
            borderRadius: "14px",
            border: `1.5px solid ${HOME.gold}`,
            bgcolor: "#fffdf5",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.7rem", fontWeight: 600 }}>
            Amount received
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              color: HOME.green,
              fontWeight: 800,
              fontSize: { xs: "1.55rem", sm: "1.75rem" },
              letterSpacing: "-0.02em",
              mt: 0.2,
            }}
          >
            {formatMoney(payment?.amount, payment?.currency)}
          </Typography>
        </Box>

        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              color: HOME.green,
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              mb: 0.75,
            }}
          >
            STUDENT DETAILS
          </Typography>
          <Stack spacing={0.65} sx={{ mb: 1.75 }}>
            <ReceiptDetailRow label="Name" value={student?.full_name} />
            <ReceiptDetailRow label="Admission" value={student?.admission_number} />
            <ReceiptDetailRow label="Programme" value={student?.programme?.name} />
            <ReceiptDetailRow
              label="Period"
              value={
                student?.year_of_study
                  ? `Year ${student.year_of_study} · Semester ${student.semester || 1}`
                  : "—"
              }
            />
          </Stack>

          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              color: HOME.green,
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              mb: 0.75,
            }}
          >
            PAYMENT DETAILS
          </Typography>
          <Stack spacing={0.65} sx={{ mb: summary ? 1.75 : 0 }}>
            <ReceiptDetailRow label="Status" value={String(payment?.status || "").toUpperCase()} />
            <ReceiptDetailRow label="Method" value={formatMethod(payment?.method)} />
            <ReceiptDetailRow label="Date" value={formatDate(payment?.paid_at || payment?.createdAt)} />
            <ReceiptDetailRow label="Reference" value={payment?.reference} />
            <ReceiptDetailRow label="Receipt" value={payment?.provider_receipt} />
            {payment?.phone ? <ReceiptDetailRow label="Phone" value={payment.phone} /> : null}
          </Stack>

          {summary ? (
            <>
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  color: HOME.green,
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  mb: 0.75,
                }}
              >
                ACCOUNT SUMMARY
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: Number(summary.credit) > 0 ? "repeat(4, 1fr)" : "repeat(3, 1fr)",
                  gap: 0.75,
                  p: 1.1,
                  borderRadius: "12px",
                  bgcolor: "rgba(27,94,168,0.04)",
                }}
              >
                {[
                  ["Billed", formatMoney(summary.total_charged, summary.currency)],
                  ["Paid", formatMoney(summary.total_paid, summary.currency)],
                  ["Balance", formatMoney(summary.balance, summary.currency)],
                  ...(Number(summary.credit) > 0
                    ? [["Excess", formatMoney(summary.credit, summary.currency)]]
                    : []),
                ].map(([label, value]) => (
                  <Box key={label} sx={{ textAlign: "center", minWidth: 0 }}>
                    <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.62rem", fontWeight: 600 }}>
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: HOME.fontBody,
                        color: HOME.navyDeep,
                        fontSize: { xs: "0.68rem", sm: "0.74rem" },
                        fontWeight: 800,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : null}
        </Box>

        <Box sx={{ px: 2, py: 1.25, borderTop: `1px solid ${HOME.border}`, bgcolor: "rgba(27,94,168,0.02)" }}>
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.65rem", textAlign: "center", lineHeight: 1.4 }}>
            Computer-generated receipt from the Kendu student portal. Present with your admission number for verification.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function SummaryCard({ label, value, hint, icon, accent = HOME.green, delay = 0 }) {
  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#fff",
        border: `1px solid ${HOME.border}`,
        borderRadius: "18px",
        p: { xs: 1.75, sm: 2 },
        boxShadow: HOME.shadowSm,
        overflow: "hidden",
        animation: `${fadeUp} 0.45s ease both`,
        animationDelay: `${delay * 0.07}s`,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: HOME.shadowMd,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accent}, ${HOME.gold})`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              color: HOME.inkSoft,
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              color: HOME.navyDeep,
              fontWeight: 700,
              fontSize: { xs: "1.35rem", md: "1.65rem" },
              letterSpacing: "-0.02em",
              mt: 0.3,
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.7rem", mt: 0.2 }}>
            {hint}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "13px",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: `linear-gradient(145deg, ${accent} 0%, ${HOME.navyDeep} 160%)`,
            boxShadow: `0 8px 20px -6px ${accent}66`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

function SectionCard({ title, subtitle, children, delay = 0 }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: `1px solid ${HOME.border}`,
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: HOME.shadowSm,
        animation: `${fadeUp} 0.5s ease both`,
        animationDelay: `${delay * 0.08}s`,
      }}
    >
      <Box sx={{ px: 2, py: 1.5, bgcolor: "rgba(27,94,168,0.04)", borderBottom: `1px solid ${HOME.border}` }}>
        <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep, fontSize: "1.1rem" }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.72rem" }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Box>
  );
}

function StatusChip({ status }) {
  const config = {
    confirmed: { label: "Confirmed", color: "success" },
    pending: { label: "Pending", color: "warning" },
    failed: { label: "Failed", color: "error" },
    reversed: { label: "Reversed", color: "default" },
  }[status] || { label: status, color: "default" };
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />;
}

export default function StudentFees({ student }) {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState(student.phone || "");
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const loadLedger = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/accounting/me", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || "Could not load your fee account");
      setLedger(data.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const closeReceiptPreview = useCallback(() => {
    setReceiptPreview(null);
  }, []);

  const viewReceipt = useCallback((payment) => {
    if (payment.status !== "confirmed") {
      Swal.fire({
        icon: "info",
        title: "Receipt not ready",
        text: "You can open a receipt once the payment is confirmed.",
        confirmButtonColor: HOME.green,
      });
      return;
    }

    const receiptNo = payment.provider_receipt || payment.reference || payment.id;
    setReceiptPreview({
      receiptNo,
      filename: `KASMS-Receipt-${receiptNo}.pdf`,
      payment,
    });
  }, []);

  const downloadReceipt = useCallback(async (payment) => {
    if (payment.status !== "confirmed") {
      Swal.fire({
        icon: "info",
        title: "Receipt not ready",
        text: "You can download a receipt once the payment is confirmed.",
        confirmButtonColor: HOME.green,
      });
      return;
    }

    setDownloadingReceiptId(payment.id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/accounting/me/payments/${payment.id}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Could not download receipt");
      }

      const blob = await response.blob();
      const receiptNo = payment.provider_receipt || payment.reference || payment.id;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `KASMS-Receipt-${receiptNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      Swal.fire({
        icon: "error",
        title: "Download failed",
        text: requestError.message,
        confirmButtonColor: HOME.green,
      });
    } finally {
      setDownloadingReceiptId(null);
    }
  }, []);

  const actionBusy = (paymentId) => downloadingReceiptId === paymentId;

  const paymentProgress = useMemo(() => {
    if (!ledger?.summary?.total_charged) return 0;
    return Math.min(100, (ledger.summary.total_paid / ledger.summary.total_charged) * 100);
  }, [ledger]);

  const openPayment = () => {
    setAmount(String(ledger?.summary?.balance || ""));
    setPhone(student.phone || "");
    setPayOpen(true);
  };

  const initiatePayment = async () => {
    const value = Number(amount);
    if (!value || value <= 0 || value > ledger.summary.balance) {
      Swal.fire({
        icon: "warning",
        title: "Check the amount",
        text: `Enter an amount between KES 1 and ${formatMoney(ledger.summary.balance)}.`,
        confirmButtonColor: HOME.green,
      });
      return;
    }

    setPaying(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/accounting/me/pay", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: value, phone }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || "Could not start payment");
      setPayOpen(false);
      await Swal.fire({
        icon: "info",
        title: "Check your phone",
        text: "Enter your M-Pesa PIN to complete the payment. Your balance will update after confirmation.",
        confirmButtonText: "I have paid",
        confirmButtonColor: HOME.green,
      });
      await loadLedger();
      window.setTimeout(() => loadLedger({ silent: true }), 6000);
    } catch (requestError) {
      Swal.fire({
        icon: "error",
        title: "Payment not started",
        text: requestError.message,
        confirmButtonColor: HOME.green,
      });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "calc(100vh - 68px)", display: "grid", placeItems: "center", bgcolor: HOME.cream }}>
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress sx={{ color: HOME.green }} />
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted }}>Loading your fee account…</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "calc(100vh - 68px)", bgcolor: HOME.cream, p: { xs: 2, sm: 4 } }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" startIcon={<RefreshRoundedIcon />} onClick={() => loadLedger()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const { summary, charges, payments, online_payment_available: onlinePaymentAvailable } = ledger;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 68px)",
        bgcolor: HOME.cream,
        px: { xs: 1.5, sm: 3, lg: 4 },
        py: { xs: 2, md: 2.5 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          background: HOME.navyGradient,
          px: { xs: 2, sm: 2.75 },
          py: { xs: 2, sm: 2.25 },
          boxShadow: HOME.shadowMd,
          animation: `${fadeUp} 0.45s ease both`,
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: HOME.heroBackgroundAccent,
            pointerEvents: "none",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1.5}
          alignItems={{ sm: "center" }}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "15px",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: `linear-gradient(145deg, ${HOME.gold} 0%, ${HOME.green} 120%)`,
                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                flexShrink: 0,
              }}
            >
              <AccountBalanceWalletRoundedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                component="h1"
                sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: { xs: "1.7rem", sm: "1.9rem" }, color: "#fff", lineHeight: 1.15 }}
              >
                Fee account
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontBody, color: "rgba(255,255,255,0.75)", fontSize: "0.85rem" }}>
                Your charges, payments and outstanding balances in one place.
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<PhoneIphoneRoundedIcon />}
            disabled={summary.balance <= 0 || !onlinePaymentAvailable}
            onClick={openPayment}
            sx={{
              textTransform: "none",
              borderRadius: "12px",
              px: 2.5,
              py: 1,
              background: HOME.goldGradient,
              color: HOME.navyDeep,
              fontWeight: 800,
              fontFamily: HOME.fontBody,
              boxShadow: "0 10px 26px -6px rgba(201,162,39,0.55)",
              flexShrink: 0,
              "&:hover": { background: `linear-gradient(135deg, ${HOME.goldMuted} 0%, ${HOME.gold} 100%)`, boxShadow: "0 12px 30px -6px rgba(201,162,39,0.6)" },
              "&.Mui-disabled": { background: "rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.45)" },
            }}
          >
            Pay with M-Pesa
          </Button>
        </Stack>
      </Box>

      {summary.fee_structure_missing ? (
        <Alert severity="warning" sx={{ mt: 2, borderRadius: "12px" }}>
          Your current semester fee structure has not been published. Contact the accounts office.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(5, 1fr)" },
          gap: 1.5,
          mt: 2,
        }}
      >
        <SummaryCard
          delay={1}
          label="Total billed"
          value={formatMoney(summary.total_charged, summary.currency)}
          hint="All semesters to date"
          icon={<ReceiptLongRoundedIcon />}
        />
        <SummaryCard
          delay={2}
          label="Paid"
          value={formatMoney(summary.total_paid, summary.currency)}
          hint={`${paymentProgress.toFixed(0)}% of billed fees`}
          icon={<CheckCircleRoundedIcon />}
          accent="#2e7d32"
        />
        <SummaryCard
          delay={3}
          label="Fee balance"
          value={formatMoney(summary.balance, summary.currency)}
          hint={
            summary.credit > 0
              ? "Fully paid — see excess credit"
              : summary.balance
                ? "Amount still payable"
                : "Your account is clear"
          }
          icon={<AccountBalanceWalletRoundedIcon />}
          accent={summary.balance ? "#b26a00" : "#2e7d32"}
        />
        <SummaryCard
          delay={4}
          label="Excess credit"
          value={formatMoney(summary.credit || 0, summary.currency)}
          hint={
            summary.credit > 0
              ? "Paid above billed fees — held on your account"
              : "No overpayment on file"
          }
          icon={<SavingsRoundedIcon />}
          accent={summary.credit > 0 ? HOME.gold : HOME.green}
        />
        <SummaryCard
          delay={5}
          label="Previous arrears"
          value={formatMoney(summary.arrears, summary.currency)}
          hint="Before the current semester"
          icon={<PaymentsRoundedIcon />}
          accent={summary.arrears ? "#b91c1c" : HOME.green}
        />
      </Box>

      {summary.credit > 0 ? (
        <Alert
          severity="info"
          sx={{
            mt: 1.5,
            borderRadius: "14px",
            fontFamily: HOME.fontBody,
            border: `1px solid ${HOME.borderGold || "rgba(200,168,64,0.35)"}`,
            bgcolor: "rgba(200,168,64,0.08)",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 800, color: HOME.navyDeep, mb: 0.35 }}>
            You have {formatMoney(summary.credit, summary.currency)} excess fee credit
          </Typography>
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.82rem", color: HOME.inkMuted, lineHeight: 1.45 }}>
            You paid more than your current billed fees. This credit stays on your account and will apply
            automatically when new semester charges are posted.
          </Typography>
        </Alert>
      ) : null}

      <Box
        sx={{
          mt: 1.5,
          bgcolor: "#fff",
          border: `1px solid ${HOME.border}`,
          borderRadius: "16px",
          px: 2,
          py: 1.5,
          boxShadow: HOME.shadowSm,
          animation: `${fadeUp} 0.5s ease both`,
          animationDelay: "0.32s",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.85 }}>
          <Stack direction="row" spacing={0.8} alignItems="center">
            <TrendingUpRoundedIcon sx={{ fontSize: 18, color: HOME.green }} />
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.78rem", fontWeight: 700, color: HOME.navyDeep }}>
              Overall payment progress
            </Typography>
          </Stack>
          <Typography sx={{ fontFamily: HOME.fontDisplay, fontSize: "1.05rem", fontWeight: 800, color: HOME.green }}>
            {paymentProgress.toFixed(0)}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={paymentProgress}
          sx={{
            height: 9,
            borderRadius: 8,
            bgcolor: "rgba(27,94,168,0.09)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 8,
              background: `linear-gradient(90deg, ${HOME.green} 0%, #4A8AD4 100%)`,
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 0.9fr) minmax(0, 1.25fr)" },
          gap: 2,
          mt: 2,
          alignItems: "start",
        }}
      >
        <SectionCard
          delay={5}
          title="Semester breakdown"
          subtitle="How each study period is billed and paid"
        >
          {charges.length ? (
            <Stack divider={<Divider />}>
              {charges.map((charge) => {
                const chargeProgress = charge.amount
                  ? Math.min(100, (Number(charge.paid) / Number(charge.amount)) * 100)
                  : 0;
                const cleared = !Number(charge.balance);
                return (
                  <Box key={charge.id} sx={{ px: 2, py: 1.5, transition: "background 0.15s ease", "&:hover": { bgcolor: "rgba(27,94,168,0.025)" } }}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                          <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 700, color: HOME.navyDeep, fontSize: "0.87rem" }}>
                            Year {charge.year_of_study} · Semester {charge.semester}
                          </Typography>
                          {charge.is_current ? (
                            <Chip size="small" label="Current" sx={{ height: 21, fontSize: "0.65rem", fontWeight: 700, bgcolor: "rgba(27,94,168,0.1)", color: HOME.green }} />
                          ) : null}
                          {cleared ? (
                            <Chip
                              size="small"
                              icon={<CheckCircleRoundedIcon sx={{ fontSize: "0.85rem !important" }} />}
                              label="Cleared"
                              sx={{ height: 21, fontSize: "0.65rem", fontWeight: 700, bgcolor: "rgba(46,125,50,0.12)", color: "#2e7d32", "& .MuiChip-icon": { color: "#2e7d32" } }}
                            />
                          ) : null}
                        </Stack>
                        <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.72rem", mt: 0.25 }}>
                          Paid {formatMoney(charge.paid, charge.currency)} of {formatMoney(charge.amount, charge.currency)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                        <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 800, color: cleared ? "#2e7d32" : HOME.navyDeep, fontSize: "1rem" }}>
                          {formatMoney(charge.balance, charge.currency)}
                        </Typography>
                        <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.67rem" }}>balance</Typography>
                      </Box>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={chargeProgress}
                      sx={{
                        mt: 1,
                        height: 6,
                        borderRadius: 6,
                        bgcolor: "rgba(27,94,168,0.08)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 6,
                          background: cleared
                            ? "linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)"
                            : `linear-gradient(90deg, ${HOME.green} 0%, #4A8AD4 100%)`,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
              <SchoolRoundedIcon sx={{ fontSize: 40, color: "rgba(27,94,168,0.25)" }} />
              <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, fontSize: "0.85rem" }}>
                No fee charges are available yet.
              </Typography>
            </Stack>
          )}
        </SectionCard>

        <SectionCard
          delay={6}
          title="Payment records"
          subtitle={`${payments.length} transaction${payments.length === 1 ? "" : "s"} on your account`}
        >
          {payments.length ? (
            <>
            <Box sx={{ overflowX: "auto", display: { xs: "none", md: "block" } }}>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: "rgba(27,94,168,0.04)" }}>
                    {["Date", "Reference", "Method", "Amount", "Status", "Action"].map((heading) => (
                      <Box
                        component="th"
                        key={heading}
                        sx={{
                          textAlign: "left",
                          px: 2,
                          py: 1.1,
                          fontFamily: HOME.fontBody,
                          fontWeight: 700,
                          fontSize: "0.68rem",
                          color: HOME.inkSoft,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {payments.map((payment) => (
                    <Box
                      component="tr"
                      key={payment.id}
                      sx={{
                        borderTop: `1px solid ${HOME.border}`,
                        transition: "background 0.15s ease",
                        "&:hover": { bgcolor: "rgba(27,94,168,0.03)" },
                      }}
                    >
                      <Box component="td" sx={{ px: 2, py: 1.2, fontFamily: HOME.fontBody, fontSize: "0.78rem", color: HOME.inkMuted }}>
                        {formatDate(payment.paid_at || payment.createdAt)}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontFamily: HOME.fontBody, fontSize: "0.78rem", color: HOME.navyDeep, fontWeight: 700 }}>
                        {payment.provider_receipt || payment.reference}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontFamily: HOME.fontBody, fontSize: "0.78rem", color: HOME.inkMuted, textTransform: "capitalize" }}>
                        {payment.method}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2, fontFamily: HOME.fontBody, fontSize: "0.8rem", color: HOME.navyDeep, fontWeight: 800 }}>
                        {formatMoney(payment.amount, payment.currency)}
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2 }}>
                        <StatusChip status={payment.status} />
                      </Box>
                      <Box component="td" sx={{ px: 2, py: 1.2 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Tooltip
                            title={
                              payment.status === "confirmed"
                                ? "View receipt"
                                : "Available after payment is confirmed"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={actionBusy(payment.id)}
                                onClick={() => viewReceipt(payment)}
                                sx={{
                                  color: payment.status === "confirmed" ? HOME.green : "rgba(27,94,168,0.35)",
                                  bgcolor: "rgba(27,94,168,0.06)",
                                  "&:hover": { bgcolor: "rgba(27,94,168,0.12)" },
                                }}
                              >
                                <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              payment.status === "confirmed"
                                ? "Download receipt PDF"
                                : "Available after payment is confirmed"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={actionBusy(payment.id)}
                                onClick={() => downloadReceipt(payment)}
                                sx={{
                                  color: payment.status === "confirmed" ? HOME.navyDeep : "rgba(27,94,168,0.35)",
                                  bgcolor: "rgba(30,40,88,0.05)",
                                  "&:hover": { bgcolor: "rgba(30,40,88,0.1)" },
                                }}
                              >
                                {downloadingReceiptId === payment.id ? (
                                  <CircularProgress size={16} sx={{ color: HOME.navyDeep }} />
                                ) : (
                                  <DownloadRoundedIcon sx={{ fontSize: 18 }} />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            <Stack spacing={1.25} sx={{ display: { xs: "flex", md: "none" }, p: 1.5 }}>
              {payments.map((payment) => (
                <Box
                  key={payment.id}
                  sx={{
                    border: `1px solid ${HOME.border}`,
                    borderRadius: "14px",
                    p: 1.5,
                    bgcolor: "rgba(27,94,168,0.02)",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 800, color: HOME.navyDeep, fontSize: "1rem" }}>
                      {formatMoney(payment.amount, payment.currency)}
                    </Typography>
                    <StatusChip status={payment.status} />
                  </Stack>
                  <Typography
                    sx={{
                      fontFamily: HOME.fontBody,
                      fontWeight: 700,
                      color: HOME.navyDeep,
                      fontSize: "0.78rem",
                      mt: 0.75,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {payment.provider_receipt || payment.reference}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 0.75, pt: 0.75, borderTop: `1px dashed ${HOME.border}` }}
                  >
                    <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, fontSize: "0.74rem", textTransform: "capitalize", fontWeight: 700 }}>
                      {payment.method === "mpesa" ? "M-Pesa" : payment.method}
                    </Typography>
                    <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.72rem" }}>
                      {formatDate(payment.paid_at || payment.createdAt)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      startIcon={<VisibilityRoundedIcon />}
                      disabled={actionBusy(payment.id)}
                      onClick={() => viewReceipt(payment)}
                      sx={{
                        textTransform: "none",
                        fontFamily: HOME.fontBody,
                        fontWeight: 700,
                        borderRadius: "10px",
                        borderColor: "rgba(27,94,168,0.25)",
                        color: HOME.green,
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      startIcon={
                        downloadingReceiptId === payment.id ? (
                          <CircularProgress size={14} sx={{ color: HOME.navyDeep }} />
                        ) : (
                          <DownloadRoundedIcon />
                        )
                      }
                      disabled={actionBusy(payment.id)}
                      onClick={() => downloadReceipt(payment)}
                      sx={{
                        textTransform: "none",
                        fontFamily: HOME.fontBody,
                        fontWeight: 700,
                        borderRadius: "10px",
                        borderColor: "rgba(30,40,88,0.2)",
                        color: HOME.navyDeep,
                      }}
                    >
                      Download
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
            </>
          ) : (
            <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
              <ReceiptLongRoundedIcon sx={{ fontSize: 40, color: "rgba(27,94,168,0.25)" }} />
              <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 700, color: HOME.navyDeep, fontSize: "0.9rem" }}>
                No payments yet
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, fontSize: "0.8rem" }}>
                Payments you make will appear here after verification.
              </Typography>
            </Stack>
          )}
        </SectionCard>
      </Box>

      <Dialog open={payOpen} onClose={paying ? undefined : () => setPayOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep }}>Pay fees with M-Pesa</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">An M-Pesa prompt will be sent to the phone number below.</Alert>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputProps={{ min: 1, max: summary.balance }}
              InputProps={{ startAdornment: <InputAdornment position="start">KES</InputAdornment> }}
            />
            <TextField
              label="M-Pesa phone number"
              fullWidth
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="07XXXXXXXX"
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneRoundedIcon fontSize="small" /></InputAdornment> }}
            />
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.76rem", color: HOME.inkSoft }}>
              Outstanding balance: {formatMoney(summary.balance, summary.currency)}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPayOpen(false)} disabled={paying} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={initiatePayment}
            disabled={paying}
            startIcon={paying ? <CircularProgress size={16} color="inherit" /> : <PhoneIphoneRoundedIcon />}
            sx={{ textTransform: "none", bgcolor: HOME.green, fontWeight: 800, boxShadow: "none", "&:hover": { bgcolor: "#0E3D73", boxShadow: "none" } }}
          >
            {paying ? "Sending prompt…" : "Send M-Pesa prompt"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(receiptPreview)}
        onClose={closeReceiptPreview}
        fullScreen={isSmallScreen}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: isSmallScreen ? 0 : "18px",
            overflow: "hidden",
            maxHeight: isSmallScreen ? "100%" : "92vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            color: HOME.navyDeep,
            pr: 1,
            py: { xs: 1.25, sm: 1.5 },
            borderBottom: `1px solid ${HOME.border}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep, fontSize: { xs: "1rem", sm: "1.15rem" } }}
              >
                Fee payment receipt
              </Typography>
              <Typography
                noWrap
                sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.72rem" }}
              >
                {receiptPreview?.receiptNo || "—"}
              </Typography>
            </Box>
            <IconButton
              aria-label="Close receipt"
              onClick={closeReceiptPreview}
              sx={{ color: HOME.inkMuted, flexShrink: 0 }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            flex: 1,
            minHeight: 0,
            bgcolor: "rgba(27,94,168,0.04)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {receiptPreview?.payment ? (
            <ReceiptPreviewCard
              payment={receiptPreview.payment}
              student={ledger?.student || student}
              summary={summary}
            />
          ) : null}
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            py: { xs: 1.25, sm: 1.75 },
            gap: 1,
            borderTop: `1px solid ${HOME.border}`,
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: { sm: "flex-end" },
          }}
        >
          <Button
            onClick={closeReceiptPreview}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={
              downloadingReceiptId === receiptPreview?.payment?.id ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DownloadRoundedIcon />
              )
            }
            onClick={() => receiptPreview?.payment && downloadReceipt(receiptPreview.payment)}
            disabled={!receiptPreview?.payment || downloadingReceiptId === receiptPreview?.payment?.id}
            sx={{
              textTransform: "none",
              bgcolor: HOME.green,
              fontWeight: 800,
              boxShadow: "none",
              "&:hover": { bgcolor: "#0E3D73", boxShadow: "none" },
            }}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
