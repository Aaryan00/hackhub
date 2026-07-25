import Link from "next/link";
import { Plus } from "lucide-react";

import { PostCard, type PostWithMeta } from "@/components/posts/post-card";
import { PostSearch } from "@/components/posts/post-search";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Posts · HackHub" };

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(
      "id, title, body, event_name, skills_needed, created_at, author:profiles(id, username, full_name, avatar_url, linkedin_verified), post_comments(count)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    const safe = q.replace(/[,()]/g, " ").trim();
    if (safe) {
      query = query.or(
        [
          `title.ilike.%${safe}%`,
          `event_name.ilike.%${safe}%`,
          `body.ilike.%${safe}%`,
        ].join(","),
      );
    }
  }

  const { data } = await query;
  const posts = (data ?? []) as unknown as PostWithMeta[];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">
            Looking for a team, or teammates? Post it here.
          </p>
        </div>
        <Button render={<Link href="/posts/new" />}>
          <Plus className="size-4" /> New post
        </Button>
      </div>

      <PostSearch />

      <p className="mb-4 mt-6 text-sm text-muted-foreground">
        {posts.length} {posts.length === 1 ? "post" : "posts"}
      </p>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          No posts yet.{" "}
          <Link
            href="/posts/new"
            className="font-medium text-primary hover:underline"
          >
            Write the first one
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
