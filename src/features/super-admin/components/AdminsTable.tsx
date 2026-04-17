"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Edit2, 
  Trash2, 
  MoreVertical, 
  UserCog, 
  UserCheck, 
  UserX,
  ShieldCheck,
  Search,
  SortAsc,
  SortDesc,
  Filter,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  MapPin
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SuperAdminServices } from "@/services/superAdmin.service";
import { IManageAdminResponse } from "@/types";
import { useState } from "react";
import { EditAdminModal } from "./EditAdminModal";

export function AdminsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [accountStatus, setAccountStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [adminToEdit, setAdminToEdit] = useState<IManageAdminResponse | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<IManageAdminResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: adminsRes, isLoading } = useQuery({
    queryKey: ["admins", searchTerm, sortBy, sortOrder, accountStatus, page],
    queryFn: () => SuperAdminServices.getAllAdmins({ 
      searchTerm, 
      sortBy, 
      sortOrder, 
      accountStatus: accountStatus || undefined,
      page,
      limit: 10
    }),
  });

  const toggleAccessMutation = useMutation({
    mutationFn: ({ id, accountStatus }: { id: string; accountStatus: string }) => SuperAdminServices.toggleAdminAccess(id, accountStatus),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Access status updated");
        queryClient.invalidateQueries({ queryKey: ["admins"] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update access");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: SuperAdminServices.deleteAdmin,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Admin account deleted");
        queryClient.invalidateQueries({ queryKey: ["admins"] });
        setAdminToDelete(null);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete admin");
    },
  });

  const admins = adminsRes?.data || [];
  const meta = adminsRes?.meta;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
        <div className="h-64 w-full bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ────────────────── Modern Search and Filters ────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-card/60 backdrop-blur-md p-5 rounded-2xl border border-primary/10 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search admins by name, email, or phone..."
            className="pl-10 h-12 rounded-xl border-primary/10 bg-background/50 font-medium focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={accountStatus} onValueChange={(v) => { setAccountStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[150px] h-12 rounded-xl border-primary/10 bg-background/50 font-black text-[10px] tracking-[0.2em] uppercase">
              <Filter className="h-4 w-4 mr-2 text-primary/70" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE" className="text-emerald-600 font-bold">Active Only</SelectItem>
              <SelectItem value="BLOCKED" className="text-destructive font-bold">Blocked Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[150px] h-12 rounded-xl border-primary/10 bg-background/50 font-black text-[10px] tracking-[0.2em] uppercase">
              <SortAsc className="h-4 w-4 mr-2 text-primary/70" />
              <span>{sortBy === "createdAt" ? "Date" : "Name"}</span>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10">
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="name">Admin Name</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl border-primary/10 bg-background/50 shadow-sm hover:translate-y-[-1px] transition-all"
            onClick={() => { setSortOrder(sortOrder === "asc" ? "desc" : "asc"); setPage(1); }}
          >
            {sortOrder === "asc" ? <SortAsc className="h-5 w-5 text-primary" /> : <SortDesc className="h-5 w-5 text-primary" />}
          </Button>
        </div>
      </div>

      {/* ────────────────── Enhanced Table Container ────────────────── */}
      <div className="rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-sm shadow-xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5 border-primary/5">
                <TableHead className="h-14 font-black text-primary uppercase text-[11px] tracking-[0.2em] pl-6">
                  Administrator
                </TableHead>
                <TableHead className="font-black text-primary uppercase text-[11px] tracking-[0.2em]">
                  Account Access
                </TableHead>
                <TableHead className="font-black text-primary uppercase text-[11px] tracking-[0.2em]">
                  Status
                </TableHead>
                <TableHead className="text-right pr-6 font-black text-primary uppercase text-[11px] tracking-[0.2em]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-medium italic">
                    No administrative accounts found matching your query.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin: any) => (
                  <TableRow key={admin.id} className="hover:bg-primary/5 transition-all duration-300 border-primary/5">
                    <TableCell className="pl-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white border-2 border-slate-700 shrink-0 shadow-lg">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground/90">
                            {admin.name}
                          </span>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                            ID: {admin.id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-foreground/80 font-semibold tracking-tight uppercase text-xs">{admin.user.email}</span>
                        <span className="text-[11px] font-bold text-muted-foreground tracking-tighter">{admin.user.contactNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge 
                        variant={admin.user.accountStatus === "ACTIVE" ? "default" : "destructive"}
                        className={cn(
                          "gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                          admin.user.accountStatus === "ACTIVE" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                        )}
                      >
                        {admin.user.accountStatus === "ACTIVE" ? (
                          <UserCheck className="h-3 w-3" />
                        ) : (
                          <UserX className="h-3 w-3" />
                        )}
                        {admin.user.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all shadow-none">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-primary/10 shadow-2xl p-2">
                          <DropdownMenuItem onClick={() => setAdminToEdit(admin)} className="cursor-pointer rounded-xl h-11 px-3 focus:bg-primary/5 focus:text-primary transition-colors">
                            <Edit2 className="mr-3 h-4 w-4 text-blue-500" />
                            <span className="font-bold text-xs uppercase tracking-wider">Update Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const newStatus = admin.user.accountStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
                            toggleAccessMutation.mutate({ id: admin.id, accountStatus: newStatus });
                          }} className="cursor-pointer rounded-xl h-11 px-3 focus:bg-amber-50 focus:text-amber-700 transition-colors">
                            <UserCog className="mr-3 h-4 w-4 text-amber-500" />
                            <span className="font-bold text-xs uppercase tracking-wider">
                              {admin.user.accountStatus === "ACTIVE" ? "Revoke Access" : "Restore Access"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer rounded-xl h-11 px-3 transition-colors mt-1"
                            onClick={() => setAdminToDelete(admin)}
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
                            <span className="font-bold text-xs uppercase tracking-wider">Terminate Account</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ────────────────── Modern Unified Pagination ────────────────── */}
      {!meta ? null : (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-card/60 backdrop-blur-md border border-primary/10 rounded-2xl shadow-xl shadow-primary/5 gap-4 mt-6">
          <div className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] text-center sm:text-left">
            Showing <span className="text-foreground font-black">{(page - 1) * meta.limit + 1}-{Math.min(page * meta.limit, meta.total)}</span> of <span className="text-foreground font-black">{meta.total}</span> Admins
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl border-primary/10 bg-background/50 font-black text-[10px] tracking-widest uppercase transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-[0.1px] shadow-primary/5 disabled:opacity-30"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1.5 text-primary" />
              Prev
            </Button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10">
              <span className="text-[10px] font-black text-primary/40 tracking-tighter mr-1">PAGE</span>
              {Array.from({ length: Math.ceil(meta.total / meta.limit) })
                .slice(Math.max(0, page - 3), Math.min(Math.ceil(meta.total / meta.limit), page + 2))
                .map((_, i) => {
                  const pageNum = Math.max(0, page - 3) + i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 rounded-lg font-black text-xs transition-all",
                        page === pageNum 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                          : "text-primary/60 hover:bg-primary/10 hover:text-primary"
                      )}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl border-primary/10 bg-background/50 font-black text-[10px] tracking-widest uppercase transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-[0.1px] shadow-primary/5 disabled:opacity-30"
              onClick={() => setPage((p) => Math.min(Math.ceil(meta.total / meta.limit), p + 1))}
              disabled={page === Math.ceil(meta.total / meta.limit)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1.5 text-primary" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      <EditAdminModal 
        admin={adminToEdit} 
        isOpen={!!adminToEdit} 
        onClose={() => setAdminToEdit(null)} 
      />

      <AlertDialog open={!!adminToDelete} onOpenChange={() => setAdminToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the administrative account for <strong className="text-foreground">{adminToDelete?.name}</strong>. This cannot be undone and will revoke all access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-2 h-11 font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 rounded-xl h-11 font-bold"
              onClick={() => adminToDelete && deleteMutation.mutate(adminToDelete.id)}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
