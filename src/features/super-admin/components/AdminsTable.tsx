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
  Search
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SuperAdminServices } from "@/services/superAdmin.service";
import { IManageAdminResponse } from "@/types";
import { useState } from "react";
import { EditAdminModal } from "./EditAdminModal";

export function AdminsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [adminToEdit, setAdminToEdit] = useState<IManageAdminResponse | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<IManageAdminResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: adminsRes, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: SuperAdminServices.getAllAdmins,
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

  const filteredAdmins = adminsRes?.data?.filter((admin) =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.user.contactNumber.includes(searchTerm)
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
        <div className="h-64 w-full bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search admins by name, email, or phone..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Administrator</TableHead>
              <TableHead>Contact Information</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No administrative accounts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        {admin.name}
                      </span>
                      <span className="text-xs text-muted-foreground">ID: {admin.id.slice(-8).toUpperCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="text-foreground">{admin.user.email}</span>
                      <span className="text-muted-foreground">{admin.user.contactNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={admin.user.accountStatus === "ACTIVE" ? "default" : "destructive"}
                      className="gap-1"
                    >
                      {admin.user.accountStatus === "ACTIVE" ? (
                        <UserCheck className="h-3 w-3" />
                      ) : (
                        <UserX className="h-3 w-3" />
                      )}
                      {admin.user.accountStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setAdminToEdit(admin)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const newStatus = admin.user.accountStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
                          toggleAccessMutation.mutate({ id: admin.id, accountStatus: newStatus });
                        }}>
                          <UserCog className="mr-2 h-4 w-4" />
                          {admin.user.accountStatus === "ACTIVE" ? "Suspend Access" : "Activate Access"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => setAdminToDelete(admin)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
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

      {/* Modals & Dialogs */}
      <EditAdminModal 
        admin={adminToEdit} 
        isOpen={!!adminToEdit} 
        onClose={() => setAdminToEdit(null)} 
      />

      <AlertDialog open={!!adminToDelete} onOpenChange={() => setAdminToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the administrative account for <strong>{adminToDelete?.name}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
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
