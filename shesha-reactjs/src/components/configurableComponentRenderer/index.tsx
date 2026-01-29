import React, { FC, PropsWithChildren, ReactElement, useState } from 'react';
import { useAppConfigurator } from '@/providers';
import { IConfigurableComponentContext } from '@/providers/configurableComponent/contexts';
import { ISettingsEditor } from '@/components/configurableComponent';
import { ComponentSettingsModal } from './componentSettingsModal';
import { useStyles } from './styles/styles';

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
  BlockOverlay: (props: IOverlayProps) => React.ReactElement,
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

const BlockOverlay: FC<PropsWithChildren<IBlockOverlayProps>> = ({ onClick, children, visible }) => {
  if (!visible) return null;

  type ClickableProps = { onClick?: React.MouseEventHandler };

  // Clone the children and compose onClick handlers
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement<ClickableProps>(child)) return child;

    const existingOnClick = child.props.onClick;
    const mergedOnClick: React.MouseEventHandler = (e) => {
      e.stopPropagation();
      existingOnClick?.(e);
      onClick?.();
    };

    return React.cloneElement(child, { onClick: mergedOnClick });
  });

  return (
    <div className="sha-configurable-component-overlay">
      {enhancedChildren}
    </div>
  );
};

export const ConfigurableComponentRenderer = <TSettings extends object>({
  children,
  canConfigure = true,
  onStartEdit,
  contextAccessor,
  settingsEditor,
}: IConfigurableComponentRendererProps<TSettings>): ReactElement => {
  const [editorIsVisible, setEditorIsVisible] = useState(false);
  const { mode } = useAppConfigurator();
  const { save, settings } = contextAccessor();
  const { styles } = useStyles();
  const { formInfoBlockVisible } = useAppConfigurator();

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


  const onOverlayClick = (): void => {
    if (onStartEdit) onStartEdit();
    else setEditorIsVisible(true);
  };

  const onCancel = (): void => {
    setEditorIsVisible(false);
  };

  const onSave = (model: TSettings): void => {
    save(model)
      .then(() => {
        setEditorIsVisible(false);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <>
      {children(componentState, ({ children: overlayChildren }) => (
        <BlockOverlay visible={formInfoBlockVisible === true} onClick={onOverlayClick}>
          <div className={styles.shaSidebarEditModeContainer}>
            {overlayChildren}
          </div>
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
