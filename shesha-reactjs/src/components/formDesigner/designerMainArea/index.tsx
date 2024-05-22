import ComponentPropertiesPanel from '../componentPropertiesPanel';
import ComponentPropertiesTitle from '../componentPropertiesTitle';
import ParentProvider from '@/providers/parentProvider';
import React, { FC, useMemo } from 'react';
import Toolbox from '../toolbox';
import { ConfigurableFormRenderer, SidebarContainer } from '@/components';
import { DebugPanel } from '../debugPanel';
import { useCanvasConfig, useForm } from '@/providers';
import { useFormDesigner } from '@/providers/formDesigner';
import { useStyles } from '../styles/styles';

export interface IDesignerMainAreaProps {
    configurator?: boolean;

}

export const DesignerMainArea: FC<IDesignerMainAreaProps> = ({ configurator = false }) => {
    const { isDebug, readOnly } = useFormDesigner();
    const { form, formMode } = useForm();
    const { width, zoom } = useCanvasConfig();
    const { styles } = useStyles();

    const magnifiedWidth = useMemo(() => width * (zoom / 100), [width, zoom]);

    return (
        <SidebarContainer
            leftSidebarProps={
                readOnly
                    ? null
                    : {
                        title: 'Builder Widgets',
                        content: () => <Toolbox />,
                        placeholder: 'Builder Widgets',
                        resizable: true,
                        configurator
                    }
            }
            rightSidebarProps={{
                title: () => <ComponentPropertiesTitle />,
                content: () => <ComponentPropertiesPanel />,
                placeholder: 'Properties',
                resizable: true,
                configurator
            }}
        >
            <div style={{ width: `${magnifiedWidth}%`, zoom: `${zoom}%`, overflow: 'auto', margin: '0 auto' }}>
                <ParentProvider model={{}} formMode='designer'>
                    <ConfigurableFormRenderer form={form} skipFetchData={true} className={formMode === 'designer' ? styles.designerWorkArea : undefined}  >
                        {isDebug && (
                            <DebugPanel formData={form.getFieldsValue()} />
                        )}
                    </ConfigurableFormRenderer>
                </ParentProvider>
            </div>
        </SidebarContainer>
    );
};
