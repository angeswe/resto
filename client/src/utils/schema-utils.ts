import { SchemaDefinition, DEFAULT_SCHEMA } from '../types/schema';

/**
 * Utility functions for handling schema definitions consistently
 */

/**
 * Ensures a schema is always an object, never a string
 * If a string is provided, it will be parsed to an object
 * If parsing fails or an empty schema is provided, the default schema is returned
 * 
 * @param schema - Schema definition as string or object
 * @returns Schema definition as object
 */
export const ensureSchemaObject = (schema: string | SchemaDefinition | undefined): SchemaDefinition => {
  if (!schema) {
    return DEFAULT_SCHEMA;
  }

  if (typeof schema === 'string') {
    try {
      const parsedSchema = JSON.parse(schema);
      return Object.keys(parsedSchema).length > 0 ? parsedSchema : DEFAULT_SCHEMA;
    } catch (error) {
      console.error('Failed to parse schema string:', error);
      return DEFAULT_SCHEMA;
    }
  }

  return Object.keys(schema).length > 0 ? schema : DEFAULT_SCHEMA;
};

/**
 * Converts a schema object to a formatted string for display
 * 
 * @param schema - Schema definition as object
 * @returns Formatted JSON string
 */
export const schemaToString = (schema: SchemaDefinition): string => {
  return JSON.stringify(schema, null, 2);
};

/**
 * Validates a schema definition
 * 
 * @param schema - Schema definition to validate
 * @returns Validation result with errors if any
 */
export const validateSchema = (schema: SchemaDefinition | string): { 
  valid: boolean; 
  errors: string[];
  schema: SchemaDefinition;
} => {
  const schemaObj = ensureSchemaObject(schema);
  const errors: string[] = [];

  // Basic validation
  if (!schemaObj || typeof schemaObj !== 'object') {
    errors.push('Schema must be a valid object');
    return { valid: false, errors, schema: DEFAULT_SCHEMA };
  }

  if (Object.keys(schemaObj).length === 0) {
    errors.push('Schema cannot be empty');
    return { valid: false, errors, schema: DEFAULT_SCHEMA };
  }

  // Additional validation logic can be added here
  // For example, checking for required fields, valid types, etc.

  return {
    valid: errors.length === 0,
    errors,
    schema: schemaObj
  };
};

/**
 * Merges a schema with the default schema
 * 
 * @param schema - Schema definition to merge
 * @returns Merged schema
 */
export const mergeWithDefaultSchema = (schema: SchemaDefinition): SchemaDefinition => {
  return { ...DEFAULT_SCHEMA, ...schema };
};
