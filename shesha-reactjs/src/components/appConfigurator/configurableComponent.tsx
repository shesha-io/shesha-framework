import React, { FC, PropsWithChildren, useState } from 'react';
import { useAppConfigurator } from '@/providers';
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
  BlockOverlay: (props: IOverlayProps) => React.ReactElement
) => React.ReactNode | null;

export interface IConfigurableComponentProps<TSettings = any> {
  canConfigure?: boolean;
  children: ConfigurableComponentChildrenFn<TSettings>;
  onStartEdit?: () => void;
}

export interface IBlockOverlayProps {
  visible: boolean;
  onClick?: () => void;
}

const BlockOverlay: FC<PropsWithChildren<IBlockOverlayProps>> = ({ onClick, children, visible }) => {
  const { styles } = useStyles();
  if (!visible) return null;

  return (
    <div onClick={onClick} className={styles.shaConfigurableComponentOverlay}>
      {children}
    </div>
  );
};

export const ConfigurableComponent = <TSettings extends any>({
  children,
  canConfigure = true,
  onStartEdit,
}: IConfigurableComponentProps<TSettings>) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { mode } = useAppConfigurator();
  const { styles } = useStyles();

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
    wrapperClassName: styles.shaConfigurableComponent,
    settings: null,
  };

  const onOverlayClick = () => {
    if (onStartEdit) onStartEdit();
    else setModalVisible(true);
  };

  const onCancelClick = () => {
    setModalVisible(false);
  };

  const onSave = (_model: TSettings) => {
    setModalVisible(false);
  };

  return (
    <>
      {children(componentState, ({ children: overlayChildren }) => (
        <BlockOverlay visible={mode === 'edit'} onClick={onOverlayClick}>
          {overlayChildren}
        </BlockOverlay>
      ))}
      {modalVisible && (
        <ComponentSettingsModal<TSettings> onCancel={onCancelClick} onSave={onSave} model={null} />
      )}
    </>
  );
};

export default ConfigurableComponent;