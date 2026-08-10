import { notFound } from "next/navigation";
import { ContestHero } from "@/features/contest/components/ContestHero";
import { ContestProblemAnalysis } from "@/features/contest/components/ContestProblemAnalysis";
import { RatingQuartiles } from "@/features/contest/components/RatingQuartiles";
import { loadContestDashboard } from "@/features/contest/data/loadContestDashboard";

/** Renders the overview for a supported contest slug. */
export default async function ContestPage(props: PageProps<"/contests/[contestSlug]">) {
  const { contestSlug } = await props.params;
  const dashboard = await loadContestDashboard(contestSlug);

  if (!dashboard) notFound();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <ContestHero contest={dashboard.contest} />
      <RatingQuartiles distribution={dashboard.ratingDistribution} />
      <ContestProblemAnalysis problems={dashboard.problems} />
    </div>
  );
}
