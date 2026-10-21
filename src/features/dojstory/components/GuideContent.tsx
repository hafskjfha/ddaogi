import type { GuideDocument } from "../model/types";
import { CheckedAt, EvidenceValue, WikiTable } from "./WikiPrimitives";
import { SourceReferences } from "./SourceReferences";

/** Renders structured prose and evidence cells; accepts no free HTML or JSX data. */
export function GuideContent({ guide }: { guide: GuideDocument }) {
  return <><header><p className="wiki-kicker">DOJstory 가이드</p><h1>{guide.title}</h1><p>{guide.summary}</p><CheckedAt evidence={guide.checkedAt} /></header>
    {guide.sections.map((section) => <section key={section.title} className="wiki-prose"><h2>{section.title}</h2>{section.blocks.map((block, index) => {
      if (block.kind === "paragraph") return <p key={index}><EvidenceValue evidence={block.content} /></p>;
      if (block.kind === "list") return <div key={index}><EvidenceValue evidence={block.content} format={(items) => <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>} /></div>;
      return <WikiTable key={index} caption={block.caption} headers={block.headers} rows={block.rows.map((row) => row.map((cell, column) => <EvidenceValue key={column} evidence={cell} />))} />;
    })}</section>)}<SourceReferences refs={guide.refs} /></>;
}
