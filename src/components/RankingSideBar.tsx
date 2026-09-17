"use client";
import { Drawer, Box, Typography, List, ListItem, ListItemText, Chip, Divider, Avatar } from "@mui/material";

interface RankingItem { appid: number; name: string; likes: number; }
interface Props { open: boolean; onClose: () => void; ranking: RankingItem[]; }

const DRAWER_WIDTH = 300;

function sortRanking(items: RankingItem[]) {
  return [...items].sort((a, b) => b.likes - a.likes || a.name.localeCompare(b.name, "pt-BR"));
}

const cover = (appid: number) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_184x69.jpg`;

export default function RankingSidebar({ open, onClose, ranking }: Props) {
  const sorted = sortRanking(ranking).slice(0, 10);
  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3, 10);
  const order = [podium[1], podium[0], podium[2]]; // visual: 2º, 1º, 3º
  const medals = ["🥈", "🥇", "🥉"];
  const heights = [70, 100, 55];

  return (
    <Drawer
      variant="persistent" open={open} onClose={onClose}
      sx={{
        width: open ? DRAWER_WIDTH : 0, flexShrink: 0,
        "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", top: 64, height: "calc(100% - 64px)" },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Top 10</Typography>
        <Typography variant="caption" color="text.secondary">Mais curtidos pelo grupo</Typography>
      </Box>
      <Divider sx={{ borderColor: "rgba(155,109,255,0.15)" }} />

      {podium.filter(Boolean).length > 0 && (
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 1, p: 2 }}>
          {order.map((g, i) =>
            g ? (
              <Box key={g.appid} sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 82 }}>
                <Avatar variant="rounded" src={cover(g.appid)} sx={{ width: 56, height: 32, mb: 0.5 }} />
                <Typography variant="caption" noWrap sx={{ maxWidth: 78 }} title={g.name}>{g.name}</Typography>
                <Chip label={`❤ ${g.likes}`} size="small" sx={{ mt: 0.5 }} />
                <Box sx={{
                  mt: 0.5, width: "100%", height: heights[i], borderRadius: "8px 8px 0 0",
                  background: "linear-gradient(180deg, rgba(155,109,255,0.35), rgba(155,109,255,0.1))",
                  display: "flex", justifyContent: "center", pt: 0.5,
                }}>
                  <Typography sx={{ fontSize: 20 }}>{medals[i]}</Typography>
                </Box>
              </Box>
            ) : <Box key={i} sx={{ width: 82 }} />
          )}
        </Box>
      )}

      <Divider sx={{ borderColor: "rgba(155,109,255,0.15)" }} />

      <List dense>
        {rest.map((g, i) => (
          <ListItem key={g.appid} sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <Typography sx={{ width: 24, color: "text.secondary", fontWeight: 700 }}>#{i + 4}</Typography>
            <Avatar variant="rounded" src={cover(g.appid)} sx={{ width: 40, height: 22, mr: 1 }} />
            <ListItemText primary={g.name} primaryTypographyProps={{ noWrap: true, sx: { fontSize: 14 } }} />
            <Chip label={g.likes} size="small" />
          </ListItem>
        ))}
      </List>

      {sorted.length === 0 && (
        <Typography sx={{ p: 2 }} variant="body2" color="text.secondary">Ninguém curtiu nada ainda.</Typography>
      )}
    </Drawer>
  );
}