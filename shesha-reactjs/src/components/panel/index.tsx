import React, { FC, PropsWithChildren, RefObject, useCallback, useEffect } from 'react';
import { Collapse, Skeleton } from 'antd';
import { CollapseProps } from 'antd/lib/collapse';
import classNames from 'classnames';
import { IStyleValue } from "@/providers/form/models";
import { useStyles } from './styles/styles';
import { isDefined } from '@/utils';

export interface ICollapseRef { collapsed: boolean; setCollapsed: (collapsed: boolean) => void };

export interface ICollapsiblePanelProps extends Omit<CollapseProps, 'onChange'>, Omit<IStyleValue, 'style'> {
  isActive?: boolean | undefined;
  header?: React.ReactNode | undefined;
  extraClassName?: string | undefined;
  showArrow?: boolean | undefined;
  forceRender?: boolean | undefined;
  extra?: React.ReactNode | undefined;
  loading?: boolean | undefined;
  collapsedByDefault?: boolean | undefined;
  headerColor?: string | undefined;
  bodyColor?: string | undefined;
  isSimpleDesign?: boolean | undefined;
  hideCollapseContent?: boolean | undefined;
  hideWhenEmpty?: boolean | undefined;
  parentPanel?: boolean | undefined;
  primaryColor?: string | undefined;
  dynamicBorderRadius?: number | undefined;
  headerStyles?: IStyleValue | undefined;
  accentStyle?: boolean | undefined;
  onChange?: (isExpanded: boolean) => void;
  ref?: RefObject<ICollapseRef | undefined>;
}

export const CollapsiblePanel: FC<PropsWithChildren<Omit<ICollapsiblePanelProps, 'radiusLeft' | 'radiusRight' | 'expandIconPosition' | 'children'>>> = (props) => {
  const {
    expandIconPlacement = 'end',
    header,
    extra,
    children,
    loading,
    className,
    extraClassName,
    collapsedByDefault = false,
    showArrow,
    collapsible,
    ghost,
    isSimpleDesign,
    hideWhenEmpty,
    onChange,
    ref,
    style,
  } = props;
  // Prevent the CollapsiblePanel from collapsing every time you click anywhere on the extra and header
  const onContainerClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => event.stopPropagation();

  const { styles } = useStyles(props);

  const [keys, setKeys] = React.useState<string[]>(collapsedByDefault ? [] : ['1']);

  const internalOnChange = useCallback((keys: string[]): void => {
    if (isDefined(keys) && keys.length > 0) {
      setKeys(['1']);
      onChange?.(true);
    } else {
      setKeys([]);
      onChange?.(false);
    }
  }, [onChange]);

  useEffect(() => {
    if (ref)
      ref.current = { collapsed: keys.length === 0, setCollapsed: (val: boolean) => internalOnChange(val ? [] : ['1']) };
  }, [internalOnChange, keys, ref]);

  const shaCollapsiblePanelStyle = isSimpleDesign === true ? styles.shaSimpleDesign : styles.shaCollapsiblePanel;

  return (
    <Collapse
      style={style ?? {}}
      activeKey={keys}
      onChange={internalOnChange}
      expandIconPlacement={expandIconPlacement}
      className={classNames(shaCollapsiblePanelStyle, { [styles.hideWhenEmpty]: hideWhenEmpty }, className)}
      ghost={ghost ?? false}
      items={[
        {
          key: "1",
          collapsible: collapsible ?? "disabled",
          showArrow: showArrow ?? false,
          label: isDefined(header) ? header : ' ',
          extra: (
            <span onClick={onContainerClick} className={extraClassName}>
              {extra}
            </span>
          ),
          children: <Skeleton loading={loading ?? false}>{children}</Skeleton>,
        },
      ]}
    />
  );
};

export default CollapsiblePanel;
