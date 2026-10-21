import type { Evidence } from "../model/types";

const labels = { sourced: "제공 자료 기재", tentative: "추정·전언", unknown: "미확인", "not-applicable": "해당 없음", conflict: "자료 충돌" };

/** Status text explicitly distinguishes source transcription from official verification. */
export function EvidenceNotice({ status, note }: { status: Evidence<never>["status"]; note?: string }) {
  return <span className={`wiki-evidence wiki-evidence-${status}`}>{labels[status]}{note ? ` · ${note}` : ""}</span>;
}
