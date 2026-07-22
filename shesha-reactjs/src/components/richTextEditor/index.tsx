import React, { CSSProperties, FC } from 'react';
import classNames from 'classnames';
import { JoditConfig, JoditEditorWrapper } from './joditEditor';
import { useStyles } from './styles/styles';

export interface IRichTextEditorProps {
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  onBlur?: ((value: string) => void) | undefined;
  config?: JoditConfig | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
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
