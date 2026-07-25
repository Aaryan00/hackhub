import Link from "next/link";
import { BadgeCheck, Trophy, Users2, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";

const FEATURES = [
  {
    icon: Users2,
    title: "Find trusted teammates",
    description:
      "Match with builders by skill, timezone and experience — not random Discord DMs.",
  },
  {
    icon: BadgeCheck,
    title: "Verified profiles",
    description:
      "Sign in with LinkedIn to prove you're a real builder. No more fake profiles.",
  },
  {
    icon: UsersRound,
    title: "Build & join teams",
    description:
      "Create a team, review join requests, and manage your crew in one place.",
  },
  {
    icon: Trophy,
    title: "Build reputation",
    description:
      "Your HackHub profile becomes a trusted signal of skill and collaboration.",
  },
];

export default async function LandingPage() {
  const user = await getUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <span className="text-xl font-bold tracking-tight">
          Hack<span className="text-primary">Hub</span>
        </span>
        <Button
          variant="ghost"
          render={<Link href={user ? "/dashboard" : "/login"} />}
        >
          {user ? "Dashboard" : "Sign in"}
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
            <BadgeCheck className="size-4 text-emerald-500" />
            For hackathon builders
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Find teammates. Join hackathons.{" "}
            <span className="text-primary">Build reputation.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            HackHub is where developers, designers and AI builders find trusted
            teammates, discover hackathons, and grow a reputation that recruiters
            and organizers actually trust.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              render={<Link href={user ? "/dashboard" : "/login"} />}
            >
              {user ? "Go to dashboard" : "Get started — it's free"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href={user ? "/builders" : "/login"} />}
            >
              Find teammates
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border bg-card p-6">
                <Icon className="size-6 text-primary" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          HackHub — built for builders. Early access.
        </div>
      </footer>
    </div>
  );
}
