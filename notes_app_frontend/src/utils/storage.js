 /**
  * Safely parse JSON, returning undefined on failure.
  * @param {string} str
  * @returns {any|undefined}
  */
export function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}

/**
 * Safely stringify JSON, returning undefined on failure or unsupported types.
 * @param {any} value
 * @returns {string|undefined}
 */
export function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

/**
 * PUBLIC_INTERFACE
 * getInitialNotes
 * Return initial notes array. Supports future migrations/versioning.
 * @returns {Array}
 */
export function getInitialNotes() {
  // Placeholder for future migrations:
  // - Could read legacy keys
  // - Could transform old shapes to new one
  return [];
}
