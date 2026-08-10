import { notFound } from "next/navigation";
import { UserProfileHero } from "@/features/user/components/UserProfileHero";
import { loadUserDashboard } from "@/features/user/data/loadUserDashboard";

/** Renders the dashboard identity summary for a supported user handle. */
export default async function UserPage(props: PageProps<"/users/[handle]">) {
  const { handle } = await props.params;
  const dashboard = await loadUserDashboard(handle);

  if (!dashboard) notFound();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <UserProfileHero profile={dashboard.profile} />
    </div>
  );
}
