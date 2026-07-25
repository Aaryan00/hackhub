import Link from "next/link";

import { CreatePostForm } from "@/components/posts/create-post-form";

export const metadata = { title: "New post · HackHub" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/posts" className="text-sm text-muted-foreground hover:underline">
        ← All posts
      </Link>
      <h1 className="mb-1 mt-4 text-2xl font-bold tracking-tight">New post</h1>
      <p className="mb-8 text-muted-foreground">
        Tell builders what you&apos;re looking for.
      </p>
      <CreatePostForm />
    </div>
  );
}
