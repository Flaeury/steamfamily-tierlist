import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

async function requireAdmin() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const { data } = await supabaseAdmin.from("users").select("is_admin").eq("id", userId).single();
  return data?.is_admin ? userId : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, username, approved, is_admin, created_at")
    .order("created_at", { ascending: false });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { userId, approved } = await req.json();
  if (!userId || typeof approved !== "boolean") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  await supabaseAdmin.from("users").update({ approved }).eq("id", userId);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { userId } = await req.json();
  await supabaseAdmin.from("users").delete().eq("id", userId);
  return NextResponse.json({ success: true });
}