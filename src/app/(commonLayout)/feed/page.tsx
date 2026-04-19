import FeedContainer from "@/features/feed/FeedContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Public Feed - ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}`,
  description: `View the latest blood requests, donations, and help posts on ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}.`,
};

export default function FeedPage() {

  return (
    <main className="min-h-screen bg-background">
      <FeedContainer />
    </main>
  );
}
