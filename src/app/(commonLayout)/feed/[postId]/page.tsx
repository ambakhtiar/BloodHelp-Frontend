import React from "react";
import PostDetailsContainer from "@/features/feed/PostDetailsContainer";
import { RoleGuard } from "@/components/shared/RoleGuard";

export const metadata = {
  title: "Post Details - BloodLink",
};

export default async function PostDetailsPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const resolvedParams = await params;
  return (
    <RoleGuard allowedRoles={["USER", "HOSPITAL", "ORGANISATION", "ADMIN", "SUPER_ADMIN"]}>
      <main className="min-h-screen bg-background">
        <PostDetailsContainer postId={resolvedParams.postId} />
      </main>
    </RoleGuard>
  );
}
