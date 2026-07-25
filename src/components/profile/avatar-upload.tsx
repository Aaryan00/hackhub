"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AvatarUpload({
  userId,
  name,
  defaultUrl,
}: {
  userId: string;
  name: string | null;
  defaultUrl: string | null;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB.");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    setUrl(publicUrl);
    setUploading(false);
  }

  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={url || undefined} alt={name ?? "avatar"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <input type="hidden" name="avatar_url" value={url} />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? "Uploading…" : "Change photo"}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">PNG or JPG, up to 2 MB.</p>
      </div>
    </div>
  );
}
