import { useAuth } from "@/stores/auth.store";
import { can, type Permission } from "./guards";

interface CanProps {
    perm?: Permission | Permission[];
    mode?: "ALL" | "ANY"; // "ALL" exige todas, "ANY" exige pelo menos uma
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function Can({
    perm,
    mode = "ANY",
    children,
    fallback = null,
}: CanProps) {
    const role = useAuth((s) => s.user?.role);

    if (!perm) return <>{children}</>;

    const perms = Array.isArray(perm) ? perm : [perm];

    const hasPermission = mode === "ALL"
        ? perms.every((p) => can(role, p))
        : perms.some((p) => can(role, p));

    return <>{hasPermission ? children : fallback}</>;
}