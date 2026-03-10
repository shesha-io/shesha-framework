import { FormSettingsButton } from '@/components/formDesigner/toolbar/formSettingsButton';
import { PreviewButton } from '@/components/formDesigner/toolbar/previewButton';
import { SaveButton } from '@/components/formDesigner/toolbar/saveButton';
import { UndoRedoButtons } from '@/components/formDesigner/toolbar/undoRedoButtons';
import { Space } from 'antd';
import React, { FC } from 'react';

export interface IFormToolbarProps {
  readOnly?: boolean;
}

export const FormToolbar: FC<IFormToolbarProps> = ({ readOnly = false }) => {
  return (
    <Space direction="horizontal" size={5}>
      <FormSettingsButton buttonText="" size="small" />
      {!readOnly && (<UndoRedoButtons size="small" />)}
      <PreviewButton size="small" />
      {!readOnly && (<SaveButton size="small" type="primary" />)}
    </Space>
  );
};
