import { useSession } from "@/hooks/use-session";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLink() {
  const { user } = useSession();
  if (!user?.isPrimaryTeam) return null;
  return (
    <Link to="/admin">
      <Button size="sm" variant="ghost">
        <Shield className="mr-2 h-4 w-4" />
        Admin
      </Button>
    </Link>
  );
}
