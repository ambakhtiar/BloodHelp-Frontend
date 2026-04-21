"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { z } from "zod";
import { Heart, Loader2, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { initiatePayment } from "@/services/payment.service";
import { cn } from "@/lib/utils";

const donateSchema = z.object({
  amount: z
    .number({ message: "Please enter a valid amount" })
    .min(10, "Minimum donation is ৳10")
    .max(100_000, "Maximum donation is ৳1,00,000"),
});

interface DonateFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
  targetAmount?: number;
  raisedAmount?: number;
}

export function DonateFundsModal({
  isOpen,
  onClose,
  postId,
  postTitle,
  targetAmount,
  raisedAmount = 0,
}: DonateFundsModalProps) {
  const progressPct =
    targetAmount && targetAmount > 0
      ? Math.min((raisedAmount / targetAmount) * 100, 100)
      : 0;

  const mutation = useMutation({
    mutationFn: initiatePayment,
    onSuccess: (res) => {
      console.log("Payment Initiation Response:", res);
      if (res.success && res.data?.paymentUrl) {
        toast.success("Redirecting to payment gateway...");
        window.location.href = res.data.paymentUrl;
      } else {
        toast.error(res.message || "Failed to initiate payment. Please try again.");
      }
    },
    onError: (error: any) => {
      console.error("Payment Initiation Error:", error);
      const message = error?.response?.data?.message || error?.message || "Payment initiation failed";
      toast.error(message);
    },
  });

  const form = useForm({
    defaultValues: { amount: "" as unknown as number },
    onSubmit: async ({ value }) => {
      mutation.mutate({ 
        postId, 
        amount: Number(value.amount)
      });
    },
  });
  
  // Watch amount value for button reactivity
  const currentAmount = useStore(form.store, (state) => state.values.amount);

  const quickAmounts = [50, 100, 250, 500, 1000];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 pt-6 pb-5 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Heart className="h-4 w-4 fill-white text-white" />
              </div>
              <DialogTitle className="text-white text-lg font-bold">
                Donate Now
              </DialogTitle>
            </div>
            <DialogDescription className="text-blue-100 text-xs leading-relaxed line-clamp-2">
              {postTitle ?? "Support this cause"}
            </DialogDescription>
          </DialogHeader>

          {/* Progress */}
          {targetAmount && targetAmount > 0 && (
            <div className="mt-4 space-y-1.5">
              <Progress
                value={progressPct}
                className="h-2 bg-white/20 [&>div]:bg-white"
              />
              <div className="flex justify-between text-xs text-blue-100">
                <span>৳{raisedAmount.toLocaleString()} raised</span>
                <span>Goal: ৳{targetAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Quick amounts */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Quick select
            </p>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => form.setFieldValue("amount", amt as unknown as number)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                  )}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field name="amount">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Enter Amount (BDT)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      ৳
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min={10}
                      placeholder="Minimum ৳10"
                      className="pl-7 h-11 text-base focus-visible:ring-blue-500"
                      value={field.state.value === undefined ? "" : String(field.state.value)}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value);
                        field.handleChange(val as unknown as number);
                      }}
                    />
                  </div>
                  {targetAmount && (
                    <div className="flex flex-col gap-1 mt-1.5">
                      <p className="text-[11px] text-muted-foreground">
                        Minimum donation: ৳10 · Secured by SSLCommerz
                      </p>
                      {raisedAmount < targetAmount && (
                        <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                          লক্ষ্য পূরণে আরও ৳{(targetAmount - raisedAmount).toLocaleString()} দরকার।{" "}
                          <span className="font-bold underline cursor-pointer" onClick={() => field.handleChange((targetAmount - raisedAmount) as unknown as number)}>
                            ৳{(targetAmount - raisedAmount).toLocaleString()} দিলেই চলবে।
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                  {targetAmount && field.state.value > (targetAmount - raisedAmount) && (
                    <p className="text-[11px] font-bold text-destructive animate-pulse mt-1">
                      আপনি টার্গেট মূল্যের বেশি দিতে চাইছেন। ৳{(targetAmount - raisedAmount).toLocaleString()} দিলে হবে এর চেয়ে বেশি দেওয়া লাগবে না।
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-500/20"
              disabled={
                mutation.isPending || 
                (targetAmount ? Number(currentAmount) > (targetAmount - raisedAmount) : false) ||
                Number(currentAmount) < 10
              }
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 fill-white" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
            <BadgeCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span>100% secure · Powered by SSLCommerz</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
