/**
 * Image Cache Busting Utility
 * Adds timestamp query parameter to image URLs to prevent browser caching issues
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

function resolveImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) {
    return "/images/user/default-avatar.png";
  }

  const normalizedImageUrl = imageUrl.trim().replace(/\\/g, "/");

  if (
    normalizedImageUrl.startsWith("http://") ||
    normalizedImageUrl.startsWith("https://")
  ) {
    return encodeURI(normalizedImageUrl);
  }

  // Prefer API origin to avoid mixing FE origin with BE relative paths
  const apiOrigin = (() => {
    if (!API_BASE_URL) return null;
    try {
      return new URL(API_BASE_URL).origin;
    } catch (error) {
      console.warn("Failed to parse API_BASE_URL", error);
      return null;
    }
  })();

  const origin = apiOrigin || window.location.origin;

  const normalizedPath = normalizedImageUrl.startsWith("/")
    ? normalizedImageUrl
    : `/${normalizedImageUrl}`;

  return encodeURI(`${origin}${normalizedPath}`);
}

/**
 * Add cache-busting query parameter to image URL
 * This forces browsers to fetch fresh image instead of using cached version
 *
 * @param imageUrl - Original image URL
 * @returns URL with cache-busting parameter
 */
export function addCacheBuster(imageUrl: string | undefined): string {
  const fullUrl = resolveImageUrl(imageUrl);
  const separator = fullUrl.includes("?") ? "&" : "?";
  return `${fullUrl}${separator}t=${Date.now()}`;
}
