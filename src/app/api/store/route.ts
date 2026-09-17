import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { isGameAllowed } from "@/lib/bannedWords";

export async function GET() {
  const [{ data: games }, { data: blocked }] = await Promise.all([
    supabaseAdmin.from("games").select("*, likes(user_id)"),
    supabaseAdmin.from("blocked_games").select("appid"),
  ]);
  return NextResponse.json({ games, blockedAppIds: (blocked ?? []).map((b) => b.appid) });
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Faça login primeiro" }, { status: 401 });

  const { appid, name, action } = await req.json();
  if (!appid || !name || !action) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  if (!isGameAllowed(name)) return NextResponse.json({ error: "Jogo bloqueado pelo filtro" }, { status: 403 });

  await supabaseAdmin.from("games").upsert({ appid, name }, { onConflict: "appid" });

  switch (action) {
    case "like":
      await supabaseAdmin.from("likes").upsert({ appid, user_id: userId });
      break;
    case "unlike":
      await supabaseAdmin.from("likes").delete().eq("appid", appid).eq("user_id", userId);
      break;
    case "buy":
      await supabaseAdmin.from("games")
        .update({ purchased: true, purchased_by: userId, purchased_at: new Date().toISOString() })
        .eq("appid", appid);
      break;
    case "unbuy":
      await supabaseAdmin.from("games")
        .update({ purchased: false, purchased_by: null, purchased_at: null })
        .eq("appid", appid);
      break;
    default:
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}