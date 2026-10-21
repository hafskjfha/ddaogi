import assert from "node:assert/strict";

const baseUrl = process.env.DOJSTORY_BASE_URL ?? "http://127.0.0.1:3000";
const routes = [
  ["/dojstory", "DOJstory 위키"],
  ["/dojstory/items?slot=chair", "기본 의자"],
  ["/dojstory/items/basic-chair", "공방 연구속도 +3%"],
  ["/dojstory/items/basic-prism", "상세 정보 수집 중"],
  ["/dojstory/research/crystal-compression", "별도 조합법 획득 필요"],
  ["/dojstory/workshop", "200 kW"],
  ["/dojstory/workshop/mines/copper", "900 XP"],
  ["/dojstory/guides/getting-started", "시작하기"],
  ["/dojstory/guides/dlc-dojpower", "33.33"],
  ["/dojstory/guides/starforce", "3.6%"],
  ["/dojstory/guides/potential", "프로필 반짝임 +?%"],
  ["/dojstory/sources/equipment", "&lt;svg"],
  ["/dojstory/sources/clarifications", "선행 연구 목록은 모두 필수"],
];

// Check real HTTP responses: calling a page function cannot detect streamed 200s.
for (const [path, expected] of routes) {
  const response = await fetch(new URL(path, baseUrl));
  assert.equal(response.status, 200, path);
  assert.ok((await response.text()).includes(expected), `${path}: missing expected content`);
  console.log(`PASS 200 ${path}`);
}
for (const path of ["items", "research", "workshop/mines", "guides", "sources"]) {
  const response = await fetch(new URL(`/dojstory/${path}/not-collected`, baseUrl));
  assert.equal(response.status, 404, `Unknown ${path} must return HTTP 404`);
  console.log(`PASS 404 /dojstory/${path}/not-collected`);
}
const empty = await fetch(new URL("/dojstory?q=not-collected-xyz", baseUrl));
assert.equal(empty.status, 200);
assert.ok((await empty.text()).includes("검색 결과 0개"));
console.log("PASS empty search returns 200");
