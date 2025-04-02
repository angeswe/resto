import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  theme: 'light' | 'dark';
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  value,
  onChange,
  isValid,
  theme,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Default Schema</h3>
      <div className={`border rounded-md ${!isValid ? 'border-red-500' : ''}`}>
        <CodeMirror
          value={value}
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
