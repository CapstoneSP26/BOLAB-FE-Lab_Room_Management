export const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const buildLabel = (value: string) => value || "Unknown";
