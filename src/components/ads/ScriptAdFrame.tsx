'use client';

import { useEffect, useRef } from 'react';

// スクリプト型広告タグ（忍者AdMax等）を同一オリジンの iframe 内で実行する。
// srcdoc の隔離iframeだと広告ネットワークがドメインを判別できず配信されないため、
// contentDocument に直接書き込む“フレンドリーiframe”方式にする。
export function ScriptAdFrame({
  html,
  width,
  height,
}: {
  html: string;
  width: number;
  height: number;
}) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    const doc = iframe?.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(
      `<!doctype html><html><head><meta charset="utf-8"><base target="_blank">` +
        `<style>html,body{margin:0;padding:0;display:flex;align-items:center;justify-content:center;background:transparent}</style>` +
        `</head><body>${html}</body></html>`
    );
    doc.close();
  }, [html]);

  return (
    <iframe
      ref={ref}
      title="広告"
      scrolling="no"
      style={{ width, maxWidth: '100%', height, border: 0, display: 'block' }}
      className="rounded-xl"
    />
  );
}
