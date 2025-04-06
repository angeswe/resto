/**
 * Types for schema definitions and field types
 */

/**
 * Supported field types in schema definitions
 */
export type SchemaFieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null'
  | 'uuid'
  | 'id'
  | 'name'
  | 'email'
  | 'date';

/**
 * Base interface for all schema field definitions
 */
export interface BaseSchemaField {
  type: SchemaFieldType;
  description?: string;
  required?: boolean;
}

/**
 * String field definition
 */
export interface StringSchemaField extends BaseSchemaField {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  format?: 'email' | 'uri' | 'date-time' | 'uuid';
}

/**
 * Number field definition
 */
export interface NumberSchemaField extends BaseSchemaField {
  type: 'number';
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
}

/**
 * Boolean field definition
 */
export interface BooleanSchemaField extends BaseSchemaField {
  type: 'boolean';
}

/**
 * Object field definition
 */
export interface ObjectSchemaField extends Omit<BaseSchemaField, 'required'> {
  type: 'object';
  properties: Record<string, SchemaField>;
  requiredFields?: string[];
  additionalProperties?: boolean | SchemaField;
}

/**
 * Array field definition
 */
export interface ArraySchemaField extends BaseSchemaField {
  type: 'array';
  items: SchemaField | SchemaField[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

/**
 * ID field definition (auto-generated)
 */
export interface IdSchemaField extends BaseSchemaField {
  type: 'id';
  format?: 'uuid' | 'increment' | 'objectId';
}

/**
 * Name field definition (auto-generated)
 */
export interface NameSchemaField extends BaseSchemaField {
  type: 'name';
  format?: 'full' | 'first' | 'last';
}

/**
 * Email field definition (auto-generated)
 */
export interface EmailSchemaField extends BaseSchemaField {
  type: 'email';
  domain?: string;
}

/**
 * Date field definition (auto-generated)
 */
export interface DateSchemaField extends BaseSchemaField {
  type: 'date';
  format?: 'iso' | 'timestamp';
  past?: boolean;
  future?: boolean;
}

/**
 * Union type for all schema field definitions
 */
export type SchemaField =
  | StringSchemaField
  | NumberSchemaField
  | BooleanSchemaField
  | ObjectSchemaField
  | ArraySchemaField
  | IdSchemaField
  | NameSchemaField
  | EmailSchemaField
  | DateSchemaField;

/**
 * Schema definition type (root level)
 */
export type SchemaDefinition = Record<string, any>;

/**
 * Default schema with common fields using the random generator format
 * Each field uses a random generator directive to create realistic test data
 */
export const DEFAULT_SCHEMA: SchemaDefinition = {
  // Unique identifier using UUID format
  id: "(random:uuid)",
  
  // Random full name
  name: "(random:name)",
  
  // Random email address
  email: "(random:email)",
  
  // Creation timestamp in ISO format
  createdAt: "(random:datetime)"
};
