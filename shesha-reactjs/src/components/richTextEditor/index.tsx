import React, { CSSProperties, FC } from 'react';
import classNames from 'classnames';
import { JoditEditorWrapper } from './joditEditor';
import { useStyles } from './styles/styles';

export interface IRichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  config?: any;
  className?: string;
  style?: CSSProperties;
}

export const RichTextEditor: FC<IRichTextEditorProps> = ({ value, onChange, config, style, className }) => {
  const { styles } = useStyles();
  return (
    <div style={style} className={classNames(styles.shaRichTextEditor, className)}>
      <JoditEditorWrapper
        value={value}
        config={config}
        onChange={onChange}
      />
    </div>
  );
};

export default RichTextEditor;
