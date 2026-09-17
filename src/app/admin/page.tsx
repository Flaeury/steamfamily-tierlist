"use client";
import { useEffect, useState } from "react";
import { Box, Paper, Typography, List, ListItem, ListItemText, Chip, Button, Stack } from "@mui/material";
import { useAuth } from "@/context/AuthContext";

interface AdminUser {
  id: string; username: string; approved: boolean; is_admin: boolean;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);

  async function load() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers((await res.json()).users);
  }

  useEffect(() => { if (user?.is_admin) load(); }, [user]);

  async function setApproved(userId: string, approved: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, approved }),
    });
    load();
  }

  async function remove(userId: string) {
    await fetch("/api/admin/users", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    load();
  }

  if (loading) return null;
  if (!user?.is_admin) {
    return (
      <Box sx={{ p: 4, color: "#fff" }}>
        <Typography>Você não tem permissão pra ver essa página.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, color: "#fff" }}>Gerenciar acessos</Typography>
      <Paper sx={{ p: 2 }}>
        <List>
          {users.map((u) => (
            <ListItem key={u.id} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <ListItemText
                primary={u.username}
                secondary={u.is_admin ? "Admin" : u.approved ? "Aprovado" : "Pendente"}
              />
              <Stack direction="row" spacing={1}>
                {!u.approved && (
                  <Button size="small" variant="contained" onClick={() => setApproved(u.id, true)}>
                    Aprovar
                  </Button>
                )}
                {u.approved && !u.is_admin && (
                  <Button size="small" color="warning" onClick={() => setApproved(u.id, false)}>
                    Revogar
                  </Button>
                )}
                {!u.is_admin && (
                  <Button size="small" color="error" onClick={() => remove(u.id)}>
                    Remover
                  </Button>
                )}
                {u.approved && <Chip label="✓" size="small" color="success" />}
              </Stack>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}