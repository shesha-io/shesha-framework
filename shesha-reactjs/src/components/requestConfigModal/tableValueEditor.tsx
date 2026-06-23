import React, { FC } from 'react';
import { ExpressionEditor, ExpressionContext } from '@/components/expressionEditor';

export interface ITableValueEditorProps {
  value: string;
  onChange: (v: string) => void;
  context: ExpressionContext;
  placeholder?: string;
  disabled?: boolean;
}

export const TableValueEditor: FC<ITableValueEditorProps> = ({
  value,
  onChange,
  context,
  placeholder,
  disabled,
}) => (
  <ExpressionEditor
    value={value}
    onChange={onChange}
    context={context}
    placeholder={placeholder}
    disabled={disabled}
    focusRows={6}
  />
);
