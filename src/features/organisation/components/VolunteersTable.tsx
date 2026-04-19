"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  MoreHorizontal,
  CalendarDays,
  Users,
  RefreshCw,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { getVolunteers, deleteVolunteer } from "@/services/organisation.service";
import { IOrganisationVolunteer } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UpdateDonationDateModal from "./UpdateDonationDateModal";
import EditVolunteerModal from "./EditVolunteerModal";

const BLOOD_GROUP_LABELS: Record<string, string> = {
  A_POSITIVE: "A+", A_NEGATIVE: "A-",
  B_POSITIVE: "B+", B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+", AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+", O_NEGATIVE: "O-",
};

interface ModalState {
  isOpen: boolean;
  bloodDonorId: string;
  volunteerName: string;
}

export default function VolunteersTable() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    bloodDonorId: "",
    volunteerName: "",
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    bloodDonorId: string;
    volunteerName: string;
  }>({
    isOpen: false,
    bloodDonorId: "",
    volunteerName: "",
  });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    volunteer: IOrganisationVolunteer | null;
  }>({
    isOpen: false,
    volunteer: null,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["volunteers"],
    queryFn: getVolunteers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVolunteer,
    onSuccess: () => {
      toast.success("Volunteer removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      setDeleteDialog({ isOpen: false, bloodDonorId: "", volunteerName: "" });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove volunteer.");
    },
  });

  const volunteers: IOrganisationVolunteer[] = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <p className="text-slate-500">Failed to load volunteers.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  if (volunteers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <Users className="w-12 h-12 text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-600">No Volunteers Yet</h3>
        <p className="text-sm text-slate-400">
          Add your first volunteer using the form above.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-bold text-slate-700">Name</TableHead>
              <TableHead className="font-bold text-slate-700">Contact</TableHead>
              <TableHead className="font-bold text-slate-700">Blood Group</TableHead>
              <TableHead className="font-bold text-slate-700">Gender</TableHead>
              <TableHead className="font-bold text-slate-700">Last Donation</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers.map((vol) => (
              <TableRow key={vol.id} className="hover:bg-slate-50/60">
                <TableCell className="font-medium text-slate-800">
                  {vol.status === "ACCEPTED" && vol.bloodDonor.userId && (vol.bloodDonor as any).user?.donorProfile ? (
                    <Link
                      href={`/profile/${vol.bloodDonor.userId}`}
                      className="text-primary hover:underline font-semibold"
                    >
                      {vol.bloodDonor.name}
                    </Link>
                  ) : (
                    <span>{vol.bloodDonor.name}</span>
                  )}
                </TableCell>
                <TableCell className="text-slate-600 text-sm">
                  {vol.bloodDonor.contactNumber}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-primary border-primary/40 bg-primary/5 font-bold">
                    {BLOOD_GROUP_LABELS[vol.bloodDonor.bloodGroup] ?? vol.bloodDonor.bloodGroup}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600 text-sm capitalize">
                  {vol.bloodDonor.gender.toLowerCase()}
                </TableCell>
                <TableCell className="text-slate-600 text-sm">
                  {vol.status === "PENDING" ? (
                    <span className="text-yellow-600 italic text-xs">Awaiting confirmation</span>
                  ) : vol.bloodDonor.lastDonationDate ? (
                    new Date(vol.bloodDonor.lastDonationDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  ) : (
                    <span className="text-slate-400 italic">Not recorded</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      vol.status === "ACCEPTED"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : vol.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : "bg-red-100 text-red-700 border-red-300"
                    }
                    variant="outline"
                  >
                    {vol.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open actions for {vol.bloodDonor.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {vol.bloodDonor.userId === null && (
                        <DropdownMenuItem
                          onClick={() =>
                            setModal({
                              isOpen: true,
                              bloodDonorId: vol.bloodDonorId,
                              volunteerName: vol.bloodDonor.name,
                            })
                          }
                          className="cursor-pointer"
                        >
                          <CalendarDays className="w-4 h-4 mr-2" />
                          Update Donation Date
                        </DropdownMenuItem>
                      )}

                      {vol.bloodDonor.userId === null && (
                        <DropdownMenuItem
                          onClick={() =>
                            setEditModal({
                              isOpen: true,
                              volunteer: vol,
                            })
                          }
                          className="cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Volunteer Info
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setDeleteDialog({
                            isOpen: true,
                            bloodDonorId: vol.bloodDonorId,
                            volunteerName: vol.bloodDonor.name,
                          })
                        }
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Volunteer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UpdateDonationDateModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, bloodDonorId: "", volunteerName: "" })}
        bloodDonorId={modal.bloodDonorId}
        volunteerName={modal.volunteerName}
      />

      <EditVolunteerModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, volunteer: null })}
        volunteer={editModal.volunteer}
      />

      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && setDeleteDialog({ ...deleteDialog, isOpen: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove <strong>{deleteDialog.volunteerName}</strong> from your
              organisation's volunteer list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteDialog.bloodDonorId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
