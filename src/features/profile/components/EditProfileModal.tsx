"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Loader2, Save, User as UserIcon, Weight, MapPin, Building2, Users } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/validations/user.validation";
import { updateMyProfile } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { IUser } from "@/types";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";

interface EditProfileModalProps {
  user: IUser;
  isOpen: boolean;
  onClose: () => void;
}

const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";
const labelClass = "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

export function EditProfileModal({ user, isOpen, onClose }: EditProfileModalProps) {
  const queryClient = useQueryClient();
  const { setUser } = useAuthContext();
  const [districts, setDistricts] = useState<string[]>([]);
  const [upazilas, setUpazilas] = useState<string[]>([]);

  // Manual Form State
  const [formData, setFormData] = useState<UpdateProfileFormValues>({
    profilePictureUrl: user.profilePictureUrl || "",
    division: user.division || "",
    district: user.district || "",
    upazila: user.upazila || "",
    name: user.donorProfile?.name || user.hospital?.name || user.organisation?.name || user.admin?.name || "",
    donorProfile: user.role === "USER" ? {
      name: user.donorProfile?.name || "",
      weight: user.donorProfile?.weight || null,
      isAvailableForDonation: user.donorProfile?.isAvailableForDonation ?? true,
      lastDonationDate: user.donorProfile?.lastDonationDate || null,
    } : undefined,
    hospital: user.role === "HOSPITAL" ? {
      name: user.hospital?.name || "",
      registrationNumber: user.hospital?.registrationNumber || "",
      address: user.hospital?.address || "",
    } : undefined,
    organisation: user.role === "ORGANISATION" ? {
      name: user.organisation?.name || "",
      registrationNumber: user.organisation?.registrationNumber || "",
      establishedYear: user.organisation?.establishedYear || "",
    } : undefined,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // cascaded location logic
  useEffect(() => {
    if (formData.division) {
      setDistricts(getDistricts(formData.division));
    }
  }, [formData.division]);

  useEffect(() => {
    if (formData.division && formData.district) {
      setUpazilas(getUpazilas(formData.division, formData.district));
    }
  }, [formData.division, formData.district]);

  const handleChange = (path: string, value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      const parts = path.split(".");
      if (parts.length === 1) {
        newData[parts[0]] = value;
      } else {
        if (!newData[parts[0]]) newData[parts[0]] = {};
        newData[parts[0]][parts[1]] = value;
      }
      return newData;
    });
  };

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Profile updated successfully");
        // Sync global auth state instantly
        setUser(response.data);
        queryClient.invalidateQueries({ queryKey: ["my-profile"] });
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        onClose();
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    },
    onError: (error: any) => {
      const data = error?.response?.data;
      if (data?.errorSources && Array.isArray(data.errorSources)) {
        // Show first 3 errors to avoid toast spam
        data.errorSources.slice(0, 3).forEach((source: any) => {
          toast.error(`${source.path}: ${source.message}`);
        });
      } else {
        toast.error(data?.message || "Something went wrong while updating");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const result = updateProfileSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        errors[issue.path.join(".")] = issue.message;
      });
      setFormErrors(errors);
      toast.error("Please fix the validation errors");
      return;
    }

    setFormErrors({});
    mutation.mutate(result.data as UpdateProfileFormValues);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-primary/10 shadow-2xl p-0 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-primary/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Save className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-tight font-medium">Update your role-specific information</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-center gap-2 text-sm font-bold text-primary mb-[-12px]">
               <UserIcon className="w-4 h-4" /> Account Basics
            </div>
            
            <div className="md:col-span-2 space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
               <label className={labelClass}>Profile Picture URL</label>
               <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {formData.profilePictureUrl ? (
                      <img 
                        src={formData.profilePictureUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User&background=random';
                        }}
                      />
                    ) : (
                      <UserIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <Input 
                      value={formData.profilePictureUrl || ""} 
                      onChange={(e) => handleChange("profilePictureUrl", e.target.value)} 
                      placeholder="https://images.unsplash.com/photo-..." 
                      className="bg-card"
                    />
                    <p className="text-[10px] text-muted-foreground">Enter a direct image URL (JPG, PNG or WEBP)</p>
                  </div>
               </div>
               {formErrors["profilePictureUrl"] && <p className="text-xs text-destructive mt-1">{formErrors["profilePictureUrl"]}</p>}
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Contact Number</label>
              <Input 
                value={user.contactNumber} 
                disabled
                className="bg-muted cursor-not-allowed opacity-70"
              />
              <p className="text-[10px] text-muted-foreground italic">Contact number cannot be changed.</p>
            </div>

             <div className="space-y-2">
              <label className={labelClass}>Division</label>
              <select 
                value={formData.division} 
                onChange={(e) => handleChange("division", e.target.value)} 
                className={selectClass}
              >
                <option value="">Select Division</option>
                {getDivisions().map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>District</label>
              <select 
                value={formData.district} 
                onChange={(e) => handleChange("district", e.target.value)} 
                className={selectClass} 
                disabled={!formData.division}
              >
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Upazila</label>
              <select 
                value={formData.upazila} 
                onChange={(e) => handleChange("upazila", e.target.value)} 
                className={selectClass} 
                disabled={!formData.district}
              >
                <option value="">Select Upazila</option>
                {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Role Specific Section */}
            {user.role === "USER" && (
              <>
                 <div className="md:col-span-2 flex items-center gap-2 text-sm font-bold text-primary border-t pt-6 mb-[-12px]">
                   <Users className="w-4 h-4" /> Donor Profile Details
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Name</label>
                  <Input 
                    value={formData.donorProfile?.name} 
                    onChange={(e) => handleChange("donorProfile.name", e.target.value)} 
                    placeholder="Your Name" 
                  />
                  {formErrors["donorProfile.name"] && <p className="text-xs text-destructive">{formErrors["donorProfile.name"]}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Weight (KG)</label>
                  <Input 
                    type="number" 
                    value={formData.donorProfile?.weight || ""} 
                    onChange={(e) => handleChange("donorProfile.weight", e.target.value ? Number(e.target.value) : null)} 
                    placeholder="e.g. 70" 
                  />
                  {formErrors["donorProfile.weight"] && <p className="text-xs text-destructive">{formErrors["donorProfile.weight"]}</p>}
                </div>
                <div className="md:col-span-2 bg-secondary/20 p-4 rounded-xl flex items-center justify-between border border-secondary">
                  <div className="space-y-0.5">
                    <label className="text-sm font-bold block italic uppercase tracking-wider">Available for Donation</label>
                    <p className="text-xs text-muted-foreground">Toggle your status for search visibility</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.donorProfile?.isAvailableForDonation}
                    onChange={(e) => handleChange("donorProfile.isAvailableForDonation", e.target.checked)}
                    className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-primary transition-all relative cursor-pointer outline-none after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:left-0.5 after:top-0.5 after:shadow-sm after:transition-all checked:after:translate-x-5"
                  />
                </div>
              </>
            )}

            {user.role === "HOSPITAL" && (
              <>
                <div className="md:col-span-2 flex items-center gap-2 text-sm font-bold text-primary border-t pt-6 mb-[-12px]">
                   <Building2 className="w-4 h-4" /> Hospital Information
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}>Hospital Name</label>
                  <Input 
                    value={formData.hospital?.name} 
                    onChange={(e) => handleChange("hospital.name", e.target.value)} 
                    placeholder="City Hospital" 
                  />
                  {formErrors["hospital.name"] && <p className="text-xs text-destructive">{formErrors["hospital.name"]}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Registration Number</label>
                  <Input 
                    value={formData.hospital?.registrationNumber || ""} 
                    onChange={(e) => handleChange("hospital.registrationNumber", e.target.value)} 
                    placeholder="REG-12345" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}>Address</label>
                  <textarea 
                    value={formData.hospital?.address || ""}
                    onChange={(e) => handleChange("hospital.address", e.target.value)}
                    className={`${inputClass} min-h-[80px] py-3 resize-none`}
                    placeholder="Provide full address"
                  />
                  {formErrors["hospital.address"] && <p className="text-xs text-destructive">{formErrors["hospital.address"]}</p>}
                </div>
              </>
            )}

            {user.role === "ORGANISATION" && (
              <>
                <div className="md:col-span-2 flex items-center gap-2 text-sm font-bold text-primary border-t pt-6 mb-[-12px]">
                   <Users className="w-4 h-4" /> Organisation Profile
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}>Organisation Name</label>
                  <Input 
                    value={formData.organisation?.name} 
                    onChange={(e) => handleChange("organisation.name", e.target.value)} 
                    placeholder="Blood Foundation" 
                  />
                  {formErrors["organisation.name"] && <p className="text-xs text-destructive">{formErrors["organisation.name"]}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Registration Number</label>
                  <Input 
                    value={formData.organisation?.registrationNumber || ""} 
                    onChange={(e) => handleChange("organisation.registrationNumber", e.target.value)} 
                    placeholder="ORG-9988" 
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Established Year</label>
                  <Input 
                    value={formData.organisation?.establishedYear || ""} 
                    onChange={(e) => handleChange("organisation.establishedYear", e.target.value)} 
                    placeholder="e.g. 2010" 
                  />
                </div>
              </>
            )}

            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <>
                 <div className="md:col-span-2 flex items-center gap-2 text-sm font-bold text-primary border-t pt-6 mb-[-12px]">
                   <UserIcon className="w-4 h-4" /> Administrative Info
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className={labelClass}>Full Name</label>
                   <Input 
                     value={formData.name} 
                     onChange={(e) => handleChange("name", e.target.value)} 
                     placeholder="Your Name" 
                   />
                   {formErrors["name"] && <p className="text-xs text-destructive">{formErrors["name"]}</p>}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-primary/5">
             <Button 
                type="submit" 
                className="flex-1 gap-2 h-11 text-base font-bold" 
                disabled={mutation.isPending}
              >
               {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
               Save Changes
             </Button>
             <Button 
                type="button" 
                variant="outline" 
                className="h-11 px-6 font-semibold"
                onClick={onClose}
                disabled={mutation.isPending}
              >
               Cancel
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
