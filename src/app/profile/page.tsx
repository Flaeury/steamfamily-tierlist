"use client";
import { useState } from "react";
import { Box, Paper, Avatar, TextField, Button, Typography, Alert } from "@mui/material";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleNameChange(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage({ type: "error", text: data.error });
    setMessage({ type: "success", text: "Nome atualizado!" });
    refresh();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch("/api/auth/avatar", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) return setMessage({ type: "error", text: data.error });
    setMessage({ type: "success", text: "Avatar atualizado!" });
    refresh();
  }

  if (!user) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#1b2838", display: "flex", justifyContent: "center", pt: 8 }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Meu perfil</Typography>
        {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Avatar src={user.avatar_url ?? undefined} sx={{ width: 96, height: 96, mb: 1 }}>
            {user.username[0]?.toUpperCase()}
          </Avatar>
          <Button component="label" size="small">
            Trocar avatar
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </Button>
        </Box>
        <Box component="form" onSubmit={handleNameChange} sx={{ display: "flex", gap: 1 }}>
          <TextField label="Nome de usuário" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
          <Button type="submit" variant="contained">Salvar</Button>
        </Box>
      </Paper>
    </Box>
  );
}