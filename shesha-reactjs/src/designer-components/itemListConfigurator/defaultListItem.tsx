import React, { FC, useMemo } from 'react';
import { DefaultItemRenderingProps } from './interfaces';
import { IconType, ShaIcon } from '@/components';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useStyles } from '@/components/listEditor/styles/styles';
import { getActualModel } from '@/providers/form/utils';

export interface IListItemProps {
    item: DefaultItemRenderingProps;
    actualModelContext?: any;
}

export const DefaultListItem: FC<IListItemProps> = ({ item, actualModelContext }) => {
    const { label, description, icon } = item;
    const actualItem = useMemo(() => {
        return getActualModel({ label, description, icon }, actualModelContext);
    }, [label, description, icon, actualModelContext]);
    
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