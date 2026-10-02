import { HOME } from "../Home/homeShared";

export const CATEGORY_META = {
  news: { label: "News", color: HOME.green },
  event: { label: "Event", color: "#7a5cc0" },
  exam: { label: "Exams", color: "#b45309" },
  admission: { label: "Admissions", color: HOME.navy },
  general: { label: "Notice", color: "#0e7490" },
};

// "exam" is intentionally absent: exam notices are student-portal only
export const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "news", label: "News" },
  { value: "event", label: "Events" },
  { value: "admission", label: "Admissions" },
  { value: "general", label: "Notices" },
];

export function categoryMeta(category) {
  return CATEGORY_META[category] || { label: category || "News", color: HOME.green };
}

export function formatNewsDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatEventRange(start, end) {
  const s = formatNewsDate(start);
  if (!s) return "";
  const e = formatNewsDate(end);
  return e && e !== s ? `${s} – ${e}` : s;
}

/** Upcoming = event with a start date today or later */
export function isUpcoming(item) {
  if (!item?.event_date) return false;
  const d = new Date(item.event_date);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}
