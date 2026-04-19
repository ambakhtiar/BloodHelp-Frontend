"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdminSchema, type CreateAdminFormValues } from "@/validations/superAdmin.validation";
import { SuperAdminServices } from "@/services/superAdmin.service";
import { LocationSelector } from "@/components/shared/LocationSelector";
import { useState } from "react";

const COUNTRY_CODE = "+880";

export function CreateAdminModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: SuperAdminServices.createAdmin,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Admin created successfully");
        queryClient.invalidateQueries({ queryKey: ["admins"] });
        setIsOpen(false);
        form.reset();
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create admin");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      division: "",
      district: "",
      upazila: "",
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        contactNumber: `${COUNTRY_CODE}${value.phone}`,
      };
      // Removing 'phone' as it's not in the API payload interface
      const { phone, ...finalPayload } = payload as any;
      mutation.mutate(finalPayload);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Administrative Account</DialogTitle>
        </DialogHeader>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6 py-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const result = createAdminSchema.shape.name.safeParse(value);
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

            {/* Email */}
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = createAdminSchema.shape.email.safeParse(value);
                  return result.success ? undefined : result.error.issues[0].message;
                },
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email Address</Label>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder={`admin@${process.env.NEXT_PUBLIC_APP_NAME_FF?.toLowerCase()}${process.env.NEXT_PUBLIC_APP_NAME_SS?.toLowerCase()}.com`}
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
                  {/* Validation for contactNumber is manually handled or derived */}
                </div>
              )}
            />

            {/* Password */}
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = createAdminSchema.shape.password.safeParse(value);
                  return result.success ? undefined : result.error.issues[0].message;
                },
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Initial Password</Label>
                  <Input
                    id={field.name}
                    type="password"
                    placeholder="Min 6 characters"
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
                  // Manual error passing if needed, though form.Field is preferred for deep validation
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || mutation.isPending}>
                  {(isSubmitting || mutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Admin
                </Button>
              )}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
