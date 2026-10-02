import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, IconButton, Tooltip } from "@mui/material";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import { HOME } from "../Home/homeShared";

/**
 * Loads active music tracks and plays them only while the user is on `/`.
 * Pauses (and resets) when navigating away from the home page.
 */
export default function HomeBackgroundMusic() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const audioRef = useRef(null);
  const indexRef = useRef(0);
  const [tracks, setTracks] = useState([]);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/music/public");
        const data = await res.json();
        if (!active) return;
        if (res.ok && data.success && Array.isArray(data.data)) {
          setTracks(data.data.filter((t) => t?.audio_url));
        }
      } catch {
        /* ignore — home still works without music */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const applyVolume = useCallback((track) => {
    const el = audioRef.current;
    if (!el) return;
    const v = track?.volume != null ? Number(track.volume) : 0.35;
    el.volume = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.35;
  }, []);

  const playAt = useCallback(
    async (idx) => {
      const el = audioRef.current;
      if (!el || !tracks.length) return;
      const nextIdx = ((idx % tracks.length) + tracks.length) % tracks.length;
      indexRef.current = nextIdx;
      const track = tracks[nextIdx];
      if (!track?.audio_url) return;

      if (el.src !== new URL(track.audio_url, window.location.origin).href) {
        el.src = track.audio_url;
      }
      applyVolume(track);

      try {
        await el.play();
        setPlaying(true);
        setNeedsGesture(false);
      } catch {
        setPlaying(false);
        setNeedsGesture(true);
      }
    },
    [tracks, applyVolume]
  );

  // Start / stop based on home route
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (!isHome || tracks.length === 0) {
      el.pause();
      setPlaying(false);
      return;
    }

    void playAt(indexRef.current);
  }, [isHome, tracks, playAt]);

  // Pause when tab is hidden; resume on home when visible again
  useEffect(() => {
    const onVisibility = () => {
      const el = audioRef.current;
      if (!el) return;
      if (document.hidden) {
        el.pause();
        setPlaying(false);
      } else if (isHome && tracks.length > 0 && !needsGesture) {
        void playAt(indexRef.current);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isHome, tracks, needsGesture, playAt]);

  const handleEnded = () => {
    if (!isHome || tracks.length === 0) return;
    void playAt(indexRef.current + 1);
  };

  const toggleFromGesture = async () => {
    const el = audioRef.current;
    if (!el || !tracks.length || !isHome) return;

    if (playing && !el.paused) {
      el.pause();
      setPlaying(false);
      return;
    }

    await playAt(indexRef.current);
  };

  if (!tracks.length) {
    return <audio ref={audioRef} preload="none" style={{ display: "none" }} />;
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={handleEnded}
        style={{ display: "none" }}
      />

      {isHome ? (
        <Box
          sx={{
            position: "fixed",
            right: { xs: 12, sm: 20 },
            bottom: { xs: 12, sm: 20 },
            zIndex: 1200,
          }}
        >
          <Tooltip
            title={
              needsGesture
                ? "Tap to play background music"
                : playing
                  ? "Mute music"
                  : "Play music"
            }
            arrow
            placement="left"
          >
            <IconButton
              aria-label={playing ? "Mute background music" : "Play background music"}
              onClick={toggleFromGesture}
              sx={{
                width: 44,
                height: 44,
                bgcolor: HOME.green,
                color: "#fff",
                boxShadow: "0 10px 28px -10px rgba(27,94,168,0.55)",
                border: "1px solid rgba(255,255,255,0.25)",
                "&:hover": { bgcolor: "#0E3D73" },
                animation: needsGesture
                  ? "kenduMusicPulse 1.6s ease-in-out infinite"
                  : "none",
                "@keyframes kenduMusicPulse": {
                  "0%, 100%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.06)" },
                },
              }}
            >
              {playing ? (
                <VolumeUpRoundedIcon fontSize="small" />
              ) : (
                <VolumeOffRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}
    </>
  );
}
