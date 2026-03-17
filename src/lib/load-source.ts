import { readFile } from "node:fs/promises";

const isUrl = (value: string) => /^https?:\/\//.test(value);

export const loadSourceText = async (input: string) => {
  if (isUrl(input)) {
    const response = await fetch(input);

    if (!response.ok) {
      throw new Error(`Failed to fetch source: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  return readFile(input, "utf8");
};
