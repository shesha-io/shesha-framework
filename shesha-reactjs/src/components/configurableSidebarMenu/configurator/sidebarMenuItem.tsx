import React, { FC } from 'react';
import { Button, Tooltip, Typography } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useSidebarMenuConfigurator } from '@/providers/sidebarMenuConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '@/components/shaIcon';
import classNames from 'classnames';
import { ISidebarMenuItem } from '@/interfaces/sidebar';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

const { Text } = Typography;

export interface IProps extends ISidebarMenuItem {
  index: number[];
}

export const SidebarMenuItem: FC<IProps> = props => {
  const { deleteItem, selectedItemId } = useSidebarMenuConfigurator();
  const { styles } = useStyles();

  const onDeleteClick = () => {
    deleteItem(props.id);
  };

  const { icon } = props;

  const renderedIcon = icon ? (
    typeof icon === 'string' ? (
      <ShaIcon iconName={icon as IconType} />
    ) : React.isValidElement(icon) ? (
      icon
    ) : null
  ) : null;

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.id} />
        {props.itemType === 'button' && (
          <>
            {renderedIcon}
            <span className={styles.shaToolbarItemName}>{props.title}</span>
            {props.tooltip && (
              <Tooltip title={props.tooltip}>
                <QuestionCircleOutlined className={styles.shaHelpIcon} />
              </Tooltip>
            )}
          </>
        )}
        {props.itemType === 'divider' && (<Text type="secondary">— divider —</Text>)}

        <div className={styles.shaToolbarItemControls}>
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
      </div>
    </div>
  );
};

export default SidebarMenuItem;
