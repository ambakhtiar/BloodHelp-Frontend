import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PaymentSuccessHandler } from "@/features/payments/components/PaymentSuccessHandler";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Successful - BloodLink",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ transactionId?: string; postId?: string }>;
}) {
  const params = await searchParams;
  const postId = params.postId || (params as any).postid || (params as any).postID;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <PaymentSuccessHandler postId={postId} />

      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center ring-8 ring-green-50 dark:ring-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Thank You for Your Donation! 💚
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your generous contribution has been received successfully. You are
            making a real difference in someone&apos;s life.
          </p>
        </div>

        {/* Transaction */}
        {params.transactionId && (
          <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm">
            <p className="text-muted-foreground text-xs mb-0.5">Transaction ID</p>
            <p className="font-mono font-semibold text-foreground">
              {params.transactionId}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-green-200 dark:shadow-green-900/20">
            <Link href={postId ? `/feed/${postId}` : "/feed"}>
              {postId ? "View Post Details" : "Back to Feed"}
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 font-bold h-11 rounded-xl border-2">
            <Link href="/feed">Back to Feed</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
