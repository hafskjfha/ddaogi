import Link from "next/link";

export function WikiNav() {
  return <nav aria-label="DOJstory 메뉴" className="wiki-nav">{[["/dojstory", "위키 홈"], ["/dojstory/guides/getting-started", "시작하기"], ["/dojstory/items", "아이템 도감"], ["/dojstory/research", "연구 도감"], ["/dojstory/workshop", "공방"], ["/dojstory/guides/dlc-dojpower", "DLC·DOJpower"], ["/dojstory/guides/starforce", "스타포스"], ["/dojstory/guides/potential", "잠재해방"]].map(([href, name]) => <Link href={href} key={href}>{name}</Link>)}</nav>;
}
