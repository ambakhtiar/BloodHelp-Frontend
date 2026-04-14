import { ReactNode } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";

export default function HospitalLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["HOSPITAL", "ADMIN", "SUPER_ADMIN"]}>
      {children}
    </RoleGuard>
  );
}
