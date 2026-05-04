export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const responseData = error.response.data as Record<string, unknown>;
    const message = responseData.message ?? responseData.error;

    if (typeof message === "string" && message.trim() !== "") {
      return message;
    }
  }

  return fallback;
}
