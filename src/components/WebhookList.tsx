import { useState } from "react";
import db from "@/lib/shared/kliv-database.js";
import { isValidWebhookUrl, maskWebhookUrl } from "@/lib/discord";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Webhook as WebhookIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface WebhookRow {
  _row_id: number;
  name: string;
  url: string;
  note?: string | null;
}

interface Props {
  webhooks: WebhookRow[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onChanged: () => void;
}

export function WebhookList({ webhooks, selectedId, onSelect, onChanged }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidWebhookUrl(url)) {
      toast.error("That doesn't look like a Discord webhook URL.");
      return;
    }
    setBusy(true);
    try {
      await db.insert("webhooks", { name: name.trim() || "Untitled webhook", url: url.trim() });
      setName("");
      setUrl("");
      setAdding(false);
      onChanged();
      toast.success("Webhook saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save webhook");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    try {
      await db.delete("webhooks", { _row_id: `eq.${id}` });
      onChanged();
      toast.success("Webhook removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove webhook");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-display text-base">Your webhooks</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <form onSubmit={add} className="space-y-3 rounded-lg border border-border p-3">
            <div className="space-y-1.5">
              <Label htmlFor="wh-name">Label</Label>
              <Input
                id="wh-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Announcements"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-url">Webhook URL</Label>
              <Input
                id="wh-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>
            <Button type="submit" size="sm" disabled={busy}>
              Save webhook
            </Button>
          </form>
        )}

        {webhooks.length === 0 && !adding && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No webhooks yet. Add one to start sending.
          </p>
        )}

        <ul className="space-y-2">
          {webhooks.map((w) => (
            <li key={w._row_id}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  selectedId === w._row_id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent",
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => onSelect(w._row_id)}
                  aria-label={`Select ${w.name}`}
                >
                  <WebhookIcon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{w.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {maskWebhookUrl(w.url)}
                    </span>
                  </span>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${w.name}`}
                  onClick={() => remove(w._row_id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
