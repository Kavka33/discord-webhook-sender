import { useCallback, useEffect, useState } from "react";
import auth from "@/lib/shared/kliv-auth.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserMinus, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import type { KlivUser } from "@/lib/shared/kliv-auth.js";

export function UserAdmin() {
  const [users, setUsers] = useState<KlivUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const res = await auth.listUsers();
      setUsers(res.data);
      setAdminUserId(res.data.find((u) => u.email === "elisejvlogslovakia@gmail.com")?.userUuid || null);
    } catch (err) {
      toast.error("Could not load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function toggleAdmin(uuid: string, makeAdmin: boolean) {
    if (uuid === adminUserId) {
      toast.error("Cannot change your own admin status");
      return;
    }
    try {
      const user = users.find((u) => (u.userUuid ?? "") === uuid);
      if (!user) return;
      
      const isAdmin = Array.isArray(user.groups)
        ? user.groups.some((g) => (typeof g === "string" ? g === "admin" : g.key === "admin"))
        : typeof user.groups === "string"
        ? user.groups === "admin"
        : false;

      const groupKeys = Array.isArray(user.groups)
        ? user.groups.map((g) => typeof g === "string" ? g : g.key)
        : typeof user.groups === "string"
        ? [user.groups]
        : [];

      const newGroups = groupKeys.filter((g) => g !== "admin");
      if (makeAdmin && !isAdmin) {
        newGroups.push("admin");
      }
      
      await auth.setUserGroups(uuid, newGroups);
      await loadUsers();
      toast.success(makeAdmin ? "Admin granted" : "Admin removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update user");
    }
  }

  async function disableUser(uuid: string) {
    if (uuid === adminUserId) {
      toast.error("Cannot disable your own account");
      return;
    }
    try {
      await auth.disableUser(uuid);
      await loadUsers();
      toast.success("User disabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not disable user");
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Shield className="h-4 w-4 text-primary" />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isUserAdmin = (u: KlivUser): boolean => {
    if (Array.isArray(u.groups)) {
      return u.groups.some((g) => (typeof g === "string" ? g === "admin" : g.key === "admin"));
    }
    return typeof u.groups === "string" && u.groups === "admin";
  };

  const getUserUuid = (u: KlivUser): string => {
    return u.userUuid ?? "";
  };

  const getUserEmail = (u: KlivUser): string => {
    return u.email ?? "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-base">
          <Users className="h-4 w-4 text-primary" />
          Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {users.map((u) => {
            const isAdmin = isUserAdmin(u);
            const isYou = getUserUuid(u) === adminUserId;
            const enabled = u.enabled ?? true;
            
            return (
              <li key={getUserUuid(u)} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {u.firstName || ""} {u.lastName || ""} {isYou && "(you)"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{getUserEmail(u)}</p>
                  <div className="mt-1 flex gap-2 text-xs">
                    {isAdmin && <span className="text-primary">Admin</span>}
                    {!enabled && <span className="text-destructive">Disabled</span>}
                  </div>
                </div>
                
                <div className="ml-3 flex gap-2">
                  {!isYou && (
                    <Button
                      size="sm"
                      variant={isAdmin ? "outline" : "ghost"}
                      onClick={() => void toggleAdmin(getUserUuid(u), !isAdmin)}
                    >
                      {isAdmin ? "Remove admin" : "Make admin"}
                    </Button>
                  )}
                  {!isYou && enabled && (
                    <Button size="sm" variant="ghost" onClick={() => void disableUser(getUserUuid(u))}>
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
