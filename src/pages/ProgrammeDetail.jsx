import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import { HOME } from "../components/Home/homeShared";
import { HomePrimaryButton, HomeGhostButton } from "../components/Home/homeUi";
import Footer from "../components/Footer/Footer";
import BrandPageLoader from "../components/common/BrandPageLoader";
import useBrandImageSrc from "../hooks/useBrandImageSrc";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "requirements", label: "Subjects" },
  { id: "fees", label: "Fees" },
  { id: "hours", label: "Hours" },
];

const edgePad = { px: { xs: 1.5, sm: 2.5, md: 3.5, lg: 4 } };

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

function formatMoney(amount, currency = "KES") {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function SectionBand({ id, title, icon, children, tone = "cream" }) {
  const bg =
    tone === "white"
      ? "#fff"
      : tone === "mist"
        ? HOME.sky
        : HOME.cream;

  return (
    <Box
      id={id}
      component="section"
      sx={{
        width: "100%",
        bgcolor: bg,
        borderTop: `1px solid ${HOME.border}`,
        py: { xs: 3.5, md: 5 },
        ...edgePad,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: { xs: 2.5, md: 3 } }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: HOME.green,
            color: "#fff",
            flexShrink: 0,
            "& svg": { fontSize: 22 },
          }}
        >
          {icon}
        </Box>
        <Typography
          component="h2"
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "1.55rem", sm: "1.85rem", md: "2rem" },
            color: HOME.navyDeep,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}
        >
          {title}
        </Typography>
      </Stack>
      {children}
    </Box>
  );
}

function MetaGrid({ items }) {
  const visible = items.filter((i) => i.value && i.value !== "—");
  if (!visible.length) return null;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
        gap: { xs: 1.25, md: 1.5 },
        width: "100%",
      }}
    >
      {visible.map((item) => (
        <Box
          key={item.label}
          sx={{
            bgcolor: "#fff",
            border: `1px solid ${HOME.border}`,
            borderLeft: `4px solid ${HOME.green}`,
            px: 2,
            py: 1.75,
            minHeight: "100%",
          }}
        >
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: HOME.inkSoft,
              mb: 0.6,
            }}
          >
            {item.label}
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontWeight: 600,
              fontSize: { xs: "0.95rem", md: "1rem" },
              color: HOME.ink,
              lineHeight: 1.55,
            }}
          >
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function EmptyHint({ children }) {
  return (
    <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, fontSize: "0.95rem" }}>
      {children}
    </Typography>
  );
}

function cellValue(column, row) {
  return typeof column.render === "function" ? column.render(row) : row[column.key] ?? "—";
}

