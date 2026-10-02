import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Chip, Stack } from "@mui/material";
import {
  HistoryEdu,
  Business,
  CheckCircle,
  Verified,
  ArrowForward,
  SchoolOutlined,
  EmojiEventsOutlined,
  LocalHospitalOutlined,
} from "@mui/icons-material";
import { HOME } from "../components/Home/homeShared";
import {
  HomeSectionHeader,
  HomeSectionShell,
  HomePrimaryButton,
  HomeGhostButton,
} from "../components/Home/homeUi";
import DicedImageGrid from "../components/About/DicedImageGrid";

const SLIDE_INTERVAL_MS = 6500;

const ABOUT_PAGE_IMAGES = [
  "kendu 1.jpg",
  "kendu 2.jpg",
  "kendu 3.jpg",
  "kendu 4.jpg",
];

const STATS = [
  { value: "2011", label: "Department founded", icon: <SchoolOutlined /> },
  { value: "100%", label: "Pass rate (2018 & 2020)", icon: <EmojiEventsOutlined /> },
  { value: "Clinical", label: "Hospital partnerships", icon: <LocalHospitalOutlined /> },
];

function aboutPublicUrl(filename) {
  return `/images/${encodeURIComponent(filename)}`;
}

const sectionPad = { px: { xs: 1.25, sm: 1.5, md: 2 } };

const cardShellSx = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 3,
  overflow: "hidden",
  bgcolor: "#fff",
  border: `1px solid ${HOME.border}`,
  boxShadow: HOME.shadowSm,
  transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: HOME.shadowMd,
    borderColor: HOME.borderGold,
    transform: "translateY(-4px)",
  },
};

