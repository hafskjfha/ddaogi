"use client";

/** Dataset and source failures remain distinct from empty search results. */
export default function WikiError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section role="alert"><h1>위키 자료를 불러오지 못했습니다</h1><p>자료 읽기 또는 검증 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p><button onClick={retry}>다시 시도</button></section>;
}
