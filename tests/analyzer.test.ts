import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { validateAnkiRows } from "../src/core/anki.js";
import { rankDialogue, sampleDialogue } from "../src/core/analyzer.js";
import { parseDialogue } from "../src/core/parser.js";

const fixturePath = new URL("./fixtures/hades-sample.txt", import.meta.url);

describe("parseDialogue", () => {
  it("parses section and speaker boundaries", async () => {
    const raw = await readFile(fixturePath, "utf8");
    const lines = parseDialogue(raw);

    expect(lines[0]?.section).toBe("Ending 01");
    expect(lines[0]?.speaker).toBe("Persephone");
    expect(lines.at(-1)?.section).toBe("Inspect House 01");
    expect(lines.at(-1)?.speaker).toBe("Storyteller");
  });
});

describe("rankDialogue", () => {
  it("filters out proper nouns and surfaces literary candidates", async () => {
    const raw = await readFile(fixturePath, "utf8");
    const ranked = rankDialogue({ raw, limit: 20 });
    const headwords = ranked.map((candidate) => candidate.headword);

    expect(headwords).not.toContain("zagreus");
    expect(headwords).not.toContain("olympus");
    expect(headwords).toContain("deference");
    expect(headwords).toContain("transpire");
  });

  it("penalizes storyteller lines compared with character dialogue", async () => {
    const raw = `--- Sample ---
Hades: You ought to show deference at all times.
Storyteller: The stoic walls reveal deference in their solemn stillness.`;
    const ranked = rankDialogue({ raw, limit: 10 });
    const deference = ranked.find((candidate) => candidate.headword === "deference");

    expect(deference?.speaker).toBe("Hades");
  });
});

describe("sampleDialogue", () => {
  it("returns between 2 and 4 candidates and keeps the target clause", () => {
    const candidates = sampleDialogue({
      text: "Hades: I expect for you to show deference to her, at all times!",
      maxItems: 4,
    });

    expect(candidates.length).toBeGreaterThanOrEqual(2);
    expect(candidates.length).toBeLessThanOrEqual(4);
    expect(candidates[0]?.sourceClause).toContain("show deference to her");
  });
});

describe("validateAnkiRows", () => {
  it("accepts valid two-column rows and rejects malformed ones", () => {
    const valid = validateAnkiRows([
      {
        Front: "He showed [[deference]] to the queen.",
        Back: "경의, 공손한 존중\n/ˈdɛfərəns/, noun\n그는 여왕에게 경의를 표했다.\nrespect, reverence, submission\n-",
      },
    ]);

    const invalid = validateAnkiRows([
      {
        Front: "Missing brackets",
        Back: "한 줄뿐",
      },
    ]);

    expect(valid).toHaveLength(0);
    expect(invalid.length).toBeGreaterThan(0);
  });
});
