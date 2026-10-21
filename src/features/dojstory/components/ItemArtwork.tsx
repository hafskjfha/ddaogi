"use client";

import Image from "next/image";
import { PackageOpen } from "lucide-react";
import { useState } from "react";

/** Keeps the name and neutral placeholder visible when artwork is absent or fails. */
export function ItemArtwork({ name, src, slot }: { name: string; src: string | null; slot: string | null }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src && failedSrc === src);
  return <div className="wiki-artwork">
    {src && !failed ? <Image src={src} alt={name} fill sizes="(max-width: 767px) 90vw, 400px" style={{ objectFit: slot === "background" ? "cover" : "contain" }} onError={() => setFailedSrc(src)} /> : <div className="wiki-artwork-fallback"><PackageOpen aria-hidden="true" size={28} /><span>{name}</span><span>{failed ? "이미지를 불러오지 못했습니다" : "이미지 미확보"}</span></div>}
  </div>;
}
