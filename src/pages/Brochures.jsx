import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import { Document, Page, pdfjs } from "react-pdf";
import { Helmet } from "react-helmet-async";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { HOME } from "../components/Home/homeShared";
import { BRAND } from "../brand";

// Serve the worker as `.js` from /public (copied by vite). Production hosts often
// give Vite's hashed `.mjs` assets the wrong MIME type, which breaks module
// workers: "Failed to fetch dynamically imported module: ...pdf.worker.min-….mjs"
pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.js`;

function isPdf(item) {
  return (
    /pdf/i.test(item?.mime_type || "") ||
    /\.pdf$/i.test(item?.original_name || item?.filename || "")
  );
}

function isImage(item) {
  return (
    /^image\//i.test(item?.mime_type || "") ||
    /\.(png|jpe?g|webp|gif)$/i.test(item?.original_name || "")
  );
}

function viewportWidth() {
  if (typeof window === "undefined") return 360;
  // clientWidth excludes scrollbar — avoids 1–15px horizontal overflow on phones
  return Math.max(280, document.documentElement?.clientWidth || window.innerWidth || 360);
}

function BrochureBlock({ item, pageWidth, widthReady, isFirst, isLast }) {
  const [numPages, setNumPages] = useState(0);
  const [pdfError, setPdfError] = useState("");
  const fileUrl = item?.file_url || "";

  useEffect(() => {
    setNumPages(0);
    setPdfError("");
  }, [item?.id]);

  return (
    <Box
      component="section"
      sx={{
        mt: isFirst ? 0 : { xs: 4, md: 5 },
        mb: isLast ? 0 : { xs: 4, md: 5 },
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: pageWidth,
          mx: "auto",
          mb: isFirst ? 0.5 : 1,
          px: { xs: 1.5, sm: 2 },
          boxSizing: "border-box",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1.5,
          ...(isFirst
            ? {
                pt: 0.75,
              }
            : null),
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.35rem", sm: "1.6rem" },
              color: HOME.navy,
              lineHeight: 1.2,
              overflowWrap: "anywhere",
            }}
          >
            {item.title}
          </Typography>
          {item.description ? (
            <Typography
              sx={{
                mt: 0.5,
                fontFamily: HOME.fontBody,
                fontSize: "0.9rem",
                color: "rgba(30,40,88,0.65)",
                overflowWrap: "anywhere",
              }}
            >
              {item.description}
            </Typography>
          ) : null}
        </Box>
        <Button
          href={fileUrl}
          download={item.original_name || true}
          size="small"
          startIcon={<DownloadRoundedIcon />}
          sx={{
            flexShrink: 0,
            textTransform: "none",
            fontFamily: HOME.fontBody,
            fontWeight: 700,
            color: HOME.navy,
            borderRadius: "10px",
          }}
        >
          Download
        </Button>
      </Box>

      {isImage(item) && (
        <Box
          component="img"
          src={fileUrl}
          alt={item.title}
          sx={{
            display: "block",
            width: "100%",
            maxWidth: pageWidth,
            mx: "auto",
            height: "auto",
            boxShadow: "0 18px 48px -24px rgba(8,22,43,0.35)",
            bgcolor: "#fff",
          }}
        />
      )}

      {!isImage(item) && !isPdf(item) && (
        <Box sx={{ py: 4, textAlign: "center", maxWidth: pageWidth, mx: "auto", px: 2 }}>
          <Typography sx={{ fontFamily: HOME.fontBody, color: "rgba(30,40,88,0.7)", mb: 1.5 }}>
            This file can’t be shown on the page. Download it to open.
          </Typography>
          <Button
            href={fileUrl}
            download={item.original_name || true}
            variant="contained"
            startIcon={<DownloadRoundedIcon />}
            sx={{
              textTransform: "none",
              fontFamily: HOME.fontBody,
              bgcolor: HOME.green,
              borderRadius: "12px",
            }}
          >
            Download
          </Button>
        </Box>
      )}

      {isPdf(item) && (
        <Document
          file={fileUrl}
          loading={
            <Box sx={{ py: 8, display: "grid", placeItems: "center" }}>
              <CircularProgress sx={{ color: HOME.green }} />
            </Box>
          }
          onLoadSuccess={({ numPages: n }) => {
            setNumPages(n);
            setPdfError("");
          }}
          onLoadError={(err) => {
            setPdfError(err?.message || "Could not open this brochure.");
          }}
          error={
            <Box sx={{ py: 4, textAlign: "center", px: 2 }}>
              <Typography sx={{ fontFamily: HOME.fontBody, color: "#b71c1c", mb: 1 }}>
                {pdfError || "Could not open this brochure."}
              </Typography>
              <Button
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                sx={{ textTransform: "none", fontFamily: HOME.fontBody, color: HOME.green }}
              >
                Open file
              </Button>
            </Box>
          }
        >
          {/* Wait for measured width so pages never paint at the desktop default (820px) on phones */}
          {!widthReady ? (
            <Box sx={{ py: 8, display: "grid", placeItems: "center" }}>
              <CircularProgress sx={{ color: HOME.green }} />
            </Box>
          ) : (
            <Stack
              spacing={isLast ? 0 : 2}
              alignItems="center"
              sx={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <Box
                  key={`${item.id}-page-${i + 1}`}
                  sx={{
                    width: "100%",
                    maxWidth: pageWidth,
                    boxShadow: "0 18px 48px -24px rgba(8,22,43,0.35)",
                    bgcolor: "#fff",
                    lineHeight: 0,
                    overflow: "hidden",
                    "& .react-pdf__Page": {
                      maxWidth: "100%",
                    },
                    "& .react-pdf__Page__canvas": {
                      maxWidth: "100% !important",
                      width: "100% !important",
                      height: "auto !important",
                    },
                    "& .react-pdf__Page__textContent, & .react-pdf__Page__annotations": {
                      maxWidth: "100%",
                    },
                  }}
                >
                  <Page
                    pageNumber={i + 1}
                    width={pageWidth}
                    renderTextLayer
                    renderAnnotationLayer
                    loading={
                      <Box
                        sx={{
                          width: "100%",
                          maxWidth: pageWidth,
                          height: Math.round(pageWidth * 1.3),
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <CircularProgress size={28} sx={{ color: HOME.green }} />
                      </Box>
                    }
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Document>
      )}
    </Box>
  );
}

export default function Brochures() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const shellRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(() => viewportWidth());
  const [widthReady, setWidthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/brochures/public");
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new Error(data.message || "Could not load brochures");
        }
        if (!cancelled) setItems(data.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load brochures");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = shellRef.current;
    const apply = (raw) => {
      const next = Math.max(280, Math.floor(raw));
      setPageWidth(next);
      setWidthReady(true);
    };

    // Immediate measure — do not wait for ResizeObserver's first callback
    apply(el?.clientWidth || viewportWidth());

    if (!el || typeof ResizeObserver === "undefined") {
      const onResize = () => apply(viewportWidth());
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) apply(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>Brochures | {BRAND.name}</title>
        <meta
          name="description"
          content={`School brochures from ${BRAND.name}.`}
        />
      </Helmet>

      <Box
        sx={{
          pt: 0,
          pb: 0,
          minHeight: "100vh",
          bgcolor: "#e8edf4",
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        <Box ref={shellRef} sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden", px: 0 }}>
          {loading && (
            <Stack spacing={3} alignItems="center" sx={{ pt: 1, px: 1, width: "100%" }}>
              <Skeleton
                variant="rounded"
                sx={{ width: "100%", maxWidth: pageWidth, height: Math.min(pageWidth * 1.15, 520) }}
              />
              <Skeleton
                variant="rounded"
                sx={{ width: "100%", maxWidth: pageWidth, height: Math.min(pageWidth * 1.15, 520) }}
              />
            </Stack>
          )}

          {!loading && error && (
            <Typography
              sx={{ textAlign: "center", color: "#b71c1c", fontFamily: HOME.fontBody, py: 6, px: 2 }}
            >
              {error}
            </Typography>
          )}

          {!loading && !error && items.length === 0 && (
            <Box sx={{ py: 8, textAlign: "center", px: 2 }}>
              <MenuBookRoundedIcon sx={{ fontSize: 44, color: HOME.green, mb: 1 }} />
              <Typography sx={{ fontFamily: HOME.fontBody, color: "rgba(30,40,88,0.7)" }}>
                No brochure has been published yet.
              </Typography>
            </Box>
          )}

          {!loading &&
            items.map((item, index) => (
              <BrochureBlock
                key={item.id}
                item={item}
                pageWidth={pageWidth}
                widthReady={widthReady}
                isFirst={index === 0}
                isLast={index === items.length - 1}
              />
            ))}
        </Box>
      </Box>
    </>
  );
}
