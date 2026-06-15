import React, { FC, PropsWithChildren } from 'react';
import { Collapse, Skeleton } from 'antd';
import { CollapseProps } from 'antd/lib/collapse';
import classNames from 'classnames';
import { IStyleType } from "@/providers/form/models";
import { useStyles } from './styles/styles';

export type headerType = 'parent' | 'child' | 'default';

export interface ICollapsiblePanelProps extends CollapseProps, Omit<IStyleType, 'style'> {
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
  panelHeadType?: headerType | undefined;
  headerStyles?: IStyleType | undefined;
  bodyStyle?: React.CSSProperties | undefined;
  headerStyle?: React.CSSProperties | undefined;
  accentStyle?: boolean | undefined;
  overflowStyle?: React.CSSProperties | undefined;
}

const defaultHeaderStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  paddingLeft: '16px',
  paddingRight: '16px',
  paddingBottom: '8px',
  paddingTop: '8px',
};

const defaultBodyStyle: React.CSSProperties = {
  paddingLeft: '16px',
  paddingBottom: '16px',
  paddingTop: '16px',
  paddingRight: '16px',
  marginBottom: '5px',
};

export const CollapsiblePanel: FC<PropsWithChildren<Omit<ICollapsiblePanelProps, 'radiusLeft' | 'radiusRight' | 'expandIconPosition' | 'children'>>> = ({
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
  bodyStyle = defaultBodyStyle,
  headerStyle = defaultHeaderStyle,
  isSimpleDesign,
  hideWhenEmpty,
  hideCollapseContent,
  accentStyle,
  overflowStyle,
}) => {
  // Prevent the CollapsiblePanel from collapsing every time you click anywhere on the extra and header
  const onContainerClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => event.stopPropagation();

  const { styles } = useStyles({ bodyStyle, headerStyle, ghost, isSimpleDesign, hideCollapseContent, accentStyle, overflow: overflowStyle });
  const shaCollapsiblePanelStyle = isSimpleDesign ? styles.shaSimpleDesign : styles.shaCollapsiblePanel;

  return (
    <Collapse
      defaultActiveKey={collapsedByDefault ? [] : ['1']}
      expandIconPlacement={expandIconPlacement}
      className={classNames(shaCollapsiblePanelStyle, { [styles.hideWhenEmpty]: hideWhenEmpty }, className)}
      ghost={ghost ?? false}
      items={[
        {
          key: "1",
          collapsible: collapsible ?? "disabled",
          showArrow: showArrow ?? false,
          label: header || ' ',
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
