import React, { FC } from 'react';
import { Collapse, Skeleton } from 'antd';
import { CollapseProps } from 'antd/lib/collapse';
import classNames from 'classnames';
import { IStyleType } from '@/index';
import { useStyles } from './styles/styles';

export type headerType = 'parent' | 'child' | 'default';

export interface ICollapsiblePanelProps extends CollapseProps, Omit<IStyleType, 'style'> {
  isActive?: boolean;
  header?: React.ReactNode;
  className?: string;
  extraClassName?: string;
  showArrow?: boolean;
  forceRender?: boolean;
  extra?: React.ReactNode;
  noContentPadding?: boolean;
  loading?: boolean;
  collapsedByDefault?: boolean;
  headerColor?: string;
  bodyColor?: string;
  isSimpleDesign?: boolean;
  hideCollapseContent?: boolean;
  hideWhenEmpty?: boolean;
  parentPanel?: boolean;
  primaryColor?: string;
  dynamicBorderRadius?: number;
  panelHeadType?: headerType;
  headerStyles?: IStyleType;
  bodyStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  accentStyle?: boolean;
  overflowStyle?: React.CSSProperties;
}

const defaultHeaderStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  paddingLeft: '16px',
  paddingRight: '16px',
  paddingBottom: '8px',
  paddingTop: '8px'
};

const defaultBodyStyle: React.CSSProperties = {
  paddingLeft: '16px',
  paddingBottom: '16px',
  paddingTop: '16px',
  paddingRight: '16px',
  marginBottom: '5px',
};
/**
 * There was an error 
 * TS4023: Exported variable 'xxx' has or is using name 'zzz' from external module "yyy" but cannot be named.
 * 
 * found a solution
 * https://stackoverflow.com/questions/43900035/ts4023-exported-variable-x-has-or-is-using-name-y-from-external-module-but
 * 
 */

export const CollapsiblePanel: FC<Omit<ICollapsiblePanelProps, 'radiusLeft' | 'radiusRight'>> = ({
  expandIconPosition = 'end',
  onChange,
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
  noContentPadding,
  hideWhenEmpty,
  hideCollapseContent,
  accentStyle,
  overflowStyle
}) => {
  // Prevent the CollapsiblePanel from collapsing every time you click anywhere on the extra and header
  const onContainerClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event?.stopPropagation();

  const { styles } = useStyles({ bodyStyle, headerStyle, ghost, isSimpleDesign, noContentPadding, hideWhenEmpty, hideCollapseContent, accentStyle, overflow: overflowStyle });
  const shaCollapsiblePanelStyle = isSimpleDesign ? styles.shaSimpleDesign : styles.shaCollapsiblePanel;

  return (
    <Collapse
      defaultActiveKey={collapsedByDefault ? [] : ['1']}
      onChange={onChange}
      expandIconPosition={expandIconPosition}
      className={classNames(shaCollapsiblePanelStyle, { [styles.hideWhenEmpty]: hideWhenEmpty }, className)}
      ghost={ghost}
      items={[
        {
          key: "1",
          collapsible: collapsible,
          showArrow: showArrow,
          label: header || ' ',
          extra: (
            <span onClick={onContainerClick} className={extraClassName}>
              {extra}
            </span>
          ),
          children: <Skeleton loading={loading}>{children}</Skeleton>,
        }
      ]}
    />
  );
};

export default CollapsiblePanel;