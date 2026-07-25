import Link from "next/link";
import { redirect } from "next/navigation";

import { OAuthButtons } from "@/components/auth/oauth-buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo, error } = await searchParams;

  // Already signed in? Skip the login screen.
  if (await getUser()) redirect(redirectTo ?? "/dashboard");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-4">
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight"
      >
        Hack<span className="text-primary">Hub</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to HackHub</CardTitle>
          <CardDescription>
            Find teammates, join hackathons, and build your reputation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error === "auth" && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Sign-in failed. Please try again.
            </p>
          )}
          <OAuthButtons redirectTo={redirectTo} />
          <p className="text-center text-xs text-muted-foreground">
            Sign in with LinkedIn to get a{" "}
            <span className="font-medium text-foreground">✅ Verified</span>{" "}
            badge instantly. With Google or GitHub, we&apos;ll ask for your
            LinkedIn profile next.
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 max-w-md text-center text-xs text-muted-foreground">
        By continuing you agree to be a good hackathon citizen. This is an
        early build — expect rough edges.
      </p>
    </main>
  );
}
