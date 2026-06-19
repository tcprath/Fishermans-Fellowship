import mammoth from "mammoth";

const { value } = await mammoth.convertToHtml({ path: "./Devotionals.docx" });

const paragraphs = value
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/(?:p|h[1-6]|li|div|tr)>/gi, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#39;/g, "'").replace(/'|'/g, "'").replace(/"|"/g, '"').replace(/–|—/g, "-")
  .split("\n").map((l) => l.trim()).filter(Boolean);

// Find Aug 12 Sara context
for (let i = 0; i < paragraphs.length; i++) {
  if (/Aug\.?\s+12\s+Sara/i.test(paragraphs[i])) {
    console.log("Aug 12 Sara context:");
    paragraphs.slice(Math.max(0, i-1), i+6).forEach((l, j) => console.log(` [${i-1+j}]`, JSON.stringify(l)));
    break;
  }
}

// Find the Oct 6 section to see the format
for (let i = 0; i < paragraphs.length; i++) {
  if (/^Oct\.?\s+6/i.test(paragraphs[i])) {
    console.log("\nOct 6 context:");
    paragraphs.slice(i, i+8).forEach((l, j) => console.log(` [${i+j}]`, JSON.stringify(l)));
    break;
  }
}

// Show what's between Aug 30 and Sept 1
for (let i = 0; i < paragraphs.length; i++) {
  if (/^Aug\.?\s+30/i.test(paragraphs[i])) {
    console.log("\nAug 30 context (first 4 lines):");
    paragraphs.slice(i, i+4).forEach((l, j) => console.log(` [${i+j}]`, JSON.stringify(l)));
    break;
  }
}
for (let i = 0; i < paragraphs.length; i++) {
  if (/^Sept\.?\s+1/i.test(paragraphs[i])) {
    console.log("\nSept 1 context:");
    paragraphs.slice(i, i+4).forEach((l, j) => console.log(` [${i+j}]`, JSON.stringify(l)));
    break;
  }
}
