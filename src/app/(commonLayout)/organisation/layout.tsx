import { ReactNode } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";

export default function OrganisationLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["ORGANISATION", "ADMIN", "SUPER_ADMIN"]}>
      {children}
    </RoleGuard>
  );
}
