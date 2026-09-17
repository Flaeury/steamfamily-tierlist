"use client";
import { useState } from "react";
import { Box, Paper, TextField, Button, Typography, Alert, Link as MLink } from "@mui/material";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setUsername("");
    setPassword("");
    setSuccess("Conta criada! Peça pro admin do grupo aprovar seu acesso — depois disso você já consegue entrar normalmente.");
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#171a21" }}>
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom> Criar conta</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <TextField label="Senha (mín. 6 caracteres)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" variant="contained" size="large">Criar conta</Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Já tem conta? <MLink component={Link} href="/login">Entrar</MLink>
        </Typography>
      </Paper>
    </Box>
  );
}