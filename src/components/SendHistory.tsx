import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export interface SendRow {
  _row_id: number;
  webhook_name?: string | null;
  content?: string | null;
  status: string;
  error?: string | null;
  _created_at: number;
}

function when(ts: number) {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toLocaleString();
}

export function SendHistory({ rows }: { rows: SendRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base">Recent sends</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nothing sent yet.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r._row_id} className="flex gap-3 rounded-lg border border-border p-3">
                {r.status === "ok" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {r.content?.trim() || <span className="italic text-muted-foreground">Embed only</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.webhook_name || "Manual URL"} · {when(r._created_at)}
                  </p>
                  {r.status !== "ok" && r.error && (
                    <p className="mt-1 truncate text-xs text-destructive">{r.error}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
