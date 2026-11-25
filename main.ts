// Unsent: The Micro-Confession Sprint
// Writes one two-part micro-confession to /output/entry.txt:
// a "To:" line naming who it was meant for, and the unsent message itself,
// one line, exactly as it was typed. Deterministic output.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TO_LINE = "To: the girl from the last train home in August";
const MESSAGE_LINE =
  "I still have the umbrella you left on the seat. I check the rain every morning, hoping one day it brings you back.";

const entry = `${TO_LINE}\n${MESSAGE_LINE}\n`;

// Runtime validation against the competition gate and judge brief.
const lines = entry.replace(/\n$/, "").split("\n");
if (lines.length !== 2) {
  throw new Error(`entry must be exactly two lines, got ${lines.length}`);
}
if (!lines[0].startsWith("To: ")) {
  throw new Error("line 1 must be a 'To: ...' line");
}
// The recipient must be a role or first-name-style reference, never a full
// real name: two consecutive capitalised words (e.g. "Jane Doe") are rejected.
const recipient = lines[0].slice("To: ".length);
if (recipient.trim().length === 0) {
  throw new Error("To: line must name a recipient");
}
if (/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(recipient)) {
  throw new Error("To: line must not contain a full real name");
}
if (MESSAGE_LINE.length > 200) {
  throw new Error(`message line is ${MESSAGE_LINE.length} chars, over the 200 limit`);
}
// The 260-char cap is on the file as stored, so enforce it in UTF-8 bytes
// too — a char count alone would pass an entry that is over the limit on disk.
if (Buffer.byteLength(entry, "utf8") > 260) {
  throw new Error(
    `entry is ${Buffer.byteLength(entry, "utf8")} UTF-8 bytes, over the 260 limit`
  );
}
if (entry.length < 1 || entry.length > 260) {
  throw new Error(`entry is ${entry.length} chars, outside the 1-260 limit`);
}
// No trailing whitespace on either line: an invisible space would make the
// entry look clean while failing a strict gate check on the raw bytes.
for (const [i, line] of lines.entries()) {
  if (line !== line.trimEnd()) {
    throw new Error(`line ${i + 1} has trailing whitespace`);
  }
}
if (entry.trim().length === 0) {
  throw new Error("entry must not be only whitespace");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), entry, "utf8");