/** Stacked cards on small screens; table from md up — no horizontal scroll. */
function DataTable({
  columns,
  rows,
  empty,
  cardTitle,
  cardSubtitle,
  cardFields,
  renderCardTitle,
  renderCardSubtitle,
}) {
  if (!rows.length) return <EmptyHint>{empty}</EmptyHint>;

  const titleCol = cardTitle ? columns.find((c) => c.key === cardTitle) : null;
  const subtitleCol = cardSubtitle ? columns.find((c) => c.key === cardSubtitle) : null;
  const detailCols =
    Array.isArray(cardFields) && cardFields.length
      ? columns.filter((c) => cardFields.includes(c.key))
      : columns.filter((c) => {
          if (renderCardTitle || renderCardSubtitle) {
            if (titleCol && c.key === titleCol.key) return false;
            if (subtitleCol && c.key === subtitleCol.key) return false;
            return true;
          }
          if (!titleCol && !subtitleCol) return c !== columns[0];
          if (titleCol && c.key === titleCol.key) return false;
          if (subtitleCol && c.key === subtitleCol.key) return false;
          return true;
        });

  return (
    <>
      {/* Mobile / tablet: stacked records */}
      <Stack spacing={1.25} sx={{ display: { xs: "flex", md: "none" } }}>
        {rows.map((row, i) => {
          const title = renderCardTitle
            ? renderCardTitle(row)
            : titleCol
              ? cellValue(titleCol, row)
              : cellValue(columns[0], row);
          const subtitle = renderCardSubtitle
            ? renderCardSubtitle(row)
            : subtitleCol
              ? cellValue(subtitleCol, row)
              : null;
          const fields = detailCols;

          return (
            <Box
              key={row.id || i}
              sx={{
                bgcolor: "#fff",
                border: `1px solid ${HOME.border}`,
                borderLeft: `3px solid ${HOME.green}`,
                px: 1.75,
                py: 1.5,
              }}
            >
              {title != null && title !== "" ? (
                <Typography
                  sx={{
                    fontFamily: HOME.fontBody,
                    fontWeight: 800,
                    color: HOME.navy,
                    fontSize: "0.95rem",
                    lineHeight: 1.35,
                    wordBreak: "break-word",
                  }}
                >
                  {title}
                </Typography>
              ) : null}
              {subtitle != null && String(subtitle) !== "—" && String(subtitle) !== "" ? (
                <Typography
                  sx={{
                    fontFamily: HOME.fontBody,
                    fontWeight: 600,
                    color: HOME.ink,
                    fontSize: "0.9rem",
                    mt: 0.35,
                    wordBreak: "break-word",
                  }}
                >
                  {subtitle}
                </Typography>
              ) : null}
              {fields.length ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    columnGap: 2,
                    rowGap: 0.65,
                    mt: title || subtitle ? 1.25 : 0,
                    pt: title || subtitle ? 1.1 : 0,
                    borderTop: title || subtitle ? `1px solid ${HOME.border}` : "none",
                  }}
                >
                  {fields.map((c) => (
                    <React.Fragment key={c.key}>
                      <Typography
                        sx={{
                          fontFamily: HOME.fontBody,
                          fontWeight: 700,
                          fontSize: "0.68rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: HOME.inkMuted,
                          alignSelf: "center",
                        }}
                      >
                        {c.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: HOME.fontBody,
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: HOME.ink,
                          textAlign: "right",
                          wordBreak: "break-word",
                        }}
                      >
                        {cellValue(c, row)}
                      </Typography>
                    </React.Fragment>
                  ))}
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Stack>

      {/* Desktop: full table, wraps instead of scrolling */}
      <TableContainer
        sx={{
          display: { xs: "none", md: "block" },
          width: "100%",
          overflow: "hidden",
          bgcolor: "#fff",
          border: `1px solid ${HOME.border}`,
        }}
      >
        <Table size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: HOME.green,
                "& th": {
                  fontFamily: HOME.fontBody,
                  fontWeight: 800,
                  fontSize: "0.7rem",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#fff",
                  borderBottom: "none",
                  py: 1.5,
                  px: 2,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                },
              }}
            >
              {columns.map((c) => (
                <TableCell key={c.key} align={c.align || "left"}>
                  {c.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow
                key={row.id || i}
                sx={{
                  bgcolor: i % 2 === 0 ? "#fff" : "rgba(27,94,168,0.03)",
                  "& td": {
                    fontFamily: HOME.fontBody,
                    fontWeight: 600,
                    color: HOME.ink,
                    borderBottom: `1px solid ${HOME.border}`,
                    py: 1.4,
                    px: 2,
                    fontSize: "0.92rem",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  },
                }}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} align={c.align || "left"}>
                    {cellValue(c, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default function ProgrammeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  const fromPath = location.state?.from || "/";
  const fromLabel = location.state?.fromLabel || "Programmes";
  const fromSection = location.state?.fromSection || (fromPath === "/" ? "programmes" : null);

  const goBack = () => {
    navigate(fromPath, {
      state: {
        highlightProgrammeId: id,
        scrollTo: fromSection,
      },
    });
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/programmes/${id}`);
        const json = await res.json();
        if (!active) return;
        if (!res.ok || !json.success) throw new Error(json.message || "Programme not found");
        const data = json.data;
        if (data?.is_active === false) {
          throw new Error("This programme is not currently available.");
        }
        setProgramme(data);
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load programme");
          setProgramme(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const { src: imgSrc, usingLogo, onError: onImageError } = useBrandImageSrc(
    programme?.image_url || null
  );

  const fees = useMemo(() => {
    const list = Array.isArray(programme?.fee_structure) ? [...programme.fee_structure] : [];
    return list.sort(
      (a, b) =>
        Number(a.year_of_study) - Number(b.year_of_study) ||
        Number(a.semester) - Number(b.semester)
    );
  }, [programme]);

  const hours = useMemo(() => {
    const list = Array.isArray(programme?.hour_distributions) ? [...programme.hour_distributions] : [];
    return list.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  }, [programme]);

  const subjects = useMemo(() => {
    const list = Array.isArray(programme?.subject_requirements)
      ? [...programme.subject_requirements]
      : [];
    return list.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  }, [programme]);

  const scrollToSection = (index) => {
    setTab(index);
    const el = document.getElementById(SECTIONS[index].id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <BrandPageLoader message="Loading programme…" />;

  if (error || !programme) {
    return (
      <Box sx={{ minHeight: "60vh", bgcolor: HOME.cream, ...edgePad, py: 6, textAlign: "center" }}>
        <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, color: HOME.navyDeep, mb: 1 }}>
          {error || "Programme not found"}
        </Typography>
        <HomeGhostButton onClick={goBack}>Back to {fromLabel}</HomeGhostButton>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: HOME.cream, display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Full-bleed hero */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          color: "#fff",
          background: `linear-gradient(135deg, ${HOME.green} 0%, #0E3D73 48%, ${HOME.navyDeep} 100%)`,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(220px, 36%) 1fr" },
            minHeight: { md: 240 },
            width: "100%",
          }}
        >
          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 160, sm: 180, md: "100%" },
              bgcolor: usingLogo ? "#fff" : "rgba(0,0,0,0.2)",
              borderRight: { md: "1px solid rgba(255,255,255,0.12)" },
            }}
          >
            <Box
              component="img"
              src={imgSrc}
              alt={programme.name}
              onError={onImageError}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: usingLogo ? "contain" : "cover",
                objectPosition: "center",
                p: usingLogo ? { xs: 3, md: 4 } : 0,
                display: "block",
                bgcolor: usingLogo ? "rgba(255,255,255,0.96)" : "transparent",
              }}
            />
            <Tooltip title={`Back to ${fromLabel}`} arrow placement="right">
              <IconButton
                onClick={goBack}
                aria-label={`Back to ${fromLabel}`}
                sx={{
                  position: "absolute",
                  top: { xs: 10, sm: 12 },
                  left: { xs: 10, sm: 12 },
                  zIndex: 2,
                  width: 40,
                  height: 40,
                  color: HOME.navyDeep,
                  bgcolor: "rgba(255,255,255,0.92)",
                  border: `1px solid ${HOME.border}`,
                  boxShadow: "0 10px 28px -12px rgba(8,22,43,0.45)",
                  backdropFilter: "blur(8px)",
                  "&:hover": {
                    bgcolor: "#fff",
                    color: HOME.green,
                    boxShadow: "0 14px 32px -12px rgba(27,94,168,0.4)",
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            sx={{
              ...edgePad,
              py: { xs: 2, md: 2.25 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.85 }}>
              {programme.category ? (
                <Chip
                  label={formatLabel(programme.category)}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.14)", color: HOME.goldMuted, fontWeight: 700 }}
                />
              ) : null}
              {programme.mode ? (
                <Chip
                  label={formatLabel(programme.mode)}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 700 }}
                />
              ) : null}
            </Stack>

            <Typography
              component="h1"
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                lineHeight: 1.1,
                mb: 0.4,
                letterSpacing: "-0.02em",
              }}
            >
              {programme.name}
            </Typography>
            {programme.award ? (
              <Typography
                sx={{
                  fontFamily: HOME.fontBody,
                  fontWeight: 600,
                  opacity: 0.92,
                  mb: 0.5,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                }}
              >
                {programme.award}
              </Typography>
            ) : null}
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontWeight: 800,
                color: HOME.goldMuted,
                mb: 1.5,
                fontSize: { xs: "0.88rem", md: "0.95rem" },
              }}
            >
              Duration · {formatDuration(programme)}
            </Typography>

            <HomePrimaryButton
              onClick={() =>
                navigate("/admission/apply", {
                  state: {
                    from: `/programmes/${id}`,
                    fromLabel: programme.name,
                    programme_id: programme.id,
                  },
                })
              }
              sx={{
                alignSelf: "flex-start",
                bgcolor: HOME.gold,
                color: HOME.navyDeep,
                "&:hover": { bgcolor: HOME.goldMuted },
              }}
            >
              Apply for admission
            </HomePrimaryButton>
          </Box>
        </Box>
      </Box>

      {/* Full-width sticky tabs — scrollable so all tabs show on small screens */}
      <Box
        sx={{
          position: "sticky",
          top: { xs: 64, sm: 72 },
          zIndex: 10,
          width: "100%",
          bgcolor: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${HOME.border}`,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_e, v) => scrollToSection(v)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          sx={{
            width: "100%",
            minHeight: { xs: 48, sm: 54 },
            px: { xs: 0, sm: 1, md: 2 },
            "& .MuiTabs-scrollButtons": {
              color: HOME.navy,
              "&.Mui-disabled": { opacity: 0.25 },
            },
            "& .MuiTabs-scroller": {
              overflowX: "auto !important",
              WebkitOverflowScrolling: "touch",
            },
            "& .MuiTabs-flexContainer": { gap: { xs: 0, md: 1 } },
            "& .MuiTab-root": {
              fontFamily: HOME.fontBody,
              fontWeight: 700,
              textTransform: "none",
              minHeight: { xs: 48, sm: 54 },
              minWidth: "auto",
              px: { xs: 1.5, sm: 2 },
              color: HOME.inkSoft,
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
              flexShrink: 0,
            },
            "& .Mui-selected": { color: `${HOME.green} !important` },
            "& .MuiTabs-indicator": { bgcolor: HOME.green, height: 3 },
          }}
        >
          {SECTIONS.map((s) => (
            <Tab key={s.id} label={s.label} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, width: "100%" }}>
        <SectionBand id="overview" title="Programme overview" icon={<SchoolOutlinedIcon />} tone="cream">
          {programme.description ? (
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                color: HOME.inkMuted,
                lineHeight: 1.8,
                mb: 3,
                fontSize: { xs: "1rem", md: "1.08rem" },
                maxWidth: 900,
                whiteSpace: "pre-wrap",
              }}
            >
              {programme.description}
            </Typography>
          ) : null}
          <MetaGrid
            items={[
              { label: "Award", value: programme.award },
              { label: "Category", value: formatLabel(programme.category) },
              { label: "Mode", value: formatLabel(programme.mode) },
              { label: "Duration", value: formatDuration(programme) },
              {
                label: "Weeks / year",
                value: programme.weeks_per_year != null ? String(programme.weeks_per_year) : null,
              },
              {
                label: "Semester 1",
                value:
                  [
                    programme.semester_1_weeks != null ? `${programme.semester_1_weeks} weeks` : null,
                    programme.semester_1_period,
                  ]
                    .filter(Boolean)
                    .join(" · ") || null,
              },
              {
                label: "Semester 2",
                value:
                  [
                    programme.semester_2_weeks != null ? `${programme.semester_2_weeks} weeks` : null,
                    programme.semester_2_period,
                  ]
                    .filter(Boolean)
                    .join(" · ") || null,
              },
              { label: "Mid-sem 1 break", value: programme.break_mid_sem1 },
              { label: "End-sem 1 break", value: programme.break_end_sem1 },
              { label: "End-sem 2 break", value: programme.break_end_sem2 },
              { label: "Min. KCSE grade", value: programme.minimum_kcse_grade },
            ]}
          />
        </SectionBand>

        <SectionBand id="requirements" title="Subject requirements" icon={<GradeOutlinedIcon />} tone="white">
          <DataTable
            empty="No subject requirements published for this programme."
            cardTitle="subject"
            columns={[
              { key: "subject", label: "Subject" },
              { key: "minimum_grade", label: "Minimum grade" },
              {
                key: "is_required",
                label: "Required",
                render: (row) => (row.is_required === false ? "Optional" : "Required"),
              },
            ]}
            rows={subjects}
          />
        </SectionBand>

        <SectionBand id="fees" title="Fee structure" icon={<PaymentsOutlinedIcon />} tone="mist">
          {programme.total_fee != null && Number(programme.total_fee) > 0 ? (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 1,
                bgcolor: HOME.green,
                color: "#fff",
                px: 2.25,
                py: 1.25,
                mb: 2.5,
              }}
            >
              <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 700, fontSize: "0.78rem", opacity: 0.9 }}>
                Estimated total
              </Typography>
              <Typography sx={{ fontFamily: HOME.fontDisplay, fontWeight: 700, fontSize: "1.35rem" }}>
                {formatMoney(programme.total_fee, programme.fee_currency || "KES")}
              </Typography>
            </Box>
          ) : null}
          <DataTable
            empty="Fee structure has not been published yet."
            renderCardTitle={(r) => r.label || "Tuition"}
            renderCardSubtitle={(r) => `Year ${r.year_of_study} · Sem ${r.semester}`}
            cardFields={["amount"]}
            columns={[
              { key: "year_of_study", label: "Year", render: (r) => `Year ${r.year_of_study}` },
              { key: "semester", label: "Semester", render: (r) => `Sem ${r.semester}` },
              { key: "label", label: "Label", render: (r) => r.label || "Tuition" },
              {
                key: "amount",
                label: "Amount",
                align: "right",
                render: (r) => formatMoney(r.amount, r.currency || programme.fee_currency || "KES"),
              },
            ]}
            rows={fees}
          />
        </SectionBand>

        <SectionBand id="hours" title="Hour distribution" icon={<ScheduleOutlinedIcon />} tone="white">
          <DataTable
            empty="Hour distribution has not been published yet."
            cardTitle="nature"
            cardSubtitle="specific_nature"
            cardFields={["year_1_hours", "year_2_hours", "year_3_hours", "total_hours"]}
            columns={[
              { key: "nature", label: "Nature" },
              { key: "specific_nature", label: "Specific", render: (r) => r.specific_nature || "—" },
              { key: "year_1_hours", label: "Year 1", align: "right" },
              { key: "year_2_hours", label: "Year 2", align: "right" },
              { key: "year_3_hours", label: "Year 3", align: "right" },
              {
                key: "total_hours",
                label: "Total",
                align: "right",
                render: (r) =>
                  r.total_hours ??
                  (Number(r.year_1_hours) || 0) + (Number(r.year_2_hours) || 0) + (Number(r.year_3_hours) || 0),
              },
            ]}
            rows={hours}
          />
        </SectionBand>
      </Box>

      <Footer />
    </Box>
  );
}
