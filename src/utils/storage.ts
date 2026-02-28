// /**
//  * Storage keys for authentication tokens.
//  * Do NOT hard-code these keys anywhere else in the application.
//  */
// const ACCESS_TOKEN_KEY = 'access_token';
// const REFRESH_TOKEN_KEY = 'refresh_token';

// /**
//  * Get access token from local storage.
//  *
//  * @returns The access token or null if not found
//  */
// export const getAccessToken = (): string | null => {
//   return localStorage.getItem(ACCESS_TOKEN_KEY);
// };

// /**
//  * Get refresh token from local storage.
//  *
//  * @returns The refresh token or null if not found
//  */
// export const getRefreshToken = (): string | null => {
//   return localStorage.getItem(REFRESH_TOKEN_KEY);
// };

// /**
//  * Save access token to local storage.
//  *
//  * @param token - JWT access token returned from backend
//  */
// export const saveAccessToken = (token: string): void => {
//   localStorage.setItem(ACCESS_TOKEN_KEY, token);
// };

// /**
//  * Save refresh token to local storage.
//  *
//  * @param token - Refresh token returned from backend
//  */
// export const saveRefreshToken = (token: string): void => {
//   localStorage.setItem(REFRESH_TOKEN_KEY, token);
// };

// /**
//  * Clear all authentication-related data from local storage.
//  * Used when user logs out or refresh token fails.
//  */
// export const clearAuth = (): void => {
//   localStorage.removeItem(ACCESS_TOKEN_KEY);
//   localStorage.removeItem(REFRESH_TOKEN_KEY);
// };
