"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Grid, Typography, CircularProgress, Chip, Stack } from "@mui/material";
import Header from "@/components/Header";
import RankingSidebar from "@/components/RankingSideBar";
import GameCard from "@/components/GameCard";
import { useAuth } from "@/context/AuthContext";

interface SteamApp { appid: number; name: string; }
interface GameRow { appid: number; name: string; purchased: boolean; likes: { user_id: string }[]; }

const BANNED_WORDS = [
  "hentai", "nsfw", "18+", "porn", "sex",
  "digital artbook", "digital art book", "art book", "artbook",
  "soundtrack dlc", "soundtrack", "soundtrack trailer",
  "dlc", "trailer", "demo", "beta", "early access",
];
const isAllowed = (name: string) => !BANNED_WORDS.some((w) => name.toLowerCase().includes(w));

const CATEGORIES = [
  { key: "terror", label: "Terror" },
  { key: "animacao", label: "Animação" },
  { key: "acao", label: "Ação" },
  { key: "rpg", label: "RPG" },
  { key: "aventura", label: "Aventura" },
  { key: "estrategia", label: "Estratégia" },
  { key: "esporte", label: "Esporte" },
  { key: "corrida", label: "Corrida" },
];

export default function Home() {
  const { user } = useAuth();
  const [apps, setApps] = useState<SteamApp[]>([]);
  const [games, setGames] = useState<Record<number, GameRow>>({});
  const [blockedIds, setBlockedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [newReleases, setNewReleases] = useState<SteamApp[]>([]);
  const [similar, setSimilar] = useState<SteamApp[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<SteamApp[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);

  async function loadStore() {
    const res = await fetch("/api/store");
    const data = await res.json();
    const map: Record<number, GameRow> = {};
    (data.games ?? []).forEach((g: GameRow) => (map[g.appid] = g));
    setGames(map);
    setBlockedIds(new Set(data.blockedAppIds ?? []));
  }

  useEffect(() => {
    (async () => {
      try {
        const [appsRes] = await Promise.all([fetch("/api/steam").then((r) => r.json()), loadStore()]);
        const valid = appsRes.applist.apps.filter((a: SteamApp) => a.name?.trim() && isAllowed(a.name));
        setApps(valid);
        const [newsRes, similarRes] = await Promise.all([
          fetch("/api/steam/discover?mode=new").then((r) => r.json()),
          fetch("/api/steam/discover?mode=similar").then((r) => r.json()),
        ]);
        setNewReleases(newsRes.items ?? []);
        setSimilar(similarRes.items ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleCategoryClick(key: string) {
    if (activeCategory === key) return setActiveCategory(null);
    setActiveCategory(key);
    setDiscoveryLoading(true);
    const res = await fetch(`/api/steam/discover?mode=category&category=${key}`);
    const data = await res.json();
    setCategoryItems(data.items ?? []);
    setDiscoveryLoading(false);
  }

  const results = useMemo(() => {
    if (!search.trim()) return [];
    return apps.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) && !blockedIds.has(a.appid)).slice(0, 60);
  }, [search, apps, blockedIds]);

  const ranking = useMemo(() => {
    return Object.values(games)
      .filter((g) => !g.purchased && g.likes?.length > 0)
      .map((g) => ({ appid: g.appid, name: g.name, likes: g.likes.length }));
  }, [games]);

  async function sendAction(app: SteamApp, action: string) {
    const res = await fetch("/api/store", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appid: app.appid, name: app.name, action }),
    });
    if (res.ok) await loadStore();
  }

  function toggleLike(app: SteamApp) {
    const g = games[app.appid];
    const liked = g?.likes?.some((l) => l.user_id === user?.id);
    sendAction(app, liked ? "unlike" : "like");
  }
  function toggleBuy(app: SteamApp) {
    sendAction(app, games[app.appid]?.purchased ? "unbuy" : "buy");
  }

  async function handleDelete(app: SteamApp) {
    if (!confirm(`Remover "${app.name}" pra sempre? Ninguém mais vai ver esse jogo.`)) return;
    const res = await fetch("/api/admin/games", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appid: app.appid, name: app.name }),
    });
    if (res.ok) {
      setBlockedIds((prev) => new Set(prev).add(app.appid));
      await loadStore();
    }
  }

  function renderCard(app: SteamApp) {
    const g = games[app.appid];
    const liked = g?.likes?.some((l) => l.user_id === user?.id) ?? false;
    return (
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={app.appid}>
        <GameCard
          appid={app.appid} name={app.name} liked={liked}
          likeCount={g?.likes?.length ?? 0} purchased={g?.purchased ?? false}
          isAdmin={user?.is_admin} onLike={() => toggleLike(app)} onBuy={() => toggleBuy(app)}
          onDelete={() => handleDelete(app)}
        />
      </Grid>
    );
  }

  const activeCategoryLabel = CATEGORIES.find((c) => c.key === activeCategory)?.label;
  const visibleCategoryItems = categoryItems.filter((i) => !blockedIds.has(i.appid));
  const visibleNewReleases = newReleases.filter((i) => !blockedIds.has(i.appid));
  const visibleSimilar = similar.filter((i) => !blockedIds.has(i.appid));

  return (
    <Box sx={{ background: "radial-gradient(circle at 20% 0%, #2a1f52 0%, #100e1f 45%, #0b0c16 100%)", minHeight: "100vh" }}>
      <Header search={search} onSearchChange={setSearch} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <Box sx={{ display: "flex" }}>
        <RankingSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} ranking={ranking} />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>
          ) : search.trim() ? (
            <>
              <Typography variant="h5" sx={{ color: "#fff", mb: 2 }}>Resultados para &quot;{search}&quot;</Typography>
              <Grid container spacing={2}>{results.map(renderCard)}</Grid>
              {results.length === 0 && <Typography color="text.secondary">Nenhum jogo encontrado</Typography>}
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ color: "#fff", mb: 2 }}>Explorar por categoria</Typography>
              <Stack direction="row" sx={{ mb: 4, flexWrap: "wrap", gap: 1 }}>
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c.key} label={c.label} onClick={() => handleCategoryClick(c.key)}
                    sx={{ cursor: "pointer", bgcolor: activeCategory === c.key ? "#9b6dff" : "rgba(155,109,255,0.15)", color: "#fff", fontWeight: 700 }}
                  />
                ))}
              </Stack>

              {activeCategory ? (
                <>
                  <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>Jogos de {activeCategoryLabel}</Typography>
                  {discoveryLoading ? <CircularProgress size={24} /> : <Grid container spacing={2}>{visibleCategoryItems.map(renderCard)}</Grid>}
                </>
              ) : (
                <>
                  {visibleSimilar.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>Baseado no que vocês já têm</Typography>
                      <Grid container spacing={2}>{visibleSimilar.map(renderCard)}</Grid>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>Novidades na Steam</Typography>
                    <Grid container spacing={2}>{visibleNewReleases.map(renderCard)}</Grid>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}