import { CSSProperties, FC } from 'react';
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
  autoWidth?: boolean | undefined;
  autoHeight?: boolean | undefined;
  allowBase64Images?: boolean | undefined;
  id?: string | undefined;
}

export const RichTextEditor: FC<IRichTextEditorProps> = ({ value, onChange, config, style, className, autoWidth, autoHeight, allowBase64Images = true, id }) => {
  const { styles } = useStyles();
  return (
    <div
      style={style}
      className={classNames(styles.shaRichTextEditor, className, { 'auto-width': autoWidth, 'auto-height': autoHeight })}
    >
      <JoditEditorWrapper
        value={value}
        config={config}
        onChange={onChange}
        allowBase64Images={allowBase64Images}
        id={id}
      />
    </div>
  );
};

export default RichTextEditor;
