export function getErrorMessage(error: unknown, fallback: string): string {
  // Case 1: Standard Error object
  if (error instanceof Error && error.message) {
    // Check if it's an Axios error with response data
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as any).response === "object" &&
      (error as any).response !== null &&
      "data" in (error as any).response
    ) {
      const responseData = (error as any).response.data as Record<string, unknown>;
      const extracted = extractMessage(responseData);
      if (extracted) return extracted;
    }

    return error.message;
  }

  // Case 2: Axios-like error with response.data
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const responseData = error.response.data as Record<string, unknown>;
    const extracted = extractMessage(responseData);
    if (extracted) return extracted;
  }

  // Case 3: Plain string error
  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }

  return fallback;
}

/**
 * Extract error message from various BE response structures:
 * - { message: "..." }
 * - { error: "..." }
 * - { title: "..." }
 * - { detail: "..." }
 * - { errors: { field: ["..."] } }  (ASP.NET validation)
 * - { errors: ["..."] }
 */
function extractMessage(data: Record<string, unknown>): string | null {
  // Direct message fields (most common)
  for (const key of ["message", "error", "title", "detail"]) {
    const value = data[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  // ASP.NET validation errors: { errors: { field: ["msg1", "msg2"] } }
  if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    const errorObj = data.errors as Record<string, unknown>;
    const messages: string[] = [];
    for (const field of Object.keys(errorObj)) {
      const fieldErrors = errorObj[field];
      if (Array.isArray(fieldErrors)) {
        messages.push(...fieldErrors.filter((e) => typeof e === "string"));
      }
    }
    if (messages.length > 0) return messages.join(". ");
  }

  // Array of error strings: { errors: ["msg1", "msg2"] }
  if (Array.isArray(data.errors)) {
    const msgs = data.errors.filter((e) => typeof e === "string");
    if (msgs.length > 0) return msgs.join(". ");
  }

  return null;
}
