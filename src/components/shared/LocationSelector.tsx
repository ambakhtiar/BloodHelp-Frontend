"use client";

import { useMemo } from "react";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";
import { Label } from "@/components/ui/label";

interface LocationSelectorProps {
  division: string;
  district: string;
  upazila: string;
  onChange: (field: string, value: string) => void;
  onBlur?: (field: string) => void;
  errors?: {
    division?: string;
    district?: string;
    upazila?: string;
  };
  touched?: {
    division?: boolean;
    district?: boolean;
    upazila?: boolean;
  };
}

export function LocationSelector({
  division,
  district,
  upazila,
  onChange,
  onBlur,
  errors,
  touched,
}: LocationSelectorProps) {
  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(() => (division ? getDistricts(division) : []), [division]);
  const upazilas = useMemo(
    () => (division && district ? getUpazilas(division, district) : []),
    [division, district]
  );

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Division</Label>
        <select
          value={division}
          onChange={(e) => {
            onChange("division", e.target.value);
            onChange("district", "");
            onChange("upazila", "");
          }}
          onBlur={() => onBlur?.("division")}
          className={selectClass}
        >
          <option value="">Select Division</option>
          {divisions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {touched?.division && errors?.division && (
          <p className="text-xs text-destructive">{errors.division}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">District</Label>
        <select
          value={district}
          onChange={(e) => {
            onChange("district", e.target.value);
            onChange("upazila", "");
          }}
          disabled={!division}
          onBlur={() => onBlur?.("district")}
          className={selectClass}
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {touched?.district && errors?.district && (
          <p className="text-xs text-destructive">{errors.district}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Upazila</Label>
        <select
          value={upazila}
          onChange={(e) => onChange("upazila", e.target.value)}
          disabled={!district}
          onBlur={() => onBlur?.("upazila")}
          className={selectClass}
        >
          <option value="">Select Upazila</option>
          {upazilas.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        {touched?.upazila && errors?.upazila && (
          <p className="text-xs text-destructive">{errors.upazila}</p>
        )}
      </div>
    </div>
  );
}
