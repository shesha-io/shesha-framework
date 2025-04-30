import React, { FC } from 'react';
import { DefaultItemRenderingProps } from './interfaces';
import { IconType, ShaIcon } from '@/components';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useStyles } from '@/components/listEditor/styles/styles';
import { useActualContextData } from '@/hooks';

export interface IListItemProps {
    item: DefaultItemRenderingProps;
}

export const DefaultListItem: FC<IListItemProps> = ({ item }) => {
    const { label, description, icon } = item;

    const actualItem = useActualContextData({ label, description, icon });

    const { styles } = useStyles();
    return (
        <>
            {actualItem.icon && <ShaIcon iconName={actualItem.icon as IconType} />}

            <span className={styles.listItemName}>{actualItem.label}</span>

            {actualItem.description && (
                <Tooltip title={actualItem.description}>
                    <QuestionCircleOutlined className={styles.helpIcon} />
                </Tooltip>
            )}
        </>
    );
};