import { readFile } from "node:fs/promises";

import { bench, describe } from "vitest";

import { rankDialogue } from "../src/core/analyzer.js";

const fixturePath = new URL("../tests/fixtures/hades-sample.txt", import.meta.url);

describe("rank pipeline", async () => {
  const raw = await readFile(fixturePath, "utf8");
  const expanded = Array.from({ length: 250 }, () => raw).join("\n");

  bench("ranks repeated sample corpus", () => {
    rankDialogue({
      raw: expanded,
      limit: 60,
    });
  });
});
