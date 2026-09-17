import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { username } = await req.json();
  if (!username?.trim()) return NextResponse.json({ error: "Nome inválido" }, { status: 400 });

  const { data: taken } = await supabaseAdmin
    .from("users").select("id").eq("username", username).neq("id", userId).maybeSingle();

  if (taken) return NextResponse.json({ error: "Esse nome já está em uso" }, { status: 409 });

  await supabaseAdmin.from("users").update({ username }).eq("id", userId);
  return NextResponse.json({ success: true });
}