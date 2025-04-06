import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';

/**
 * Props for the SchemaEditor component
 */
interface SchemaEditorProps {
  value: string | Record<string, any>;
  onChange: (value: string) => void;
  isValid: boolean;
  theme: 'light' | 'dark';
}

/**
 * Formats a JSON schema with proper indentation and line breaks
 * @param schema - The schema to format
 * @returns Formatted schema string
 */
const formatSchema = (schema: Record<string, any> | string): string => {
  try {
    // If it's already a string, parse it to ensure it's valid JSON
    const schemaObj = typeof schema === 'string' ? JSON.parse(schema) : schema;

    // Format with 2 spaces indentation and line breaks between properties
    return JSON.stringify(schemaObj, null, 2)
      // Add an extra line break after each property (except the last one)
      .replace(/},/g, '},\n')
      // Add an extra line break after each array item (except the last one)
      .replace(/],/g, '],\n');
  } catch (error) {
    // If parsing fails, return the original value
    return typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2);
  }
};

/**
 * Component for editing JSON schemas with syntax highlighting
 */
const SchemaEditor: React.FC<SchemaEditorProps> = ({
  value,
  onChange,
  isValid,
  theme,
}) => {
  // Format the schema with proper spacing and line breaks
  const formattedValue = formatSchema(value);

  return (
    <div className="space-y-2">
      <div className={`border rounded-md ${!isValid ? 'border-red-500' : ''}`}>
        <CodeMirror
          value={formattedValue}
          height="200px"
          extensions={[json()]}
          onChange={onChange}
          theme={theme === 'dark' ? dracula : githubLight}
        />
      </div>
      {!isValid && (
        <p className="text-sm text-red-500">Invalid JSON schema</p>
      )}
    </div>
  );
};

export default SchemaEditor;
