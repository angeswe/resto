/**
 * Convert a string to a slug (URL-friendly string)
 * @param text - The text to convert
 * @returns The slugified string
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-"); // Replace multiple - with single -
};

interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
}

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param options - Formatting options
 * @returns The formatted date
 */
export const formatDate = (date: string | Date, options: DateFormatOptions = {}): string => {
  const dateObj = new Date(date);
  const defaultOptions: DateFormatOptions = {
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
 * @param date - The date to format
 * @returns The relative time string
 */
export const timeAgoOld = (date: string | Date): string => {
  const dateObj = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

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

  return seconds <= 1 ? "just now" : `${Math.floor(seconds)} seconds ago`;
};

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 * @param date - The date to format
 * @returns The relative time string
 */
export const timeAgo = (dateString: string) => {
  if (!dateString) return 'Unknown date';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};


/**
 * Truncate a string to a specified length and add ellipsis
 * @param str - The string to truncate
 * @param length - Maximum length
 * @returns The truncated string
 */
export const truncate = (str: string, length: number = 100): string => {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
};

/**
 * Copy text to clipboard
 * @param text - The text to copy
 * @returns Whether the copy was successful
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
};

/**
 * Generate a random string
 * @param length - The length of the string
 * @returns The random string
 */
export const generateRandomString = (length: number = 10): string => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Get method badge class based on HTTP method
 * @param method - The HTTP method
 * @returns The CSS class
 */
export const getMethodBadgeClass = (method: HttpMethod): string => {
  const classes = {
    GET: "bg-green-100 text-green-800",
    POST: "bg-blue-100 text-blue-800",
    PUT: "bg-yellow-100 text-yellow-800",
    PATCH: "bg-orange-100 text-orange-800",
    DELETE: "bg-red-100 text-red-800",
  };
  return classes[method] || "bg-gray-100 text-gray-800";
};

/**
 * Parse a JSON schema and return prettified version
 * @param schema - The schema to parse
 * @returns Prettified JSON string
 */
export const prettyPrintSchema = (schema: object | string): string => {
  try {
    const obj = typeof schema === "string" ? JSON.parse(schema) : schema;
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    console.error("Error parsing schema:", err);
    return typeof schema === "string" ? schema : JSON.stringify(schema);
  }
};

interface SchemaTemplate {
  type: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  enum?: string[];
  properties?: Record<string, SchemaTemplate>;
  items?: SchemaTemplate;
}

/**
 * Generate sample data based on schema template
 * This is a simplified version of what the server does for preview purposes
 * @param schema - The schema template
 * @returns Generated sample data
 */
export const generateSampleData = (schema: SchemaTemplate): unknown => {
  switch (schema.type) {
    case "string": {
      if (schema.format === "date") {
        return new Date().toISOString().split("T")[0];
      }
      if (schema.format === "date-time") {
        return new Date().toISOString();
      }
      if (schema.format === "email") {
        return "user@example.com";
      }
      if (schema.format === "uri") {
        return "https://example.com";
      }
      if (schema.enum) {
        return schema.enum[Math.floor(Math.random() * schema.enum.length)];
      }
      return "Sample String";
    }
    case "number":
    case "integer": {
      const min = schema.minimum || 0;
      const max = schema.maximum || 100;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    case "boolean":
      return Math.random() > 0.5;
    case "array": {
      if (schema.items) {
        const length = Math.floor(Math.random() * 3) + 1;
        return Array.from({ length }, () => generateSampleData(schema.items!));
      }
      return [];
    }
    case "object": {
      if (schema.properties) {
        const result: Record<string, unknown> = {};
        for (const [key, prop] of Object.entries(schema.properties)) {
          result[key] = generateSampleData(prop);
        }
        return result;
      }
      return {};
    }
    default:
      return null;
  }
};
