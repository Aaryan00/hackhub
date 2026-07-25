import { ConnectButton } from "@/components/connections/connect-button";
import { RemoveConnectionButton } from "@/components/connections/remove-connection-button";
import {
  ProfileInline,
  type InlineProfile,
} from "@/components/profile/profile-inline";
import { Card, CardContent } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My network · HackHub" };

type ConnectionRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  note: string | null;
  status: "pending" | "accepted" | "rejected";
  requester: InlineProfile;
  addressee: InlineProfile;
};

export default async function NetworkPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("connections")
    .select(
      "id, requester_id, addressee_id, note, status, " +
        "requester:profiles!connections_requester_id_fkey(id, username, full_name, avatar_url, linkedin_verified), " +
        "addressee:profiles!connections_addressee_id_fkey(id, username, full_name, avatar_url, linkedin_verified)",
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as ConnectionRow[];

  const incoming = rows.filter(
    (r) => r.status === "pending" && r.addressee_id === user.id,
  );
  const outgoing = rows.filter(
    (r) => r.status === "pending" && r.requester_id === user.id,
  );
  const connected = rows.filter((r) => r.status === "accepted");

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My network</h1>
        <p className="text-muted-foreground">
          Manage your connections and requests.
        </p>
      </div>

      <Section
        title={`Requests received (${incoming.length})`}
        empty="No pending requests."
        show={incoming.length > 0}
      >
        {incoming.map((r) => (
          <Row key={r.id} profile={r.requester} note={r.note}>
            <ConnectButton
              targetId={r.requester.id}
              targetName={r.requester.full_name ?? `@${r.requester.username}`}
              state="incoming_pending"
              connectionId={r.id}
              size="sm"
            />
          </Row>
        ))}
      </Section>

      <Section
        title={`Connections (${connected.length})`}
        empty="You have no connections yet. Find people on the Builders page or in Posts."
        show
      >
        {connected.map((r) => {
          const other = r.requester_id === user.id ? r.addressee : r.requester;
          return (
            <Row key={r.id} profile={other}>
              <RemoveConnectionButton connectionId={r.id} />
            </Row>
          );
        })}
      </Section>

      <Section
        title={`Sent requests (${outgoing.length})`}
        empty="No sent requests."
        show={outgoing.length > 0}
      >
        {outgoing.map((r) => (
          <Row key={r.id} profile={r.addressee}>
            <RemoveConnectionButton connectionId={r.id} label="Cancel" />
          </Row>
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  empty,
  show,
  children,
}: {
  title: string;
  empty: string;
  show: boolean;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">{title}</h2>
      {show && hasChildren ? (
        <div className="space-y-3">{children}</div>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  );
}

function Row({
  profile,
  note,
  children,
}: {
  profile: InlineProfile;
  note?: string | null;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4 pt-6">
        <ProfileInline profile={profile} />
        {note && (
          <p className="w-full text-sm text-muted-foreground sm:w-auto sm:flex-1">
            “{note}”
          </p>
        )}
        <div className="ml-auto">{children}</div>
      </CardContent>
    </Card>
  );
}
