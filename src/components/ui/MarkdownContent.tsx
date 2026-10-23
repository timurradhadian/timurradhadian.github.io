"use client";

import React from "react";
import { MermaidDiagram } from "@/components/ui/MermaidDiagram";

interface MarkdownContentProps {
  content?: string | null;
  className?: string;
}

/**
 * Tokenizes and formats inline markdown (bold, italic, inline code, links).
 */
function renderInline(text: string): React.ReactNode {
  const pattern = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(pattern);

  return parts.filter(Boolean).map((part, i) => {
    // Links: [label](url)
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a
            key={i}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 font-medium underline underline-offset-2 hover:text-zinc-600 transition-colors"
          >
            {match[1]}
          </a>
        );
      }
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={i} className="italic text-zinc-800">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="font-mono text-[11px] sm:text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200/80 font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "hr" }
  | { type: "code"; lang?: string; code: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "p"; text: string };

/**
 * Parses markdown text into structured semantic blocks.
 */
function parseMarkdownBlocks(rawText: string): Block[] {
  const lines = rawText.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal Rule
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Code Blocks
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", text: trimmed.slice(2).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      blocks.push({ type: "h4", text: trimmed.slice(5).trim() });
      i++;
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ") });
      continue;
    }

    // Bullet Lists (- , * , • )
    if (/^[●•\-\*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[●•\-\*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[●•\-\*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Numbered Lists (1. , 2. )
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Tables
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (r: string) =>
          r
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim());
        const headers = parseRow(tableLines[0]);
        // line 1 is usually separator |---|---|
        const rows = tableLines.slice(2).map(parseRow);
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    // Paragraph
    const pLines: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim().length > 0 &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !/^[●•\-\*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|"))
    ) {
      pLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "p", text: pLines.join(" ") });
  }

  return blocks;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  if (!content || content.trim().length === 0) return null;

  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`space-y-4 text-zinc-600 leading-relaxed text-sm ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <h2
                key={idx}
                className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight pt-3 first:pt-0"
              >
                {renderInline(block.text)}
              </h2>
            );
          case "h2":
            return (
              <h3
                key={idx}
                className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight pt-4 pb-1 border-b border-zinc-100 flex items-center gap-2 first:pt-0"
              >
                <span className="size-2 rounded-full bg-zinc-900 inline-block" />
                <span>{renderInline(block.text)}</span>
              </h3>
            );
          case "h3":
            return (
              <h4
                key={idx}
                className="text-sm sm:text-base font-semibold text-zinc-900 pt-2"
              >
                {renderInline(block.text)}
              </h4>
            );
          case "h4":
            return (
              <h5
                key={idx}
                className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-800 pt-1"
              >
                {renderInline(block.text)}
              </h5>
            );
          case "hr":
            return <hr key={idx} className="border-t border-zinc-200 my-4" />;
          case "quote":
            return (
              <blockquote
                key={idx}
                className="border-l-3 border-zinc-400 bg-zinc-50/80 pl-3.5 py-2 my-2 rounded-r-lg text-zinc-700 italic text-xs sm:text-sm"
              >
                {renderInline(block.text)}
              </blockquote>
            );
          case "code": {
            const isMermaid =
              block.lang?.toLowerCase() === "mermaid" ||
              (!block.lang &&
                /^\s*(graph\s+|flowchart\s+|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie)/.test(
                  block.code
                ));

            if (isMermaid) {
              return <MermaidDiagram key={idx} chart={block.code} />;
            }

            return (
              <div key={idx} className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100">
                {block.lang && (
                  <div className="px-3.5 py-1.5 bg-zinc-900 text-zinc-400 text-[10px] font-mono uppercase tracking-wider border-b border-zinc-800">
                    {block.lang}
                  </div>
                )}
                <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-normal">
                  <code>{block.code}</code>
                </pre>
              </div>
            );
          }
          case "ul":
            return (
              <ul key={idx} className="space-y-1.5 pl-1 my-2">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-600">
                    <span className="size-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                    <span className="flex-1">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="space-y-1.5 pl-1 my-2">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-600">
                    <span className="font-mono text-xs font-bold text-zinc-400 shrink-0 w-4">
                      {itemIdx + 1}.
                    </span>
                    <span className="flex-1">{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={idx} className="overflow-x-auto my-3 rounded-xl border border-zinc-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-900">
                    <tr>
                      {block.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3 py-2">
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {block.rows.map((r, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-50/50">
                        {r.map((c, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 text-zinc-600">
                            {renderInline(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "p":
          default:
            return (
              <p key={idx} className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
