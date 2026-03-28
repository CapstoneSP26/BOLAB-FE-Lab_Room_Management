import type { ReportReasonOption } from "./report.type";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toReasonOption = (item: unknown): ReportReasonOption | null => {
  if (!isObject(item)) return null;

  const valueCandidate = item.value ?? item.id ?? item.code ?? item.reason;
  const labelCandidate =
    item.label ?? item.name ?? item.title ?? item.description;

  if (
    typeof valueCandidate !== "string" ||
    typeof labelCandidate !== "string"
  ) {
    return null;
  }

  return {
    value: valueCandidate,
    label: labelCandidate,
  };
};

export const normalizeReasonOptions = (
  payload: unknown,
): ReportReasonOption[] => {
  const source =
    isObject(payload) && Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

  return source
    .map(toReasonOption)
    .filter((item): item is ReportReasonOption => item !== null);
};

export const getResponseSuccess = (payload: unknown): boolean => {
  return isObject(payload) && typeof payload.success === "boolean"
    ? payload.success
    : true;
};
