import { Metadata } from "next";
import { DonorSearchContainer } from "@/features/donors/components/DonorSearchContainer";
import { Search, Heart, UserCheck } from "lucide-react";
import { DonorStatsRow } from "@/features/donors/components/DonorStatsRow";

export const metadata: Metadata = {
  title: `Search Donors - ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}`,
  description: "Find blood donors in Bangladesh by blood group, division, district, or area. Connect with volunteers and save lives.",
  keywords: ["blood donor search", "find blood donors bangladesh", "blood link donors", "emergency blood"],
};

export default function DonorsPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* PAGE HEADER / HERO */}
      <section className="relative py-16 bg-primary/5 border-b border-primary/10 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-primary/20">
              <UserCheck className="w-4 h-4" /> Verified Volunteers
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight leading-none">
              Find <span className="text-primary font-bold">Life-Savers</span> <br />
              Near You.
            </h1>
            <p className="text-lg text-muted-foreground font-normal max-w-2xl leading-relaxed">
              Searching for blood is now easier and faster. Use our advanced filters to find verified donors in your specific area across Bangladesh.
            </p>

            <DonorStatsRow />
          </div>
        </div>
      </section>

      {/* SEARCH CONTAINER SECTION */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <DonorSearchContainer />
      </div>

      {/* FOOTER INFO MESSAGE */}
      <section className="container mx-auto px-4 mt-24 pb-8 text-center">
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-secondary/20 border border-primary/10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5 shadow-sm">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3 tracking-tight">Be a Hero Today</h2>
          <p className="text-muted-foreground font-normal mb-8 leading-relaxed">
            If you're healthy and haven't donated in the last 3-4 months, consider registering as a donor. Your one bag of blood can save up to three lives.
          </p>
          <hr className="border-primary/5 mb-6" />
          <p className="text-xs text-muted-foreground italic">
            {process.env.NEXT_PUBLIC_APP_NAME_FF}{process.env.NEXT_PUBLIC_APP_NAME_SS} strictly prohibits the sale of blood. All donations should be voluntary and selfless.
          </p>
        </div>
      </section>
    </main>
  );
}
