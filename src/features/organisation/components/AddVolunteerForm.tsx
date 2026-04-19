"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, UserPlus, Phone, Droplet, UserCircle, MapPin,
  Search, UserCheck, UserX, Info
} from "lucide-react";

import { addVolunteer } from "@/services/organisation.service";
import { checkDonorByPhone } from "@/services/post.service";
import { BloodGroup, Gender, IAddVolunteerPayload } from "@/types";
import { Button } from "@/components/ui/button";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";

const COUNTRY_CODE = "+880";

const BLOOD_GROUPS: { label: string; value: string }[] = [
  { label: "A+",  value: "A+" },
  { label: "A-",  value: "A-" },
  { label: "B+",  value: "B+" },
  { label: "B-",  value: "B-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
  { label: "O+",  value: "O+" },
  { label: "O-",  value: "O-" },
];

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";
const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

function RequiredMark() {
  return <span className="text-destructive ml-0.5">*</span>;
}

export default function AddVolunteerForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // ── Phone lookup state ─────────────────────────────────────────────────────
  const [phoneInput, setPhoneInput] = useState("");
  const [lookupPhone, setLookupPhone] = useState(""); // triggers query when set

  const { data: donorData, isFetching: isSearching } = useQuery({
    queryKey: ["checkDonorByPhone", lookupPhone],
    queryFn: () => checkDonorByPhone(lookupPhone),
    enabled: !!lookupPhone,
    staleTime: 0,
  });
  const donorInfo = donorData?.data;

  // ── Manual form state (only used if donor NOT found) ───────────────────────
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [gender, setGender] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");

  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(() => division ? getDistricts(division) : [], [division]);
  const upazilas  = useMemo(() => (division && district) ? getUpazilas(division, district) : [], [division, district]);

  // Reset derived selects when parent changes
  const handleDivisionChange = useCallback((val: string) => {
    setDivision(val);
    setDistrict("");
    setUpazila("");
  }, []);
  const handleDistrictChange = useCallback((val: string) => {
    setDistrict(val);
    setUpazila("");
  }, []);

  const mutation = useMutation({
    mutationFn: addVolunteer,
    onSuccess: (data) => {
      const isPending = data?.data?.status === "PENDING";
      toast.success(
        isPending
          ? "Invitation sent! The volunteer will receive a notification to accept or reject."
          : "Volunteer added successfully!"
      );
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      router.push("/organisation/volunteers");
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err.message || "Failed to add volunteer.";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contactNumber = `${COUNTRY_CODE}${phoneInput}`;

    if (phoneInput.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    // If donor NOT found — validate manual fields
    if (donorInfo && !donorInfo.found) {
      if (!name.trim()) { toast.error("Donor name is required."); return; }
      if (!bloodGroup)  { toast.error("Blood group is required."); return; }
      if (!gender)      { toast.error("Gender is required."); return; }
      if (!division)    { toast.error("Division is required."); return; }
      if (!district)    { toast.error("District is required."); return; }
      if (!upazila)     { toast.error("Upazila is required."); return; }
    }

    // If no lookup done yet — require a search first
    if (!donorInfo && !lookupPhone) {
      toast.error("Please search by phone number first.");
      return;
    }

    const payload: IAddVolunteerPayload = {
      contactNumber,
      ...(donorInfo && !donorInfo.found && {
        name: name.trim(),
        bloodGroup: bloodGroup as BloodGroup,
        gender: gender as Gender,
        division,
        district,
        upazila,
      }),
    };

    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Phone Lookup ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          Volunteer&apos;s Phone Number <RequiredMark />
        </label>
        <div className="flex gap-2">
          <div className="flex flex-1">
            <div className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground select-none">
              🇧🇩 {COUNTRY_CODE}
            </div>
            <input
              type="tel"
              placeholder="1XXXXXXXXX"
              value={phoneInput}
              onChange={(e) => {
                let digits = e.target.value.replace(/\D/g, "");
                if (digits.startsWith("880")) digits = digits.substring(3);
                else if (digits.startsWith("88")) digits = digits.substring(2);
                else if (digits.startsWith("8")) digits = digits.substring(1);
                if (digits.startsWith("0")) digits = digits.substring(1);
                digits = digits.slice(0, 10);
                setPhoneInput(digits);
                // Reset lookup when phone changes
                if (lookupPhone) setLookupPhone("");
              }}
              className={`${inputClass} rounded-l-none`}
              maxLength={10}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 px-4 gap-2 shrink-0"
            disabled={phoneInput.length < 10 || isSearching}
            onClick={() => setLookupPhone(`${COUNTRY_CODE}${phoneInput}`)}
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">10-digit Bangladesh number, e.g. 1XXXXXXXXX</p>
      </div>

      {/* ── Donor Found ───────────────────────────────────────────────────── */}
      {donorInfo && donorInfo.found && (
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-lg">
          <UserCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">✅ Volunteer Found!</p>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <span className="bg-white dark:bg-green-900/20 rounded px-2 py-1 border border-green-200 dark:border-green-800/30 font-medium">
                👤 {donorInfo.name || "—"}
              </span>
              <span className="bg-white dark:bg-green-900/20 rounded px-2 py-1 border border-green-200 dark:border-green-800/30 font-medium">
                🩸 {donorInfo.bloodGroup || "—"}
              </span>
              <span className="bg-white dark:bg-green-900/20 rounded px-2 py-1 border border-green-200 dark:border-green-800/30 font-medium">
                {donorInfo.gender === "FEMALE" ? "♀️ Female" : "♂️ Male"}
              </span>
              {donorInfo.district && (
                <span className="bg-white dark:bg-green-900/20 rounded px-2 py-1 border border-green-200 dark:border-green-800/30 font-medium">
                  📍 {donorInfo.district}
                </span>
              )}
            </div>
            {donorInfo.type === "platform_user" && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-green-700 dark:text-green-400">
                <Info className="w-3.5 h-3.5" />
                Platform user — they will receive a notification to accept this invitation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Donor NOT Found — manual fields ────────────────────────────── */}
      {donorInfo && !donorInfo.found && (
        <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Not found — please enter volunteer details manually
            </p>
          </div>

          {/* Name + Blood Group + Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                Full Name <RequiredMark />
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5" /> Blood Group <RequiredMark />
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className={selectClass}
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg.value} value={bg.value}>{bg.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                <UserCircle className="w-3.5 h-3.5" /> Gender <RequiredMark />
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={selectClass}
              >
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <p className="text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Location <RequiredMark />
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Division</label>
                <select value={division} onChange={(e) => handleDivisionChange(e.target.value)} className={selectClass}>
                  <option value="">Select Division</option>
                  {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">District</label>
                <select value={district} onChange={(e) => handleDistrictChange(e.target.value)} className={selectClass} disabled={!division}>
                  <option value="">{division ? "Select District" : "Select division first"}</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Upazila</label>
                <select value={upazila} onChange={(e) => setUpazila(e.target.value)} className={selectClass} disabled={!district}>
                  <option value="">{district ? "Select Upazila" : "Select district first"}</option>
                  {upazilas.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Prompt to search first ─────────────────────────────────────── */}
      {!donorInfo && !isSearching && !lookupPhone && (
        <p className="text-xs text-muted-foreground italic">
          Enter the volunteer&apos;s phone number and click &quot;Search&quot; to look them up before adding.
        </p>
      )}

      {/* ── Submit ──────────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={mutation.isPending || !lookupPhone || isSearching}
          className="min-w-36"
        >
          {mutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
          ) : (
            <><UserPlus className="w-4 h-4 mr-2" /> Add Volunteer</>
          )}
        </Button>
      </div>
    </form>
  );
}
