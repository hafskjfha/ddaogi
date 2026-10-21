import Link from "next/link";
import type { WikiDataset } from "../model/types";
import { sourceDate } from "../../../../data/dojstory/sources";
import { CheckedAt, EvidenceValue, WikiPanel, WikiTable, formatDuration, formatTokens } from "./WikiPrimitives";
import { SourceReferences } from "./SourceReferences";

/** Describes collected workshop mechanics without simulating missing production rules. */
export function WorkshopOverview({ workshop: w }: { workshop: WikiDataset["workshop"] }) {
  return <>
    <header><p className="wiki-kicker">공방 안내</p><h1>머신과 전력, 그리고 광산</h1><CheckedAt evidence={sourceDate("workshop")} /><p className="wiki-muted">확보된 자료의 관찰값입니다. 일부 효과와 제작 레시피는 자료가 더 필요합니다.</p></header>
    <nav className="wiki-nav" aria-label="공방 탭"><a href="#machines">머신</a><a href="#process-research">공정연구</a><a href="#power">발전소</a><a href="#mines">광산</a></nav>
    <section id="machines"><h2>머신</h2><WikiPanel><p>기본 머신 <EvidenceValue evidence={w.machineCount} />개. 아이템 1개를 제작할 때마다 내구도가 <EvidenceValue evidence={w.durabilityPerItem} /> 감소합니다.</p><p>내구도 최대 <EvidenceValue evidence={w.durabilityMax} />. 내구도 0에서는 제작 시간 <EvidenceValue evidence={w.exhaustedTimeMultiplier} />배가 됩니다.</p><p><Link href="/dojstory/items/repair-pack">수리팩</Link> 사용 시 내구도 <EvidenceValue evidence={w.repairRecovery} /> 회복, 최대치를 넘지 않습니다.</p><p><EvidenceValue evidence={w.machineExpansion} /></p><p><EvidenceValue evidence={w.powerGrowth} /></p><p>모듈: <EvidenceValue evidence={w.moduleSlots} /></p></WikiPanel>
      <WikiTable caption="확보된 머신 레벨과 도달 비용" headers={["머신 레벨", "제작 시간 감소", "업그레이드 도달 비용"]} rows={w.machineLevels.map((row) => [row.level, <EvidenceValue key="time" evidence={row.timeReduction} format={(value) => `${value}%`} />, <EvidenceValue key="tokens" evidence={row.tokens} format={formatTokens} />])} />
    </section>
    <section id="process-research"><h2>공정연구</h2><p>새로운 제작 방법과 효과를 해금합니다. 선행 연구, DOJpower 요구치와 소비 비용을 구분해 확인하세요.</p><Link href="/dojstory/research">현재 수록 연구 탐색 →</Link></section>
    <section id="power"><h2>발전소</h2><WikiPanel><dl className="wiki-facts"><div><dt>기본 발전량</dt><dd><EvidenceValue evidence={w.basePowerKw} format={(value) => `${value} kW`} /></dd></div><div><dt>태양광 패널</dt><dd><EvidenceValue evidence={w.solarPowerKw} /></dd></div><div><dt>전력 부족</dt><dd><EvidenceValue evidence={w.shortageMultiplier} /></dd></div></dl><p className="wiki-muted">제작과 연구에는 전력이 필요합니다. 수요가 발전량보다 높으면 속도가 느려집니다.</p><Link href="/dojstory/items/solar-panel">태양광 패널 항목 →</Link></WikiPanel></section>
    <section id="mines"><h2>광산 · 현재 수록 3종</h2><p>채굴은 머신에서 진행합니다. 원문 수치를 보간하거나 개인 효과 적용 여부를 단정하지 않습니다.</p><p>광산 레벨업에는 <Link href="/dojstory/items/iron-ingot">철 주괴</Link>를 소비합니다. 확보된 비용과 필요 XP는 각 광산 상세에서 확인할 수 있습니다.</p><ul className="wiki-result-grid mt-4">{w.mines.map((mine) => <li key={mine.id}><Link className="wiki-result" href={`/dojstory/workshop/mines/${mine.slug}`} aria-label={`${mine.name} 상세`}><span className="wiki-kicker">광산 관찰 자료</span><strong>{mine.name}</strong><span className="wiki-muted"><EvidenceValue evidence={mine.secondsPerOre} format={formatDuration} /> / 개</span></Link></li>)}</ul></section>
    <SourceReferences refs={w.refs} />
  </>;
}
