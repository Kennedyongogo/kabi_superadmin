import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LocalLibraryRoundedIcon from "@mui/icons-material/LocalLibraryRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import MiscellaneousServicesRoundedIcon from "@mui/icons-material/MiscellaneousServicesRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { HOME, fadeUp, studentAuthHeaders } from "./studentPortalShared";

const navy = HOME.navyDeep || HOME.navy || "#141a3a";

const cardSx = {
  bgcolor: "#fff",
  border: `1px solid ${HOME.border}`,
  borderRadius: { xs: "14px", sm: "16px" },
  boxShadow: HOME.shadowSm,
  overflow: "hidden",
};

const SERVICE_CATEGORY_LABELS = {
  research: "Research & reference",
  access: "Computers & internet",
  print: "Print, copy & scan",
  space: "Study spaces",
  lending: "Lending support",
  other: "Other",
};

const LIBRARY_TABS = [
  { key: "books", label: "My books", short: "Mine", icon: <MenuBookRoundedIcon />, accent: HOME.green },
  { key: "collection", label: "Collection", short: "Books", icon: <Inventory2RoundedIcon />, accent: HOME.green },
  { key: "elearning", label: "E-learning", short: "E-learn", icon: <AutoStoriesRoundedIcon />, accent: HOME.green },
  { key: "rules", label: "Rules", short: "Rules", icon: <RuleRoundedIcon />, accent: HOME.green },
  { key: "services", label: "Services", short: "Services", icon: <MiscellaneousServicesRoundedIcon />, accent: HOME.green },
];

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeLeftLabel(msUntilDue, isOverdue) {
  if (msUntilDue == null) return "Due date not set";
  const abs = Math.abs(msUntilDue);
  const minutes = Math.floor(abs / 60000);
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins || !parts.length) parts.push(`${mins}m`);
  const span = parts.join(" ");
  return isOverdue ? `${span} overdue` : `${span} left`;
}

function EmptyState({ icon, title, hint }) {
  return (
    <Box
      sx={{
        ...cardSx,
        width: "100%",
        minHeight: { xs: 240, sm: 280 },
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        p: { xs: 3, sm: 4 },
      }}
    >
      <Box>
        <Box sx={{ color: "rgba(27,94,168,0.28)", mb: 1, "& svg": { fontSize: { xs: 42, sm: 48 } } }}>{icon}</Box>
        <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.88rem", maxWidth: 380, mx: "auto" }}>
          {hint}
        </Typography>
      </Box>
    </Box>
  );
}

