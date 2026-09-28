import { FormSettingsButton } from '@/components/formDesigner/toolbar/formSettingsButton';
import { PreviewButton } from '@/components/formDesigner/toolbar/previewButton';
import { SaveButton } from '@/components/formDesigner/toolbar/saveButton';
import { UndoRedoButtons } from '@/components/formDesigner/toolbar/undoRedoButtons';
import { ButtonProps, Space } from 'antd';
import { FC } from 'react';
import { CustomActions } from './customMenu';
import { useIsDevMode } from '@/hooks/useIsDevMode';

export type IFormToolbarProps = Pick<ButtonProps, 'size'> & {
  readOnly?: boolean;
};

export const FormToolbar: FC<IFormToolbarProps> = ({ readOnly = false, size = "small" }) => {
  const isDevMode = useIsDevMode();
  return (
    <Space orientation="horizontal" size={5}>
      <FormSettingsButton buttonText="" size={size} />
      {!readOnly && (<UndoRedoButtons size={size} />)}
      <PreviewButton size={size} />
      {!readOnly && (<SaveButton size={size} type="primary" />)}
      {isDevMode && <CustomActions size={size} />}
    </Space>
  );
};
