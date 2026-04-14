"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, CalendarDays } from "lucide-react";

import { updateVolunteerDonationDate } from "@/services/organisation.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpdateDonationDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  bloodDonorId: string;
  volunteerName: string;
}

interface UpdateDateFormValues {
  donationDate: string;
}

export default function UpdateDonationDateModal({
  isOpen,
  onClose,
  bloodDonorId,
  volunteerName,
}: UpdateDonationDateModalProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ date }: { date: string }) =>
      updateVolunteerDonationDate(bloodDonorId, { donationDate: new Date(date).toISOString() }),
    onSuccess: () => {
      toast.success("Donation date updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      onClose();
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err.message || "Failed to update donation date.";
      toast.error(errorMessage);
    },
  });

  const form = useForm<UpdateDateFormValues>({
    defaultValues: {
      donationDate: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({ date: value.donationDate });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <CalendarDays className="w-5 h-5 text-primary" />
            Update Donation Date
          </DialogTitle>
          <DialogDescription>
            Set the last donation date for <span className="font-semibold text-slate-700">{volunteerName}</span>.
            This will update their donation eligibility automatically.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4 py-2"
        >
          <form.Field
            name="donationDate"
            validators={{
              onChange: ({ value }) => {
                const result = z.string().min(1, "Please select a donation date").safeParse(value);
                return result.success ? undefined : result.error.issues[0]?.message;
              },
            }}
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="font-bold text-slate-700">
                  Donation Date & Time *
                </Label>
                <Input
                  id={field.name}
                  type="datetime-local"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                  className={field.state.meta.errors.length ? "border-destructive" : "border-slate-200"}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">{field.state.meta.errors[0]?.toString()}</p>
                )}
              </div>
            )}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                "Save Date"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
