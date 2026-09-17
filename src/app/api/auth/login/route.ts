import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, password_hash, approved")
    .eq("username", username)
    .maybeSingle();

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 });
  }

  if (!user.approved) {
    return NextResponse.json(
      { error: "Sua conta ainda não foi aprovada. Peça pro admin liberar seu acesso." },
      { status: 403 }
    );
  }

  await createSession(user.id);
  return NextResponse.json({ success: true });
}