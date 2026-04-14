import { ReactNode } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["USER", "HOSPITAL", "ORGANISATION", "ADMIN", "SUPER_ADMIN"]}>
      {children}
    </RoleGuard>
  );
}
