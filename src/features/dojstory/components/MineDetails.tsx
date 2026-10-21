import type { WikiDataset } from "../model/types";
import { workshop } from "../../../../data/dojstory/workshop";
import { CheckedAt, EvidenceValue, WikiPanel, WikiTable, formatDuration, formatTokens } from "./WikiPrimitives";
import { SourceReferences } from "./SourceReferences";

/** Keeps XP units and missing level costs faithful to the source clarification. */
export function MineDetails({ mine }: { mine: WikiDataset["workshop"]["mines"][number] }) {
  return <>
    <header><p className="wiki-kicker">공방 · 광산 관찰 자료</p><h1>{mine.name}</h1><CheckedAt evidence={mine.checkedAt} /></header>
    <WikiPanel><h2>확보된 수치</h2><dl className="wiki-facts">
      <div><dt>광산 용량</dt><dd><EvidenceValue evidence={mine.capacity} format={(value) => `${value}개`} /></dd></div>
      <div><dt>문제당 증가량</dt><dd><EvidenceValue evidence={mine.perProblem} format={(value) => `${value}개 / 문제`} /></dd></div>
      <div><dt>연속 해결 시</dt><dd><EvidenceValue evidence={mine.consecutive} format={(value) => `${value}개 / 문제`} /></dd></div>
      <div><dt>채굴 시간</dt><dd><EvidenceValue evidence={mine.secondsPerOre} format={(value) => `${formatDuration(value)} / 개`} /></dd></div>
      <div><dt>채굴당 경험치</dt><dd><EvidenceValue evidence={mine.xpPerOre} format={(value) => `${value.toLocaleString("en-US")} XP / 개`} /></dd></div>
    </dl><p><EvidenceValue evidence={workshop.personalModifiers} /></p><p><EvidenceValue evidence={workshop.streakRule} /></p></WikiPanel>
    <section><h2>광산 레벨업</h2><p className="wiki-muted">원문의 필요 사용게이지는 경험치와 같은 단위로 보완되어 XP로 표기합니다. 누락 값은 보간하지 않습니다.</p>
      <WikiTable caption="광산 레벨업 비용과 필요 경험치 (확보된 공통 표)" headers={["레벨", "토큰", "철 주괴", "필요 경험치 (XP)"]} rows={workshop.mineLevels.map((row) => [row.level, <EvidenceValue key="tokens" evidence={row.tokens} format={formatTokens} />, <EvidenceValue key="iron" evidence={row.ironIngots} format={(value) => `${value}개`} />, <EvidenceValue key="xp" evidence={row.requiredXp} format={(value) => `${value.toLocaleString("en-US")} XP`} />])} />
      <EvidenceValue evidence={workshop.mineRules} format={(rules) => <ul className="wiki-prose">{rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>} />
    </section><SourceReferences refs={[...mine.refs, ...workshop.refs]} />
  </>;
}
