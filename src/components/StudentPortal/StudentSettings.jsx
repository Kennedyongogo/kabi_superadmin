import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { HOME, fadeUp, firstName, settingsInputSx } from "./studentPortalShared";

function SettingsCard({ icon, title, subtitle, children, delay = 0 }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: `1px solid ${HOME.border}`,
        borderRadius: "18px",
        boxShadow: HOME.shadowSm,
        overflow: "hidden",
        animation: `${fadeUp} 0.45s ease both`,
        animationDelay: `${delay}ms`,
        height: "100%",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          boxShadow: HOME.shadowMd,
          borderColor: "rgba(27,94,168,0.22)",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        sx={{
          px: { xs: 2, sm: 2.25 },
          py: { xs: 1.5, lg: 1.15 },
          bgcolor: "rgba(27,94,168,0.045)",
          borderBottom: `1px solid ${HOME.border}`,
        }}
      >
        <Box
          sx={{
            width: { xs: 40, lg: 36 },
            height: { xs: 40, lg: 36 },
            borderRadius: "11px",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: `linear-gradient(135deg, ${HOME.green}, #0E3D73)`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontSize: { xs: "1.15rem", lg: "1.1rem" },
              fontWeight: 700,
              color: HOME.navyDeep,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.78rem", color: HOME.inkSoft }}>
            {subtitle}
          </Typography>
        </Box>
      </Stack>
      <Box sx={{ p: { xs: 2, sm: 2.25, lg: 1.85 } }}>{children}</Box>
    </Box>
  );
}

export default function StudentSettings({ student, onStudentUpdate, onLogout }) {
  const [profile, setProfile] = useState({
    full_name: student.full_name || "",
    email: student.email || "",
    phone: student.phone || "",
  });
  const [profileFile, setProfileFile] = useState(null);
  const [preview, setPreview] = useState(student.profile_image_url || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setProfile({
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
    });
    if (!profileFile) setPreview(student.profile_image_url || "");
  }, [student, profileFile]);

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setProfileFile(file);
    setPreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!profile.full_name.trim() || !profile.email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Details required",
        text: "Name and email are required.",
        confirmButtonColor: HOME.green,
      });
      return;
    }

    setSavingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const body = new FormData();
      body.append("full_name", profile.full_name.trim());
      body.append("email", profile.email.trim());
      body.append("phone", profile.phone.trim());
      if (profileFile) body.append("profile_image", profileFile);

      const response = await fetch(`/api/users/${student.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || "Could not update profile");

      onStudentUpdate(data.data);
      setProfileFile(null);
      setPreview(data.data.profile_image_url || "");
      Swal.fire({
        icon: "success",
        title: "Profile updated",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: error.message,
        confirmButtonColor: HOME.green,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (!password.current) {
      Swal.fire({
        icon: "warning",
        title: "Current password required",
        text: "Enter your current password to continue.",
        confirmButtonColor: HOME.green,
      });
      return;
    }
    if (password.next.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Password too short",
        text: "Use at least 8 characters.",
        confirmButtonColor: HOME.green,
      });
      return;
    }
    if (password.next !== password.confirm) {
      Swal.fire({
        icon: "warning",
        title: "Passwords do not match",
        text: "Confirm the same new password.",
        confirmButtonColor: HOME.green,
      });
      return;
    }

    setSavingPassword(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${student.id}/password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: password.current,
          new_password: password.next,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || "Could not change password");

      setPassword({ current: "", next: "", confirm: "" });

      await Swal.fire({
        icon: "success",
        title: "Password changed",
        html: "Your password was updated successfully.<br/>You will be signed out shortly — please sign in with your new password.",
        timer: 3200,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: "Sign in now",
        confirmButtonColor: HOME.green,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      onLogout?.();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Password not changed",
        text: error.message,
        confirmButtonColor: HOME.green,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const passwordField = (key, label) => (
    <TextField
      label={label}
      type={showPassword[key] ? "text" : "password"}
      fullWidth
      required
      size="small"
      value={password[key]}
      onChange={(event) => setPassword((old) => ({ ...old, [key]: event.target.value }))}
      sx={settingsInputSx}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LockOutlinedIcon sx={{ color: HOME.green, fontSize: 18 }} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              aria-label={showPassword[key] ? `Hide ${label}` : `Show ${label}`}
              onClick={() => setShowPassword((old) => ({ ...old, [key]: !old[key] }))}
            >
              {showPassword[key] ? (
                <VisibilityOffOutlinedIcon fontSize="small" />
              ) : (
                <VisibilityOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  const fieldIcon = (Icon) => (
    <InputAdornment position="start">
      <Icon sx={{ color: HOME.green, fontSize: 18 }} />
    </InputAdornment>
  );

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 68px)",
        bgcolor: HOME.cream,
        px: { xs: 1.5, sm: 3, lg: 4 },
        pt: { xs: 1.25, md: 1.75 },
        pb: { xs: 2.5, md: 2 },
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontFamily: HOME.fontDisplay,
          fontWeight: 700,
          fontSize: { xs: "1.8rem", sm: "2rem" },
          color: HOME.navyDeep,
          lineHeight: 1.1,
        }}
      >
        Settings
      </Typography>
      <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkMuted, mt: 0.25, mb: 1.5, fontSize: "0.92rem" }}>
        Keep your personal details current and your account secure.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.15fr) minmax(0, 1fr)" },
          gap: { xs: 2, lg: 2.5 },
          alignItems: "start",
        }}
      >
        <SettingsCard
          icon={<PersonOutlineRoundedIcon fontSize="small" />}
          title="Profile"
          subtitle="Update your photo and personal information"
        >
          <Box component="form" onSubmit={saveProfile}>
            <Stack spacing={1.75}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ position: "relative", flexShrink: 0 }}>
                  <Avatar
                    src={preview || undefined}
                    alt={profile.full_name}
                    sx={{
                      width: { xs: 72, sm: 84 },
                      height: { xs: 72, sm: 84 },
                      bgcolor: HOME.green,
                      fontFamily: HOME.fontBody,
                      fontWeight: 800,
                      fontSize: "1.65rem",
                      border: `3px solid ${HOME.gold}`,
                      boxShadow: HOME.shadowSm,
                    }}
                  >
                    {firstName(profile.full_name).charAt(0).toUpperCase()}
                  </Avatar>
                  <IconButton
                    component="label"
                    aria-label="Change profile photo"
                    size="small"
                    sx={{
                      position: "absolute",
                      right: -6,
                      bottom: -2,
                      bgcolor: HOME.green,
                      color: "#fff",
                      border: "2px solid #fff",
                      width: 32,
                      height: 32,
                      "&:hover": { bgcolor: "#0E3D73" },
                    }}
                  >
                    <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
                    <input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={choosePhoto} />
                  </IconButton>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: HOME.fontBody,
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: HOME.navyDeep,
                      lineHeight: 1.25,
                    }}
                  >
                    Profile photo
                  </Typography>
                  <Typography sx={{ fontFamily: HOME.fontBody, color: HOME.inkSoft, fontSize: "0.75rem", mt: 0.25 }}>
                    JPG, PNG or WebP · tap the camera to change
                  </Typography>
                </Box>
              </Stack>

              <TextField
                label="Full name"
                required
                fullWidth
                size="small"
                value={profile.full_name}
                onChange={(event) => setProfile((old) => ({ ...old, full_name: event.target.value }))}
                sx={settingsInputSx}
                InputProps={{ startAdornment: fieldIcon(PersonOutlineRoundedIcon) }}
              />
              <TextField
                label="Email address"
                type="email"
                required
                fullWidth
                size="small"
                value={profile.email}
                onChange={(event) => setProfile((old) => ({ ...old, email: event.target.value }))}
                sx={settingsInputSx}
                InputProps={{ startAdornment: fieldIcon(EmailOutlinedIcon) }}
              />
              <TextField
                label="Phone number"
                fullWidth
                size="small"
                value={profile.phone}
                onChange={(event) => setProfile((old) => ({ ...old, phone: event.target.value }))}
                sx={settingsInputSx}
                InputProps={{ startAdornment: fieldIcon(PhoneOutlinedIcon) }}
              />
              <TextField
                label="Admission number"
                fullWidth
                size="small"
                value={student.admission_number || ""}
                disabled
                helperText="Contact the school if this needs correction."
                sx={settingsInputSx}
                InputProps={{ startAdornment: fieldIcon(BadgeOutlinedIcon) }}
              />
              <Box sx={{ display: "flex", justifyContent: { xs: "stretch", sm: "flex-end" }, pt: 0.25 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={savingProfile}
                  startIcon={savingProfile ? <CircularProgress size={17} color="inherit" /> : <SaveRoundedIcon />}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    textTransform: "none",
                    fontFamily: HOME.fontBody,
                    fontWeight: 800,
                    borderRadius: "12px",
                    px: 3,
                    py: { xs: 1.1, lg: 0.85 },
                    bgcolor: HOME.green,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#0E3D73", boxShadow: "none" },
                  }}
                >
                  {savingProfile ? "Saving…" : "Save profile"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </SettingsCard>

        <SettingsCard
          icon={<LockOutlinedIcon fontSize="small" />}
          title="Password"
          subtitle="Choose a strong password you do not use elsewhere"
          delay={80}
        >
          <Box component="form" onSubmit={savePassword}>
            <Stack spacing={1.75}>
              {passwordField("current", "Current password")}
              {passwordField("next", "New password")}
              {passwordField("confirm", "Confirm new password")}
              <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.76rem", color: HOME.inkSoft, lineHeight: 1.45 }}>
                Use at least 8 characters. After changing your password you will be signed out and asked to sign in again.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: { xs: "stretch", sm: "flex-end" }, pt: 0.25 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={savingPassword}
                  startIcon={savingPassword ? <CircularProgress size={17} color="inherit" /> : <LockOutlinedIcon />}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    textTransform: "none",
                    fontFamily: HOME.fontBody,
                    fontWeight: 800,
                    borderRadius: "12px",
                    px: 3,
                    py: { xs: 1.1, lg: 0.85 },
                    bgcolor: HOME.navyDeep,
                    boxShadow: "none",
                    "&:hover": { bgcolor: HOME.navy, boxShadow: "none" },
                  }}
                >
                  {savingPassword ? "Updating…" : "Change password"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </SettingsCard>
      </Box>
    </Box>
  );
}
