import React, { FC, PropsWithChildren, ReactNode } from 'react';
import { useAppConfigurator } from '@/providers';
import { useStyles } from './styles/styles';
import { isDefined } from '@/utils/nullables';

export interface IComponentStateProps<TSettings extends object = object> {
  isSelected: boolean;
  isEditMode: boolean;
  wrapperClassName: string;
  settings: TSettings | null;
}

export interface IOverlayProps {
  children?: React.ReactElement;
}

export type ConfigurableComponentChildrenFn<TSettings extends object = object> = (
  componentState: IComponentStateProps<TSettings>,
  BlockOverlay: (props: IOverlayProps) => React.ReactElement,
) => React.ReactNode | null;

export interface IConfigurableComponentProps<TSettings extends object = object> {
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

export const ConfigurableComponent = <TSettings extends object = object>({
  children,
  canConfigure = true,
  onStartEdit,
}: IConfigurableComponentProps<TSettings>): ReactNode => {
  const { mode } = useAppConfigurator();
  const { styles } = useStyles();

  if (!isDefined(children)) return null;

  if (!canConfigure) {
    return (
      <>
        {children({ isEditMode: false, isSelected: false, wrapperClassName: '', settings: null }, () => (
          <></>
        ))}
      </>
    );
  }

  const componentState: IComponentStateProps<TSettings> = {
    isEditMode: mode === 'edit',
    isSelected: false,
    wrapperClassName: styles.shaConfigurableComponent,
    settings: null,
  };

  const onOverlayClick = (): void => {
    onStartEdit?.();
  };

  return (
    <>
      {children(componentState, ({ children: overlayChildren }) => (
        <BlockOverlay visible={mode === 'edit'} onClick={onOverlayClick}>
          {overlayChildren}
        </BlockOverlay>
      ))}
    </>
  );
};

export default ConfigurableComponent;