function LoanCard({ loan }) {
  const overdue = loan.is_overdue || loan.status === "overdue";
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: overdue ? "linear-gradient(145deg, #fff 0%, rgba(185,28,28,0.04) 100%)" : "#fff",
        background: overdue ? "linear-gradient(145deg, #fff 0%, rgba(185,28,28,0.04) 100%)" : "#fff",
        borderTop: `1px solid ${overdue ? "rgba(185,28,28,0.18)" : HOME.border}`,
        borderBottom: `1px solid ${overdue ? "rgba(185,28,28,0.18)" : HOME.border}`,
        borderLeft: overdue ? "4px solid #b91c1c" : `4px solid ${HOME.green}`,
        borderRight: "none",
        borderRadius: 0,
        boxShadow: "none",
        px: { xs: 1.5, sm: 2.25, md: 3 },
        py: { xs: 1.6, sm: 2 },
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.25, sm: 1.75 }} alignItems={{ sm: "flex-start" }}>
        <Box
          sx={{
            width: { xs: 44, sm: 52 },
            height: { xs: 44, sm: 52 },
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            bgcolor: overdue ? "rgba(185,28,28,0.1)" : "rgba(27,94,168,0.1)",
            color: overdue ? "#b91c1c" : HOME.green,
            flexShrink: 0,
          }}
        >
          <MenuBookRoundedIcon sx={{ fontSize: { xs: 22, sm: 26 } }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                color: HOME.navyDeep,
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                lineHeight: 1.2,
              }}
            >
              {loan.book_title || "Library book"}
            </Typography>
            <Chip
              size="small"
              icon={overdue ? <WarningAmberRoundedIcon /> : <CheckCircleRoundedIcon />}
              label={overdue ? "Overdue" : "On loan"}
              sx={{
                height: 24,
                fontWeight: 800,
                fontSize: "0.68rem",
                bgcolor: overdue ? "rgba(185,28,28,0.12)" : "rgba(27,94,168,0.1)",
                color: overdue ? "#b91c1c" : HOME.green,
                "& .MuiChip-icon": { color: "inherit", fontSize: 16 },
              }}
            />
          </Stack>
          {loan.book_author ? (
            <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: { xs: "0.82rem", sm: "0.88rem" }, mb: 1 }}>
              {loan.book_author}
            </Typography>
          ) : null}
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
              <ScheduleRoundedIcon sx={{ fontSize: 17, color: overdue ? "#b91c1c" : HOME.green }} />
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontWeight: 700,
                  fontSize: { xs: "0.82rem", sm: "0.88rem" },
                  color: overdue ? "#b91c1c" : HOME.navyDeep,
                }}
              >
                Due {formatDateTime(loan.due_at)} · {timeLeftLabel(loan.ms_until_due, overdue)}
              </Typography>
            </Stack>
            <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, fontSize: "0.76rem", fontWeight: 600 }}>
              Issued {formatDateTime(loan.issued_at)}
              {loan.issuer_name ? ` · by ${loan.issuer_name}` : ""}
            </Typography>
          </Stack>
          <Typography
            sx={{
              mt: 1.15,
              fontFamily: HOME.fontBody,
              color: overdue ? "#b91c1c" : HOME.inkSoft,
              fontSize: { xs: "0.8rem", sm: "0.84rem" },
              fontWeight: overdue ? 700 : 500,
            }}
          >
            {overdue
              ? "Please return this book to the library as soon as possible."
              : "Return it on or before the due time to avoid an overdue flag."}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function CatalogueCard({ book }) {
  const available = Number(book.available) || 0;
  const inStock = available > 0;
  return (
    <Box sx={{ ...cardSx, p: { xs: 1.5, sm: 1.85 }, height: "100%" }}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            display: "grid",
            placeItems: "center",
            bgcolor: inStock ? "rgba(27,94,168,0.1)" : "rgba(30,40,88,0.08)",
            color: inStock ? HOME.green : HOME.inkMuted,
            flexShrink: 0,
          }}
        >
          <MenuBookRoundedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              color: HOME.navyDeep,
              fontSize: "0.98rem",
              lineHeight: 1.25,
              mb: 0.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {book.title}
          </Typography>
          <Typography noWrap sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.76rem", mb: 0.85 }}>
            {book.author || "Author not set"}
          </Typography>
          <Stack spacing={0.4}>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <Inventory2RoundedIcon sx={{ fontSize: 14, color: inStock ? HOME.green : HOME.inkMuted }} />
              <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 700, fontSize: "0.74rem", color: inStock ? HOME.green : HOME.inkMuted }}>
                {available} available · {book.quantity} copies
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <SchoolRoundedIcon sx={{ fontSize: 14, color: HOME.inkMuted }} />
              <Typography noWrap sx={{ fontFamily: HOME.fontBody, fontSize: "0.72rem", color: HOME.inkMuted, fontWeight: 600 }}>
                {book.programme_name || "General"}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function ElearnCard({ item }) {
  return (
    <Box sx={{ ...cardSx, p: { xs: 1.5, sm: 1.85 }, height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75, flexWrap: "wrap" }}>
        <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep, fontSize: "0.98rem", flex: 1, minWidth: 0 }}>
          {item.title}
        </Typography>
        <Chip
          size="small"
          label={(item.resource_type || "link").toUpperCase()}
          sx={{ height: 22, fontWeight: 800, fontSize: "0.62rem", bgcolor: "rgba(27,94,168,0.1)", color: HOME.green }}
        />
      </Stack>
      {item.description ? (
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            color: HOME.inkSoft,
            fontSize: "0.82rem",
            lineHeight: 1.45,
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {item.description}
        </Typography>
      ) : (
        <Box sx={{ flex: 1 }} />
      )}
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography noWrap sx={{ fontFamily: HOME.fontBody, fontSize: "0.72rem", color: HOME.inkMuted, fontWeight: 600, minWidth: 0 }}>
          {item.programme_name || "All programmes"}
        </Typography>
        {item.url ? (
          <Button
            component="a"
            href={item.url}
            target="_blank"
            rel="noreferrer"
            size="small"
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: "14px !important" }} />}
            sx={{
              textTransform: "none",
              fontFamily: HOME.fontBody,
              fontWeight: 800,
              fontSize: "0.74rem",
              color: HOME.green,
              flexShrink: 0,
            }}
          >
            Open
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}

