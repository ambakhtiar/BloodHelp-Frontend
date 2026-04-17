"use client";

import { cn } from "@/lib/utils";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminServices } from "@/services/admin.service";
import { AccountStatus, IUser, UserRole } from "@/types";
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
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  Ban,
  Mail,
  Phone,
  Calendar,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  BadgeCheck,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuthContext } from "@/providers/AuthProvider";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EntityManagementTableProps {
  entityType: "users" | "hospitals" | "organisations";
}

export default function EntityManagementTable({ entityType }: EntityManagementTableProps) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthContext();
  
  // State for Filters, Sorting, and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Handle debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch logic with params
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-entities", entityType, debouncedSearch, statusFilter, roleFilter, page, sortBy, sortOrder],
    queryFn: () => {
      const params: any = {
        searchTerm: debouncedSearch,
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (statusFilter !== "ALL") params.accountStatus = statusFilter;
      if (roleFilter !== "ALL") params.role = roleFilter;

      if (entityType === "users") return AdminServices.getUsers(params);
      if (entityType === "hospitals") return AdminServices.getHospitals(params);
      return AdminServices.getOrganisations(params);
    },
  });

  // Mutation logic for status updates
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AccountStatus }) => {
      if (entityType === "users") return AdminServices.updateUserStatus(id, status);
      if (entityType === "hospitals") return AdminServices.updateHospitalStatus(id, status);
      return AdminServices.updateOrganisationStatus(id, status);
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-entities"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update status");
    },
  });

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-100">Active</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-50">Pending</Badge>;
      case "BLOCKED":
        return <Badge variant="destructive">Blocked</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-none hover:bg-rose-100">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const isActionRestricted = (targetUser: IUser) => {
    if (!currentUser) return true;
    
    // 1. Cannot act on self
    if (targetUser.id === currentUser.id) return true;

    // 2. Admins cannot act on other Admins or Super Admins
    if (currentUser.role === "ADMIN" && (targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN")) {
      return true;
    }

    return false;
  };

  const getRestrictionReason = (targetUser: IUser) => {
    if (targetUser.id === currentUser?.id) return "You cannot manage your own account status.";
    if (currentUser?.role === "ADMIN" && (targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN")) {
      return "You do not have permission to manage other administrative accounts.";
    }
    return "";
  };

  const entities = response?.data || [];
  const meta = response?.meta;

  if (isLoading && !debouncedSearch) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ────────────────── Modern Controls Bar ────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between bg-card/60 backdrop-blur-md p-5 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${entityType}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {entityType === "users" && (
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px] h-12 rounded-xl border-primary/10 bg-background/50 font-semibold text-xs tracking-wider uppercase">
                <Filter className="h-4 w-4 mr-2 text-primary/70" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-primary/10">
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="USER">Donors</SelectItem>
                <SelectItem value="HOSPITAL">Hospitals</SelectItem>
                <SelectItem value="ORGANISATION">Organisations</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-12 rounded-xl border-primary/10 bg-background/50 font-semibold text-xs tracking-wider uppercase">
              <BadgeCheck className="h-4 w-4 mr-2 text-primary/70" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE" className="text-emerald-600 font-medium">Active</SelectItem>
              <SelectItem value="PENDING" className="text-amber-600 font-medium">Pending</SelectItem>
              <SelectItem value="BLOCKED" className="text-destructive font-medium">Blocked</SelectItem>
              <SelectItem value="REJECTED" className="text-rose-600 font-medium">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ────────────────── Enhanced Table Container ────────────────── */}
      <div className="rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-sm shadow-xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5 border-primary/5">
                <TableHead className="w-[300px] h-14 font-bold text-primary uppercase text-[11px] tracking-widest pl-6">
                  Entity Information
                </TableHead>
                <TableHead className="font-bold text-primary uppercase text-[11px] tracking-widest">
                  Contact Details
                </TableHead>
                {entityType === "users" && (
                  <TableHead className="font-bold text-primary uppercase text-[11px] tracking-widest">
                    Role
                  </TableHead>
                )}
                <TableHead className="font-bold text-primary uppercase text-[11px] tracking-widest">
                  Account Status
                </TableHead>
                <TableHead 
                  className="cursor-pointer font-bold text-primary uppercase text-[11px] tracking-widest group"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-1.5">
                    Registration Date
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
                <TableHead className="text-right pr-6 font-bold text-primary uppercase text-[11px] tracking-widest">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="py-8"><Skeleton className="h-12 w-full rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : entities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground/60 italic font-medium">
                    No matching records found in our database.
                  </TableCell>
                </TableRow>
              ) : (
                entities.map((entity: IUser) => (
                <TableRow key={entity.id} className="hover:bg-primary/5 transition-all duration-300 border-primary/5">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 shrink-0">
                        {(entity.hospital?.name || entity.organisation?.name || entity.donorProfile?.name || entity.admin?.name || "S")[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-foreground/90 leading-none mb-1">
                          {entity.hospital?.name || entity.organisation?.name || entity.donorProfile?.name || entity.admin?.name || "System User"}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Mail className="h-3 w-3 opacity-60" /> {entity.email || "No email"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="flex items-center gap-1.5 text-foreground/80 font-semibold tracking-tight">
                        <Phone className="h-3 w-3 text-primary opacity-70" /> {entity.contactNumber}
                      </span>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {entity.upazila}, {entity.district}
                      </span>
                    </div>
                  </TableCell>
                  {entityType === "users" && (
                    <TableCell className="py-4">
                      <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-widest px-2.5 py-0.5 border-primary/20 bg-primary/5 text-primary">
                        {entity.role}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="py-4">{getStatusBadge(entity.accountStatus)}</TableCell>
                  <TableCell className="py-4">
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5" /> {format(new Date(entity.createdAt), "MMM dd, yyyy")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="inline-block">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all shadow-none"
                                  disabled={isActionRestricted(entity)}
                                >
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-primary/10 shadow-2xl p-2">
                                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Manage Access</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-primary/5" />
                                <DropdownMenuItem 
                                  onClick={() => mutation.mutate({ id: entity.id, status: "ACTIVE" })}
                                  disabled={entity.accountStatus === "ACTIVE" || mutation.isPending}
                                  className="cursor-pointer rounded-xl h-11 px-3 focus:bg-emerald-50 focus:text-emerald-700 transition-colors"
                                >
                                  <CheckCircle2 className="mr-3 h-4.5 w-4.5 text-emerald-500" />
                                  <span className="font-bold text-sm text-[12px]">Approve / Activate</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => mutation.mutate({ id: entity.id, status: "REJECTED" })}
                                  disabled={entity.accountStatus === "REJECTED" || mutation.isPending}
                                  className="cursor-pointer rounded-xl h-11 px-3 focus:bg-rose-50 focus:text-rose-700 transition-colors"
                                >
                                  <XCircle className="mr-3 h-4.5 w-4.5 text-rose-500" />
                                  <span className="font-bold text-sm text-[12px]">Reject Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => mutation.mutate({ id: entity.id, status: "BLOCKED" })}
                                  disabled={entity.accountStatus === "BLOCKED" || mutation.isPending}
                                  className="cursor-pointer rounded-xl h-11 px-3 focus:bg-orange-50 focus:text-orange-700 transition-colors"
                                >
                                  <Ban className="mr-3 h-4.5 w-4.5 text-orange-500" />
                                  <span className="font-bold text-sm text-[12px]">Block / Restrict</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TooltipTrigger>
                        {isActionRestricted(entity) && (
                          <TooltipContent side="left" className="bg-destructive text-destructive-foreground rounded-xl border-none shadow-xl py-2 px-3">
                            <p className="text-[10px] font-black uppercase tracking-wider">{getRestrictionReason(entity)}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </div>

        {/* ────────────────── Modern Unified Pagination ────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-card/60 backdrop-blur-md border border-primary/10 rounded-2xl shadow-xl shadow-primary/5 gap-4 mt-6">
          <div className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] text-center sm:text-left">
            Showing <span className="text-foreground font-black">{(page - 1) * limit + 1}-{Math.min(page * limit, meta?.total || 0)}</span> of <span className="text-foreground font-black">{meta?.total || 0}</span> {entityType}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl border-primary/10 bg-background/50 font-black text-[10px] tracking-widest uppercase transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-[0.1px] shadow-primary/5 disabled:opacity-30"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1.5 text-primary" />
              Prev
            </Button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10">
              <span className="text-[10px] font-black text-primary/40 tracking-tighter mr-1">PAGE</span>
              {meta && Array.from({ length: Math.ceil(meta.total / limit) })
                .slice(Math.max(0, page - 3), Math.min(Math.ceil(meta.total / limit), page + 2))
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
              onClick={() => setPage((p) => p + 1)}
              disabled={entities.length < limit || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1.5 text-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
