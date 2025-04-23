import { useDynamicModals, useHttpClient } from "@/providers";
import { useFormDesignerStateSelector } from "@/providers/formDesigner";
import { useFormPersister } from "@/providers/formPersisterProvider";
import { downloadAsJson } from "@/utils/configurationFramework/actions";
import { MenuOutlined } from "@ant-design/icons";
import { App, Button, Dropdown, MenuProps } from "antd";
import React from "react";
import { FC } from "react";

type MenuItem = MenuProps['items'][number];

export interface ICustomActionsProps {

}

export const CustomActions: FC<ICustomActionsProps> = () => {
    const httpClient = useHttpClient();
    const { formProps, loadForm } = useFormPersister();
    const { open: openModal } = useDynamicModals();
    const { message } = App.useApp();
    const readOnly = useFormDesignerStateSelector(x => x.readOnly);

    const items: MenuItem[] = [
        {
            key: 'exportJson',
            label: 'Get JSON',
            onClick: () => { 
                downloadAsJson({ httpClient, id: formProps.id });
            },
        },
        {
            key: 'importJson',
            label: 'Import JSON',
            disabled: readOnly,
            onClick: () => {
                openModal({
                    title: 'Import JSON',
                    formId: { module: 'Shesha', name: 'form-import-json' },
                    mode: 'edit',
                    formArguments: {
                        itemId: formProps.id,
                    },
                    id: `import-form-${formProps.id}`,
                    isVisible: true,
                    width: '60%',
                    onSubmitted: () => {
                        message.success('Form imported successfully');
                        loadForm({ skipCache: true });
                    }
                });
            }
        },
    ];
    return (
        <Dropdown menu={{ items }} placement="bottomRight" arrow>
            <Button icon={<MenuOutlined />}></Button>
        </Dropdown>
    );
};