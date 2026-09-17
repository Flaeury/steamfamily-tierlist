"use client";
import { createTheme } from "@mui/material/styles";

export const steamTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#9b6dff" },
    secondary: { main: "#66c0f4" },
    background: { default: "#0f1220", paper: "rgba(28, 24, 48, 0.55)" },
    text: { primary: "#e7e9f5", secondary: "#a3a8c2" },
  },
  typography: { fontFamily: '"Segoe UI", Inter, Arial, sans-serif' },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: "linear-gradient(160deg, rgba(107,73,196,0.22), rgba(20,22,40,0.6))",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(155,109,255,0.25)",
          borderRadius: 18,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backdropFilter: "blur(14px)",
          borderRadius: 18,
          border: "1px solid rgba(155,109,255,0.15)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 700, borderRadius: 12 },
        contained: { background: "linear-gradient(135deg, #9b6dff, #66c0f4)" },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 700 } } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(15, 15, 28, 0.65)",
          backdropFilter: "blur(18px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(155,109,255,0.2)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "rgba(20, 18, 36, 0.65)",
          backdropFilter: "blur(18px)",
          borderRight: "1px solid rgba(155,109,255,0.15)",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
  },
});