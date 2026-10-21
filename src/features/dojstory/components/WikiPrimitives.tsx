import type { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Evidence, RelatedLink } from "../model/types";
import { EvidenceNotice } from "./EvidenceNotice";

export function WikiPanel({ children, className = "" }: { children: ReactNode; className?: string }) { return <Card className={`wiki-panel ${className}`}>{children}</Card>; }

/** Renders unknown/zero, false and confirmed empty values without conflation. */
export function EvidenceValue<T>({ evidence, format }: { evidence: Evidence<T>; format?: (value: T) => ReactNode }) {
  if ("value" in evidence) return <><span>{format ? format(evidence.value) : String(evidence.value)}</span>{(evidence.status === "tentative" || evidence.note) && <EvidenceNotice status={evidence.status} note={evidence.note} />}</>;
  if (evidence.status === "conflict") return <><EvidenceNotice status="conflict" /><ul>{evidence.claims.map((claim, index) => <li key={index}>{claim.text}</li>)}</ul></>;
  return <><EvidenceNotice status={evidence.status} /><span className="wiki-muted"> · {evidence.reason}</span></>;
}

export function CheckedAt({ evidence }: { evidence: Evidence<string> }) { return <p className="wiki-muted">자료 확인일: <EvidenceValue evidence={evidence} /></p>; }

export function RelatedLinks({ related }: { related: RelatedLink[] }) {
  if (!related.length) return null;
  return <section aria-label="관련 항목"><h2>연결된 항목</h2><ul className="wiki-link-list">{related.map((link) => <li key={`${link.id}-${link.label}`}><span className="wiki-muted">{link.label}</span><Link href={link.href}>{link.title} →</Link></li>)}</ul></section>;
}

/** A focusable scroll region keeps source tables readable on small screens. */
export function WikiTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: ReactNode[][] }) {
  return <div className="wiki-table-scroll" role="region" aria-label={caption} tabIndex={0}><table><caption>{caption}</caption><thead><tr>{headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, column) => column === 0 ? <th scope="row" key={column}>{cell}</th> : <td key={column}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export const formatDuration = (seconds: number) => seconds === 0 ? "0초 (즉시 완료)" : seconds % 3600 === 0 ? `${seconds / 3600}시간` : seconds % 60 === 0 ? `${seconds / 60}분` : `${seconds}초`;
export const formatTokens = (tokens: number) => tokens === 0 ? "무료 (0 토큰)" : `${tokens.toLocaleString("en-US")} 토큰`;
