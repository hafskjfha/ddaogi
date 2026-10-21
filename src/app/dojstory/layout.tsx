import type { Metadata } from "next";
import { WikiNav } from "@/features/dojstory/components/WikiNav";
import "./wiki.css";

export const metadata: Metadata = { title: "DOJstory 위키", description: "제공 자료와 출처로 탐색하는 DOJstory 장비·연구·공방 도감" };

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return <div className="wiki mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><p className="wiki-eyebrow">따오기 / DOJstory</p><WikiNav /><div className="wiki-body">{children}</div></div>;
}
