import { useActiveDoc } from '@/configuration-studio/cs/hooks';
import { useStyles } from '@/configuration-studio/styles';
import { BranchesOutlined, CodeOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { FC } from 'react';

export interface IQuickInfoIconsProps {

}

type ConfigItemFlags = {
    isConfigExposed: boolean;
    isCodeBased: boolean;
    isCodegenPending: boolean;
    isManuallyEdited: boolean;
};

export const QuickInfoIcons: FC<IQuickInfoIconsProps> = () => {
    const { styles, theme } = useStyles();

    const activeDoc = useActiveDoc();
    if (!activeDoc)
        return undefined;

    const flags: ConfigItemFlags = {
        isConfigExposed: true,
        isCodeBased: true,
        isCodegenPending: true,
        isManuallyEdited: true,
    };
    return (
        <div className={styles.csQuickInfoIcons}>
            {flags.isConfigExposed && <Tooltip title="Configuration originally defined in a base module which has been exposed"><BranchesOutlined /></Tooltip>}
            {flags.isCodeBased && <Tooltip title="Configuration is code based or has a corresponding code based portion "><CodeOutlined /></Tooltip>}
            {flags.isCodegenPending && <Tooltip title="Corresponding code based configuration has not been updated"><ExclamationCircleOutlined style={{ color: theme.colorError }} /></Tooltip>}
            {flags.isManuallyEdited && <Tooltip title="Current version has manual changes (i.e. is not a version that was imported via package)"><EditOutlined /></Tooltip>}
        </div>
    );
};