import { Metadata } from "next";
import { DonorSearchContainer } from "@/features/donors/components/DonorSearchContainer";
import { Search, Heart, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Search Donors - BloodLink",
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
              <UserCheck className="w-3.5 h-3.5" /> Verified Volunteers
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight leading-none italic">
              Find <span className="text-primary italic">Life-Savers</span> <br />
              Near You.
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Searching for blood is now easier and faster. Use our advanced filters to find verified donors in your specific area across Bangladesh. 
            </p>
            
            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-foreground">Live Database</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-bold text-foreground">8,000+ Potential Donors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm font-bold text-foreground">Verified Contacts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH CONTAINER SECTION */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <DonorSearchContainer />
      </div>

      {/* FOOTER INFO MESSAGE */}
      <section className="container mx-auto px-4 mt-20 text-center">
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-secondary/30 border border-primary/5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2 italic">Be a Hero Today</h2>
          <p className="text-muted-foreground font-medium mb-6">
            If you're healthy and haven't donated in the last 3-4 months, consider registering as a donor. Your one bag of blood can save up to three lives.
          </p>
          <hr className="border-primary/5 mb-6" />
          <p className="text-xs text-muted-foreground italic">
            BloodLink strictly prohibits the sale of blood. All donations should be voluntary and selfless.
          </p>
        </div>
      </section>
    </main>
  );
}
