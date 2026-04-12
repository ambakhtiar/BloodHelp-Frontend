"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Droplet, RefreshCcw } from "lucide-react";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";
import { BloodGroup } from "@/types";

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

interface DonorSearchFilterProps {
  onFilterChange: (filters: any) => void;
  isFetching?: boolean;
}

export function DonorSearchFilter({ onFilterChange, isFetching }: DonorSearchFilterProps) {
  const form = useForm({
    defaultValues: {
      searchTerm: "",
      bloodGroup: "",
      division: "",
      district: "",
      upazila: "",
    },
    onSubmit: async ({ value }) => {
      onFilterChange(value);
    },
  });

  // Correct way to watch values in TanStack Form v1
  const division = useStore(form.store, (state) => state.values.division);
  const district = useStore(form.store, (state) => state.values.district);

  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(() => (division ? getDistricts(division) : []), [division]);
  const upazilas = useMemo(() => (division && district ? getUpazilas(division, district) : []), [division, district]);

  // Shared styles
  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block flex items-center gap-1.5";

  return (
    <Card className="border-primary/10 shadow-lg overflow-visible bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* SEARCH TERM */}
            <form.Field
              name="searchTerm"
              children={(field) => (
                <div className="space-y-1">
                  <label className={labelClass} htmlFor={field.name}>
                    <Search className="w-3.5 h-3.5" /> Search Name/Email
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Donor name..."
                    className="bg-background/80"
                  />
                </div>
              )}
            />

            {/* BLOOD GROUP */}
            <form.Field
              name="bloodGroup"
              children={(field) => (
                <div className="space-y-1">
                  <label className={labelClass} htmlFor={field.name}>
                    <Droplet className="w-3.5 h-3.5 text-primary" /> Blood Group
                  </label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Any Group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg.value} value={bg.value}>
                        {bg.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />

            {/* DIVISION */}
            <form.Field
              name="division"
              children={(field) => (
                <div className="space-y-1">
                  <label className={labelClass} htmlFor={field.name}>
                    <MapPin className="w-3.5 h-3.5" /> Division
                  </label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      form.setFieldValue("district", "");
                      form.setFieldValue("upazila", "");
                    }}
                    className={selectClass}
                  >
                    <option value="">Whole Country</option>
                    {divisions.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            />

            {/* DISTRICT */}
            <form.Field
              name="district"
              children={(field) => (
                <div className="space-y-1">
                  <label className={labelClass} htmlFor={field.name}>
                    <MapPin className="w-3.5 h-3.5 opacity-70" /> District
                  </label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    disabled={!division}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      form.setFieldValue("upazila", "");
                    }}
                    className={selectClass}
                  >
                    <option value="">Specific District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            />

            {/* UPAZILA */}
            <form.Field
              name="upazila"
              children={(field) => (
                <div className="space-y-1">
                  <label className={labelClass} htmlFor={field.name}>
                    <MapPin className="w-3.5 h-3.5 opacity-50" /> Upazila
                  </label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    disabled={!district}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Specific Area</option>
                    {upazilas.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              )}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-primary/5">
            <p className="text-xs text-muted-foreground italic">
              * Filter by location to find donors nearest to you.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onFilterChange({});
                }}
                className="gap-2 border-primary/20 hover:bg-primary/5"
              >
                <RefreshCcw className="w-4 h-4" /> Reset
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 min-w-[120px]"
                disabled={isFetching}
              >
                {isFetching ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Find Donors
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
