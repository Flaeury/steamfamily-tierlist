import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.steampowered.com/ISteamApps/GetAppList/v2");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: "Erro ao buscar Steam API" }, { status: 500 });
  }
}
