import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CommentForm,
  DeleteCommentButton,
  DeletePostButton,
} from "@/components/posts/post-actions";
import {
  ProfileInline,
  type InlineProfile,
} from "@/components/profile/profile-inline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/format";

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  author: InlineProfile;
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: postData } = await supabase
    .from("posts")
    .select(
      "*, author:profiles(id, username, full_name, avatar_url, linkedin_verified)",
    )
    .eq("id", id)
    .single();

  if (!postData) notFound();

  const post = postData as unknown as {
    id: string;
    author_id: string;
    title: string;
    body: string | null;
    event_name: string | null;
    skills_needed: string[];
    created_at: string;
    author: InlineProfile;
  };

  const [{ data: commentData }, user] = await Promise.all([
    supabase
      .from("post_comments")
      .select(
        "id, body, created_at, author:profiles(id, username, full_name, avatar_url, linkedin_verified)",
      )
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
    getUser(),
  ]);

  const comments = (commentData ?? []) as unknown as CommentRow[];
  const isAuthor = user?.id === post.author_id;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/posts" className="text-sm text-muted-foreground hover:underline">
        ← All posts
      </Link>

      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-2">
            <ProfileInline profile={post.author} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {relativeTime(post.created_at)}
              </span>
              {isAuthor && <DeletePostButton postId={post.id} />}
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {post.title}
          </h1>
          {post.event_name && (
            <p className="text-muted-foreground">{post.event_name}</p>
          )}

          {post.body && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
              {post.body}
            </p>
          )}

          {post.skills_needed.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Skills needed
              </p>
              <div className="flex flex-wrap gap-1.5">
                {post.skills_needed.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <h2 className="mb-4 text-lg font-semibold tracking-tight">
        Comments ({comments.length})
      </h2>

      <div className="mb-6">
        <CommentForm postId={post.id} />
      </div>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Start the conversation.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const canDelete = user?.id === comment.author.id || isAuthor;
            return (
              <Card key={comment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <ProfileInline profile={comment.author} size="sm" />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {relativeTime(comment.created_at)}
                      </span>
                      {canDelete && (
                        <DeleteCommentButton
                          commentId={comment.id}
                          postId={post.id}
                        />
                      )}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm">
                    {comment.body}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
