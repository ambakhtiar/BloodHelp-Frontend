"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, User, Phone, MapPin, Droplet, UserCircle, FileText, CheckCircle2 } from "lucide-react";
import ImageUploader from "@/components/shared/ImageUploader";

import { recordDonation } from "@/services/hospital.service";
import { BloodGroup, Gender } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";

const BLOOD_GROUPS: { label: string; value: BloodGroup }[] = [
  { label: "A+", value: "A_POSITIVE" },
  { label: "A-", value: "A_NEGATIVE" },
  { label: "B+", value: "B_POSITIVE" },
  { label: "B-", value: "B_NEGATIVE" },
  { label: "AB+", value: "AB_POSITIVE" },
  { label: "AB-", value: "AB_NEGATIVE" },
  { label: "O+", value: "O_POSITIVE" },
  { label: "O-", value: "O_NEGATIVE" },
];

export function RecordDonationForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: recordDonation,
    onSuccess: (response) => {
      toast.success(response.message || "Donation recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["hospital-donation-records"] });
      form.reset();
      router.push("/hospital/history");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to record donation";
      toast.error(message);
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      contactNumber: "+8801",
      bloodGroup: "" as BloodGroup,
      gender: "" as Gender,
      division: "",
      district: "",
      upazila: "",
      createPost: false,
      postTitle: "A life saved today!",
      postImages: [] as string[],
      postContent: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.name || !value.bloodGroup || !value.gender || !value.contactNumber) {
        toast.error("Please fill out all required fields.");
        return;
      }

      mutation.mutate(value);
    },
  });

  // Watch location fields for cascading dropdowns
  const selectedDivision = useStore(form.store, (state) => state.values.division);
  const selectedDistrict = useStore(form.store, (state) => state.values.district);

  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(() => {
    return selectedDivision ? getDistricts(selectedDivision) : [];
  }, [selectedDivision]);

  const upazilas = useMemo(() => {
    return selectedDistrict ? getUpazilas(selectedDivision, selectedDistrict) : [];
  }, [selectedDistrict, selectedDivision]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-primary/20 backdrop-blur-sm bg-card/95">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <PlusCircle className="w-5 h-5" />
          </div>
          <CardTitle className="text-2xl">Record Donation</CardTitle>
        </div>
        <CardDescription>
          Record a new blood donation. Core profile details are required to accurately update the registry. Location is optional but helpful.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* ----- ROW 1: Name & Contact Phase ----- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => (!value ? "Name is required" : undefined),
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2 font-bold text-slate-700">
                    <User className="w-4 h-4 text-primary" /> Donor Name *
                  </Label>
                  <Input
                    id={field.name}
                    placeholder="John Doe"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={field.state.meta.errors.length ? "border-destructive focus-visible:ring-destructive" : "border-slate-200"}
                  />
                  {field.state.meta.errors.length ? (
                    <p className="text-xs font-medium text-destructive">{field.state.meta.errors[0]}</p>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="contactNumber"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "Contact number is required";
                  if (!/^\+8801[3-9]\d{8}$/.test(value) && !/^01[3-9]\d{8}$/.test(value)) {
                    return "Invalid phone number";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2 font-bold text-slate-700">
                    <Phone className="w-4 h-4 text-primary" /> Contact No. *
                  </Label>
                  <Input
                    id={field.name}
                    placeholder="+88017..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={field.state.meta.errors.length ? "border-destructive focus-visible:ring-destructive" : "border-slate-200"}
                  />
                  {field.state.meta.errors.length ? (
                    <p className="text-xs font-medium text-destructive">{field.state.meta.errors[0]}</p>
                  ) : null}
                </div>
              )}
            />
          </div>

          {/* ----- ROW 2: Blood Group & Gender ----- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form.Field
              name="bloodGroup"
              validators={{
                onChange: ({ value }) => (!value ? "Blood group is required" : undefined),
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold text-slate-700">
                    <Droplet className="w-4 h-4 text-primary" /> Blood Group *
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as BloodGroup)}
                  >
                    <SelectTrigger className={field.state.meta.errors.length ? "border-destructive focus:ring-destructive" : "border-slate-200"}>
                      <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg.value} value={bg.value}>
                          {bg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length ? (
                    <p className="text-xs font-medium text-destructive">{field.state.meta.errors[0]}</p>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="gender"
              validators={{
                onChange: ({ value }) => (!value ? "Gender is required" : undefined),
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold text-slate-700">
                    <UserCircle className="w-4 h-4 text-primary" /> Gender *
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as Gender)}
                  >
                    <SelectTrigger className={field.state.meta.errors.length ? "border-destructive focus:ring-destructive" : "border-slate-200"}>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length ? (
                    <p className="text-xs font-medium text-destructive">{field.state.meta.errors[0]}</p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="pt-2 pb-2">
            <div className="w-full border-t border-slate-100"></div>
          </div>

          {/* ----- ROW 3: Optional Locations ----- */}
          <div className="space-y-4 rounded-xl bg-slate-50/50 p-4 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider mb-4">
              <MapPin className="w-4 h-4 text-primary" /> Location Information <span className="text-muted-foreground font-normal normal-case text-xs">(Optional)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Division */}
              <form.Field
                name="division"
                children={(field) => (
                  <div className="space-y-2">
                    <Label className="text-xs">Division</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => {
                        field.handleChange(val);
                        // Reset downstream
                        form.setFieldValue("district", "");
                        form.setFieldValue("upazila", "");
                      }}
                    >
                      <SelectTrigger className="border-slate-200 bg-white">
                        <SelectValue placeholder="Select Division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((div) => (
                          <SelectItem key={div} value={div}>
                            {div}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              {/* District */}
              <form.Field
                name="district"
                children={(field) => (
                  <div className="space-y-2">
                    <Label className="text-xs">District</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => {
                        field.handleChange(val);
                        // Reset downstream
                        form.setFieldValue("upazila", "");
                      }}
                      disabled={!selectedDivision}
                    >
                      <SelectTrigger className="border-slate-200 bg-white">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((dist) => (
                          <SelectItem key={dist} value={dist}>
                            {dist}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              {/* Upazila */}
              <form.Field
                name="upazila"
                children={(field) => (
                  <div className="space-y-2">
                    <Label className="text-xs">Upazila</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => field.handleChange(val)}
                      disabled={!selectedDistrict}
                    >
                      <SelectTrigger className="border-slate-200 bg-white">
                        <SelectValue placeholder="Select Upazila" />
                      </SelectTrigger>
                      <SelectContent>
                        {upazilas.map((upa) => (
                          <SelectItem key={upa} value={upa}>
                            {upa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>
          </div>

          {/* ----- ROW 4: Post Toggle ----- */}
          <div className="grid grid-cols-1 gap-6">
            <form.Field
              name="createPost"
              children={(field) => (
                <div className="flex flex-col">
                  <div className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/50 transition-colors cursor-pointer shadow-sm" onClick={() => field.handleChange(!field.state.value)}>
                    <Checkbox
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-black leading-none cursor-pointer text-slate-700"
                      >
                        PUBLISH DONATION POST
                      </Label>
                      <p className="text-xs text-slate-500">
                        Create a public post to celebrate this donation and inspire others.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>

          {/* ----- ROW 5: Conditional Post Fields ----- */}
          <form.Field name="createPost" children={(field) => field.state.value && (
            <div className="space-y-6 p-6 rounded-2xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-black text-lg uppercase tracking-tight">Post Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <form.Field
                  name="postTitle"
                  validators={{
                    onChange: ({ value }) => (!value ? "Post title is required" : undefined),
                  }}
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name} className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                        <FileText className="w-4 h-4" /> Post Title *
                      </Label>
                      <Input
                        id={field.name}
                        placeholder="e.g. A life saved today!"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={field.state.meta.errors.length ? "border-destructive focus-visible:ring-destructive bg-white" : "bg-white border-slate-200"}
                      />
                      {field.state.meta.errors.length ? (
                        <p className="text-xs font-medium text-destructive">{field.state.meta.errors[0]}</p>
                      ) : null}
                    </div>
                  )}
                />

                <form.Field
                  name="postContent"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name} className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                        <FileText className="w-4 h-4" /> Post Content (Optional)
                      </Label>
                      <Textarea
                        id={field.name}
                        placeholder="Write a few lines about this donation..."
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white border-slate-200 min-h-[100px]"
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="postImages"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                        Post Images <span className="text-slate-400 font-normal">(Optional)</span>
                      </Label>
                      <ImageUploader
                        value={field.state.value as string[]}
                        onChange={(urls) => field.handleChange(urls as unknown as string[])}
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          )} />

          <Button
            type="submit"
            className="w-full h-12 mt-4 text-base font-bold uppercase tracking-wide transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Record...
              </>
            ) : (
              "Submit Donation Record"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
