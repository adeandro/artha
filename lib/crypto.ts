/**
 * Simple PIN hashing for local storage
 * NOTE: This is for local storage only, not cryptographically secure
 * For a real app, consider using a proper crypto library
 */

const HASH_SALT = "artha_local_only";

// Simple string to base64 converter (no Buffer dependency)
const toBase64 = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    // Fallback for non-standard characters
    return Buffer.from(str).toString("base64");
  }
};

export const hashPin = (pin: string): string => {
  // Simple hash: concatenate salt + pin and convert to base64
  const combined = HASH_SALT + pin;
  return toBase64(combined);
};

export const verifyPin = (pin: string, hash: string): boolean => {
  return hashPin(pin) === hash;
};

export const getDefaultPinHash = (): string => {
  // Default PIN is 123456
  return hashPin("123456");
};
