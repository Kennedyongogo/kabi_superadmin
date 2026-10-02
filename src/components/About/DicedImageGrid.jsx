import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import "./dicedImageGrid.css";

/** Warp corner classes — order matches DicedHeroSection grid layout. */
const GRID_MASK_CLASSES = [
  "diced-grid__img--bottom-right",
  "diced-grid__img--bottom-left",
  "diced-grid__img--top-right",
  "diced-grid__img--top-left",
];

const ROTATE_MS = 5600;
const FADE_MS = 1600;

/**
 * 2×2 image grid with curved “diced” masks.
 * When autoRotate is on, images cycle clockwise through slots with a soft crossfade.
 */
export default function DicedImageGrid({
  slides,
  onImageClick,
  onImageHover,
  sx,
  autoRotate = true,
}) {
  const [offset, setOffset] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const items = useMemo(() => {
    if (!slides?.length) return [];
    const base = slides.length >= 4 ? slides.slice(0, 4) : [...slides];
    while (base.length < 4) base.push(base[base.length - 1] || slides[0]);
    return base;
  }, [slides]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    if (!autoRotate || reduceMotion || items.length < 2) return undefined;
    const id = window.setInterval(() => {
      setOffset((o) => (o + 1) % items.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [autoRotate, reduceMotion, items.length]);

  if (!items.length) return null;

  // Stable display order for slots (matches original layout), then rotate by offset
  const slotBase = [3, 2, 1, 0];

  return (
    <Box
      className="diced-grid"
      sx={{
        maxWidth: { xs: 360, sm: 440, lg: "100%" },
        mx: { xs: "auto", lg: 0 },
        ...sx,
      }}
    >
      {slotBase.map((baseIndex, slotIndex) => {
        const activeIndex = (baseIndex + offset) % items.length;
        return (
          <Box key={`slot-${slotIndex}`} className="diced-grid__cell">
            {items.map((slide, imageIndex) => {
              const active = imageIndex === activeIndex;
              return (
                <Box
                  key={`${slide.image}-${imageIndex}`}
                  component="img"
                  src={slide.image}
                  alt={slide.title || `Campus life ${imageIndex + 1}`}
                  className={`diced-grid__img ${GRID_MASK_CLASSES[slotIndex]}`}
                  onClick={() => active && onImageClick?.(slotIndex, slide)}
                  onMouseEnter={() => active && onImageHover?.(slotIndex, slide)}
                  sx={{
                    opacity: active ? 1 : 0,
                    transform: active ? "scale(1)" : "scale(1.04)",
                    transition: reduceMotion
                      ? "opacity 0.2s ease"
                      : `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                    pointerEvents: active ? "auto" : "none",
                    zIndex: active ? 2 : 1,
                  }}
                />
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}
