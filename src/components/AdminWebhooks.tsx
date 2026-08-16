import { useState } from "react";
import db from "@/lib/shared/kliv-database.js";
import { isValidWebhookUrl, maskWebhookUrl } from "@/lib/discord";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Webhook as WebhookIcon, Shield } from "lucide-react";
import { toast } from "sonner";

export interface AdminWebhookRow {
  _row_id: number;
  name: string;
  url: string;
  note?: string | null;
  admin_note?: string | null;
  _created_by?: string;
  _created_at: number;
}

interface Props {
  rows: AdminWebhookRow[];
  onChanged: () => void;
}

export function AdminWebhooks({ rows, onChanged }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidWebhookUrl(url)) {
      toast.error("That doesn't look like a Discord webhook URL.");
      return;
    }
    setBusy(true);
    try {
      await db.insert("webhooks", { name: name.trim() || "Untitled webhook", url: url.trim(), note: note.trim() || null });
      setName("");
      setUrl("");
      setNote("");
      setAdding(false);
      onChanged();
      toast.success("Webhook added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add webhook");
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

  async function updateAdminNote(id: number, text: string) {
    try {
      await db.update("webhooks", { _row_id: `eq.${id}` }, { admin_note: text || null });
      onChanged();
      toast.success("Note saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save note");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Shield className="h-4 w-4 text-primary" />
            All webhooks
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setAdding((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <form onSubmit={add} className="space-y-3 rounded-lg border border-border p-3">
            <div className="space-y-1.5">
              <Label htmlFor="aw-name">Label</Label>
              <Input id="aw-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Announcements" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aw-url">Webhook URL</Label>
              <Input
                id="aw-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aw-note">User note</Label>
              <Textarea
                id="aw-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional description for the owner"
              />
            </div>
            <Button type="submit" size="sm" disabled={busy}>
              Save webhook
            </Button>
          </form>
        )}

        {rows.length === 0 && !adding && <p className="py-6 text-center text-sm text-muted-foreground">No webhooks.</p>}

        <ul className="space-y-3">
          {rows.map((w) => (
            <li key={w._row_id} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <WebhookIcon className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{w.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{maskWebhookUrl(w.url)}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" aria-label={`Delete ${w.name}`} onClick={() => void remove(w._row_id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              {w.note && <p className="mb-2 text-xs text-muted-foreground">Note: {w.note}</p>}

              <div className="space-y-1.5">
                <Label htmlFor={`admin-note-${w._row_id}`} className="text-xs">
                  Admin note
                </Label>
                <Textarea
                  id={`admin-note-${w._row_id}`}
                  rows={2}
                  defaultValue={w.admin_note || ""}
                  onBlur={(e) => void updateAdminNote(w._row_id, e.target.value)}
                  placeholder="Only you can see this..."
                  className="text-xs"
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
