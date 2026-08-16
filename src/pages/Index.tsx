import { useCallback, useEffect, useState } from "react";
import db from "@/lib/shared/kliv-database.js";
import { useSession } from "@/hooks/use-session";
import { AuthPanel } from "@/components/AuthPanel";
import { WebhookList, type WebhookRow } from "@/components/WebhookList";
import { Composer } from "@/components/Composer";
import { SendHistory, type SendRow } from "@/components/SendHistory";
import { AdminLink } from "@/components/AdminLink";
import { Button } from "@/components/ui/button";
import { Send, LogOut, Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useSession();
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [history, setHistory] = useState<SendRow[]>([]);

  const loadWebhooks = useCallback(async () => {
    try {
      const rows = await db.query<WebhookRow>("webhooks", { order: "_created_at.desc" });
      setWebhooks(rows);
      setSelectedId((cur) =>
        cur && rows.some((r) => r._row_id === cur) ? cur : (rows[0]?._row_id ?? null),
      );
    } catch {
      setWebhooks([]);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await db.query<SendRow>("send_log", { order: "_created_at.desc", limit: "15" }));
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadWebhooks();
    void loadHistory();
  }, [user, loadWebhooks, loadHistory]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <AuthPanel />;

  const selected = webhooks.find((w) => w._row_id === selectedId) ?? null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Send className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-none">Webhook Sender</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AdminLink />
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <WebhookList
            webhooks={webhooks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChanged={loadWebhooks}
          />
          <SendHistory rows={history} />
        </div>
        <Composer webhook={selected} onSent={loadHistory} />
      </main>
    </div>
  );
};

export default Index;
