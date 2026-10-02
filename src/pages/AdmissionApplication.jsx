import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  ButtonBase,
  Fade,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Swal from "sweetalert2";
import { HOME } from "../components/Home/homeShared";
import {
  HomeSectionHeader,
  HomeGhostButton,
  HomePrimaryButton,
} from "../components/Home/homeUi";
import Footer from "../components/Footer/Footer";
import { meetsMinimumKcseGrade } from "../utils/kcseGrade";

const emptyForm = () => ({
  full_name: "",
  national_id: "",
  phone: "",
  email: "",
  address: "",
  kcse_grade: "",
  programme_id: "",
});

const emptyFiles = () => ({
  kcse_certificate: null,
  result_slip: null,
  birth_certificate: null,
  id_document: null,
});

const STEP_LABELS = [
  "Personal",
  "Contact",
  "Academic",
  "Programme",
  "Documents",
];

function isEmailOk(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

/** Which of the 5 form steps are complete (for the progress bar). */
function getStepCompletion(form, files) {
  return [
    Boolean(form.full_name.trim() && form.national_id.trim()),
    Boolean(form.phone.trim() && isEmailOk(form.email)),
    Boolean(form.kcse_grade.trim()),
    Boolean(form.programme_id),
    Boolean(
      files.kcse_certificate ||
        files.result_slip ||
        files.birth_certificate ||
        files.id_document
    ),
  ];
}

const fieldSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    width: "100%",
    borderRadius: "12px",
    bgcolor: "#fff",
    fontFamily: HOME.fontBody,
    fontSize: { xs: "0.95rem", md: "1rem" },
    minHeight: 56,
    boxShadow: "0 1px 0 rgba(8,22,43,0.03)",
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
    "& fieldset": { borderColor: "rgba(12, 35, 64, 0.12)" },
    "&:hover": {
      boxShadow: "0 8px 20px rgba(8,22,43,0.06)",
      "& fieldset": { borderColor: HOME.green },
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 4px rgba(27,94,168,0.12)`,
      "& fieldset": { borderColor: HOME.green, borderWidth: 1.5 },
    },
  },
  "& .MuiInputBase-input": {
    py: 1.7,
    px: 2.1,
  },
  "& .MuiSelect-select": {
    py: 1.7,
    px: 2.1,
  },
  "& .MuiFormHelperText-root": {
    mx: 0.25,
    mt: 0.75,
    fontFamily: HOME.fontBody,
  },
};

const labelSx = {
  fontFamily: HOME.fontBody,
  fontSize: "0.82rem",
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: HOME.ink,
  mb: 0.95,
  display: "block",
};

function FieldLabel({ children, required }) {
  return (
    <Typography component="label" sx={labelSx}>
      {children}
      {required ? (
        <Box component="span" sx={{ color: HOME.green, ml: 0.4 }}>
          *
        </Box>
      ) : (
        <Box
          component="span"
          sx={{
            color: HOME.inkMuted,
            fontWeight: 600,
            ml: 0.6,
            textTransform: "none",
            letterSpacing: 0,
          }}
        >
          optional
        </Box>
      )}
    </Typography>
  );
}

function FormSection({ icon, step, title, subtitle, children, delay = 0, tone = "light" }) {
  const isSoft = tone === "soft";
  return (
    <Fade in timeout={520 + delay}>
      <Box
        sx={{
          width: "100%",
          position: "relative",
          bgcolor: isSoft ? HOME.sky : "#fff",
          py: { xs: 3.75, md: 5 },
          backgroundImage: isSoft
            ? `radial-gradient(ellipse 60% 80% at 100% 0%, rgba(27,94,168,0.06) 0%, transparent 55%)`
            : `radial-gradient(ellipse 50% 70% at 0% 100%, rgba(200,168,64,0.07) 0%, transparent 50%)`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: { xs: 24, md: 36 },
            bottom: { xs: 24, md: 36 },
            width: 4,
            borderRadius: "0 4px 4px 0",
            background: `linear-gradient(180deg, ${HOME.gold} 0%, ${HOME.green} 100%)`,
          }}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.75, sm: 2.75 }}
          alignItems={{ xs: "flex-start", sm: "flex-start" }}
          sx={{ mb: { xs: 2.75, md: 3.25 }, px: { xs: 2.25, sm: 3.5, md: 5 } }}
        >
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: "18px",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: "#fff",
              background: `linear-gradient(145deg, ${HOME.green} 0%, #0E3D73 100%)`,
              boxShadow: `0 12px 28px rgba(27,94,168,0.28)`,
              position: "relative",
              "& svg": { fontSize: 26 },
            }}
          >
            {icon}
            <Box
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                minWidth: 28,
                height: 28,
                px: 0.75,
                borderRadius: "999px",
                display: "grid",
                placeItems: "center",
                bgcolor: HOME.gold,
                color: HOME.navyDeep,
                fontFamily: HOME.fontBody,
                fontWeight: 800,
                fontSize: "0.68rem",
                letterSpacing: "0.04em",
                boxShadow: "0 6px 14px rgba(200,168,64,0.4)",
              }}
            >
              {step}
            </Box>
          </Box>
          <Box sx={{ minWidth: 0, flex: 1, pt: { sm: 0.35 } }}>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: HOME.green,
                mb: 0.55,
              }}
            >
              Step {step}
            </Typography>
            <Typography
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.7rem", md: "2.05rem" },
                color: HOME.navyDeep,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                sx={{
                  mt: 0.85,
                  fontFamily: HOME.fontBody,
                  fontSize: { xs: "0.95rem", md: "1.02rem" },
                  color: HOME.inkMuted,
                  maxWidth: 680,
                  lineHeight: 1.65,
                }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        <Box sx={{ width: "100%", px: { xs: 2.25, sm: 3.5, md: 5 } }}>{children}</Box>
      </Box>
    </Fade>
  );
}