export default function StudentLibrary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/library/me", { headers: studentAuthHeaders() });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Could not load library");
      }
      setData(json.data || null);
    } catch (err) {
      setError(err.message || "Could not load library");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSearch("");
  }, [tab]);

  const loans = data?.loans || [];
  const books = data?.books || [];
  const elearning = data?.elearning || [];
  const rules = data?.rules || [];
  const services = data?.services || [];
  const summary = data?.summary || { on_loan: 0, overdue: 0, total: 0, books: 0, elearning: 0 };

  const q = search.trim().toLowerCase();

  const filteredBooks = useMemo(() => {
    if (!q) return books;
    return books.filter((book) =>
      [book.title, book.author, book.programme_name].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [books, q]);

  const filteredElearn = useMemo(() => {
    if (!q) return elearning;
    return elearning.filter((item) =>
      [item.title, item.description, item.programme_name, item.resource_type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [elearning, q]);

  const filteredRules = useMemo(() => {
    if (!q) return rules;
    return rules.filter((rule) =>
      [rule.name, rule.title, rule.body].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rules, q]);

  const filteredServices = useMemo(() => {
    if (!q) return services;
    return services.filter((service) =>
      [service.name, service.description, service.availability_note, service.category]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [services, q]);

  const filteredLoans = useMemo(() => {
    if (!q) return loans;
    return loans.filter((loan) =>
      [loan.book_title, loan.book_author].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [loans, q]);

  const tabCounts = [summary.total, books.length, elearning.length, rules.length, services.length];

  const tabHint = useMemo(() => {
    const key = LIBRARY_TABS[tab]?.key;
    if (key === "books") {
      return summary.total
        ? `${summary.total} currently out${summary.overdue ? ` · ${summary.overdue} overdue` : ""}`
        : "No books charged to you right now";
    }
    if (key === "collection") return `${filteredBooks.length} of ${books.length} titles`;
    if (key === "elearning") return `${filteredElearn.length} of ${elearning.length} resources`;
    if (key === "rules") return `${filteredRules.length} of ${rules.length} rules`;
    return `${filteredServices.length} of ${services.length} services`;
  }, [tab, summary, books.length, elearning.length, rules.length, services.length, filteredBooks.length, filteredElearn.length, filteredRules.length, filteredServices.length]);

  const searchPlaceholder =
    LIBRARY_TABS[tab]?.key === "books"
      ? "Search my books…"
      : LIBRARY_TABS[tab]?.key === "collection"
        ? "Search collection…"
        : LIBRARY_TABS[tab]?.key === "elearning"
          ? "Search e-learning…"
          : LIBRARY_TABS[tab]?.key === "rules"
            ? "Search rules…"
            : "Search services…";

  if (loading) {
    return (
      <Box sx={{ minHeight: "calc(100vh - 68px)", display: "grid", placeItems: "center", bgcolor: HOME.cream }}>
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress sx={{ color: HOME.green }} />
          <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted }}>Loading library…</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 68px)",
        width: "100%",
        bgcolor: HOME.cream,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        px: { xs: 1, sm: 1.5, md: 2 },
        py: { xs: 1, sm: 1.25, md: 1.5 },
        animation: `${fadeUp} 0.4s ease both`,
      }}
    >
      <Box
        sx={{
          borderRadius: { xs: "14px", sm: "16px" },
          px: { xs: 1.5, sm: 2.25 },
          py: { xs: 1.15, sm: 1.25 },
          mb: 1,
          background: `linear-gradient(135deg, ${HOME.green} 0%, ${navy} 100%)`,
          color: "#fff",
          boxShadow: "0 14px 32px -14px rgba(27, 94, 168, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            borderRadius: "12px",
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255,255,255,0.16)",
            border: "1px solid rgba(255,255,255,0.22)",
            flexShrink: 0,
          }}
        >
          <LocalLibraryRoundedIcon sx={{ fontSize: { xs: 20, sm: 22 }, color: "#fff" }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.08rem", sm: "1.3rem" },
              lineHeight: 1.2,
            }}
          >
            Library
          </Typography>
          <Typography noWrap sx={{ fontFamily: HOME.fontBody, color: "rgba(255,255,255,0.75)", fontSize: { xs: "0.7rem", sm: "0.76rem" } }}>
            Loans, collection, e-learning, rules, and services.
          </Typography>
        </Box>
      </Box>

      {error ? (
        <Alert
          severity="error"
          sx={{ mb: 1, borderRadius: "14px", flexShrink: 0 }}
          action={
            <Button color="inherit" size="small" onClick={() => load()}>
              Retry
            </Button>
          }
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          flexShrink: 0,
          mb: 1,
          p: 0.45,
          borderRadius: "14px",
          bgcolor: "#fff",
          border: `1px solid ${HOME.border}`,
          boxShadow: HOME.shadowSm,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { height: 5 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(27,94,168,0.28)", borderRadius: 999 },
        }}
      >
        <Stack direction="row" spacing={0.55} sx={{ minWidth: "max-content", width: "100%" }}>
          {LIBRARY_TABS.map((item, index) => {
            const active = tab === index;
            return (
              <Button
                key={item.key}
                onClick={() => setTab(index)}
                startIcon={item.icon}
                sx={{
                  textTransform: "none",
                  fontFamily: HOME.fontBody,
                  fontWeight: 700,
                  fontSize: { xs: "0.72rem", sm: "0.78rem" },
                  height: { xs: 36, sm: 38 },
                  borderRadius: "10px",
                  px: { xs: 1.15, sm: 1.4 },
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  flex: { xs: "0 0 auto", lg: "1 1 0" },
                  color: active ? "#fff" : HOME.inkMuted,
                  bgcolor: active ? item.accent : "transparent",
                  boxShadow: active ? `0 6px 14px -6px ${item.accent}88` : "none",
                  "&:hover": { bgcolor: active ? item.accent : "rgba(27,94,168,0.08)" },
                  "& .MuiButton-startIcon": { mr: { xs: 0.45, sm: 0.65 } },
                  "& svg": { fontSize: "1rem !important" },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  {item.label}
                </Box>
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  {item.short}
                </Box>
                <Box
                  component="span"
                  sx={{
                    ml: 0.7,
                    minWidth: 18,
                    height: 18,
                    px: 0.5,
                    borderRadius: "999px",
                    display: "inline-grid",
                    placeItems: "center",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    bgcolor: active ? "rgba(255,255,255,0.22)" : "rgba(27,94,168,0.12)",
                    color: active ? "#fff" : HOME.green,
                  }}
                >
                  {tabCounts[index] ?? 0}
                </Box>
              </Button>
            );
          })}
        </Stack>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ flexShrink: 0, mb: 1 }}
      >
        <TextField
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          sx={{
            width: "100%",
            maxWidth: { sm: 360, md: 420 },
            bgcolor: "#fff",
            borderRadius: "12px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              fontFamily: HOME.fontBody,
              fontSize: "0.84rem",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: HOME.inkMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <Typography
          sx={{
            fontFamily: HOME.fontBody,
            color: HOME.inkSoft,
            fontSize: "0.76rem",
            fontWeight: 600,
            px: { xs: 0.25, sm: 0 },
          }}
        >
          {tabHint}
        </Typography>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", overflowX: "hidden", pb: { xs: 1, sm: 0.5 } }}>
        {tab === 0 ? (
          filteredLoans.length ? (
            <Box
              sx={{
                mx: { xs: -1, sm: -1.5, md: -2 },
                width: { xs: "calc(100% + 16px)", sm: "calc(100% + 24px)", md: "calc(100% + 32px)" },
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {filteredLoans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </Box>
          ) : (
            <EmptyState
              icon={<MenuBookRoundedIcon />}
              title={q ? "No matching loans" : "No books on loan"}
              hint={
                q
                  ? "Try another search term."
                  : "When the library issues you a book, it will appear here with its due date and time."
              }
            />
          )
        ) : null}

        {tab === 1 ? (
          filteredBooks.length ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  xl: "repeat(4, minmax(0, 1fr))",
                },
                gap: { xs: 1, sm: 1.25 },
              }}
            >
              {filteredBooks.map((book) => (
                <CatalogueCard key={book.id} book={book} />
              ))}
            </Box>
          ) : (
            <EmptyState
              icon={<Inventory2RoundedIcon />}
              title={q ? "No matching titles" : "Collection is empty"}
              hint={q ? "Try another title, author, or programme." : "Library titles will appear here once catalogued."}
            />
          )
        ) : null}

        {tab === 2 ? (
          filteredElearn.length ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: { xs: 1, sm: 1.25 },
              }}
            >
              {filteredElearn.map((item) => (
                <ElearnCard key={item.id} item={item} />
              ))}
            </Box>
          ) : (
            <EmptyState
              icon={<AutoStoriesRoundedIcon />}
              title={q ? "No matching resources" : "No e-learning yet"}
              hint={q ? "Try another search term." : "Digital resources published by the library will show here."}
            />
          )
        ) : null}

        {tab === 3 ? (
          filteredRules.length ? (
            <Stack spacing={1.1}>
              {filteredRules.map((rule) => (
                <Box
                  key={rule.id}
                  sx={{
                    ...cardSx,
                    borderLeft: `3px solid ${HOME.green}`,
                    borderRadius: "0 14px 14px 0",
                    p: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep, fontSize: "1rem", mb: 0.5 }}>
                    {rule.name || rule.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: HOME.fontBody,
                      color: HOME.inkSoft,
                      fontSize: "0.88rem",
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {rule.body || "—"}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <EmptyState
              icon={<RuleRoundedIcon />}
              title={q ? "No matching rules" : "No published rules"}
              hint={q ? "Try another search term." : "Library policies will show here once they are published."}
            />
          )
        ) : null}

        {tab === 4 ? (
          filteredServices.length ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: { xs: 1, sm: 1.25 },
              }}
            >
              {filteredServices.map((service) => (
                <Box key={service.id} sx={{ ...cardSx, p: { xs: 1.5, sm: 2 }, height: "100%" }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75, flexWrap: "wrap" }}>
                    <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep, fontSize: "1rem" }}>
                      {service.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={SERVICE_CATEGORY_LABELS[service.category] || service.category || "Other"}
                      sx={{
                        height: 22,
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        bgcolor: "rgba(27,94,168,0.1)",
                        color: HOME.green,
                      }}
                    />
                  </Stack>
                  {service.description ? (
                    <Typography
                      sx={{
                        fontFamily: HOME.fontBody,
                        color: HOME.inkSoft,
                        fontSize: "0.84rem",
                        lineHeight: 1.5,
                        mb: service.availability_note ? 0.85 : 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {service.description}
                    </Typography>
                  ) : null}
                  {service.availability_note ? (
                    <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, fontSize: "0.74rem", fontWeight: 600 }}>
                      {service.availability_note}
                    </Typography>
                  ) : null}
                </Box>
              ))}
            </Box>
          ) : (
            <EmptyState
              icon={<MiscellaneousServicesRoundedIcon />}
              title={q ? "No matching services" : "No services listed"}
              hint={q ? "Try another search term." : "Library services such as printing and study rooms will appear here."}
            />
          )
        ) : null}
      </Box>
    </Box>
  );
}
