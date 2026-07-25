"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Connection } from "@/lib/database.types";

export type ConnectionActionState = { error?: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Returns the connection row between the current user and `otherId`, if any. */
export async function getConnectionWith(
  otherId: string,
): Promise<Connection | null> {
  const { supabase, user } = await requireUser();
  if (!user || user.id === otherId) return null;

  const { data } = await supabase
    .from("connections")
    .select("*")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${otherId}),` +
        `and(requester_id.eq.${otherId},addressee_id.eq.${user.id})`,
    )
    .limit(1);

  return (data?.[0] as Connection) ?? null;
}

export async function sendConnectionRequest(
  addresseeId: string,
  note: string,
): Promise<ConnectionActionState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };
  if (user.id === addresseeId)
    return { error: "You can't connect with yourself." };

  const existing = await getConnectionWith(addresseeId);

  if (existing) {
    if (existing.status === "accepted")
      return { error: "You're already connected." };
    if (existing.status === "pending") {
      if (existing.requester_id === user.id)
        return { error: "You already sent a request." };
      // They already requested you — accept it.
      await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", existing.id);
      revalidatePath("/network");
      return {};
    }
    // rejected — clear it and start fresh.
    await supabase.from("connections").delete().eq("id", existing.id);
  }

  const { error } = await supabase.from("connections").insert({
    requester_id: user.id,
    addressee_id: addresseeId,
    note: note.trim() || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/network");
  return {};
}

export async function respondToRequest(
  connectionId: string,
  accept: boolean,
): Promise<ConnectionActionState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { error } = await supabase
    .from("connections")
    .update({ status: accept ? "accepted" : "rejected" })
    .eq("id", connectionId)
    .eq("addressee_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/network");
  return {};
}

export async function removeConnection(
  connectionId: string,
): Promise<ConnectionActionState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connectionId);
  if (error) return { error: error.message };

  revalidatePath("/network");
  return {};
}
