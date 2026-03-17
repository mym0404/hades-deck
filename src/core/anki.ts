type AnkiRow = {
  Front: string;
  Back: string;
};

export const validateAnkiRows = (rows: Record<string, string>[]) => {
  const issues: string[] = [];

  if (rows.length === 0) {
    issues.push("CSV is empty.");
    return issues;
  }

  for (const [index, row] of rows.entries()) {
    const keys = Object.keys(row);

    if (keys.length !== 2 || keys[0] !== "Front" || keys[1] !== "Back") {
      issues.push(`Row ${index + 2}: expected only Front and Back columns.`);
      continue;
    }

    if (!row.Front?.trim()) {
      issues.push(`Row ${index + 2}: Front is empty.`);
    }

    if (!row.Back?.trim()) {
      issues.push(`Row ${index + 2}: Back is empty.`);
    }

    if (row.Front.includes("\n")) {
      issues.push(`Row ${index + 2}: Front must be a single line.`);
    }

    if (!row.Front.includes("[[") || !row.Front.includes("]]")) {
      issues.push(`Row ${index + 2}: Front must include [[headword]].`);
    }

    const backLines = row.Back.split(/\r?\n/);

    if (backLines.length !== 5) {
      issues.push(`Row ${index + 2}: Back must contain exactly 5 lines.`);
    }
  }

  return issues;
};

export type { AnkiRow };
