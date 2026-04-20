import { ReactNode } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["USER"]}>
      {children}
    </RoleGuard>
  );
}
