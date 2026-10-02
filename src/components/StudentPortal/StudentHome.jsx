import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Stack, Chip } from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { HOME, fadeUp, firstName } from "./studentPortalShared";
import StudentUnitsCard from "./StudentUnitsCard";
import StudentMealCard from "./StudentMealCard";
import StudentNoticesCard from "./StudentNoticesCard";

export default function StudentHome({ student }) {
  const [programmeName, setProgrammeName] = useState(student?.programme?.name || "");

  // Login payload only carries programme_id — resolve the display name
  useEffect(() => {
    const pid = student?.programme_id;
    if (!pid || programmeName) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/programmes/${pid}`);
        const json = await res.json();
        if (active && res.ok && json.success && json.data?.name) {
          setProgrammeName(json.data.name);
        }
      } catch {
        /* chip simply omitted */
      }
    })();
    return () => {
      active = false;
    };
  }, [student, programmeName]);

  const yearSemester = useMemo(() => {
    const parts = [];
    if (student.year_of_study) parts.push(`Year ${student.year_of_study}`);
    if (student.semester) parts.push(`Semester ${student.semester}`);
    return parts.length ? parts.join(" · ") : null;
  }, [student]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          bgcolor: HOME.green,
          pl: { xs: 1.25, sm: 1.5 },
          pr: { xs: 2, sm: 3 },
          py: { xs: 2.25, sm: 2.75, md: 3 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -70,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: "rgba(200,168,64,0.16)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -90,
            left: "24%",
            width: 180,
            height: 180,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1, animation: `${fadeUp} 0.6s ease both` }}>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: HOME.goldMuted,
              mb: 0.4,
            }}
          >
            {greeting} · {todayLabel}
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.55rem", sm: "1.85rem", md: "2.1rem" },
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            Welcome, {firstName(student.full_name)}
            <Box
              component="span"
              sx={{
                display: "block",
                width: 56,
                height: 3,
                mt: 0.75,
                borderRadius: 2,
                bgcolor: HOME.gold,
              }}
            />
          </Typography>
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontSize: { xs: "0.88rem", md: "0.95rem" },
              color: "rgba(255,255,255,0.85)",
              maxWidth: 620,
              lineHeight: 1.5,
            }}
          >
            Glad to have you back at Kendu Adventist School of Medical Sciences.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
            {yearSemester ? (
              <Chip
                size="small"
                icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 15, color: "#fff !important" }} />}
                label={yearSemester}
                sx={{
                  bgcolor: "rgba(255,255,255,0.14)",
                  color: "#fff",
                  fontWeight: 700,
                  fontFamily: HOME.fontBody,
                  border: "1px solid rgba(255,255,255,0.22)",
                  px: 0.5,
                }}
              />
            ) : null}
            {programmeName ? (
              <Chip
                size="small"
                icon={<SchoolOutlinedIcon sx={{ fontSize: 15, color: "#fff !important" }} />}
                label={programmeName}
                sx={{
                  bgcolor: "rgba(200,168,64,0.22)",
                  color: "#fff",
                  fontWeight: 700,
                  fontFamily: HOME.fontBody,
                  border: "1px solid rgba(200,168,64,0.45)",
                  px: 0.5,
                }}
              />
            ) : null}
          </Stack>
        </Box>
      </Box>

      <StudentUnitsCard student={student} />
      <StudentMealCard />
      <StudentNoticesCard />
    </Box>
  );
}
