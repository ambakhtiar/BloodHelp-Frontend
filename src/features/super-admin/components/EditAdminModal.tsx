"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAdminSchema } from "@/validations/superAdmin.validation";
import { SuperAdminServices } from "@/services/superAdmin.service";
import { IManageAdminResponse } from "@/types";
import { LocationSelector } from "@/components/shared/LocationSelector";

interface EditAdminModalProps {
  admin: IManageAdminResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRY_CODE = "+880";

export function EditAdminModal({ admin, isOpen, onClose }: EditAdminModalProps) {
  const queryClient = useQueryClient();

  // Extract initial phone without country code
  const initialPhone = admin?.user.contactNumber.startsWith(COUNTRY_CODE) 
    ? admin.user.contactNumber.slice(COUNTRY_CODE.length) 
    : admin?.user.contactNumber || "";

  const mutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) => 
      SuperAdminServices.updateAdmin(payload.id, payload.data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Admin updated successfully");
        queryClient.invalidateQueries({ queryKey: ["admins"] });
        onClose();
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update admin");
    },
  });

  const form = useForm({
    defaultValues: {
      name: admin?.name || "",
      email: admin?.user.email || "",
      phone: initialPhone,
      division: admin?.user.division || "",
      district: admin?.user.district || "",
      upazila: admin?.user.upazila || "",
    },
    onSubmit: async ({ value }) => {
      if (!admin) return;
      const payload: any = {
        name: value.name,
      };
      
      if (value.phone !== initialPhone) {
        payload.contactNumber = `${COUNTRY_CODE}${value.phone}`;
      }
      if (value.email !== admin.user.email) payload.email = value.email;
      if (value.division !== admin.user.division) payload.division = value.division;
      if (value.district !== admin.user.district) payload.district = value.district;
      if (value.upazila !== admin.user.upazila) payload.upazila = value.upazila;
      
      mutation.mutate({ id: admin.id, data: payload });
    },
  });

  if (!admin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Admin Details</DialogTitle>
        </DialogHeader>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6 py-4"
        >
          <div className="space-y-4">
            {/* Name */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const result = updateAdminSchema.shape.name.safeParse(value);
                  return result.success ? undefined : result.error.issues[0].message;
                },
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Full Name</Label>
                  <Input
                    id={field.name}
                    placeholder="Enter admin name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors && (
                    <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
                  )}
                </div>
              )}
            />

            {/* Phone */}
            <form.Field
              name="phone"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Phone Number</Label>
                  <div className="flex">
                    <div className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground select-none">
                      🇧🇩 {COUNTRY_CODE}
                    </div>
                    <Input
                      id={field.name}
                      placeholder="1XXXXXXXXX"
                      className="rounded-l-none"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.startsWith("0")) val = val.substring(1);
                        field.handleChange(val.slice(0, 10));
                      }}
                    />
                  </div>
                </div>
              )}
            />
            
            {/* Email */}
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined;
                  const result = updateAdminSchema.shape.email?.safeParse(value);
                  return result?.success ? undefined : result?.error.issues[0].message;
                },
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email Address</Label>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="admin@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors && (
                    <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Assigned Location</p>
            <form.Subscribe
              selector={(state) => [state.values.division, state.values.district, state.values.upazila]}
              children={([division, district, upazila]) => (
                <LocationSelector
                  division={division as string}
                  district={district as string}
                  upazila={upazila as string}
                  onChange={(field, value) => form.setFieldValue(field as any, value)}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || mutation.isPending}>
                  {(isSubmitting || mutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              )}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
