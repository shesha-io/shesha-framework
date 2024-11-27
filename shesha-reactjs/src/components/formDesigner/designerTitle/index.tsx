import HelpTextPopover from '@/components/helpTextPopover';
import React, { FC } from 'react';
import StatusTag from '@/components/statusTag';
import { CONFIGURATION_ITEM_STATUS_MAPPING } from '@/utils/configurationFramework/models';
import { getFormFullName } from '@/utils/form';
import { Space } from 'antd';
import { useFormPersister } from '@/providers/formPersisterProvider';


export interface IDesignerTitleProps {
}

export const DesignerTitle: FC<IDesignerTitleProps> = ({ }) => {
    const { formProps } = useFormPersister();
    const fullName = formProps ? getFormFullName(formProps.module, formProps.name) : null;
    const title = formProps?.label ? `${formProps.label} (${fullName})` : fullName;

    return (
        <Space>
            {title && (
                <p style={{ margin: 'unset' }}>
                    {title} v{formProps.versionNo}
                </p>
            )}
            <HelpTextPopover content={formProps.description}></HelpTextPopover>
            <StatusTag value={formProps.versionStatus} mappings={CONFIGURATION_ITEM_STATUS_MAPPING} color={null}></StatusTag>
        </Space>
    );
};