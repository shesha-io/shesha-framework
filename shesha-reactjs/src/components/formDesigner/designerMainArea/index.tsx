import ComponentPropertiesPanel from '../componentPropertiesPanel';
import ComponentPropertiesTitle from '../componentPropertiesTitle';
import ParentProvider from '@/providers/parentProvider';
import React, { FC } from 'react';
import Toolbox from '../toolbox';
import { ConfigurableFormRenderer, SidebarContainer } from '@/components';
import { DebugPanel } from '../debugPanel';
import { useForm } from '@/providers';
import { useFormDesigner } from '@/providers/formDesigner';
import { useStyles } from '../styles/styles';

export interface IDesignerMainAreaProps {

}

export const DesignerMainArea: FC<IDesignerMainAreaProps> = () => {
    const { isDebug, readOnly } = useFormDesigner();
    const { form, formMode } = useForm();
    const { styles } = useStyles();

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
            <ParentProvider model={{}} formMode='designer'>
                <ConfigurableFormRenderer form={form} skipFetchData={true} className={formMode === 'designer' ? styles.designerWorkArea : undefined}>
                    {isDebug && (
                        <DebugPanel formData={form.getFieldsValue()} />
                    )}
                </ConfigurableFormRenderer>
            </ParentProvider>
        </SidebarContainer>
    );
};
