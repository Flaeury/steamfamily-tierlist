import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ user: null });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, username, avatar_url, is_admin")
    .eq("id", userId)
    .single();

  return NextResponse.json({ user });
}