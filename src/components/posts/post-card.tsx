import Link from "next/link";
import { MessageSquare } from "lucide-react";

import {
  ProfileInline,
  type InlineProfile,
} from "@/components/profile/profile-inline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTime } from "@/lib/format";

export type PostWithMeta = {
  id: string;
  title: string;
  body: string | null;
  event_name: string | null;
  skills_needed: string[];
  created_at: string;
  author: InlineProfile;
  post_comments: { count: number }[];
};

export function PostCard({ post }: { post: PostWithMeta }) {
  const commentCount = post.post_comments[0]?.count ?? 0;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-2">
          <ProfileInline profile={post.author} size="sm" />
          <span className="text-xs text-muted-foreground">
            {relativeTime(post.created_at)}
          </span>
        </div>

        <Link href={`/posts/${post.id}`} className="mt-3 block">
          <h3 className="text-lg font-semibold tracking-tight hover:underline">
            {post.title}
          </h3>
        </Link>

        {post.event_name && (
          <p className="text-sm text-muted-foreground">{post.event_name}</p>
        )}

        {post.body && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {post.body}
          </p>
        )}

        {post.skills_needed.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.skills_needed.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <Link
          href={`/posts/${post.id}`}
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <MessageSquare className="size-3.5" />
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </Link>
      </CardContent>
    </Card>
  );
}
