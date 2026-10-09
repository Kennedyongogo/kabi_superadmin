// Mirrors SHOP_CATEGORIES and SOCIAL_PLATFORMS in delivery_api/src/utils/shopCategories.js.
export const SHOP_CATEGORIES = [
  {
    id: "water",
    label: "Water",
    blurb: "Refills, bottles and dispensers",
    unitHint: "e.g. 20 L",
    services: ["Bottle refills", "Home delivery", "Dispenser cleaning", "Bulk supply"],
    icon: <DropIcon />,
  },
  {
    id: "gas",
    label: "Gas",
    blurb: "Cylinders, refills and accessories",
    unitHint: "e.g. 13 kg",
    services: ["Cylinder refills", "Cylinder exchange", "Home delivery", "Installation"],
    icon: <FlameIcon />,
  },
  {
    id: "fastfood",
    label: "Fast food",
    blurb: "Meals, snacks and drinks",
    unitHint: "e.g. 1 plate",
    services: ["Takeaway", "Dine-in", "Home delivery", "Catering"],
    icon: <BurgerIcon />,
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(SHOP_CATEGORIES.map((category) => [category.id, category]));

export const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", base: "https://facebook.com/", placeholder: "yourshop" },
  { id: "instagram", label: "Instagram", base: "https://instagram.com/", placeholder: "@yourshop" },
  { id: "x", label: "X (Twitter)", base: "https://x.com/", placeholder: "@yourshop" },
  { id: "tiktok", label: "TikTok", base: "https://tiktok.com/@", placeholder: "@yourshop" },
  { id: "youtube", label: "YouTube", base: "https://youtube.com/@", placeholder: "@yourshop" },
  { id: "linkedin", label: "LinkedIn", base: "https://linkedin.com/company/", placeholder: "your-shop" },
];

export const moneyFmt = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });

// Owners type either a handle ("@kabi") or a full profile URL; both should open the profile.
export function socialUrl(platform, value) {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[a-z]{2,}\//i.test(value)) return `https://${value}`;
  return `${platform.base}${value.replace(/^@/, "")}`;
}

