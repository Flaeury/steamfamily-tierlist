import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

async function requireAdmin() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const { data } = await supabaseAdmin.from("users").select("is_admin").eq("id", userId).single();
  return data?.is_admin ? userId : null;
}

export async function DELETE(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { appid, name } = await req.json();
  if (!appid) return NextResponse.json({ error: "appid obrigatório" }, { status: 400 });

  await supabaseAdmin.from("blocked_games").upsert({ appid, name: name ?? "", blocked_by: adminId });
  await supabaseAdmin.from("likes").delete().eq("appid", appid);
  await supabaseAdmin.from("games").delete().eq("appid", appid);

  return NextResponse.json({ success: true });
}