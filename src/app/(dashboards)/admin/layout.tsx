"use client";

import { ReactNode, useState } from "react";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import AdminHeader from "@/features/admin/components/AdminHeader";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        {/* Desktop Sidebar - Fixed and Scrollable if needed */}
        <aside className="hidden md:block w-72 shrink-0 border-r bg-card h-full overflow-y-auto">
          <AdminSidebar />
        </aside>

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="sr-only">
                <SheetTitle>Admin Navigation</SheetTitle>
            </SheetHeader>
            <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
