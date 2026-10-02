import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Stack, keyframes, IconButton, Tooltip } from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { HOME } from "../components/Home/homeShared";
import { HomeSectionShell } from "../components/Home/homeUi";
import Footer from "../components/Footer/Footer";
import BrandPageLoader from "../components/common/BrandPageLoader";
import useBrandImageSrc from "../hooks/useBrandImageSrc";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

/** Always 3 tracks on desktop so 1 sits left, 2 sit side-by-side, 3 fill the row. */
function staffGridColumns() {
  return {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
  };
}

function StaffCard({ person, index }) {
  const { src: photoSrc, usingLogo, onError } = useBrandImageSrc(person.profile_image_url);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "5 / 4",
        overflow: "hidden",
        border: `1px solid ${HOME.border}`,
        bgcolor: usingLogo ? "#fff" : HOME.green,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "@media (prefers-reduced-motion: no-preference)": {
          animation: `${fadeUp} 0.55s ease both`,
          animationDelay: `${Math.min(index, 8) * 0.06}s`,
        },
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: HOME.shadowSm,
          "& .staff-photo": { transform: "scale(1.04)" },
        },
      }}
    >
      <Box
        className="staff-photo"
        component="img"
        src={photoSrc}
        alt={person.full_name}
        onError={onError}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: usingLogo ? "contain" : "cover",
          objectPosition: usingLogo ? "center" : "center top",
          p: usingLogo ? { xs: 3, sm: 4 } : 0,
          display: "block",
          transition: "transform 0.45s ease",
          bgcolor: usingLogo ? "rgba(27,94,168,0.06)" : "transparent",
        }}
      />

      {/* Bottom gradient so text stays readable on the photo */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: usingLogo
            ? "linear-gradient(180deg, transparent 35%, rgba(8,22,43,0.62) 70%, rgba(8,22,43,0.9) 100%)"
            : "linear-gradient(180deg, transparent 42%, rgba(8,22,43,0.55) 72%, rgba(8,22,43,0.88) 100%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          px: 2,
          pb: 1.75,
          pt: 3,
          zIndex: 1,
        }}
      >
        <Typography
          component="h3"
          sx={{
            fontFamily: HOME.fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "1.15rem", sm: "1.3rem" },
            color: "#fff",
            lineHeight: 1.2,
            mb: 0.35,
            textShadow: "0 1px 8px rgba(0,0,0,0.35)",
          }}
        >
          {person.full_name}
        </Typography>

        {person.position ? (
          <Typography
            sx={{
              fontFamily: HOME.fontBody,
              fontWeight: 600,
              fontSize: "0.85rem",
              color: HOME.goldMuted,
              lineHeight: 1.35,
              mb: person.phone ? 0.75 : 0,
            }}
          >
            {person.position}
          </Typography>
        ) : null}

        {person.phone ? (
          <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            component="a"
            href={`tel:${person.phone.replace(/\s+/g, "")}`}
            sx={{
              textDecoration: "none",
              color: "rgba(255,255,255,0.88)",
              width: "fit-content",
              "&:hover": { color: HOME.goldMuted },
            }}
          >
            <PhoneOutlinedIcon sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>{person.phone}</Typography>
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}

export default function MeetOurTeam() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/users/public/staff");
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Could not load staff directory");
        }
        if (!cancelled) setStaff(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Could not load staff directory");
          setStaff([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const count = staff.length;

  if (loading) {
    return <BrandPageLoader message="Loading team…" />;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: HOME.cream, display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${HOME.green} 0%, #0E3D73 100%)`,
          pt: { xs: 2, md: 3 },
          pb: { xs: 2.5, md: 3.5 },
        }}
      >
        {/* Mobile: arrow in flow so text never overlaps */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "flex-start",
            gap: 1,
            px: 1.25,
          }}
        >
          <Tooltip title="Back to About Us" arrow placement="right">
            <IconButton
              aria-label="Back to About Us"
              onClick={() => navigate("/about-us")}
              sx={{
                flexShrink: 0,
                mt: 0.15,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.28)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1, minWidth: 0, textAlign: "center", pr: 5 }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: "1.5rem",
                lineHeight: 1.15,
                color: "#fff",
                mb: 0.75,
              }}
            >
              Meet our{" "}
              <Box component="span" sx={{ color: HOME.goldMuted }}>
                staff
              </Box>
            </Typography>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.82rem",
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              Educators and clinicians dedicated to forming skilled, compassionate healthcare
              professionals at KASMS.
            </Typography>
          </Box>
        </Box>

        {/* Desktop: arrow far left, title centered */}
        <Box sx={{ display: { xs: "none", md: "block" }, position: "relative" }}>
          <Tooltip title="Back to About Us" arrow placement="right">
            <IconButton
              aria-label="Back to About Us"
              onClick={() => navigate("/about-us")}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.28)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ px: 3, maxWidth: 960, mx: "auto", textAlign: "center" }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: HOME.fontDisplay,
                fontWeight: 700,
                fontSize: { md: "2.1rem" },
                lineHeight: 1.15,
                color: "#fff",
                mb: 0.75,
              }}
            >
              Meet our{" "}
              <Box component="span" sx={{ color: HOME.goldMuted }}>
                staff
              </Box>
            </Typography>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontSize: "0.95rem",
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.88)",
                maxWidth: 480,
                mx: "auto",
              }}
            >
              Educators and clinicians dedicated to forming skilled, compassionate healthcare
              professionals at KASMS.
            </Typography>
          </Box>
        </Box>
      </Box>

      <HomeSectionShell
        bg={{
          py: { xs: 2.5, md: 3.5 },
          px: 0,
          bgcolor: HOME.warmWhite,
          position: "relative",
          zIndex: 2,
          flex: 1,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            mx: 0,
            px: 0,
            pb: { xs: 3, md: 4 },
          }}
        >
          {error ? (
            <Box sx={{ py: 8, px: 3, textAlign: "center", bgcolor: "#fff" }}>
              <Typography sx={{ color: HOME.navyDeep, fontWeight: 700, mb: 1 }}>
                Unable to load staff
              </Typography>
              <Typography sx={{ color: HOME.inkMuted }}>{error}</Typography>
            </Box>
          ) : count === 0 ? (
            <Box
              sx={{
                py: { xs: 8, md: 10 },
                px: 3,
                textAlign: "center",
                bgcolor: "#fff",
                border: `1px solid ${HOME.border}`,
              }}
            >
              <GroupsOutlinedIcon sx={{ fontSize: 48, color: HOME.green, mb: 2, opacity: 0.9 }} />
              <Typography
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: HOME.navyDeep,
                  mb: 1,
                }}
              >
                Profiles coming soon
              </Typography>
              <Typography sx={{ color: HOME.inkMuted, lineHeight: 1.75, maxWidth: 420, mx: "auto" }}>
                Staff will appear here once they are published from the school admin.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: staffGridColumns(),
                gap: { xs: 1, sm: 1.25, md: 1.5 },
                alignItems: "stretch",
                justifyContent: "start",
                width: "100%",
                pl: { xs: 1.25, sm: 1.5, md: 2 },
                pr: { xs: 1.25, sm: 1.5, md: 2 },
              }}
            >
              {staff.map((person, index) => (
                <StaffCard key={person.id} person={person} index={index} />
              ))}
            </Box>
          )}
        </Box>
      </HomeSectionShell>
      <Footer />
    </Box>
  );
}
