"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type PostFormState = { error?: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const title = formData.get("title")?.toString().trim();
  if (!title) return { error: "A title is required." };

  const body = formData.get("body")?.toString().trim() || null;
  const eventName = formData.get("event_name")?.toString().trim() || null;
  const skillsNeeded = (formData.get("skills_needed")?.toString() ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      body,
      event_name: eventName,
      skills_needed: skillsNeeded,
    })
    .select("id")
    .single();

  if (error || !post) return { error: error?.message ?? "Could not create post." };

  revalidatePath("/posts");
  redirect(`/posts/${post.id}`);
}

export async function addComment(
  postId: string,
  body: string,
): Promise<PostFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const trimmed = body.trim();
  if (!trimmed) return { error: "Comment can't be empty." };

  const { error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, author_id: user.id, body: trimmed });
  if (error) return { error: error.message };

  revalidatePath(`/posts/${postId}`);
  return {};
}

export async function deleteComment(
  commentId: string,
  postId: string,
): Promise<PostFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { error } = await supabase
    .from("post_comments")
    .delete()
    .eq("id", commentId);
  if (error) return { error: error.message };

  revalidatePath(`/posts/${postId}`);
  return {};
}

export async function deletePost(postId: string): Promise<PostFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) return { error: error.message };

  revalidatePath("/posts");
  redirect("/posts");
}
