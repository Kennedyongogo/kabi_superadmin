import { keyframes } from "@mui/material";
import { HOME } from "../Home/homeShared";

export { HOME };

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

export function readStoredStudent() {
  try {
    const raw = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (raw && token) return JSON.parse(raw);
  } catch {
    /* fall through */
  }
  return null;
}

export function firstName(fullName) {
  const s = String(fullName || "").trim();
  return s ? s.split(/\s+/)[0] : "Student";
}

export function studentAuthHeaders(json = false) {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

export const settingsInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    bgcolor: "#fff",
    fontFamily: HOME.fontBody,
    "& fieldset": { borderColor: "rgba(27,94,168,0.18)" },
    "&:hover fieldset": { borderColor: "rgba(27,94,168,0.42)" },
    "&.Mui-focused fieldset": { borderColor: HOME.green },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: HOME.green },
};
