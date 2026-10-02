import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Divider,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import LocalLibraryRoundedIcon from "@mui/icons-material/LocalLibraryRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ChurchRoundedIcon from "@mui/icons-material/ChurchRounded";
import BrandLogoMark from "../common/BrandLogoMark";
import StudentNotificationsBell from "./StudentNotificationsBell";
import { HOME, firstName } from "./studentPortalShared";

/** Hamburger bars that morph into an X when open. */
function BurgerIcon({ open }) {
  const barSx = {
    display: "block",
    width: 20,
    height: 2.4,
    borderRadius: 2,
    bgcolor: HOME.navyDeep,
    transition: "transform 0.3s ease, opacity 0.25s ease",
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "5px", width: 20 }}>
      <Box sx={{ ...barSx, transform: open ? "translateY(7.4px) rotate(45deg)" : "none" }} />
      <Box sx={{ ...barSx, opacity: open ? 0 : 1 }} />
      <Box sx={{ ...barSx, transform: open ? "translateY(-7.4px) rotate(-45deg)" : "none" }} />
    </Box>
  );
}

/** Sticky, responsive top bar: logo left, nav centered, avatar + name far right (burger on mobile). */
export default function StudentNavbar({ student, activePage, onNavigate, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const mobileOpen = Boolean(mobileAnchorEl);

  const navButtonSx = (page, Icon, label) => (
    <Button
      onClick={() => onNavigate(page)}
      startIcon={<Icon sx={{ fontSize: "1.15rem !important" }} />}
      sx={{
        textTransform: "none",
        fontFamily: HOME.fontBody,
        fontWeight: 700,
        fontSize: "0.9rem",
        color: activePage === page ? HOME.green : HOME.inkMuted,
        px: 1.75,
        borderRadius: "999px",
        bgcolor: activePage === page ? "rgba(27,94,168,0.08)" : "transparent",
        "&:hover": { bgcolor: "rgba(27,94,168,0.14)" },
      }}
    >
      {label}
    </Button>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${HOME.border}`,
        color: HOME.ink,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 60, md: 68 }, gap: 1, px: { xs: 1.5, sm: 3 } }}>
        {/* Brand — logo only */}
        <BrandLogoMark
          size={40}
          sx={{ height: 40, width: 40, flexShrink: 0, mr: 1 }}
          imgSx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
        />

        {/* Nav items — desktop, centered */}
        <Stack
          direction="row"
          spacing={0.25}
          justifyContent="center"
          sx={{ flex: 1, minWidth: 0, display: { xs: "none", md: "flex" } }}
        >
          {navButtonSx("home", HomeRoundedIcon, "Home")}
          {navButtonSx("programme", SchoolRoundedIcon, "My programme")}
          {navButtonSx("timetable", CalendarMonthRoundedIcon, "Timetable")}
          {navButtonSx("transcript", DescriptionRoundedIcon, "Transcript")}
          {navButtonSx("fees", AccountBalanceWalletRoundedIcon, "Fees")}
          {navButtonSx("library", LocalLibraryRoundedIcon, "Library")}
          {navButtonSx("church", ChurchRoundedIcon, "Church")}
          {navButtonSx("settings", SettingsRoundedIcon, "Settings")}
        </Stack>

        <StudentNotificationsBell sx={{ ml: { xs: "auto", md: 0 }, flexShrink: 0 }} />

        {/* Student name + profile picture — far right (desktop) */}
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: { xs: "none", md: "flex" },
            cursor: "pointer",
            pl: 1.25,
            pr: 0.5,
            py: 0.5,
            borderRadius: "999px",
            transition: "background 0.2s ease",
            "&:hover": { bgcolor: "rgba(12,35,64,0.05)" },
          }}
        >
          <Box sx={{ minWidth: 0, textAlign: "right" }}>
            <Typography
              noWrap
              sx={{
                fontFamily: HOME.fontBody,
                fontWeight: 700,
                fontSize: "0.88rem",
                color: HOME.navyDeep,
                lineHeight: 1.2,
                maxWidth: { sm: 160, md: 220 },
              }}
            >
              {student.full_name}
            </Typography>
            <Typography
              noWrap
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.72rem",
                color: HOME.inkSoft,
                maxWidth: { sm: 160, md: 220 },
              }}
            >
              {student.admission_number || "Student"}
            </Typography>
          </Box>
          <Avatar
            src={student.profile_image_url || undefined}
            alt={student.full_name}
            sx={{
              width: 42,
              height: 42,
              bgcolor: HOME.green,
              color: "#fff",
              fontFamily: HOME.fontBody,
              fontWeight: 800,
              fontSize: "1rem",
              border: `2px solid ${HOME.gold}`,
            }}
          >
            {firstName(student.full_name).charAt(0).toUpperCase()}
          </Avatar>
        </Stack>

        {/* Hamburger — far right on small screens */}
        <IconButton
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={(e) => setMobileAnchorEl(mobileOpen ? null : e.currentTarget)}
          sx={{
            display: { xs: "inline-flex", md: "none" },
            width: 42,
            height: 42,
            borderRadius: "12px",
            border: `1px solid ${HOME.border}`,
            bgcolor: mobileOpen ? "rgba(27,94,168,0.08)" : "transparent",
          }}
        >
          <BurgerIcon open={mobileOpen} />
        </IconButton>

        {/* Mobile dropdown — student identity, items, sign out */}
        <Menu
          anchorEl={mobileAnchorEl}
          open={mobileOpen}
          onClose={() => setMobileAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.25,
                borderRadius: "16px",
                minWidth: 230,
                border: `1px solid ${HOME.border}`,
                boxShadow: HOME.shadowMd,
              },
            },
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 2, py: 1.25 }}>
            <Avatar
              src={student.profile_image_url || undefined}
              alt={student.full_name}
              sx={{
                width: 38,
                height: 38,
                bgcolor: HOME.green,
                color: "#fff",
                fontFamily: HOME.fontBody,
                fontWeight: 800,
                fontSize: "0.92rem",
                border: `2px solid ${HOME.gold}`,
              }}
            >
              {firstName(student.full_name).charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ fontFamily: HOME.fontBody, fontWeight: 700, fontSize: "0.88rem", color: HOME.navyDeep, maxWidth: 150 }}
              >
                {student.full_name}
              </Typography>
              <Typography
                noWrap
                sx={{ fontFamily: HOME.fontBody, fontSize: "0.72rem", color: HOME.inkSoft, maxWidth: 150 }}
              >
                {student.admission_number || "Student"}
              </Typography>
            </Box>
          </Stack>
          <Divider />
          <MenuItem
            onClick={() => {
              setMobileAnchorEl(null);
              onNavigate("home");
            }}
            sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.88rem", py: 1.15 }}
          >
            <ListItemIcon>
              <HomeRoundedIcon fontSize="small" sx={{ color: HOME.green }} />
            </ListItemIcon>
            Home
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMobileAnchorEl(null);
              onNavigate("programme");
            }}
            sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.88rem", py: 1.15 }}
          >
            <ListItemIcon>
              <SchoolRoundedIcon fontSize="small" sx={{ color: HOME.green }} />
            </ListItemIcon>
            My programme
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMobileAnchorEl(null);
              onNavigate("timetable");
            }}
            sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.88rem", py: 1.15 }}
          >
            <ListItemIcon>
              <CalendarMonthRoundedIcon fontSize="small" sx={{ color: HOME.green }} />
            </ListItemIcon>
            Timetable
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMobileAnchorEl(null);
              onNavigate("transcript");
            }}
            sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.88rem", py: 1.15 }}
          >
            <ListItemIcon>
              <DescriptionRoundedIcon fontSize="small" sx={{ color: HOME.green }} />
            </ListItemIcon>
            Transcript
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMobileAnchorEl(null);
              onNavigate("fees");
            }}
            sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.88rem", py: 1.15 }}
          >
            <ListItemIcon>
              <AccountBalanceWalletRoundedIcon fontSize="small" sx={{ color: HOME.green }} />
            </ListItemIcon>
            Fees
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMobileAnchorEl(null);
              onNavigate("library");
            }}
            sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.88rem", py: 1.15 }}
          >
            <ListItemIcon>
              <LocalLibraryRoundedIcon fontSize="small" sx={{ color: HOME.green }} />
            </ListItemIcon>
            Library
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMobileAnchorEl(null);
              onNavigate("church");
            }}
            sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.88rem", py: 1.15 }}
          >
            <ListItemIcon>
              <ChurchRoundedIcon fontSize="small" sx={{ color: HOME.green }} />
            </ListItemIcon>
            Church
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMobileAnchorEl(null);
              onNavigate("settings");
            }}
            sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.88rem", py: 1.15 }}
          >
            <ListItemIcon>
              <SettingsRoundedIcon fontSize="small" sx={{ color: HOME.green }} />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={onLogout}
            sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.88rem", py: 1.15 }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" sx={{ color: HOME.green }} />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>

        {/* Desktop avatar dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                borderRadius: "14px",
                minWidth: 220,
                border: `1px solid ${HOME.border}`,
                boxShadow: HOME.shadowMd,
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.25 }}>
            <Typography sx={{ fontFamily: HOME.fontBody, fontWeight: 700, fontSize: "0.9rem", color: HOME.navyDeep }} noWrap>
              {student.full_name}
            </Typography>
            <Typography sx={{ fontFamily: HOME.fontBody, fontSize: "0.75rem", color: HOME.inkSoft }} noWrap>
              {student.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={onLogout}
            sx={{ fontFamily: HOME.fontBody, fontWeight: 600, fontSize: "0.88rem", py: 1.25 }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" sx={{ color: HOME.green }} />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
