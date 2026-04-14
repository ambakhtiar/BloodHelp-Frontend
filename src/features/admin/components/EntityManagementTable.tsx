"use client";

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
  Filter
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

interface EntityManagementTableProps {
  entityType: "users" | "hospitals" | "organisations";
}

export default function EntityManagementTable({ entityType }: EntityManagementTableProps) {
  const queryClient = useQueryClient();
  
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
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex flex-1 items-center gap-2 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {entityType === "users" && (
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-3.5 w-3.5 mr-2 opacity-70" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="USER">Donors</SelectItem>
                <SelectItem value="HOSPITAL">Hospitals</SelectItem>
                <SelectItem value="ORGANISATION">Organisations</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead 
                className="w-[250px] cursor-pointer hover:text-primary transition-colors"
              >
                Entity Information
              </TableHead>
              <TableHead>Contact Info</TableHead>
              {entityType === "users" && <TableHead>Role</TableHead>}
              <TableHead>Account Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  Joined Date
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell>
                </TableRow>
               ))
            ) : entities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                  No {entityType} found in records.
                </TableCell>
              </TableRow>
            ) : (
              entities.map((entity: IUser) => (
              <TableRow key={entity.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">
                      {entity.hospital?.name || entity.organisation?.name || entity.donorProfile?.name || entity.admin?.name || "System User"}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {entity.email || "No email"}
                    </span>
                    {entity.role === "HOSPITAL" && entity.hospital?.registrationNumber && (
                        <span className="text-[10px] text-blue-600 font-medium">Reg: {entity.hospital.registrationNumber}</span>
                    )}
                    {entity.role === "ORGANISATION" && entity.organisation?.registrationNumber && (
                        <span className="text-[10px] text-purple-600 font-medium">Reg: {entity.organisation.registrationNumber}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" /> {entity.contactNumber}
                    </span>
                    <span className="text-[11px] font-medium text-foreground/70">
                        {entity.upazila}, {entity.district}
                    </span>
                  </div>
                </TableCell>
                {entityType === "users" && (
                    <TableCell>
                        <Badge variant="secondary" className="font-normal text-[11px] uppercase tracking-wider">
                            {entity.role}
                        </Badge>
                    </TableCell>
                )}
                <TableCell>{getStatusBadge(entity.accountStatus)}</TableCell>
                <TableCell>
                  <span className="text-xs flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {format(new Date(entity.createdAt), "MMM dd, yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Manage Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => mutation.mutate({ id: entity.id, status: "ACTIVE" })}
                        disabled={entity.accountStatus === "ACTIVE" || mutation.isPending}
                        className="cursor-pointer"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        <span>Approve / Active</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => mutation.mutate({ id: entity.id, status: "REJECTED" })}
                        disabled={entity.accountStatus === "REJECTED" || mutation.isPending}
                        className="cursor-pointer"
                      >
                        <XCircle className="mr-2 h-4 w-4 text-rose-500" />
                        <span>Reject Account</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => mutation.mutate({ id: entity.id, status: "BLOCKED" })}
                        disabled={entity.accountStatus === "BLOCKED" || mutation.isPending}
                        className="cursor-pointer"
                      >
                        <Ban className="mr-2 h-4 w-4 text-orange-500" />
                        <span>Block User</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-4 bg-muted/20 border-t">
        <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{entities.length}</span> of{" "}
            <span className="font-medium">{meta?.total || 0}</span> results
        </div>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
            </Button>
            <div className="text-sm font-medium px-2">
                Page {page} of {Math.ceil((meta?.total || 0) / limit) || 1}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={entities.length < limit || isLoading}
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
      </div>
    </div>
  </div>
);
}
