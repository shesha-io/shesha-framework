import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { App, Space } from 'antd';
import React, { FC } from 'react';
import { DebugButton } from '../toolbar/debugButton';
import { FormSettingsButton } from '../toolbar/formSettingsButton';
import { OpenOnNewPageButton } from '../toolbar/openOnNewPageButton';
import { PreviewButton } from '../toolbar/previewButton';
import { SaveMenu } from '../toolbar/saveMenu';
import { UndoRedoButtons } from '../toolbar/undoRedoButtons';
import { CanvasConfig } from '../toolbar/canvasConfig';

export interface IQuickEditToolbarProps {
  onUpdated: () => void;
  renderSource: "modal" | "designer-page";
}

export const QuickEditToolbar: FC<IQuickEditToolbarProps> = ({ onUpdated, renderSource }) => {
  const readOnly = useFormDesignerStateSelector((x) => x.readOnly);
  const { message } = App.useApp();

  const onSaved = (): void => {
    message.success('Form saved successfully');

    if (onUpdated)
      onUpdated();
  };

  return (
    <div className="sha-designer-toolbar">
      <Space direction="horizontal" size={20}>
        <CanvasConfig />
        <div className="sha-designer-toolbar-right" style={{ marginRight: renderSource === "modal" ? "30px" : "auto" }}>
          <FormSettingsButton buttonText="" size="small" />
          <OpenOnNewPageButton />
          <PreviewButton size="small" />
          <DebugButton />

          {!readOnly && (<UndoRedoButtons size="small" />)}
        </div>
      </Space>
      <div className="sha-designer-toolbar-left">
        {!readOnly && (
          <SaveMenu onSaved={onSaved} />
        )}
      </div>
    </div>
  );
};
