import { useAuth } from "@/stores/auth.store";
import { can, type Permission } from "./guards";

export function Can({
    perm,
    children,
    fallback = null,
}: {
    perm: Permission;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    const role = useAuth((s) => s.user?.role);
    return <>{can(role, perm) ? children : fallback}</>;
}
