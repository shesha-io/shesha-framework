import React, { FC } from 'react';
import { Collapse, Skeleton } from 'antd';
import { CollapseProps } from 'antd/lib/collapse';
import classNames from 'classnames';
import styled from 'styled-components';
import { useStyles } from './styles/styles';

const { Panel } = Collapse;

export interface ICollapsiblePanelProps extends CollapseProps {
  isActive?: boolean;
  header?: React.ReactNode;
  className?: string;
  extraClassName?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  forceRender?: boolean;
  extra?: React.ReactNode;
  noContentPadding?: boolean;
  loading?: boolean;
  collapsedByDefault?: boolean;
  bodyColor?: string;
  isSimpleDesign?: boolean;
  hideCollapseContent?: boolean;
}

/**
 * There was an error 
 * TS4023: Exported variable 'xxx' has or is using name 'zzz' from external module "yyy" but cannot be named.
 * 
 * found a solution
 * https://stackoverflow.com/questions/43900035/ts4023-exported-variable-x-has-or-is-using-name-y-from-external-module-but
 * 
 */

const StyledCollapse: any = styled(Collapse)<
  Omit<ICollapsiblePanelProps, 'collapsible' | 'showArrow' | 'header' | 'extraClassName' | 'extra' | 'radius'>
>`
  .ant-collapse-header {
    visibility: ${({ hideCollapseContent }) => (hideCollapseContent ? 'hidden' : 'visible')};
  }

  .ant-collapse-content {
    .ant-collapse-content-box > .sha-components-container {
      background-color: ${({ bodyColor }) => bodyColor};
    }
  }
`;

export const CollapsiblePanel: FC<Omit<ICollapsiblePanelProps, 'radiusLeft' | 'radiusRight'>> = ({
  expandIconPosition = 'end',
  onChange,
  header,
  extra,
  children,
  noContentPadding,
  loading,
  className,
  extraClassName,
  style,
  collapsedByDefault = false,
  showArrow,
  collapsible,
  ghost,
  bodyColor = 'unset',
  isSimpleDesign,
  hideCollapseContent,
}) => {
  // Prevent the CollapsiblePanel from collapsing every time you click anywhere on the extra and header
  const onContainerClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event?.stopPropagation();
  const { styles } = useStyles();

  const shaCollapsiblePanelStyle = isSimpleDesign ? {} : styles.shaCollapsiblePanel;

  return (
    <StyledCollapse
      defaultActiveKey={collapsedByDefault ? [] : ['1']}
      onChange={onChange}
      expandIconPosition={expandIconPosition}
      className={classNames(shaCollapsiblePanelStyle, className, { [styles.noContentPadding]: noContentPadding })}
      style={style}
      ghost={ghost}
      bodyColor={bodyColor}
      hideCollapseContent={hideCollapseContent}
    >
      <Panel
        key="1"
        collapsible={collapsible}
        showArrow={showArrow}
        header={header || ' '}
        extra={
          <span onClick={onContainerClick} className={extraClassName}>
            {extra}
          </span>
        }
      >
        <Skeleton loading={loading}>{children}</Skeleton>
      </Panel>
    </StyledCollapse>
  );
};

export default CollapsiblePanel;
