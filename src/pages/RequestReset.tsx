import { useState } from "react";
import auth from "@/lib/shared/kliv-auth.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const RequestReset = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await auth.requestPasswordReset(email);
      console.log("Password reset requested:", result);
      toast.success("Password reset email sent (if email exists)");
      setEmail("");
    } catch (err) {
      console.error("Password reset error:", err);
      toast.error(err instanceof Error ? err.message : "Could not request reset");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">Forgot password?</h1>
          <p className="text-sm text-muted-foreground">Enter your email to receive a reset link.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Request reset</CardTitle>
            <CardDescription>We'll send instructions to your email.</CardDescription>
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
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Check your inbox for the reset email
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RequestReset;
