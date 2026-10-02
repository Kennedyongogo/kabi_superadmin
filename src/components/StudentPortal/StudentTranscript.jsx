import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { HOME, fadeUp, studentAuthHeaders } from "./studentPortalShared";

const cardSx = {
  bgcolor: "#fff",
  border: `1px solid ${HOME.border}`,
  borderRadius: "20px",
  boxShadow: HOME.shadowSm,
  overflow: "hidden",
};

function formatIssuedAt(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function placementLabel(row) {
  return `Year ${row.year_of_study} · Sem ${row.semester} · ${row.academic_year}`;
}

async function fetchMinePdfBlob(transcriptId) {
  const res = await fetch(`/api/transcripts/me/${encodeURIComponent(transcriptId)}/pdf`, {
    headers: {
      ...studentAuthHeaders(),
      Accept: "application/pdf",
    },
  });
  if (!res.ok) {
    let message = "Could not load transcript PDF";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      /* binary or empty */
    }
    throw new Error(message);
  }
  return res.blob();
}

async function downloadMinePdf(transcriptId, academicYear) {
  const blob = await fetchMinePdfBlob(transcriptId);
  const slug =
    String(academicYear || "transcript")
      .replace(/[^\w/-]/g, "")
      .replace(/\//g, "-")
      .slice(0, 32) || "transcript";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `KASMS-Transcript-${slug}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function EmptyState() {
  return (
    <Box
      sx={{
        ...cardSx,
        textAlign: "center",
        py: { xs: 5, sm: 7 },
        px: 2.5,
        borderStyle: "dashed",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "16px",
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(27,94,168,0.08)",
          color: HOME.green,
          mx: "auto",
          mb: 1.5,
        }}
      >
        <DescriptionRoundedIcon sx={{ fontSize: 28 }} />
      </Box>
      <Typography
        sx={{
          fontFamily: HOME.fontDisplay,
          fontWeight: 700,
          color: HOME.ink,
          fontSize: "1.15rem",
        }}
      >
        No transcripts yet
      </Typography>
      <Typography
        sx={{
          fontFamily: HOME.fontBody,
          color: HOME.inkMuted,
          fontSize: "0.86rem",
          mt: 0.75,
          maxWidth: 420,
          mx: "auto",
          lineHeight: 1.5,
        }}
      >
        When the school issues an academic transcript for you, it will appear here so you can view
        and download the PDF.
      </Typography>
    </Box>
  );
}

export default function StudentTranscript() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transcripts/me", { headers: studentAuthHeaders() });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load transcripts");
      }
      setRows(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || "Failed to load transcripts");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const closeDetail = () => {
    setDetail(null);
    setDetailLoading(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleView = async (row) => {
    setBusyId(row.id);
    setDetailLoading(true);
    setDetail(null);
    setError(null);
    try {
      const [detailRes, blob] = await Promise.all([
        fetch(`/api/transcripts/me/${encodeURIComponent(row.id)}`, {
          headers: studentAuthHeaders(),
        }),
        fetchMinePdfBlob(row.id),
      ]);
      const detailJson = await detailRes.json();
      if (!detailRes.ok || !detailJson.success) {
        throw new Error(detailJson.message || "Failed to open transcript");
      }
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
      setDetail(detailJson.data);
    } catch (err) {
      setError(err.message || "Failed to open transcript");
    } finally {
      setBusyId(null);
      setDetailLoading(false);
    }
  };

  const handleDownload = async (row) => {
    setBusyId(row.id);
    setError(null);
    try {
      await downloadMinePdf(row.id, row.academic_year);
    } catch (err) {
      setError(err.message || "Could not download transcript");
    } finally {
      setBusyId(null);
    }
  };

  const navy = HOME.navyDeep || HOME.navy;
  const sortedLines = useMemo(() => {
    const lines = detail?.lines || [];
    return [...lines].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.unit_code).localeCompare(String(b.unit_code))
    );
  }, [detail]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 68px)",
        px: { xs: 1.5, sm: 3, lg: 4 },
        py: { xs: 2, md: 2.5 },
        animation: `${fadeUp} 0.4s ease both`,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          borderRadius: "18px",
          px: { xs: 2, sm: 2.75 },
          py: { xs: 1.5, sm: 1.75 },
          mb: 1.75,
          background: `linear-gradient(135deg, ${HOME.green} 0%, ${navy} 100%)`,
          color: "#fff",
          boxShadow: "0 14px 32px -14px rgba(27, 94, 168, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "13px",
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255,255,255,0.16)",
            border: "1px solid rgba(255,255,255,0.22)",
            flexShrink: 0,
          }}
        >
          <DescriptionRoundedIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.15rem", sm: "1.35rem" },
              lineHeight: 1.2,
            }}
          >
            Transcripts
          </Typography>
          <Typography
            noWrap
            sx={{ fontFamily: HOME.fontBody, color: "rgba(255,255,255,0.75)", fontSize: "0.76rem" }}
          >
            View and download issued academic transcripts
          </Typography>
        </Box>
        <IconButton
          aria-label="Refresh transcripts"
          onClick={() => void load()}
          disabled={loading}
          sx={{
            color: "#fff",
            bgcolor: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          }}
        >
          <RefreshRoundedIcon />
        </IconButton>
      </Box>

      {error ? (
        <Alert
          severity="error"
          sx={{ mb: 1.75, borderRadius: "14px", fontFamily: HOME.fontBody }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress size={36} sx={{ color: HOME.green }} />
        </Box>
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <Stack spacing={1.25}>
          {rows.map((row) => {
            const busy = busyId === row.id;
            return (
              <Box
                key={row.id}
                sx={{
                  ...cardSx,
                  p: { xs: 1.5, sm: 1.85 },
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: 1.35,
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "13px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(27,94,168,0.09)",
                      color: HOME.green,
                      flexShrink: 0,
                    }}
                  >
                    <SchoolRoundedIcon />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography
                        sx={{
                          fontFamily: HOME.fontBody,
                          fontWeight: 800,
                          color: HOME.ink,
                          fontSize: { xs: "0.9rem", sm: "0.96rem" },
                        }}
                      >
                        {placementLabel(row)}
                      </Typography>
                      <Chip
                        size="small"
                        label="Issued"
                        sx={{
                          height: 22,
                          fontWeight: 800,
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          bgcolor: "rgba(27,94,168,0.12)",
                          color: HOME.green,
                        }}
                      />
                    </Stack>
                    <Typography
                      sx={{
                        fontFamily: HOME.fontBody,
                        color: HOME.inkSoft,
                        fontSize: "0.78rem",
                        mt: 0.25,
                      }}
                    >
                      {row.programme_name || "Programme"} · {row.line_count} unit
                      {row.line_count === 1 ? "" : "s"}
                      {formatIssuedAt(row.issued_at) ? ` · Issued ${formatIssuedAt(row.issued_at)}` : ""}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent={{ xs: "stretch", sm: "flex-end" }}
                  sx={{ flexShrink: 0 }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={
                      busy && detailLoading ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <VisibilityRoundedIcon />
                      )
                    }
                    disabled={busy}
                    onClick={() => void handleView(row)}
                    sx={{
                      textTransform: "none",
                      fontFamily: HOME.fontBody,
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      borderRadius: "11px",
                      borderColor: "rgba(27,94,168,0.28)",
                      color: HOME.green,
                      minWidth: { sm: 108 },
                      "&:hover": {
                        borderColor: HOME.green,
                        bgcolor: "rgba(27,94,168,0.06)",
                      },
                    }}
                  >
                    View
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={
                      busy && !detailLoading ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <DownloadRoundedIcon />
                      )
                    }
                    disabled={busy}
                    onClick={() => void handleDownload(row)}
                    sx={{
                      textTransform: "none",
                      fontFamily: HOME.fontBody,
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      borderRadius: "11px",
                      bgcolor: HOME.green,
                      boxShadow: "0 8px 18px -10px rgba(27,94,168,0.7)",
                      minWidth: { sm: 124 },
                      "&:hover": { bgcolor: HOME.heroSplitGreenDark || "#0E3D73" },
                    }}
                  >
                    Download
                  </Button>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

      <Dialog
        open={Boolean(detail) || detailLoading}
        onClose={closeDetail}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: { xs: "18px", sm: "22px" },
            m: { xs: 1.25, sm: 2 },
            maxHeight: { xs: "92vh", sm: "90vh" },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            pr: 6,
            pb: 1,
          }}
        >
          {detail ? placementLabel(detail) : "Loading transcript…"}
          <IconButton
            aria-label="Close"
            onClick={closeDetail}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 1.5, sm: 2.5 }, py: 2 }}>
          {detailLoading && !detail ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
              <CircularProgress size={34} sx={{ color: HOME.green }} />
            </Box>
          ) : detail ? (
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  label={detail.programme?.name || "Programme"}
                  sx={{ fontFamily: HOME.fontBody, fontWeight: 700 }}
                />
                <Chip
                  label={`${detail.line_count ?? sortedLines.length} units`}
                  sx={{ fontFamily: HOME.fontBody, fontWeight: 700 }}
                />
                {formatIssuedAt(detail.issued_at) ? (
                  <Chip
                    label={`Issued ${formatIssuedAt(detail.issued_at)}`}
                    sx={{ fontFamily: HOME.fontBody, fontWeight: 700 }}
                  />
                ) : null}
              </Stack>

              {detail.recommendation ? (
                <Typography
                  sx={{
                    fontFamily: HOME.fontBody,
                    fontSize: "0.86rem",
                    color: HOME.inkMuted,
                    lineHeight: 1.5,
                  }}
                >
                  Recommendation: {detail.recommendation}
                </Typography>
              ) : null}

              <TableContainer
                sx={{
                  borderRadius: "14px",
                  border: `1px solid ${HOME.border}`,
                  overflowX: "auto",
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "rgba(27,94,168,0.05)" }}>
                      <TableCell sx={{ fontFamily: HOME.fontBody, fontWeight: 800 }}>Code</TableCell>
                      <TableCell sx={{ fontFamily: HOME.fontBody, fontWeight: 800 }}>Unit</TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontFamily: HOME.fontBody, fontWeight: 800, whiteSpace: "nowrap" }}
                      >
                        Hours
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontFamily: HOME.fontBody, fontWeight: 800 }}
                      >
                        Grade
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedLines.map((line) => (
                      <TableRow key={line.id || `${line.unit_code}-${line.sort_order}`}>
                        <TableCell
                          sx={{
                            fontFamily: HOME.fontBody,
                            fontWeight: 700,
                            color: HOME.green,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {line.unit_code}
                        </TableCell>
                        <TableCell sx={{ fontFamily: HOME.fontBody, color: HOME.ink }}>
                          {line.course_title}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft }}
                        >
                          {line.hours}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontFamily: HOME.fontBody, fontWeight: 800 }}
                        >
                          {line.grade}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {pdfUrl ? (
                <Box
                  sx={{
                    display: { xs: "none", md: "block" },
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: `1px solid ${HOME.border}`,
                    height: 420,
                  }}
                >
                  <Box
                    component="iframe"
                    title="Transcript PDF preview"
                    src={pdfUrl}
                    sx={{ width: "100%", height: "100%", border: 0 }}
                  />
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            onClick={closeDetail}
            sx={{
              textTransform: "none",
              fontFamily: HOME.fontBody,
              fontWeight: 700,
              color: HOME.inkMuted,
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            disabled={!detail}
            startIcon={<DownloadRoundedIcon />}
            onClick={() => detail && void handleDownload(detail)}
            sx={{
              textTransform: "none",
              fontFamily: HOME.fontBody,
              fontWeight: 800,
              bgcolor: HOME.green,
              borderRadius: "11px",
              "&:hover": { bgcolor: HOME.heroSplitGreenDark || "#0E3D73" },
            }}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
