import React, { FC, useState } from 'react';
import { useAppConfigurator } from '../../providers';
import { IConfigurableComponentContext } from '../../providers/configurableComponent/contexts';
import { ISettingsEditor } from '../configurableComponent';
import { ComponentSettingsModal } from './componentSettingsModal';

export interface IComponentStateProps<TSettings = any> {
  isSelected: boolean;
  isEditMode: boolean;
  wrapperClassName: string;
  settings: TSettings;
}

export interface IOverlayProps {
  children?: React.ReactElement;
}

export type ConfigurableComponentChildrenFn<TSettings = any> = (
  componentState: IComponentStateProps<TSettings>,
  BlockOverlay: (props: IOverlayProps) => React.ReactElement
) => React.ReactNode | null;

export interface IConfigurableComponentRendererProps<TSettings = any> {
  canConfigure?: boolean;
  children: ConfigurableComponentChildrenFn<TSettings>;
  onStartEdit?: () => void;
  contextAccessor: () => IConfigurableComponentContext<TSettings>;
  settingsEditor?: ISettingsEditor<TSettings>;
}

export interface IBlockOverlayProps {
  visible: boolean;
  onClick?: () => void;
}

const BlockOverlay: FC<IBlockOverlayProps> = ({ onClick, children, visible }) => {
  if (!visible) return null;

  return (
    <div onClick={onClick} className="sha-configurable-component-overlay">
      {children}
    </div>
  );
};

export const ConfigurableComponentRenderer = <TSettings extends any>({
  children,
  canConfigure = true,
  onStartEdit,
  contextAccessor,
  settingsEditor,
}: IConfigurableComponentRendererProps<TSettings>) => {
  const [editorIsVisible, setEditorIsVisible] = useState(false);
  const { mode } = useAppConfigurator();
  const { save, settings } = contextAccessor();

  if (!children) return null;

  if (!canConfigure) {
    return (
      <>
        {children({ isEditMode: false, isSelected: false, wrapperClassName: '', settings: null }, () => (
          <></>
        ))}
      </>
    );
  }

  const componentState: IComponentStateProps = {
    isEditMode: mode === 'edit',
    isSelected: false,
    wrapperClassName: 'sha-configurable-component',
    settings,
  };

  const onOverlayClick = () => {
    if (onStartEdit) onStartEdit();
    else setEditorIsVisible(true);
  };

  const onCancel = () => {
    setEditorIsVisible(false);
  };

  const onSave = (model: TSettings) => {
    save(model)
      .then(() => {
        setEditorIsVisible(false);
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <>
      {children(componentState, ({ children: overlayChildren }) => (
        <BlockOverlay visible={mode === 'edit'} onClick={onOverlayClick}>
          {overlayChildren}
        </BlockOverlay>
      ))}
      {editorIsVisible && Boolean(settingsEditor) && settingsEditor.render({ settings, onSave, onCancel })}
      {editorIsVisible && !Boolean(settingsEditor) && (
        <ComponentSettingsModal<TSettings> onCancel={onCancel} onSave={onSave} markup={null} model={null} />
      )}
    </>
  );
};

export default ConfigurableComponentRenderer;
