import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;

  if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Envie uma imagem de até 2MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const path = `${userId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from("avatars").upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadError) return NextResponse.json({ error: "Erro ao subir imagem" }, { status: 500 });

  const { data } = supabaseAdmin.storage.from("avatars").getPublicUrl(path);
  await supabaseAdmin.from("users").update({ avatar_url: data.publicUrl }).eq("id", userId);

  return NextResponse.json({ avatar_url: data.publicUrl });
}