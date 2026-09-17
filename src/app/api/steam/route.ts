import { NextResponse } from "next/server";

export const revalidate = 86400;

async function fetchAllApps() {
  const apps: { appid: number; name: string }[] = [];
  let lastAppId = 0;
  let hasMore = true;

  while (hasMore) {
    const url = new URL("https://api.steampowered.com/IStoreService/GetAppList/v1/");
    url.searchParams.set("key", process.env.STEAM_API_KEY!);
    url.searchParams.set("max_results", "50000");
    url.searchParams.set("include_games", "true");
    url.searchParams.set("include_dlc", "false");
    url.searchParams.set("include_software", "false");
    url.searchParams.set("include_videos", "false");
    url.searchParams.set("include_hardware", "false");
    url.searchParams.set("last_appid", String(lastAppId));

    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`Steam API respondeu ${res.status}`);
    const data = await res.json();

    const page = data.response?.apps ?? [];
    apps.push(...page.map((a: { appid: number; name: string }) => ({ appid: a.appid, name: a.name })));

    hasMore = !!data.response?.have_more_results;
    lastAppId = data.response?.last_appid ?? 0;
  }
  return apps;
}

export async function GET() {
  try {
    const apps = await fetchAllApps();
    return NextResponse.json({ applist: { apps } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar Steam API" }, { status: 500 });
  }
}