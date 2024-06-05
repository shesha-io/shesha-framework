import React, { FC } from 'react';
import { DefaultItemRenderingProps } from './interfaces';
import { IconType, ShaIcon } from '@/components';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useStyles } from '@/components/listEditor/styles/styles';

export interface IListItemProps {
    item: DefaultItemRenderingProps;
}

export const DefaultListItem: FC<IListItemProps> = ({ item }) => {
    const { label, description, icon } = item;
    const { styles } = useStyles();
    return (
        <>
            {icon && <ShaIcon iconName={icon as IconType} />}

            <span className={styles.listItemName}>{label}</span>

            {description && (
                <Tooltip title={description}>
                    <QuestionCircleOutlined className={styles.helpIcon} />
                </Tooltip>
            )}
        </>
    );
};