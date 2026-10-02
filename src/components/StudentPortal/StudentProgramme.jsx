import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { HOME, fadeUp } from "./studentPortalShared";

function formatLabel(value) {
  if (!value) return "—";
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDuration(p) {
  if (p?.duration) return p.duration;
  if (p?.duration_years) {
    const y = Number(p.duration_years);
    return `${y} year${y === 1 ? "" : "s"}`;
  }
  return "—";
}

function MetaChip({ label }) {
  if (!label || label === "—") return null;
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 26,
        fontFamily: HOME.fontBody,
        fontWeight: 700,
        fontSize: "0.72rem",
        bgcolor: "rgba(27,94,168,0.08)",
        color: HOME.green,
      }}
    />
  );
}

function ModuleCard({ module: m, detailed }) {
  const meta = [
    { label: "Year", value: m.year_of_study != null ? `Y${m.year_of_study}` : "—" },
    { label: "Sem", value: m.semester || "—" },
    ...(detailed
      ? [
          { label: "Hours", value: m.hours ?? "—" },
          { label: "Credits", value: m.credits ?? "—" },
        ]
      : []),
  ];

  return (
    <Box
      sx={{
        px: 1.75,
        py: 1.5,
        borderBottom: `1px solid ${HOME.border}`,
        borderLeft: `3px solid ${HOME.green}`,
        bgcolor: "#fff",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography
        sx={{
          fontFamily: HOME.fontBody,
          fontWeight: 800,
          color: HOME.green,
          fontSize: "0.78rem",
          letterSpacing: "0.04em",
          mb: 0.25,
        }}
      >
        {m.code || "—"}
      </Typography>
      <Typography
        sx={{
          fontFamily: HOME.fontBody,
          fontWeight: 700,
          color: HOME.navyDeep,
          fontSize: "0.92rem",
          lineHeight: 1.35,
          overflowWrap: "anywhere",
          mb: 1,
        }}
      >
        {m.name || "—"}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: detailed ? "repeat(2, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
          gap: 0.75,
        }}
      >
        {meta.map((item) => (
          <Box
            key={item.label}
            sx={{
              px: 1,
              py: 0.65,
              borderRadius: "10px",
              bgcolor: "rgba(27,94,168,0.04)",
              border: "1px solid rgba(27,94,168,0.08)",
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.62rem",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: HOME.inkMuted,
              }}
            >
              {item.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontWeight: 700,
                fontSize: "0.84rem",
                color: HOME.navyDeep,
                overflowWrap: "anywhere",
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function ModulesTable({ rows, detailed }) {
  return (
    <TableContainer sx={{ display: { xs: "none", md: "block" }, overflowX: "hidden" }}>
      <Table size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontFamily: HOME.fontBody, fontWeight: 700, width: "18%" }}>Code</TableCell>
            <TableCell sx={{ fontFamily: HOME.fontBody, fontWeight: 700 }}>Module</TableCell>
            <TableCell sx={{ fontFamily: HOME.fontBody, fontWeight: 700, width: "10%" }}>Year</TableCell>
            <TableCell sx={{ fontFamily: HOME.fontBody, fontWeight: 700, width: "10%" }}>Sem</TableCell>
            {detailed ? (
              <>
                <TableCell align="right" sx={{ fontFamily: HOME.fontBody, fontWeight: 700, width: "12%" }}>
                  Hours
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: HOME.fontBody, fontWeight: 700, width: "12%" }}>
                  Credits
                </TableCell>
              </>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((m) => (
            <TableRow key={m.id} hover>
              <TableCell
                sx={{
                  fontFamily: HOME.fontBody,
                  fontWeight: 700,
                  color: HOME.green,
                  overflowWrap: "anywhere",
                }}
              >
                {m.code}
              </TableCell>
              <TableCell sx={{ fontFamily: HOME.fontBody, overflowWrap: "anywhere" }}>{m.name}</TableCell>
              <TableCell sx={{ fontFamily: HOME.fontBody }}>
                {m.year_of_study != null ? `Y${m.year_of_study}` : "—"}
              </TableCell>
              <TableCell sx={{ fontFamily: HOME.fontBody }}>{m.semester || "—"}</TableCell>
              {detailed ? (
                <>
                  <TableCell align="right" sx={{ fontFamily: HOME.fontBody }}>
                    {m.hours ?? "—"}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: HOME.fontBody }}>
                    {m.credits ?? "—"}
                  </TableCell>
                </>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ModulesList({ rows, detailed, empty }) {
  if (!rows.length) {
    return (
      <Typography
        sx={{
          p: 3,
          textAlign: "center",
          fontFamily: HOME.fontBody,
          color: HOME.inkMuted,
        }}
      >
        {empty}
      </Typography>
    );
  }

  return (
    <>
      {/* Small screens: one card per module — no horizontal scroll */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {rows.map((m) => (
          <ModuleCard key={m.id} module={m} detailed={detailed} />
        ))}
      </Box>
      <ModulesTable rows={rows} detailed={detailed} />
    </>
  );
}

export default function StudentProgramme() {
  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/programmes/me", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not load your programme");
      }
      setProgramme(data.data);
    } catch (err) {
      setError(err.message || "Could not load your programme");
      setProgramme(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const modules = useMemo(() => {
    const list = Array.isArray(programme?.modules) ? [...programme.modules] : [];
    return list.sort(
      (a, b) =>
        Number(a.year_of_study || 0) - Number(b.year_of_study || 0) ||
        Number(a.sort_order || 0) - Number(b.sort_order || 0)
    );
  }, [programme]);

  const myYearModules = useMemo(() => {
    if (!programme?.student_year) return modules;
    return modules.filter(
      (m) => !m.year_of_study || Number(m.year_of_study) === Number(programme.student_year)
    );
  }, [modules, programme]);

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
        <CircularProgress sx={{ color: HOME.green }} />
      </Box>
    );
  }

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
        animation: `${fadeUp} 0.45s ease both`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5, minWidth: 0 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            background: `linear-gradient(135deg, ${HOME.green} 0%, ${HOME.navy} 100%)`,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <SchoolRoundedIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.45rem", md: "1.7rem" },
              color: HOME.navyDeep,
              lineHeight: 1.15,
            }}
          >
            My programme
          </Typography>
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.85rem", color: HOME.inkMuted }}>
            Your enrolled programme and modules
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
          {error}
        </Alert>
      )}

      {!error && programme && (
        <Stack spacing={2.5} sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: "18px",
              bgcolor: "#fff",
              border: `1px solid ${HOME.border}`,
              boxShadow: "0 12px 32px -22px rgba(8,22,43,0.28)",
              overflow: "hidden",
            }}
          >
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.25rem", md: "1.45rem" },
                color: HOME.navyDeep,
                mb: 1,
                overflowWrap: "anywhere",
              }}
            >
              {programme.name}
            </Typography>
            {programme.description ? (
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontSize: "0.92rem",
                  color: HOME.inkMuted,
                  lineHeight: 1.55,
                  mb: 1.5,
                  overflowWrap: "anywhere",
                }}
              >
                {programme.description}
              </Typography>
            ) : null}

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <MetaChip label={formatLabel(programme.award)} />
              <MetaChip label={formatLabel(programme.category)} />
              <MetaChip label={formatLabel(programme.mode)} />
              <MetaChip label={formatDuration(programme)} />
              {programme.student_year ? (
                <MetaChip label={`Year ${programme.student_year}`} />
              ) : null}
              {programme.student_semester ? (
                <MetaChip label={`Semester ${programme.student_semester}`} />
              ) : null}
            </Stack>
          </Box>

          <Box
            sx={{
              borderRadius: "18px",
              bgcolor: "#fff",
              border: `1px solid ${HOME.border}`,
              overflow: "hidden",
              boxShadow: "0 12px 32px -22px rgba(8,22,43,0.28)",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${HOME.border}`,
                bgcolor: "rgba(27,94,168,0.04)",
                minWidth: 0,
              }}
            >
              <MenuBookRoundedIcon sx={{ color: HOME.green, fontSize: 22, flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 800, color: HOME.navyDeep }}>
                  My modules
                </Typography>
                <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.75rem", color: HOME.inkMuted }}>
                  {programme.student_year
                    ? `Showing year ${programme.student_year} modules (${myYearModules.length}) · full list below if needed`
                    : `${modules.length} module${modules.length === 1 ? "" : "s"}`}
                </Typography>
              </Box>
              <ScheduleRoundedIcon sx={{ color: HOME.inkMuted, fontSize: 18, flexShrink: 0 }} />
            </Stack>

            <ModulesList
              rows={myYearModules}
              detailed
              empty="No modules published for your programme yet."
            />
          </Box>

          {programme.student_year && modules.length > myYearModules.length && (
            <Box
              sx={{
                borderRadius: "18px",
                bgcolor: "#fff",
                border: `1px solid ${HOME.border}`,
                overflow: "hidden",
                width: "100%",
                maxWidth: "100%",
              }}
            >
              <Typography
                sx={{
                  px: 2,
                  py: 1.5,
                  fontFamily: HOME.fontBody,
                  fontWeight: 800,
                  color: HOME.navyDeep,
                  borderBottom: `1px solid ${HOME.border}`,
                  bgcolor: "rgba(12,35,64,0.03)",
                }}
              >
                All programme modules
              </Typography>
              <ModulesList rows={modules} detailed={false} empty="No modules published yet." />
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
