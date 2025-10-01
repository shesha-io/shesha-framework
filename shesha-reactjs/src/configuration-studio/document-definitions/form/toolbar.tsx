import { FormSettingsButton } from '@/components/formDesigner/toolbar/formSettingsButton';
import { PreviewButton } from '@/components/formDesigner/toolbar/previewButton';
import { SaveButton } from '@/components/formDesigner/toolbar/saveButton';
import { UndoRedoButtons } from '@/components/formDesigner/toolbar/undoRedoButtons';
import React, { FC } from 'react';

export interface IFormToolbarProps {
  readOnly?: boolean;
}

export const FormToolbar: FC<IFormToolbarProps> = ({ readOnly = false }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center' }}>
      <FormSettingsButton buttonText="" />
      <SaveButton size="small" type="link" />
      {!readOnly && (<UndoRedoButtons size="small" />)}
      <PreviewButton size="small" />
    </div>
  );
};
