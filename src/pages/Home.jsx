import React from "react";
import { Box } from "@mui/material";
import HeroSection from "../components/Home/HeroSection";
import ProgrammesSection from "../components/Home/ProgrammesSection";
import NewsSection from "../components/Home/NewsSection";
import Footer from "../components/Footer/Footer";
import { HOME } from "../components/Home/homeShared";

export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: HOME.fontBody,
        bgcolor: HOME.warmWhite,
      }}
    >
      <HeroSection />
      <ProgrammesSection />
      <NewsSection />
      <Footer />
    </Box>
  );
}
