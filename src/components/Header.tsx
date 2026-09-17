"use client";
import { AppBar, Toolbar, Typography, InputBase, IconButton, Avatar, Menu, MenuItem, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  onToggleSidebar: () => void;
}

export default function Header({ search, onSearchChange, onToggleSidebar }: Props) {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.push("/login");
  }

  return (
    <AppBar position="sticky" sx={{ bgcolor: "#171a21", borderBottom: "1px solid #000" }}>
      <Toolbar sx={{ gap: 2 }}>
        <IconButton color="inherit" onClick={onToggleSidebar}><MenuIcon /></IconButton>
        <Typography variant="h6" sx={{ color: "#66c0f4", fontWeight: 700, whiteSpace: "nowrap" }}>
          Tier List - Steam
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#0f1720", borderRadius: 1, px: 1, flexGrow: 1, maxWidth: 500 }}>
          <SearchIcon sx={{ color: "#8f98a0" }} />
          <InputBase
            placeholder="Pesquisar jogos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ ml: 1, color: "#c6d4df", flex: 1, py: 1 }}
          />
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {user && (
          <>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar src={user.avatar_url ?? undefined} sx={{ width: 32, height: 32 }}>
                {user.username[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>{user.username}</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); router.push("/profile"); }}>Meu perfil</MenuItem>
              {user.is_admin && (
                <MenuItem onClick={() => { setAnchorEl(null); router.push("/admin"); }}>
                  Gerenciar acessos
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}