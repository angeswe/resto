// client/src/utils/helpers.js

/**
 * Convert a string to a slug (URL-friendly string)
 * @param {string} text - The text to convert
 * @returns {string} - The slugified string
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

/**
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @param {object} options - Formatting options
 * @returns {string} - The formatted date
 */
export const formatDate = (date, options = {}) => {
  const dateObj = new Date(date);
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return dateObj.toLocaleDateString(undefined, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} - The relative time string
 */
export const timeAgo = (date) => {
  const dateObj = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - dateObj) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  }

  return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`;
};

/**
 * Truncate a string to a specified length and add ellipsis
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length
 * @returns {string} - The truncated string
 */
export const truncate = (str, length = 100) => {
  if (!str) return "";
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} - Whether the copy was successful
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy: ", err);
    return false;
  }
};

/**
 * Generate a random string
 * @param {number} length - The length of the string
 * @returns {string} - The random string
 */
export const generateRandomString = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Get method badge class based on HTTP method
 * @param {string} method - The HTTP method
 * @returns {string} - The CSS class
 */
export const getMethodBadgeClass = (method) => {
  const methodClasses = {
    GET: "badge-get",
    POST: "badge-post",
    PUT: "badge-put",
    DELETE: "badge-delete",
    PATCH: "badge-patch",
  };

  return `badge-method ${methodClasses[method] || ""}`;
};

/**
 * Parse a JSON schema and return prettified version
 * @param {object|string} schema - The schema to parse
 * @returns {string} - Prettified JSON string
 */
export const prettyPrintSchema = (schema) => {
  try {
    const parsed = typeof schema === "string" ? JSON.parse(schema) : schema;
    return JSON.stringify(parsed, null, 2);
  } catch (err) {
    return typeof schema === "string" ? schema : JSON.stringify(schema);
  }
};

/**
 * Generate sample data based on schema template
 * This is a simplified version of what the server does for preview purposes
 * @param {object} schema - The schema template
 * @returns {object} - Generated sample data
 */
export const generateSampleData = (schema) => {
  // Return empty object for invalid input
  if (!schema || typeof schema !== "object") return {};

  // Function to process a schema node
  const processSchema = (node) => {
    // Handle arrays
    if (Array.isArray(node)) {
      return node.map((item) => processSchema(item));
    }

    // Handle objects
    if (typeof node === "object" && node !== null) {
      const result = {};

      for (const [key, value] of Object.entries(node)) {
        if (typeof value === "string" && value === "(random)") {
          // Default to sample string
          result[key] = "sample_string";
        } else if (typeof value === "string" && value.startsWith("(random:")) {
          // Extract the type
          const type = value.substring(8, value.length - 1);
          result[key] = getSampleValueForType(type);
        } else if (typeof value === "object" && value !== null) {
          // Recursively process nested objects/arrays
          result[key] = processSchema(value);
        } else {
          // Keep static values as is
          result[key] = value;
        }
      }

      return result;
    }

    // Return primitive values as is
    return node;
  };

  // Generate a sample value based on type
  const getSampleValueForType = (type) => {
    switch (type.toLowerCase()) {
      case "string":
        return "sample_string";
      case "number":
      case "integer":
        return 42;
      case "float":
        return 42.5;
      case "boolean":
        return true;
      case "id":
      case "uuid":
        return "123e4567-e89b-12d3-a456-426614174000";
      case "date":
        return "2023-01-15";
      case "datetime":
      case "timestamp":
        return "2023-01-15T12:34:56Z";
      case "email":
        return "user@example.com";
      case "url":
        return "https://example.com";
      case "fullname":
        return "John Doe";
      case "phone":
        return "+1-555-123-4567";
      default:
        return `sample_${type}`;
    }
  };

  return processSchema(schema);
};
