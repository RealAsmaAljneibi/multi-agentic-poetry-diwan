// Tiny markdown renderer scoped to what the Critics actually emit:
// **bold**, > blockquote, line breaks, headers like **القافية / Rhyme**.
// Why not react-markdown: we want zero extra deps for v1; their output is
// predictable because we control the system prompt.

import React from "react";

function inline(text: string): React.ReactNode[] {
  // **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let buffer: string[] = [];

  function flushParagraph() {
    if (buffer.length === 0) return;
    const joined = buffer.join(" ").trim();
    if (joined) {
      blocks.push(
        <p key={blocks.length} className="my-2">
          {inline(joined)}
        </p>
      );
    }
    buffer = [];
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flushParagraph();
      continue;
    }
    if (line.startsWith(">")) {
      flushParagraph();
      blocks.push(
        <blockquote key={blocks.length}>{inline(line.slice(1).trim())}</blockquote>
      );
      continue;
    }
    // Header-like sole-line bold
    if (/^\*\*[^*]+\*\*$/.test(line)) {
      flushParagraph();
      blocks.push(
        <p key={blocks.length} className="mt-4 mb-1">
          <strong>{line.slice(2, -2)}</strong>
        </p>
      );
      continue;
    }
    buffer.push(line);
  }
  flushParagraph();

  return <div className="verdict-prose">{blocks}</div>;
}
