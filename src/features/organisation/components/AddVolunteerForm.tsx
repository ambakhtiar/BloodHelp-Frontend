"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, User, Phone, Droplet, UserCircle, MapPin, Calendar } from "lucide-react";
import { z } from "zod";

import { addVolunteer } from "@/services/organisation.service";
import { BloodGroup, Gender, IAddVolunteerPayload } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";

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

export default function AddVolunteerForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: addVolunteer,
    onSuccess: () => {
      toast.success("Volunteer added successfully!");
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      router.push("/organisation/volunteers");
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err.message || "Failed to add volunteer.";
      toast.error(errorMessage);
    },
  });

  const form = useForm<IAddVolunteerPayload>({
    defaultValues: {
      name: "",
      contactNumber: "+880",
      bloodGroup: "" as BloodGroup,
      gender: "" as Gender,
      lastDonationDate: "",
      isAvailable: true,
      division: "",
      district: "",
      upazila: "",
    },
    onSubmit: async ({ value }) => {
      const payload: IAddVolunteerPayload = {
        ...value,
        lastDonationDate: value.lastDonationDate || undefined,
        division: value.division || undefined,
        district: value.district || undefined,
        upazila: value.upazila || undefined,
      };
      mutation.mutate(payload);
    },
  });

  const [divisionValue, setDivisionValue] = useState<string>("");
  const [districtValue, setDistrictValue] = useState<string>("");

  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(() => divisionValue ? getDistricts(divisionValue) : [], [divisionValue]);
  const upazilas  = useMemo(() => (divisionValue && districtValue) ? getUpazilas(divisionValue, districtValue) : [], [divisionValue, districtValue]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* ----- ROW 1: Name & Contact ----- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              const r = z.string().trim().min(2, "Name must be at least 2 characters").safeParse(value);
              return r.success ? undefined : r.error.issues[0]?.message;
            },
          }}
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="flex items-center gap-2 font-bold text-slate-700">
                <User className="w-4 h-4 text-primary" /> Full Name *
              </Label>
              <Input
                id={field.name}
                placeholder="e.g. John Doe"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={field.state.meta.errors.length ? "border-destructive" : "border-slate-200"}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">{field.state.meta.errors[0]?.toString()}</p>
              )}
            </div>
          )}
        />

        <form.Field
          name="contactNumber"
          validators={{
            onChange: ({ value }) => {
              const r = z.string().regex(/^(\+88)?01[3-9]\d{8}$/, "Must be a valid Bangladeshi phone number").safeParse(value);
              return r.success ? undefined : r.error.issues[0]?.message;
            },
          }}
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="flex items-center gap-2 font-bold text-slate-700">
                <Phone className="w-4 h-4 text-primary" /> Contact Number *
              </Label>
              <Input
                id={field.name}
                placeholder="+8801XXXXXXXXX"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={field.state.meta.errors.length ? "border-destructive" : "border-slate-200"}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">{field.state.meta.errors[0]?.toString()}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* ----- ROW 2: Blood Group & Gender ----- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form.Field
          name="bloodGroup"
          validators={{
            onChange: ({ value }) => {
              const r = z.string().min(1, "Blood group is required").safeParse(value);
              return r.success ? undefined : r.error.issues[0]?.message;
            },
          }}
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="flex items-center gap-2 font-bold text-slate-700">
                <Droplet className="w-4 h-4 text-primary" /> Blood Group *
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val as BloodGroup)}
              >
                <SelectTrigger id={field.name} className={field.state.meta.errors.length ? "border-destructive" : "border-slate-200"}>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg.value} value={bg.value}>{bg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">{field.state.meta.errors[0]?.toString()}</p>
              )}
            </div>
          )}
        />

        <form.Field
          name="gender"
          validators={{
            onChange: ({ value }) => {
              const r = z.string().min(1, "Gender is required").safeParse(value);
              return r.success ? undefined : r.error.issues[0]?.message;
            },
          }}
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="flex items-center gap-2 font-bold text-slate-700">
                <UserCircle className="w-4 h-4 text-primary" /> Gender *
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val as Gender)}
              >
                <SelectTrigger id={field.name} className={field.state.meta.errors.length ? "border-destructive" : "border-slate-200"}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">{field.state.meta.errors[0]?.toString()}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* ----- ROW 3: Last Donation Date ----- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form.Field
          name="lastDonationDate"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="flex items-center gap-2 font-bold text-slate-700">
                <Calendar className="w-4 h-4 text-primary" /> Last Donation Date (Optional)
              </Label>
              <Input
                id={field.name}
                type="datetime-local"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="border-slate-200"
              />
            </div>
          )}
        />
      </div>

      {/* ----- ROW 4: Location ----- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form.Field
          name="division"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="flex items-center gap-2 font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-primary" /> Division
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(val) => {
                  field.handleChange(val);
                  setDivisionValue(val);
                  form.setFieldValue("district", "");
                  setDistrictValue("");
                  form.setFieldValue("upazila", "");
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
                  <SelectValue placeholder={divisionValue ? "Select district" : "Select division first"} />
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
                  <SelectValue placeholder={districtValue ? "Select upazila" : "Select district first"} />
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

      {/* ----- Submit ----- */}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={mutation.isPending} className="min-w-36">
          {mutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding Volunteer...</>
          ) : (
            <><UserPlus className="w-4 h-4 mr-2" /> Add Volunteer</>
          )}
        </Button>
      </div>
    </form>
  );
}
