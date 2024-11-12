import { useFormPersister } from '@/providers/formPersisterProvider';
import { ConfigurationItemVersionStatus } from '@/utils/configurationFramework/models';
import { BranchesOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, App } from 'antd';
import React, { FC } from 'react';
import {
    createNewVersionRequest,
    showErrorDetails,
} from '@/utils/configurationFramework/actions';
import { useSheshaApplication } from '@/providers/index';
import { FormConfigurationDto } from '@/providers/form/api';

export interface ICreateNewVersionButtonProps {
    onSuccess: (formDto: FormConfigurationDto) => void;
}

export const CreateNewVersionButton: FC<ICreateNewVersionButtonProps> = ({ onSuccess }) => {
    const { formProps } = useFormPersister();
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const { message, notification, modal } = App.useApp();

    const onCreateNewVersionClick = () => {
        const onOk = () => {
            message.loading('Creating new version..', 0);
            return createNewVersionRequest({
                backendUrl: backendUrl,
                httpHeaders: httpHeaders,
                id: formProps.id,
                message,
                notification,
                modal,
            })
                .then((response) => {
                    message.destroy();

                    if (onSuccess)
                        onSuccess(response.data.result);
                })
                .catch((e) => {
                    message.destroy();
                    showErrorDetails(message, notification, e);
                });
        };
        modal.confirm({
            title: 'Create New Version',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure you want to create new version of the form?',
            okText: 'Yes',
            cancelText: 'No',
            onOk,
        });
    };

    const canCreate = formProps.isLastVersion && (
        formProps.versionStatus === ConfigurationItemVersionStatus.Live ||
        formProps.versionStatus === ConfigurationItemVersionStatus.Cancelled
    );
    return canCreate
        ? (
            <Button onClick={onCreateNewVersionClick} type="link">
                <BranchesOutlined /> Create New Version
            </Button>
        )
        : null;
};