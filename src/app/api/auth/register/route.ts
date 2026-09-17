import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username?.trim() || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Usuário obrigatório e senha com no mínimo 6 caracteres" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("users").select("id").eq("username", username).maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Esse nome de usuário já existe" }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { error } = await supabaseAdmin
    .from("users")
    .insert({ username, password_hash, approved: false, is_admin: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }

  // não cria sessão — precisa esperar aprovação
  return NextResponse.json({ success: true, pending: true });
}