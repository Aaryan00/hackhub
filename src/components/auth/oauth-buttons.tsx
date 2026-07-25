"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  GoogleIcon,
  GithubIcon,
  LinkedinIcon,
} from "@/components/brand-icons";
import { createClient } from "@/lib/supabase/client";

type Provider = "google" | "github" | "linkedin_oidc";

const PROVIDERS: {
  id: Provider;
  label: string;
  Icon: typeof GoogleIcon;
  recommended?: boolean;
}[] = [
  { id: "linkedin_oidc", label: "Continue with LinkedIn", Icon: LinkedinIcon, recommended: true },
  { id: "google", label: "Continue with Google", Icon: GoogleIcon },
  { id: "github", label: "Continue with GitHub", Icon: GithubIcon },
];

export function OAuthButtons({ redirectTo }: { redirectTo?: string }) {
  const [pending, setPending] = useState<Provider | null>(null);
  const supabase = createClient();

  async function signIn(provider: Provider) {
    setPending(provider);
    const params = new URLSearchParams();
    if (redirectTo) params.set("redirectTo", redirectTo);
    const callback = `${window.location.origin}/auth/callback${
      params.toString() ? `?${params}` : ""
    }`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callback },
    });

    if (error) {
      setPending(null);
      toast.error(error.message);
    }
    // On success the browser is redirected to the provider.
  }

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map(({ id, label, Icon, recommended }) => (
        <Button
          key={id}
          variant="outline"
          size="lg"
          className="relative h-12 justify-center gap-3 text-base"
          disabled={pending !== null}
          onClick={() => signIn(id)}
        >
          <Icon className="size-5" />
          {pending === id ? "Redirecting…" : label}
          {recommended && (
            <span className="absolute right-3 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Recommended
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
