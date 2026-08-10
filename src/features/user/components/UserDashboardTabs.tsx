"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MoreOverview } from "@/features/user/components/MoreOverview";
import { ProblemOverview } from "@/features/user/components/ProblemOverview";
import { RatingOverview } from "@/features/user/components/RatingOverview";
import type { UserDashboardData } from "@/features/user/model/types";

type UserDashboardTab = "rating" | "problems" | "more";

/** Owns the user analytics tabs and delegates each complete panel. */
export function UserDashboardTabs({ dashboard }: { dashboard: UserDashboardData }) {
  const [activeTab, setActiveTab] = useState<UserDashboardTab>("rating");

  function selectTab(value: string): void {
    if (value === "rating" || value === "problems" || value === "more") {
      setActiveTab(value);
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={selectTab} className="space-y-6">
      <TabsList aria-label="유저 분석 범주" className="grid w-full grid-cols-3 sm:w-auto">
        <TabsTrigger value="rating">레이팅</TabsTrigger>
        <TabsTrigger value="problems">문제</TabsTrigger>
        <TabsTrigger value="more">기타 정보</TabsTrigger>
      </TabsList>
      <TabsContent value="rating" forceMount hidden={activeTab !== "rating"}>
        <RatingOverview dashboard={dashboard} />
      </TabsContent>
      <TabsContent value="problems" forceMount hidden={activeTab !== "problems"}>
        <ProblemOverview dashboard={dashboard} />
      </TabsContent>
      <TabsContent value="more" forceMount hidden={activeTab !== "more"}>
        <MoreOverview dashboard={dashboard} />
      </TabsContent>
    </Tabs>
  );
}
