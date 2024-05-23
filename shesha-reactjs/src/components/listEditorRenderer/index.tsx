import React, { FC, PropsWithChildren } from 'react';
import { ISidebarProps } from './models';
import { SidebarPanel } from './sidebarPanel';
import { useStyles } from './styles/styles';
import { SizableColumns } from '../sizableColumns';
import classNames from 'classnames';


export interface IListEditorRendererProps extends PropsWithChildren<any> {
  /**
   * Sidebar props
   */
  sidebarProps?: ISidebarProps;
}

export const ListEditorRenderer: FC<IListEditorRendererProps> = ({
  sidebarProps: rightSidebarProps,
  children,
}) => {
  const { styles } = useStyles();

  return (
    <SizableColumns
      sizes={[75, 25]}
      minSize={150}
      expandToMin={false}
      gutterSize={8}
      gutterAlign="center"
      snapOffset={30}
      dragInterval={1}
      direction="horizontal"
      cursor="col-resize"
      className={classNames(styles.container)}
    >
      <div className={styles.mainArea}>
        {children}
      </div>
      <div className={styles.propsPanel}>
        <SidebarPanel {...rightSidebarProps} />
      </div>
    </SizableColumns>
  );
};