function FileUploadField({ label, required, file, onSelect, onClear, accept, hint }) {
  const inputId = useMemo(() => `file-${label.replace(/\s+/g, "-").toLowerCase()}`, [label]);

  return (
    <Box sx={{ width: "100%" }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <ButtonBase
        component="label"
        htmlFor={inputId}
        sx={{
          width: "100%",
          display: "block",
          textAlign: "left",
          borderRadius: "14px",
          border: `1.5px dashed ${file ? HOME.green : "rgba(12, 35, 64, 0.18)"}`,
          bgcolor: file ? "rgba(27,94,168,0.05)" : "rgba(255,255,255,0.9)",
          px: { xs: 2, md: 2.5 },
          py: { xs: 2.35, md: 2.85 },
          transition: "all 0.22s ease",
          boxShadow: file ? "0 10px 24px rgba(27,94,168,0.1)" : "none",
          "&:hover": {
            borderColor: HOME.green,
            bgcolor: "rgba(27,94,168,0.06)",
            transform: "translateY(-1px)",
          },
        }}
      >
        <input
          id={inputId}
          hidden
          type="file"
          accept={accept}
          onChange={(e) => {
            const next = e.target.files?.[0] || null;
            onSelect(next);
            e.target.value = "";
          }}
        />
        <Stack direction="row" spacing={1.75} alignItems="center" sx={{ width: "100%" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              bgcolor: file ? "rgba(27,94,168,0.14)" : "rgba(12,35,64,0.06)",
              color: file ? HOME.green : HOME.navy,
              flexShrink: 0,
            }}
          >
            {file ? <CheckCircleOutlineRoundedIcon /> : <UploadFileOutlinedIcon />}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontWeight: 700,
                color: HOME.navyDeep,
                fontSize: "0.95rem",
              }}
            >
              {file ? file.name : "Choose file"}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: HOME.inkSoft, mt: 0.25 }}>
              {file
                ? `${(file.size / 1024).toFixed(0)} KB · click to replace`
                : hint || "PDF or image · max 8MB"}
            </Typography>
          </Box>
          {file ? (
            <Box
              component="span"
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClear();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onClear();
                }
              }}
              sx={{
                display: "grid",
                placeItems: "center",
                width: 36,
                height: 36,
                borderRadius: "10px",
                color: HOME.inkMuted,
                "&:hover": { color: HOME.navyDeep, bgcolor: "rgba(12,35,64,0.06)" },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </Box>
          ) : (
            <InsertDriveFileOutlinedIcon sx={{ color: HOME.inkSoft }} />
          )}
        </Stack>
      </ButtonBase>
    </Box>
  );
}

