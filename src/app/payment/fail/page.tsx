import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Payment Failed - ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}`,
};

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<{ transactionId?: string; postId?: string }>;
}) {
  const params = await searchParams;
  const postId = params.postId || (params as any).postid || (params as any).postID;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center ring-8 ring-red-50 dark:ring-red-900/30">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground font-black uppercase tracking-tight">Payment Failed</h1>
          <p className="text-muted-foreground text-sm leading-relaxed px-4">
            We were unable to process your payment. No money has been charged.
            Please verify your details and try again.
          </p>
        </div>

        {params.transactionId && (
          <div className="bg-muted/30 rounded-2xl px-4 py-4 text-sm border-2 border-dashed border-muted">
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1.5 text-center">Reference ID</p>
            <p className="font-mono font-bold text-foreground text-center select-all">
              {params.transactionId}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-2xl shadow-lg shadow-red-200 dark:shadow-red-900/20">
            <Link href={postId ? `/feed/${postId}` : "/feed"}>
              {postId ? "Retry Donation" : "Back to Feed"}
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 font-bold h-12 rounded-2xl border-2">
            <Link href="/feed">Back to Feed</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