export function socialHandle(value) {
  if (!/^https?:\/\//i.test(value)) return value.startsWith("@") ? value : `@${value}`;
  const last = value.replace(/\/+$/, "").split("/").pop();
  return last ? `@${last.replace(/^@/, "")}` : value;
}

export function websiteUrl(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function telUrl(value) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

// Kenyan numbers are stored as typed (07…), WhatsApp links need the international form.
export function whatsappUrl(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `254${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

export function hasLocation(shop) {
  return shop.latitude !== null && shop.latitude !== undefined && shop.longitude !== null && shop.longitude !== undefined;
}

export function directionsUrl(shop) {
  return `https://www.google.com/maps/search/?api=1&query=${Number(shop.latitude)},${Number(shop.longitude)}`;
}

/** Parses typed coordinates; returns [lat, lng] or null when either is missing or out of range. */
export function parseCoords(latitude, longitude) {
  const lat = String(latitude ?? "").trim();
  const lng = String(longitude ?? "").trim();
  if (!lat || !lng) return null;
  const a = Number(lat);
  const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180 ? [a, b] : null;
}

// PNG pins in public/markers, one per category plus a neutral one for shops that haven't picked yet.
export const MARKER_ICONS = {
  water: "/markers/water.png",
  gas: "/markers/gas.png",
  fastfood: "/markers/fastfood.png",
  shop: "/markers/shop.png",
};

/* ---------- Opening hours ---------- */

// Mirrors WEEK_DAYS in delivery_api/src/utils/shopCategories.js. Index 0 is Monday.
export const WEEK_DAYS = [
  { id: "mon", short: "Mon", letter: "M", label: "Monday" },
  { id: "tue", short: "Tue", letter: "T", label: "Tuesday" },
  { id: "wed", short: "Wed", letter: "W", label: "Wednesday" },
  { id: "thu", short: "Thu", letter: "T", label: "Thursday" },
  { id: "fri", short: "Fri", letter: "F", label: "Friday" },
  { id: "sat", short: "Sat", letter: "S", label: "Saturday" },
  { id: "sun", short: "Sun", letter: "S", label: "Sunday" },
];

const DAY_INDEX = Object.fromEntries(WEEK_DAYS.map((day, index) => [day.id, index]));

export function formatTime(value) {
  const [h, m] = value.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
}

export function formatHours(entry) {
  return entry.all_day ? "Open 24 hours" : `${formatTime(entry.open)} – ${formatTime(entry.close)}`;
}

/** ["mon","tue","wed","thu","fri","sun"] → "Mon – Fri, Sun". */
export function formatDays(days) {
  const sorted = [...days].sort((a, b) => DAY_INDEX[a] - DAY_INDEX[b]);
  if (sorted.length === 7) return "Every day";
  const runs = [];
  for (const day of sorted) {
    const last = runs.at(-1);
    if (last && DAY_INDEX[day] === DAY_INDEX[last.at(-1)] + 1) last.push(day);
    else runs.push([day]);
  }
  const short = (id) => WEEK_DAYS[DAY_INDEX[id]].short;
  return runs
    .map((run) => (run.length >= 3 ? `${short(run[0])} – ${short(run.at(-1))}` : run.map(short).join(", ")))
    .join(", ");
}

/** One row per weekday with the entry covering it, or null when closed. */
export function weekSchedule(hours = []) {
  return WEEK_DAYS.map((day) => ({ day, entry: hours.find((entry) => entry.days.includes(day.id)) ?? null }));
}

const minutes = (value) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

/** Whether the shop is open at `now` (local time), honouring hours that run past midnight. */
export function openStatus(hours, now = new Date()) {
  if (!hours?.length) return null;
  const today = (now.getDay() + 6) % 7;
  const yesterday = (today + 6) % 7;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const entryFor = (index) => hours.find((entry) => entry.days.includes(WEEK_DAYS[index].id));

  const late = entryFor(yesterday);
  if (late && !late.all_day && minutes(late.close) < minutes(late.open) && nowMin < minutes(late.close)) {
    return { open: true, label: `Open · closes ${formatTime(late.close)}` };
  }
  const entry = entryFor(today);
  if (entry?.all_day) return { open: true, label: "Open 24 hours today" };
  if (entry) {
    const open = minutes(entry.open);
    const close = minutes(entry.close);
    const overnight = close < open;
    if (nowMin >= open && (overnight || nowMin < close)) return { open: true, label: `Open · closes ${formatTime(entry.close)}` };
    if (nowMin < open) return { open: false, label: `Closed · opens ${formatTime(entry.open)}` };
  }
  for (let step = 1; step <= 7; step += 1) {
    const next = entryFor((today + step) % 7);
    if (!next) continue;
    const when = step === 1 ? "tomorrow" : WEEK_DAYS[(today + step) % 7].short;
    return { open: false, label: next.all_day ? `Closed · opens ${when}` : `Closed · opens ${when} ${formatTime(next.open)}` };
  }
  return { open: false, label: "Closed" };
}

const svgProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function DropIcon() {
  return (
    <svg {...svgProps}>
      <path d="M12 3.5s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11Z" />
      <path d="M9 15a3 3 0 0 0 3 3" />
    </svg>
  );
}

export function FlameIcon() {
  return (
    <svg {...svgProps}>
      <path d="M12 21a7 7 0 0 0 7-7c0-4-3-6.5-4-10-2.5 2-3.5 4-3.5 6-1-1-1.6-2-1.8-3.5C7 8.6 5 11 5 14a7 7 0 0 0 7 7Z" />
      <path d="M12 21a3 3 0 0 0 3-3c0-2-1.5-3-3-5-1.5 2-3 3-3 5a3 3 0 0 0 3 3Z" />
    </svg>
  );
}

export function BurgerIcon() {
  return (
    <svg {...svgProps}>
      <path d="M4 10a8 6 0 0 1 16 0v.5H4V10Z" />
      <path d="M3.5 14h17M5 17.5h14a1 1 0 0 1-1 2H6a1 1 0 0 1-1-2Z" />
      <path d="m4 14 2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2" />
    </svg>
  );
}

export function SocialIcon({ id }) {
  switch (id) {
    case "facebook":
      return (
        <svg {...svgProps}>
          <path d="M14 8h2.5V4.5H14A4 4 0 0 0 10 8.5V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V9a1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...svgProps}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
        </svg>
      );
    case "x":
      return (
        <svg {...svgProps}>
          <path d="M4 4l16 16M20 4 4 20" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...svgProps}>
          <path d="M14 3.5v11a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 3.5c.5 2.8 2.3 4.5 5 4.8" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...svgProps}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path d="m10.5 9.5 4 2.5-4 2.5v-5Z" fill="currentColor" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...svgProps}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
          <path d="M8 10.5V16M8 7.8v.1M11.5 16v-5.5M11.5 13a2.5 2.5 0 0 1 5 0v3" />
        </svg>
      );
    default:
      return null;
  }
}
