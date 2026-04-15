"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock, Loader2 } from "lucide-react";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/validations/auth.validation";
import { changePasswordApi } from "@/services/auth.service";
import { useAuthContext } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  hideOldPassword?: boolean;
}

export default function ChangePasswordForm({ onSuccess, hideOldPassword }: ChangePasswordFormProps) {
  const { refreshUser } = useAuthContext();

  const mutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      toast.success("Password changed successfully");
      form.reset();
      refreshUser(); 
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to change password");
    },
  });

  const form = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    } as ChangePasswordFormValues,
    validators: {
      onChange: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {!hideOldPassword && (
        <form.Field
          name="oldPassword"
          children={(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="password"
                  placeholder="Enter current password"
                  className={`${inputClass} pl-9`}
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errors
                    .filter(Boolean)
                    .map((err: any) => (typeof err === "string" ? err : err.message))
                    .join(", ")}
                </p>
              )}
            </div>
          )}
        />
      )}

      <form.Field
        name="newPassword"
        children={(field) => (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="password"
                placeholder="New password (min 6 chars)"
                className={`${inputClass} pl-9`}
              />
            </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errors
                    .filter(Boolean)
                    .map((err: any) => (typeof err === "string" ? err : err.message))
                    .join(", ")}
                </p>
              )}
          </div>
        )}
      />

      <form.Field
        name="confirmPassword"
        children={(field) => (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="password"
                placeholder="Repeat new password"
                className={`${inputClass} pl-9`}
              />
            </div>
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">
                {field.state.meta.errors
                  .filter(Boolean)
                  .map((err: any) => (typeof err === "string" ? err : err.message))
                  .join(", ")}
              </p>
            )}
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!canSubmit || isSubmitting || mutation.isPending}
          >
            {mutation.isPending || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        )}
      />
    </form>
  );
}
