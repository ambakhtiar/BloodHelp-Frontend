import { CreatePostForm } from "@/features/post/components/CreatePostForm";

export const metadata = {
  title: `Create a New Post | ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}`,
  description:
    `Create a blood finding request, blood donation offer, or financial help campaign on ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}.`,
};

export default function CreatePostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create a New Post
          </h1>
          <p className="mt-2 text-muted-foreground">
            Share your blood request, donation offer, or help campaign with the community.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-card shadow-lg p-6 sm:p-8">
          <CreatePostForm />
        </div>
      </div>
    </div>
  );
}
