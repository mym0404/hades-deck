import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

export const toCsv = <T extends Record<string, unknown>>(rows: T[]) =>
  stringify(rows, {
    header: true,
    columns: rows.length === 0 ? undefined : Object.keys(rows[0]),
  });

export const fromCsv = <T>(content: string) =>
  parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[];
