/**
 * Minimale, dependency-vrije Markdown → HTML voor onze eigen blog-content.
 * Ondersteunt: ## / ### headings, paragrafen, - / * bullets, 1. lijsten,
 * ```fenced``` code, **bold**, `inline code`, [tekst](url).
 * Input is altijd van onszelf (trusted), maar we escapen toch alle HTML.
 */

const SENTINEL = "\uE000"; // private-use char, komt niet voor in echte tekst

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  // 1. escape, 2. code spans → sentinel, 3. bold, 4. links, 5. herstel code
  const codes: string[] = [];
  let out = escapeHtml(s).replace(/`([^`]+)`/g, (_m, c: string) => {
    codes.push(c);
    return `${SENTINEL}${codes.length - 1}${SENTINEL}`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" class="text-emerald-400 hover:underline">$1</a>'
  );
  out = out.replace(
    new RegExp(`${SENTINEL}(\\d+)${SENTINEL}`, "g"),
    (_m, i: string) =>
      `<code class="rounded bg-neutral-800 px-1 py-0.5 text-[0.85em]">${codes[Number(i)]}</code>`
  );
  return out;
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      html.push(
        `<pre class="my-4 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm"><code>${escapeHtml(
          buf.join("\n")
        )}</code></pre>`
      );
      continue;
    }

    if (line.startsWith("### ")) {
      html.push(
        `<h3 class="mt-7 mb-2 text-lg font-semibold">${inline(line.slice(4))}</h3>`
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      html.push(
        `<h2 class="mt-9 mb-3 text-xl font-semibold">${inline(line.slice(3))}</h2>`
      );
      i++;
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^[-*] /, ""))}</li>`);
        i++;
      }
      html.push(
        `<ul class="my-4 list-disc space-y-1.5 pl-5 text-neutral-300">${items.join(
          ""
        )}</ul>`
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\. /, ""))}</li>`);
        i++;
      }
      html.push(
        `<ol class="my-4 list-decimal space-y-1.5 pl-5 text-neutral-300">${items.join(
          ""
        )}</ol>`
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("#") &&
      !/^[-*] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    html.push(
      `<p class="my-4 leading-relaxed text-neutral-300">${inline(
        para.join(" ")
      )}</p>`
    );
  }

  return html.join("\n");
}
