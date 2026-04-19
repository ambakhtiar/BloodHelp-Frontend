import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: `Payment Cancelled - ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}`,
};

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ transactionId?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center ring-8 ring-amber-50 dark:ring-amber-900/30">
            <AlertCircle className="h-10 w-10 text-amber-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You cancelled the payment process. No charge was made to your
            account. You can return to the feed and try again whenever you
            are ready.
          </p>
        </div>

        {params.transactionId && (
          <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm">
            <p className="text-muted-foreground text-xs mb-0.5">Transaction ID</p>
            <p className="font-mono font-semibold text-foreground">
              {params.transactionId}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link href="/feed">Back to Feed</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
