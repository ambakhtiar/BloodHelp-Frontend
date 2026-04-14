"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo, useState, useEffect } from "react";
import { Loader2, UserCircle, MapPin, Droplet, User, Phone } from "lucide-react";
import { z } from "zod";

import { updateVolunteerInfo } from "@/services/organisation.service";
import { BloodGroup, Gender, IAddVolunteerPayload, IOrganisationVolunteer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";

interface EditVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteer: IOrganisationVolunteer | null;
}

const BLOOD_GROUPS: { label: string; value: BloodGroup }[] = [
  { label: "A+",  value: "A_POSITIVE"  },
  { label: "A-",  value: "A_NEGATIVE"  },
  { label: "B+",  value: "B_POSITIVE"  },
  { label: "B-",  value: "B_NEGATIVE"  },
  { label: "AB+", value: "AB_POSITIVE" },
  { label: "AB-", value: "AB_NEGATIVE" },
  { label: "O+",  value: "O_POSITIVE"  },
  { label: "O-",  value: "O_NEGATIVE"  },
];

const GENDERS: { label: string; value: Gender }[] = [
  { label: "Male",   value: "MALE"   },
  { label: "Female", value: "FEMALE" },
];

export default function EditVolunteerModal({ isOpen, onClose, volunteer }: EditVolunteerModalProps) {
  const queryClient = useQueryClient();

  const [divisionValue, setDivisionValue] = useState<string>("");
  const [districtValue, setDistrictValue] = useState<string>("");

  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(() => divisionValue ? getDistricts(divisionValue) : [], [divisionValue]);
  const upazilas = useMemo(() => (divisionValue && districtValue) ? getUpazilas(divisionValue, districtValue) : [], [divisionValue, districtValue]);

  const mutation = useMutation({
    mutationFn: (payload: Partial<IAddVolunteerPayload>) => 
      updateVolunteerInfo(volunteer!.bloodDonorId, payload),
    onSuccess: () => {
      toast.success("Volunteer information updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      onClose();
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err.message || "Failed to update volunteer info.";
      toast.error(errorMessage);
    },
  });

  const form = useForm<Partial<IAddVolunteerPayload>>({
    defaultValues: {
      name: "",
      bloodGroup: undefined,
      gender: undefined,
      division: "",
      district: "",
      upazila: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  // Sync form values when volunteer prop changes
  useEffect(() => {
    if (volunteer && isOpen) {
      form.reset({
        name: volunteer.bloodDonor.name,
        bloodGroup: volunteer.bloodDonor.bloodGroup,
        gender: volunteer.bloodDonor.gender,
        division: volunteer.bloodDonor.division || "",
        district: volunteer.bloodDonor.district || "",
        upazila: volunteer.bloodDonor.upazila || "",
      });
      setDivisionValue(volunteer.bloodDonor.division || "");
      setDistrictValue(volunteer.bloodDonor.district || "");
    }
  }, [volunteer, isOpen, form]);

  if (!volunteer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <UserCircle className="w-5 h-5 text-primary" />
            Edit Volunteer Information
          </DialogTitle>
          <DialogDescription>
            Update details for <span className="font-semibold text-slate-700">{volunteer.bloodDonor.name}</span>.
            This is only available for unregistered volunteers.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6 py-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NAME */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const r = z.string().trim().min(3, "Name must be at least 3 characters").max(100).safeParse(value);
                  return r.success ? undefined : r.error.issues[0]?.message;
                },
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-bold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary/60" /> Full Name *
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={field.state.meta.errors.length ? "border-destructive" : "border-slate-200"}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">{field.state.meta.errors[0]?.toString()}</p>
                  )}
                </div>
              )}
            />

            {/* BLOOD GROUP */}
            <form.Field
              name="bloodGroup"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-bold text-slate-700 flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-primary" /> Blood Group *
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as BloodGroup)}
                  >
                    <SelectTrigger id={field.name} className="border-slate-200">
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg.value} value={bg.value}>{bg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* GENDER */}
            <form.Field
              name="gender"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-bold text-slate-700 flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-primary/60" /> Gender *
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as Gender)}
                  >
                    <SelectTrigger id={field.name} className="border-slate-200">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* DIVISION */}
              <form.Field
                name="division"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="font-bold text-slate-700">Division</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => {
                        field.handleChange(val);
                        setDivisionValue(val);
                        form.setFieldValue("district", "");
                        form.setFieldValue("upazila", "");
                        setDistrictValue("");
                      }}
                    >
                      <SelectTrigger id={field.name} className="border-slate-200">
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              {/* DISTRICT */}
              <form.Field
                name="district"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="font-bold text-slate-700">District</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => {
                        field.handleChange(val);
                        setDistrictValue(val);
                        form.setFieldValue("upazila", "");
                      }}
                      disabled={!divisionValue}
                    >
                      <SelectTrigger id={field.name} className="border-slate-200">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              {/* UPAZILA */}
              <form.Field
                name="upazila"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="font-bold text-slate-700">Upazila</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => field.handleChange(val)}
                      disabled={!districtValue}
                    >
                      <SelectTrigger id={field.name} className="border-slate-200">
                        <SelectValue placeholder="Select upazila" />
                      </SelectTrigger>
                      <SelectContent>
                        {upazilas.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="min-w-[120px]">
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
              ) : (
                "Update Info"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
