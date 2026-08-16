import { useState } from "react";
import auth from "@/lib/shared/kliv-auth.js";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthPanel() {
  const { refresh } = useSession();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        await auth.signUp(email, password);
        toast.success("Account created");
      }
      const result = await auth.signIn(email, password);
      if (result.status === "totp_required") {
        toast.error("Two-factor sign-in isn't supported here yet.");
        return;
      }
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <Send className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Webhook Sender</h1>
          <p className="text-sm text-muted-foreground">
            Save your Discord webhooks and post messages in seconds.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">
              {mode === "in" ? "Sign in" : "Create an account"}
            </CardTitle>
            <CardDescription>Your webhooks stay private to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "in" ? "Sign in" : "Sign up"}
              </Button>
            </form>
            <button
              type="button"
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMode(mode === "in" ? "up" : "in")}
            >
              {mode === "in" ? "No account? Sign up" : "Already have an account? Sign in"}
            </button>
            <div className="mt-2 text-center">
              <a href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                Forgot password?
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
