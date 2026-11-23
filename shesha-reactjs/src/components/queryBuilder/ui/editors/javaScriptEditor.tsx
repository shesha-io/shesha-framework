import { FC } from 'react';
import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';

interface JavaScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  label?: string | undefined;
  description?: string | undefined;
}

export const JavaScriptEditor: FC<JavaScriptEditorProps> = ({ value, onChange, readOnly, label, description }) => (
  <CodeEditor
    value={value}
    onChange={(next) => onChange(next ?? '')}
    readOnly={readOnly}
    mode="dialog"
    propertyName="expression"
    label={label ?? 'JavaScript Expression'}
    description={description ?? 'Enter a JavaScript expression that returns true or false.'}
  />
);
