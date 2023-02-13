import React, { CSSProperties, FC } from 'react';
import classNames from 'classnames';
import { JoditEditorWrapper } from './joditEditor';

export interface IRichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  config?: any;
  className?: string;
  style?: CSSProperties;
}

export const RichTextEditor: FC<IRichTextEditorProps> = ({ value, onChange, config, style, className }) => {
  return (
    <div style={style} className={classNames('sha-rich-text-editor', className)}>
      <JoditEditorWrapper
        value={value}
        config={config}
        onChange={onChange}
      />
    </div>
  );
};

export default RichTextEditor;