function pathLabel(pathname = "/") {
  const map = {
    "/": "Home",
    "/about-us": "About us",
    "/meet-our-team": "Meet our team",
    "/login": "Login",
  };
  return map[pathname] || "previous page";
}

export default function AdmissionApplication() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from || "/";
  const fromLabel = location.state?.fromLabel || pathLabel(fromPath);
  const preselectedProgrammeId = location.state?.programme_id || "";
  const [form, setForm] = useState(() => ({
    ...emptyForm(),
    programme_id: preselectedProgrammeId,
  }));
  const [files, setFiles] = useState(emptyFiles);
  const [programmes, setProgrammes] = useState([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(true);
  const [programmeError, setProgrammeError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formKey, setFormKey] = useState(0);

  const selectedProgramme = useMemo(
    () => programmes.find((p) => p.id === form.programme_id) || null,
    [programmes, form.programme_id]
  );

  const stepDone = useMemo(() => getStepCompletion(form, files), [form, files]);
  const completedCount = stepDone.filter(Boolean).length;
  const firstIncomplete = stepDone.findIndex((done) => !done);
  const currentStepIndex = firstIncomplete === -1 ? STEP_LABELS.length - 1 : firstIncomplete;
  const progressLabel =
    completedCount >= STEP_LABELS.length
      ? "All steps complete · ready to submit"
      : `Step ${currentStepIndex + 1} of ${STEP_LABELS.length} · ${STEP_LABELS[currentStepIndex]}`;

  const loadProgrammes = useCallback(async () => {
    setLoadingProgrammes(true);
    setProgrammeError("");
    try {
      const res = await fetch("/api/programmes?is_active=true&limit=100");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Could not load programmes");
      }
      setProgrammes(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setProgrammeError(err.message || "Could not load programmes");
      setProgrammes([]);
    } finally {
      setLoadingProgrammes(false);
    }
  }, []);

  useEffect(() => {
    loadProgrammes();
  }, [loadProgrammes]);

  useEffect(() => {
    const pid = location.state?.programme_id;
    if (pid) {
      setForm((prev) => (prev.programme_id === pid ? prev : { ...prev, programme_id: pid }));
    }
  }, [location.state?.programme_id]);

  const setField = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const errors = {};
    if (!form.full_name.trim()) errors.full_name = "Full name is required";
    if (!form.national_id.trim()) errors.national_id = "National ID is required";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email";
    }
    if (!form.kcse_grade.trim()) errors.kcse_grade = "KCSE grade is required";
    if (!form.programme_id) errors.programme_id = "Select a programme";

    if (form.kcse_grade.trim() && form.programme_id) {
      const programme = programmes.find((p) => p.id === form.programme_id);
      if (programme?.minimum_kcse_grade) {
        const check = meetsMinimumKcseGrade(form.kcse_grade, programme.minimum_kcse_grade);
        if (!check.ok) {
          errors.kcse_grade = check.message;
        }
      }
    }

    setFieldErrors(errors);
    return { ok: Object.keys(errors).length === 0, errors };
  };

  const resetForm = () => {
    setForm(emptyForm());
    setFiles(emptyFiles());
    setFieldErrors({});
    setFormKey((k) => k + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, errors } = validate();
    if (!ok) {
      const gradeMsg = errors.kcse_grade;
      const isGradeFail =
        Boolean(gradeMsg) &&
        /does not meet the minimum|Could not read KCSE/i.test(gradeMsg);
      Swal.fire({
        icon: isGradeFail ? "error" : "warning",
        title: isGradeFail ? "Grade requirement not met" : "Missing required details",
        text: isGradeFail
          ? gradeMsg
          : "Please complete all required fields before submitting.",
        confirmButtonColor: HOME.green,
      });
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("full_name", form.full_name.trim());
      body.append("national_id", form.national_id.trim());
      body.append("phone", form.phone.trim());
      body.append("email", form.email.trim());
      body.append("kcse_grade", form.kcse_grade.trim());
      body.append("programme_id", form.programme_id);
      if (form.address.trim()) body.append("address", form.address.trim());
      if (files.kcse_certificate) body.append("kcse_certificate", files.kcse_certificate);
      if (files.result_slip) body.append("result_slip", files.result_slip);
      if (files.birth_certificate) body.append("birth_certificate", files.birth_certificate);
      if (files.id_document) body.append("id_document", files.id_document);

      const res = await fetch("/api/admissions", {
        method: "POST",
        body,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        const msg = json.message || "Application could not be submitted";
        if (json.code === "KCSE_GRADE_TOO_LOW") {
          setFieldErrors((prev) => ({ ...prev, kcse_grade: msg }));
        }
        throw new Error(msg);
      }

      resetForm();

      await Swal.fire({
        icon: "success",
        title: "Application submitted",
        text: "Thank you. Our admissions team will review your application and contact you.",
        confirmButtonColor: HOME.green,
      });

      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission failed",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonColor: HOME.green,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: HOME.cream, display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          bgcolor: HOME.green,
          background: `linear-gradient(165deg, ${HOME.green} 0%, #0E3D73 55%, #0A2F5C 100%)`,
          color: "#fff",
          pt: { xs: 1.5, md: 2 },
          pb: { xs: 2.25, md: 2.75 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            pl: { xs: 1.25, sm: 1.5, md: 2 },
            pr: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 1.25, ml: { xs: -0.5, sm: -0.75 } }}
          >
            <Tooltip title={`Back to ${fromLabel}`} arrow placement="right">
              <IconButton
                onClick={handleBack}
                aria-label={`Back to ${fromLabel}`}
                sx={{
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.28)",
                  bgcolor: "rgba(255,255,255,0.08)",
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  "&:hover": {
                    bgcolor: "rgba(201, 162, 39, 0.22)",
                    borderColor: HOME.goldMuted,
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Chip
              label="Admissions"
              sx={{
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                height: 28,
                bgcolor: "rgba(255,255,255,0.12)",
                color: HOME.goldMuted,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          </Stack>
          <HomeSectionHeader
            light
            align="left"
            title="Apply for"
            titleAccent="admission"
            subtitle="Complete the form below to apply to Kendu Adventist School of Medical Sciences. Required fields are marked."
            sx={{
              mb: 0,
              ml: 0,
              gap: 0.75,
              alignItems: "flex-start",
              textAlign: "left",
              width: "100%",
              maxWidth: "none",
              "& h2": {
                maxWidth: "none",
                width: "100%",
                fontSize: { xs: "1.65rem", sm: "2rem", md: "2.25rem" },
              },
              "& p": {
                maxWidth: "none",
                width: "100%",
                fontSize: { xs: "0.9rem", md: "1rem" },
                lineHeight: 1.55,
              },
            }}
          />
        </Box>
      </Box>

      {/* Full-bleed form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        key={formKey}
        noValidate
        sx={{
          width: "100%",
          flex: 1,
          bgcolor: HOME.warmWhite,
          borderTop: `3px solid ${HOME.gold}`,
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: { xs: 64, sm: 72 },
            zIndex: 8,
            width: "100%",
            px: { xs: 2.25, sm: 3.5, md: 5 },
            py: { xs: 2, md: 2.25 },
            bgcolor: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${HOME.border}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
            {STEP_LABELS.map((label, i) => {
              const done = stepDone[i];
              const active = !done && i === currentStepIndex;
              return (
                <Box
                  key={label}
                  title={label}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 999,
                    transition: "background 0.35s ease, opacity 0.35s ease",
                    bgcolor: done || active ? undefined : "rgba(27,94,168,0.12)",
                    background: done
                      ? `linear-gradient(90deg, ${HOME.green}, ${HOME.gold})`
                      : active
                        ? `linear-gradient(90deg, rgba(27,94,168,0.45), rgba(200,168,64,0.55))`
                        : "rgba(27,94,168,0.12)",
                  }}
                />
              );
            })}
          </Stack>
          <Typography
            sx={{
              mt: 1.1,
              fontFamily: HOME.fontBody,
              fontSize: "0.78rem",
              fontWeight: 700,
              color: HOME.inkMuted,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {progressLabel}
            <Box component="span" sx={{ color: "rgba(12,35,64,0.35)", mx: 0.75 }}>
              ·
            </Box>
            about 3 minutes
          </Typography>
        </Box>

        <FormSection
          step="01"
          title="Personal information"
          subtitle="Your legal names as they appear on your national ID."
          icon={<PersonOutlineRoundedIcon />}
          delay={0}
          tone="light"
        >
          <Stack spacing={2.5} sx={{ width: "100%" }}>
            <Box sx={{ width: "100%" }}>
              <FieldLabel required>Full name</FieldLabel>
              <TextField
                fullWidth
                placeholder="e.g. Jane Achieng Otieno"
                value={form.full_name}
                onChange={setField("full_name")}
                error={Boolean(fieldErrors.full_name)}
                helperText={fieldErrors.full_name}
                sx={fieldSx}
              />
            </Box>
            <Box sx={{ width: "100%" }}>
              <FieldLabel required>National ID</FieldLabel>
              <TextField
                fullWidth
                placeholder="National identity number"
                value={form.national_id}
                onChange={setField("national_id")}
                error={Boolean(fieldErrors.national_id)}
                helperText={fieldErrors.national_id}
                sx={fieldSx}
              />
            </Box>
          </Stack>
        </FormSection>

        <FormSection
          step="02"
          title="Contact details"
          subtitle="We will use these details to reach you about your application."
          icon={<ContactMailOutlinedIcon />}
          delay={80}
          tone="soft"
        >
          <Stack spacing={2.5} sx={{ width: "100%" }}>
            <Box sx={{ width: "100%" }}>
              <FieldLabel required>Phone number</FieldLabel>
              <TextField
                fullWidth
                placeholder="+254 7XX XXX XXX"
                value={form.phone}
                onChange={setField("phone")}
                error={Boolean(fieldErrors.phone)}
                helperText={fieldErrors.phone}
                sx={fieldSx}
              />
            </Box>
            <Box sx={{ width: "100%" }}>
              <FieldLabel required>Email address</FieldLabel>
              <TextField
                fullWidth
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={setField("email")}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                sx={fieldSx}
              />
            </Box>
            <Box sx={{ width: "100%" }}>
              <FieldLabel>Postal / physical address</FieldLabel>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Town, county, or postal address"
                value={form.address}
                onChange={setField("address")}
                sx={{
                  ...fieldSx,
                  "& .MuiOutlinedInput-root": {
                    ...fieldSx["& .MuiOutlinedInput-root"],
                    minHeight: "auto",
                    alignItems: "flex-start",
                  },
                }}
              />
            </Box>
          </Stack>
        </FormSection>

        <FormSection
          step="03"
          title="Academic background"
          subtitle="Enter your overall KCSE mean grade."
          icon={<SchoolOutlinedIcon />}
          delay={160}
          tone="light"
        >
          <Box sx={{ width: "100%" }}>
            <FieldLabel required>KCSE mean grade</FieldLabel>
            <TextField
              fullWidth
              placeholder="e.g. C+, C, B-"
              value={form.kcse_grade}
              onChange={setField("kcse_grade")}
              error={Boolean(fieldErrors.kcse_grade)}
              helperText={
                fieldErrors.kcse_grade ||
                (selectedProgramme?.minimum_kcse_grade
                  ? `Selected programme requires a minimum mean grade of ${selectedProgramme.minimum_kcse_grade}.`
                  : undefined)
              }
              sx={fieldSx}
            />
          </Box>
        </FormSection>

        <FormSection
          step="04"
          title="Programme choice"
          subtitle="Select the programme you want to apply for."
          icon={<MenuBookOutlinedIcon />}
          delay={240}
          tone="soft"
        >
          <Box sx={{ width: "100%" }}>
            <FieldLabel required>Programme</FieldLabel>
            {programmeError ? (
              <Alert
                severity="error"
                sx={{ mb: 1.5, borderRadius: "12px" }}
                action={
                  <HomeGhostButton onClick={loadProgrammes} sx={{ py: 0.5, px: 1.5 }}>
                    Retry
                  </HomeGhostButton>
                }
              >
                {programmeError}
              </Alert>
            ) : null}
            <TextField
              select
              fullWidth
              value={form.programme_id}
              onChange={setField("programme_id")}
              disabled={loadingProgrammes || programmes.length === 0}
              error={Boolean(fieldErrors.programme_id)}
              helperText={
                fieldErrors.programme_id ||
                (loadingProgrammes ? "Loading programmes…" : undefined)
              }
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return (
                      <Typography sx={{ color: HOME.inkSoft }}>
                        {loadingProgrammes ? "Loading…" : "Select a programme"}
                      </Typography>
                    );
                  }
                  const match = programmes.find((p) => p.id === selected);
                  return match?.name || selected;
                },
              }}
              sx={fieldSx}
              InputProps={{
                startAdornment: loadingProgrammes ? (
                  <CircularProgress size={18} sx={{ mr: 1, color: HOME.green }} />
                ) : null,
              }}
            >
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id} sx={{ py: 1.25 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: HOME.navyDeep }}>{p.name}</Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: HOME.inkSoft }}>
                      {[p.award, p.category, p.minimum_kcse_grade ? `Min grade ${p.minimum_kcse_grade}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </FormSection>

        <FormSection
          step="05"
          title="Supporting documents"
          subtitle="Upload clear scans or photos where available. All document uploads are optional."
          icon={<UploadFileOutlinedIcon />}
          delay={320}
          tone="light"
        >
          <Stack spacing={2.5} sx={{ width: "100%" }}>
            <FileUploadField
              label="KCSE certificate"
              file={files.kcse_certificate}
              accept="image/*,application/pdf"
              onSelect={(file) => setFiles((prev) => ({ ...prev, kcse_certificate: file }))}
              onClear={() => setFiles((prev) => ({ ...prev, kcse_certificate: null }))}
            />
            <FileUploadField
              label="Result slip"
              file={files.result_slip}
              accept="image/*,application/pdf"
              onSelect={(file) => setFiles((prev) => ({ ...prev, result_slip: file }))}
              onClear={() => setFiles((prev) => ({ ...prev, result_slip: null }))}
            />
            <FileUploadField
              label="Birth certificate"
              file={files.birth_certificate}
              accept="image/*,application/pdf"
              onSelect={(file) => setFiles((prev) => ({ ...prev, birth_certificate: file }))}
              onClear={() => setFiles((prev) => ({ ...prev, birth_certificate: null }))}
            />
            <FileUploadField
              label="Copy of ID document"
              file={files.id_document}
              accept="image/*,application/pdf"
              onSelect={(file) => setFiles((prev) => ({ ...prev, id_document: file }))}
              onClear={() => setFiles((prev) => ({ ...prev, id_document: null }))}
            />
          </Stack>
        </FormSection>

        {/* Submit band */}
        <Box
          sx={{
            width: "100%",
            borderTop: `1px solid ${HOME.border}`,
            background: `linear-gradient(135deg, ${HOME.navyDeep} 0%, ${HOME.green} 100%)`,
            px: { xs: 2.25, sm: 3.5, md: 5 },
            py: { xs: 3.5, md: 4.25 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,0.88)",
                fontSize: "0.95rem",
                maxWidth: 560,
                lineHeight: 1.6,
              }}
            >
              By submitting, you confirm that the information provided is accurate to the best of
              your knowledge.
            </Typography>
            <HomePrimaryButton
              type="submit"
              disabled={submitting}
              sx={{
                minWidth: { xs: "100%", sm: 240 },
                py: 1.55,
                borderRadius: "12px",
                alignSelf: { xs: "stretch", sm: "center" },
                fontSize: "1rem",
              }}
            >
              {submitting ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} sx={{ color: HOME.navyDeep }} />
                  <span>Submitting…</span>
                </Stack>
              ) : (
                "Submit application"
              )}
            </HomePrimaryButton>
          </Stack>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
