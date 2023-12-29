import ComponentPropertiesPanel from '../componentPropertiesPanel';
import ComponentPropertiesTitle from '../componentPropertiesTitle';
import React, { FC } from 'react';
import Toolbox from '../toolbox';
import { ConfigurableFormRenderer, SidebarContainer } from '@/components';
import { DebugPanel } from '../debugPanel/index';
import { useForm } from '@/providers';
import { useFormDesigner } from '@/providers/formDesigner';

export interface IDesignerMainAreaProps {

}

export const DesignerMainArea: FC<IDesignerMainAreaProps> = () => {
    const { isDebug, readOnly } = useFormDesigner();
    const formInstance = useForm();
    const { form } = formInstance;

    return (
        <SidebarContainer
            leftSidebarProps={
                readOnly
                    ? null
                    : {
                        title: 'Builder Widgets',
                        content: () => <Toolbox />,
                        placeholder: 'Builder Widgets',
                    }
            }
            rightSidebarProps={{
                title: () => <ComponentPropertiesTitle />,
                content: () => <ComponentPropertiesPanel />,
                placeholder: 'Properties',
            }}
        >
            <ConfigurableFormRenderer form={form} skipFetchData={true}>
                {isDebug && (
                    <DebugPanel formData={form.getFieldsValue()} />
                )}
            </ConfigurableFormRenderer>
        </SidebarContainer>
    );
};
