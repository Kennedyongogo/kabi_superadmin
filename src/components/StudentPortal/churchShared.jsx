import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { HOME, studentAuthHeaders } from "./studentPortalShared";

export async function studentApi(path, { method = "GET", body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: studentAuthHeaders(body !== undefined),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

export const SEAT_COLORS = {
  available: { fill: "#ffffff", stroke: "#1B5EA8", text: "#0E3D73", label: "Available" },
  selected: { fill: "#1B5EA8", stroke: "#0E3D73", text: "#ffffff", label: "Your choice" },
  mine: { fill: "#c8a840", stroke: "#8a6d12", text: "#141a3a", label: "Your seat" },
  booked: { fill: "#cbd5e1", stroke: "#94a3b8", text: "#64748b", label: "Taken" },
  blocked: { fill: "#f1f5f9", stroke: "#cbd5e1", text: "#94a3b8", label: "Blocked" },
};

const SHAPE_STYLE = {
  room: { fill: "#fbfaf6", stroke: "#1e2858", strokeWidth: 6, rx: 14, text: "#94a3b8", textSize: 14 },
  stage: { fill: "rgba(200,168,64,0.22)", stroke: "#b8962e", strokeWidth: 2, rx: 12, text: "#7a5f10", textSize: 16 },
  pulpit: { fill: "#1e2858", stroke: "#1e2858", strokeWidth: 1, rx: 8, text: "#ffffff", textSize: 11 },
  altar: { fill: "rgba(109,40,217,0.14)", stroke: "#6d28d9", strokeWidth: 2, rx: 6, text: "#5b21b6", textSize: 12 },
  choir: { fill: "rgba(13,148,136,0.12)", stroke: "#0d9488", strokeWidth: 2, rx: 12, text: "#0f766e", textSize: 14 },
  door: { fill: "#b45309", stroke: "#92400e", strokeWidth: 1, rx: 3, text: "#92400e", textSize: 11, labelOutside: true },
  aisle: { fill: "rgba(148,163,184,0.1)", stroke: "#94a3b8", strokeWidth: 1.5, rx: 4, dash: "8 6", text: "#94a3b8", textSize: 12 },
  pillar: { fill: "#64748b", stroke: "#475569", strokeWidth: 1, rx: 4, text: "#ffffff", textSize: 9 },
  window: { fill: "#bfdbfe", stroke: "#3b82f6", strokeWidth: 1, rx: 2, text: "#1d4ed8", textSize: 10, labelOutside: true },
  area: { fill: "rgba(27,94,168,0.06)", stroke: "#1B5EA8", strokeWidth: 1.5, rx: 10, dash: "6 5", text: "#1B5EA8", textSize: 13 },
  label: { fill: "none", stroke: "none", strokeWidth: 0, rx: 0, text: "#1e2858", textSize: 18 },
};

// Wall positions of a cross-shaped hall as fractions of its box; same defaults as the admin designer.
const CROSS_DEFAULTS = { hl: 0.3, hr: 0.7, fl: 0.3, fr: 0.7, lt: 0.22, lb: 0.5, rt: 0.22, rb: 0.5 };

function crossWalls(shape) {
  const f = { ...CROSS_DEFAULTS, ...(shape.cross || {}) };
  const { x, y, w, h } = shape;
  return {
    left: x,
    right: x + w,
    top: y,
    bottom: y + h,
    hl: x + f.hl * w,
    hr: x + f.hr * w,
    fl: x + f.fl * w,
    fr: x + f.fr * w,
    lt: y + f.lt * h,
    lb: y + f.lb * h,
    rt: y + f.rt * h,
    rb: y + f.rb * h,
  };
}

function crossPoints(a) {
  return [
    [a.hl, a.top],
    [a.hr, a.top],
    [a.hr, a.rt],
    [a.right, a.rt],
    [a.right, a.rb],
    [a.fr, a.rb],
    [a.fr, a.bottom],
    [a.fl, a.bottom],
    [a.fl, a.lb],
    [a.left, a.lb],
    [a.left, a.lt],
    [a.hl, a.lt],
  ];
}

function CrossGraphic({ shape }) {
  const st = SHAPE_STYLE.room;
  const walls = crossWalls(shape);
  return (
    <g>
      <polygon
        points={crossPoints(walls).map((p) => p.join(",")).join(" ")}
        fill={st.fill}
        stroke={st.stroke}
        strokeWidth={st.strokeWidth}
        strokeLinejoin="round"
      />
      {shape.label ? (
        <text
          x={(walls.hl + walls.hr) / 2}
          y={shape.y + st.textSize * 0.9 + 8}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily='"Plus Jakarta Sans", system-ui, sans-serif'
          fontWeight={700}
          fontSize={st.textSize}
          fill={st.text}
          letterSpacing={4}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {String(shape.label).toUpperCase()}
        </text>
      ) : null}
    </g>
  );
}

function ShapeGraphic({ shape }) {
  if (shape.type === "cross") return <CrossGraphic shape={shape} />;
  const st = SHAPE_STYLE[shape.type] || SHAPE_STYLE.area;
  const cx = shape.x + shape.w / 2;
  const cy = shape.y + shape.h / 2;
  const label = shape.label ?? "";
  const outside = st.labelOutside;
  const vertical = shape.h > shape.w * 2.2 && shape.type !== "label";
  const topLabel = !outside && !vertical && ["room", "stage", "choir", "area"].includes(shape.type) && shape.h >= st.textSize * 4;
  const isRoom = shape.type === "room" && topLabel;
  const y = outside ? shape.y + shape.h + st.textSize + 2 : topLabel ? shape.y + st.textSize * 0.9 + 6 : cy;
  return (
    <g>
      {shape.type !== "label" ? (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.w}
          height={shape.h}
          rx={Math.min(st.rx, shape.w / 2, shape.h / 2)}
          fill={st.fill}
          stroke={st.stroke}
          strokeWidth={st.strokeWidth}
          strokeDasharray={st.dash}
        />
      ) : null}
      {label ? (
        <text
          x={isRoom ? shape.x + 20 : cx}
          y={y}
          textAnchor={isRoom ? "start" : "middle"}
          dominantBaseline={outside ? "auto" : "central"}
          fontFamily='"Plus Jakarta Sans", system-ui, sans-serif'
          fontWeight={700}
          fontSize={st.textSize}
          fill={st.text}
          letterSpacing={shape.type === "room" ? 4 : 0.5}
          transform={vertical ? `rotate(-90 ${cx} ${cy})` : undefined}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {shape.type === "room" ? String(label).toUpperCase() : label}
        </text>
      ) : null}
    </g>
  );
}

function SeatGraphic({ seat, size, colors, pulse }) {
  const half = size / 2;
  const x = seat.x - half;
  const y = seat.y - half;
  const back = Math.max(3, size * 0.16);
  const fontSize = Math.max(7, Math.min(size * 0.36, 13));
  return (
    <g>
      {pulse ? (
        <circle cx={seat.x} cy={seat.y} r={size} fill="rgba(200,168,64,0.28)">
          <animate attributeName="r" values={`${size * 0.7};${size * 1.1};${size * 0.7}`} dur="1.6s" repeatCount="indefinite" />
        </circle>
      ) : null}
      <rect x={x + size * 0.06} y={y} width={size * 0.88} height={back} rx={back / 2} fill={colors.stroke} opacity={0.85} />
      <rect
        x={x}
        y={y + back + 1.5}
        width={size}
        height={size - back - 1.5}
        rx={Math.max(3, size * 0.2)}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={pulse ? 2.4 : 1.4}
      />
      {size >= 18 ? (
        <text
          x={seat.x}
          y={y + back + 1.5 + (size - back - 1.5) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily='"Plus Jakarta Sans", system-ui, sans-serif'
          fontWeight={800}
          fontSize={fontSize}
          fill={colors.text}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {seat.label}
        </text>
      ) : null}
    </g>
  );
}

export function StudentSeatMap({ layout, zoom = 1, selectedId, onSeatClick }) {
  if (!layout) return null;
  const size = layout.seat_size || 28;
  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={layout.width * zoom}
      height={layout.height * zoom}
      style={{ display: "block" }}
      role="img"
      aria-label="Church seating plan"
    >
      {(layout.shapes || []).map((s) => (
        <ShapeGraphic key={s.id} shape={s} />
      ))}
      {(layout.seats || []).map((seat) => {
        const key = seat.id === selectedId ? "selected" : seat.status || "available";
        const colors = SEAT_COLORS[key] || SEAT_COLORS.available;
        const clickable = seat.status === "available" || seat.status === "mine";
        return (
          <g
            key={seat.id}
            onClick={clickable && onSeatClick ? () => onSeatClick(seat) : undefined}
            style={{ cursor: clickable ? "pointer" : "not-allowed" }}
          >
            <title>
              {seat.label}
              {seat.section ? ` · ${seat.section}` : ""} — {colors.label}
            </title>
            <SeatGraphic seat={seat} size={size} colors={colors} pulse={seat.status === "mine" || seat.id === selectedId} />
          </g>
        );
      })}
    </svg>
  );
}

export function SeatLegend({ sx }) {
  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} sx={sx}>
      {["available", "selected", "mine", "booked", "blocked"].map((k) => {
        const c = SEAT_COLORS[k];
        return (
          <Stack key={k} direction="row" spacing={0.7} alignItems="center">
            <Box sx={{ width: 15, height: 15, borderRadius: "4px", bgcolor: c.fill, border: `2px solid ${c.stroke}` }} />
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.74rem", fontWeight: 700, color: HOME.inkMuted }}>{c.label}</Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

export function formatWhen(value, opts = {}) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...opts,
  });
}

export function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function timeAgo(value) {
  const d = new Date(value);
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** Opens a printable booking slip (students can print it or save it as PDF). */
export function printBookingSlip({ booking, service, student }) {
  const w = window.open("", "_blank", "width=520,height=720");
  if (!w) return false;
  const when = formatWhen(service.starts_at, { year: "numeric" });
  const booked = booking.created_at ? new Date(booking.created_at).toLocaleString("en-GB") : "";
  w.document.write(`<!doctype html><html><head><title>Seat ${escapeHtml(booking.seat_label)} · ${escapeHtml(service.title)}</title>
<style>
  body{font-family:"Plus Jakarta Sans",system-ui,Segoe UI,sans-serif;background:#f1f5f9;margin:0;padding:24px;color:#1a2638}
  .slip{max-width:420px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 18px 40px rgba(8,22,43,.15)}
  .top{background:linear-gradient(135deg,#141a3a,#1e2858 55%,#1B5EA8);color:#fff;padding:20px 22px}
  .top small{letter-spacing:.14em;font-weight:800;font-size:10px;opacity:.75}
  .top h1{font-family:Georgia,serif;font-size:22px;margin:6px 0 2px}
  .top p{margin:0;font-size:13px;opacity:.85}
  .seat{display:flex;align-items:center;gap:16px;padding:20px 22px;border-bottom:2px dashed #e2e8f0}
  .seat .big{background:#c8a840;color:#141a3a;border-radius:14px;min-width:84px;height:84px;display:grid;place-items:center;font-size:28px;font-weight:900}
  .row{display:flex;justify-content:space-between;padding:10px 22px;font-size:13px;border-bottom:1px solid #f1f5f9}
  .row span:first-child{color:#64748b;font-weight:700}
  .row span:last-child{font-weight:800;text-align:right}
  .foot{padding:14px 22px 20px;font-size:11px;color:#64748b;line-height:1.5}
  .ref{letter-spacing:.12em;font-size:18px;color:#1B5EA8}
  @media print{body{background:#fff;padding:0}.slip{box-shadow:none}}
</style></head><body>
<div class="slip">
  <div class="top"><small>KASMS · CHURCH SEAT BOOKING</small><h1>${escapeHtml(service.title)}</h1><p>${escapeHtml(when)}</p></div>
  <div class="seat"><div class="big">${escapeHtml(booking.seat_label)}</div>
    <div><div style="font-size:12px;color:#64748b;font-weight:700">BOOKING REFERENCE</div><div class="ref"><b>${escapeHtml(booking.reference)}</b></div>
    <div style="font-size:12px;color:#64748b;margin-top:4px">Show this slip if asked by an usher.</div></div></div>
  <div class="row"><span>Name</span><span>${escapeHtml(student?.full_name || "")}</span></div>
  <div class="row"><span>Admission no.</span><span>${escapeHtml(student?.admission_number || "—")}</span></div>
  ${service.service_type ? `<div class="row"><span>Service</span><span>${escapeHtml(service.service_type)}</span></div>` : ""}
  <div class="row"><span>Booked on</span><span>${escapeHtml(booked)}</span></div>
  <div class="foot">Please be seated before the service begins. Attendance is checked during the service; a booked seat left empty is recorded as absent.</div>
</div>
<script>setTimeout(function(){window.print()},350)</script>
</body></html>`);
  w.document.close();
  return true;
}
