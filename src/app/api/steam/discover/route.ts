import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isGameAllowed } from "@/lib/bannedWords";

const CATEGORIES: Record<string, string> = {
  terror: "horror",
  animacao: "animation",
  acao: "action",
  rpg: "rpg",
  aventura: "adventure",
  estrategia: "strategy",
  esporte: "sports",
  corrida: "racing",
};

interface SearchItem { appid: number; name: string; }

async function storeSearch(term: string): Promise<SearchItem[]> {
  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=portuguese&cc=br`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map((i: { id: number; name: string }) => ({ appid: i.id, name: i.name }));
}

async function getBlockedAppIds(): Promise<Set<number>> {
  const { data } = await supabaseAdmin.from("blocked_games").select("appid");
  return new Set((data ?? []).map((b) => b.appid));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const mode = searchParams.get("mode");

  const blocked = await getBlockedAppIds();
  let items: SearchItem[] = [];

  if (mode === "category" && category && CATEGORIES[category]) {
    items = await storeSearch(CATEGORIES[category]);
  } else if (mode === "new") {
    const res = await fetch("https://store.steampowered.com/api/featuredcategories?cc=br&l=portuguese");
    const data = await res.json();
    items = (data.new_releases?.items ?? []).map((i: { id: number; name: string }) => ({ appid: i.id, name: i.name }));
  } else if (mode === "similar") {
    const { data: purchased } = await supabaseAdmin.from("games").select("appid, name").eq("purchased", true);
    const sample = (purchased ?? []).sort(() => 0.5 - Math.random()).slice(0, 3);
    const results = await Promise.all(sample.map((g) => storeSearch(g.name)));
    items = results.flat();
  }

  const seen = new Set<number>();
  const unique = items.filter(
    (i) => i.name?.trim() && isGameAllowed(i.name) && !blocked.has(i.appid) && !seen.has(i.appid) && seen.add(i.appid)
  );

  return NextResponse.json({ items: unique.slice(0, 16) });
}