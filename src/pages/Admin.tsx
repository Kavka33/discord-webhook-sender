import { useCallback, useEffect, useState } from "react";
import db from "@/lib/shared/kliv-database.js";
import { useSession } from "@/hooks/use-session";
import { AdminWebhooks, type AdminWebhookRow } from "@/components/AdminWebhooks";
import { SendHistory, type SendRow } from "@/components/SendHistory";
import { UserAdmin } from "@/components/UserAdmin";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Loader2 } from "lucide-react";

const Admin = () => {
  const { user, loading, signOut } = useSession();
  const [webhooks, setWebhooks] = useState<AdminWebhookRow[]>([]);
  const [history, setHistory] = useState<SendRow[]>([]);

  const loadWebhooks = useCallback(async () => {
    try {
      setWebhooks(await db.query<AdminWebhookRow>("webhooks", { order: "_created_at.desc" }));
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

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-none">Admin</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr]">
        <div className="space-y-6">
          <UserAdmin />
          <AdminWebhooks rows={webhooks} onChanged={loadWebhooks} />
          <SendHistory rows={history} />
        </div>
      </main>
    </div>
  );
};

export default Admin;
