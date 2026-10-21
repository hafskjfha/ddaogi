import { useId } from "react";
import type { WikiResearch } from "../model/types";
import { buildResearchGraph } from "../data/buildResearchGraph";

/** A server-rendered, keyboard-accessible DAG of the collected prerequisites. */
export function ResearchGraph({ research, highlightedIds }: { research: WikiResearch[]; highlightedIds?: string[] }) {
  const graph = buildResearchGraph(research);
  const instanceId = useId();
  const arrowId = `research-arrow-${instanceId}`;
  const descriptionId = `research-description-${instanceId}`;
  const names = new Map(graph.nodes.map((node) => [node.id, node.name]));
  const matches = highlightedIds ? new Set(highlightedIds) : null;

  if (!graph.nodes.length) return <p>표시할 연구가 없습니다.</p>;
  return <section className="research-graph" aria-label="연구 선행 관계도">
    <div className="wiki-section-heading">
      <h2>연구 선행 관계도</h2>
      <span className="wiki-muted">{graph.nodes.length}개 연구 · {graph.edges.length}개 선행 연결</span>
    </div>
    <p id={descriptionId} className="wiki-muted">화살표는 선행 연구 → 후속 연구입니다. 각 정점으로 들어오는 모든 선행 연구가 필요합니다. 정점을 누르면 요구 DOJpower·착용 조건과 비용을 확인할 수 있습니다.</p>
    {matches && <p className="research-graph-search">검색 결과 {matches.size}개를 강조했습니다. 전체 선행 관계는 함께 표시합니다.</p>}
    <div className="research-graph-scroll" role="region" aria-label="연구 그래프 스크롤 영역" tabIndex={0}>
      <svg
        role="group"
        aria-label="연구 선행 관계 그래프"
        aria-describedby={descriptionId}
        viewBox={`0 0 ${graph.width} ${graph.height}`}
        width={graph.width}
        height={graph.height}
        style={{ minWidth: graph.width }}
      >
        <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" className="research-graph-arrow" /></marker></defs>
        {graph.edges.map((edge) => <g
          key={`${edge.from}-${edge.to}`}
          role="img"
          aria-label={`${names.get(edge.from)} → ${names.get(edge.to)} (${edge.tentative ? "추정 선행" : "필수 선행"})`}
          className="research-graph-edge"
          data-tentative={edge.tentative}
          data-match={!matches || matches.has(edge.from) || matches.has(edge.to)}
        ><path d={edge.path} markerEnd={`url(#${arrowId})`} /></g>)}
        {graph.nodes.map((node) => <a
          key={node.id}
          href={`/dojstory/research/${node.slug}`}
          aria-label={`${node.name} 연구 상세`}
          tabIndex={0}
          className="research-graph-node"
          data-match={!matches || matches.has(node.id)}
          data-unknown={node.prerequisiteCount === null}
        >
          <rect x={node.x} y={node.y} width={node.width} height={node.height} rx="12" />
          <text x={node.x + 18} y={node.y + 31} className="research-graph-name">{node.name}</text>
          <text x={node.x + 18} y={node.y + 55} className="research-graph-subtitle">
            {node.prerequisiteCount === null ? "선행 연구 미확인" : `${node.tentative ? "추정·전언 · " : ""}${node.prerequisiteCount ? `필수 선행 ${node.prerequisiteCount}개` : "선행 연구 없음"}`}
          </text>
          <text x={node.x + node.width - 24} y={node.y + 31} className="research-graph-go" aria-hidden="true">↗</text>
        </a>)}
      </svg>
    </div>
    <p className="wiki-muted">현재 수록분의 관계입니다. 작은 화면에서는 그래프를 좌우로 스크롤할 수 있습니다.</p>
  </section>;
}