function AboutHero({ slideIndex, onSelectSlide, imageUrls, onApply, onMeetStaff }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        minHeight: { xs: "auto", lg: "min(88vh, 720px)" },
        width: "100%",
      }}
    >
      <Box
        sx={{
          position: "relative",
          flex: { lg: "1 1 55%" },
          minHeight: { xs: 320, sm: 400, lg: "auto" },
          overflow: "hidden",
        }}
      >
        {imageUrls.map((src, i) => (
          <Box
            key={src}
            component="img"
            src={src}
            alt={`${HOME.name} campus life`}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === slideIndex ? 1 : 0,
              transform: i === slideIndex ? "scale(1)" : "scale(1.04)",
              transition: "opacity 1.8s ease-in-out, transform 8s ease-out",
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(8,22,43,0.15) 0%, rgba(8,22,43,0.05) 40%, rgba(8,22,43,0.45) 100%)",
            pointerEvents: "none",
          }}
        />
        <Stack direction="row" spacing={0.75} sx={{ position: "absolute", bottom: 20, left: 20 }}>
          {imageUrls.map((_, i) => (
            <Box
              key={i}
              component="button"
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => onSelectSlide(i)}
              sx={{
                width: i === slideIndex ? 28 : 8,
                height: 8,
                p: 0,
                border: "none",
                borderRadius: "999px",
                cursor: "pointer",
                bgcolor: i === slideIndex ? HOME.gold : "rgba(255,255,255,0.45)",
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          flex: { lg: "1 1 45%" },
          display: "flex",
          alignItems: "center",
          bgcolor: HOME.warmWhite,
          borderLeft: { lg: `1px solid ${HOME.border}` },
          px: { xs: 2.5, sm: 3.5, lg: 5 },
          py: { xs: 4, sm: 5, lg: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 520 }}>
          <Chip
            label="About our school"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              height: 28,
              bgcolor: "rgba(27, 94, 168, 0.1)",
              color: HOME.green,
              border: "1px solid rgba(27, 94, 168, 0.22)",
            }}
          />
          <Typography
            component="h1"
            sx={{
              fontFamily: HOME.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "2.35rem", sm: "2.75rem", lg: "3.1rem" },
              lineHeight: 1.1,
              color: HOME.navyDeep,
              mb: 1.5,
            }}
          >
            History &{" "}
            <Box component="span" sx={{ color: HOME.gold }}>
              KASMS facilities
            </Box>
          </Typography>

          <Typography
            sx={{
              color: HOME.green,
              fontWeight: 700,
              fontSize: { xs: "0.95rem", md: "1.02rem" },
              lineHeight: 1.5,
              mb: 2,
            }}
          >
            A legacy of clinical excellence — and a campus built to grow with it.
          </Typography>

          <Typography
            sx={{
              color: HOME.inkMuted,
              fontSize: { xs: "1rem", md: "1.08rem" },
              lineHeight: 1.75,
              mb: 2,
            }}
          >
            Kendu Adventist School of Medical Sciences (KASMS) is committed to quality medical
            training that aligns with the highest standards.
          </Typography>
          <Typography
            sx={{
              color: HOME.inkMuted,
              fontSize: { xs: "1rem", md: "1.08rem" },
              lineHeight: 1.75,
              mb: 3.5,
            }}
          >
            From our Clinical Medicine roots in 2011 to a growing campus of classrooms, labs, and
            clinical partnerships — we prepare graduates for healthcare excellence.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <HomePrimaryButton endIcon={<ArrowForward />} onClick={onMeetStaff}>
              Meet our staff
            </HomePrimaryButton>
            <HomeGhostButton onClick={onApply}>Apply for admission</HomeGhostButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function PillarCard({ eyebrow, headline, subline, icon: Icon, items, checkIcon: CheckIcon }) {
  return (
    <Box sx={cardShellSx}>
      <Box sx={{ height: 4, background: HOME.navyGradient, flexShrink: 0 }} />
      <Box sx={{ p: { xs: 2.5, md: 3.5 }, flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
          <Typography
            sx={{
              color: HOME.gold,
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            {eyebrow}
          </Typography>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: "rgba(201, 162, 39, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: 26, color: HOME.gold }} />
          </Box>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: HOME.fontDisplay,
              fontSize: { xs: "2rem", md: "2.35rem" },
              fontWeight: 700,
              color: HOME.navyDeep,
              lineHeight: 1.1,
            }}
          >
            {headline}
          </Typography>
          <Typography sx={{ color: HOME.gold, fontWeight: 700, fontSize: "1rem", mt: 0.5 }}>
            {subline}
          </Typography>
        </Box>
        <Stack spacing={2} sx={{ mt: "auto" }}>
          {items.map((text) => (
            <Stack key={text.slice(0, 48)} direction="row" spacing={1.5} alignItems="flex-start">
              <CheckIcon sx={{ color: HOME.gold, fontSize: 22, mt: 0.25, flexShrink: 0 }} />
              <Typography sx={{ color: HOME.inkMuted, lineHeight: 1.65, fontSize: "0.98rem" }}>
                {text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default function Team() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const imageUrls = ABOUT_PAGE_IMAGES.map(aboutPublicUrl);
  const campusSlides = [
    { title: "Campus life", image: imageUrls[0] },
    { title: "Clinical training", image: imageUrls[1] },
    { title: "Learning together", image: imageUrls[2] },
    { title: "Campus grounds", image: imageUrls[3] },
  ];

  useEffect(() => {
    if (imageUrls.length <= 1) return undefined;
    const id = window.setInterval(
      () => setSlideIndex((i) => (i + 1) % imageUrls.length),
      SLIDE_INTERVAL_MS
    );
    return () => window.clearInterval(id);
  }, [imageUrls.length]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: HOME.cream,
        display: "flex",
        flexDirection: "column",
        fontFamily: HOME.fontBody,
        width: "100%",
      }}
    >
      <HomeSectionShell
        id="about-hero"
        bg={{ bgcolor: HOME.warmWhite }}
        sx={{ borderBottom: `1px solid ${HOME.border}` }}
      >
        <AboutHero
          slideIndex={slideIndex}
          onSelectSlide={setSlideIndex}
          imageUrls={imageUrls}
          onApply={() =>
            navigate("/admission/apply", { state: { from: "/about-us", fromLabel: "About us" } })
          }
          onMeetStaff={() => navigate("/meet-our-team")}
        />
      </HomeSectionShell>

      {/* History & KASMS Facility — same two-card layout as Mission & Vision */}
      <HomeSectionShell id="history-facilities" bg={{ py: { xs: 5, md: 7 }, bgcolor: HOME.cream }}>
        <Box sx={{ ...sectionPad, width: "100%" }}>
          <HomeSectionHeader
            eyebrow="Our story"
            title="History &"
            titleAccent="facilities"
            subtitle="The journey of KASMS and the campus that supports medical education and clinical practice."
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: 2, md: 2.5 },
              width: "100%",
            }}
          >
            <PillarCard
              eyebrow="History"
              headline="Since 2011"
              subline="Clinical Medicine roots"
              icon={HistoryEdu}
              checkIcon={CheckCircle}
              items={[
                "Kendu Adventist School of Medical Sciences (KASMS) traces its roots back to September 2011 with the establishment of the Department of Clinical Medicine. Since then, the institution has been committed to providing quality training that aligns with the highest standards.",
                "This dedication was exemplified by the remarkable achievement of recording a 100% pass rate in the Clinical Officers’ Council Pre-Internship standardization examination for both the September 2018 and 2020 classes.",
                "The school’s resources, both existing and those slated for development, are geared towards fostering an environment conducive to learning and innovation, ensuring that graduates are equipped to meet the evolving demands of the healthcare sector.",
              ]}
            />
            <PillarCard
              eyebrow="KASMS Facility"
              headline="Campus"
              subline="Built for medical education"
              icon={Business}
              checkIcon={Verified}
              items={[
                "KASMS has a range of facilities for medical education. These include an Administration Block, Departmental offices, classrooms, and partnerships with various hospitals and rural health centers for practical training.",
                "The institution also provides access to well-equipped libraries, skills labs, hostels, and recreational facilities.",
                "Looking ahead, KASMS is committed to further enhancing its facilities, with plans for science laboratories and additional classrooms.",
              ]}
            />
          </Box>
        </Box>
      </HomeSectionShell>

      {/* Campus collage — same diced-grid layout as before */}
      <HomeSectionShell bg={{ pt: { xs: 1.25, md: 1.75 }, pb: { xs: 5, md: 7 }, bgcolor: "#fff" }}>
        <Box sx={{ ...sectionPad, width: "100%" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: { xs: 4, lg: 5 },
              alignItems: "center",
            }}
          >
            <Box>
              <HomeSectionHeader
                align="left"
                eyebrow="Campus life"
                title="Learning that"
                titleAccent="serves"
                subtitle="A Christ-centred medical sciences community preparing learners for service, clinical excellence, and lifelong impact."
                sx={{ mb: { xs: 3, md: 4 }, textAlign: "left", alignItems: "flex-start" }}
              />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(3, auto)" },
                  gap: { xs: 1.5, sm: 3 },
                  mb: 3,
                }}
              >
                {STATS.map(({ value, label, icon }) => (
                  <Box key={label}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Box sx={{ color: HOME.gold, lineHeight: 0 }}>{icon}</Box>
                      <Typography
                        sx={{
                          fontFamily: HOME.fontDisplay,
                          fontSize: { xs: "1.5rem", md: "2rem" },
                          fontWeight: 700,
                          color: HOME.gold,
                          lineHeight: 1,
                        }}
                      >
                        {value}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: HOME.inkSoft,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Typography sx={{ color: HOME.inkMuted, lineHeight: 1.75, maxWidth: 480 }}>
                KASMS is poised to continue its legacy of excellence in medical education and
                contribute significantly to healthcare delivery.
              </Typography>
            </Box>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: { xs: "center", lg: "flex-end" },
                alignItems: "center",
              }}
            >
              <DicedImageGrid
                slides={campusSlides}
                sx={{ width: "100%", maxWidth: { xs: 360, sm: 440, lg: 520 } }}
              />
            </Box>
          </Box>
        </Box>
      </HomeSectionShell>

      <HomeSectionShell bg={{ py: { xs: 3, md: 3.5 }, bgcolor: HOME.cream }}>
        <Box sx={{ ...sectionPad, width: "100%" }}>
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: { xs: 2.5, md: 3 },
              background: HOME.navyGradient,
              border: `1px solid ${HOME.borderGold}`,
              boxShadow: HOME.shadowMd,
              px: { xs: 2.5, sm: 4, md: 5 },
              py: { xs: 3, md: 3.5 },
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -80,
                right: -60,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${HOME.gold}22 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <Box sx={{ position: "relative", zIndex: 1, maxWidth: 640, mx: "auto" }}>
              <Chip
                icon={<EmojiEventsOutlined sx={{ color: `${HOME.gold} !important` }} />}
                label="Take the next step"
                size="small"
                sx={{
                  mb: 1.25,
                  fontWeight: 700,
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: HOME.goldMuted,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              <Typography
                component="h2"
                sx={{
                  fontFamily: HOME.fontDisplay,
                  fontWeight: 700,
                  fontSize: { xs: "1.55rem", md: "2rem" },
                  color: "#fff",
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                Ready to explore {HOME.name}?
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: { xs: "0.92rem", md: "1rem" },
                  lineHeight: 1.6,
                  mb: 2.25,
                  maxWidth: 460,
                  mx: "auto",
                }}
              >
                Start your journey with us — we are here to welcome you.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                justifyContent="center"
                alignItems="center"
              >
                <HomePrimaryButton
                  onClick={() =>
                    navigate("/admission/apply", {
                      state: { from: "/about-us", fromLabel: "About us" },
                    })
                  }
                >
                  Apply for admission
                </HomePrimaryButton>
                <HomeGhostButton light onClick={() => navigate("/")}>
                  Back to home
                </HomeGhostButton>
              </Stack>
            </Box>
          </Box>
        </Box>
      </HomeSectionShell>
    </Box>
  );
}
