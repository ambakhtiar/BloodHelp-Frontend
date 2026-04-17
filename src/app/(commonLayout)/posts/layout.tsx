import { ReactNode } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";

export default function PostsLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["USER", "HOSPITAL", "ORGANISATION", "ADMIN", "SUPER_ADMIN"]}>
      {children}
    </RoleGuard>
  );
}
