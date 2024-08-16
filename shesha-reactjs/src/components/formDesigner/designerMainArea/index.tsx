import { ComponentPropertiesTitle } from '../componentPropertiesTitle';
import ParentProvider from '@/providers/parentProvider';
import React, { FC, useMemo } from 'react';
import Toolbox from '../toolbox';
import { ConfigurableFormRenderer, SidebarContainer } from '@/components';
import { DebugPanel } from '../debugPanel';
import { MetadataProvider, useCanvasConfig, useForm } from '@/providers';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useStyles } from '../styles/styles';
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import ConditionalWrap from '@/components/conditionalWrapper';

export interface IDesignerMainAreaProps {

}

export const DesignerMainArea: FC<IDesignerMainAreaProps> = () => {
    const { isDebug, readOnly } = useFormDesignerState();
    const { form, formMode, formSettings } = useForm();
    const { width, zoom, activeDevice } = useCanvasConfig();
    const { styles } = useStyles();

    const magnifiedWidth = useMemo(() => width * (zoom / 100), [width, zoom]);

    const customWidth = useMemo(() => {
        if (activeDevice === 'mobile' || activeDevice === 'custom') {
            return `${width}px`;
        }
        return `${magnifiedWidth}%`;
    }, [activeDevice, magnifiedWidth]);

    return (
        <div className={styles.mainArea}>
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
                <div style={{ width: customWidth, zoom: `${zoom}%`, overflow: 'auto', margin: '0 auto' }}>
                    <ConditionalWrap
                        condition={Boolean(formSettings?.modelType)}
                        wrap={(children) => (<MetadataProvider modelType={formSettings?.modelType}>{children}</MetadataProvider>)}
                    >
                        <ParentProvider model={{}} formMode='designer'>
                            <ConfigurableFormRenderer form={form} className={formMode === 'designer' ? styles.designerWorkArea : undefined}  >
                                {isDebug && (
                                    <DebugPanel formData={form.getFieldsValue()} />
                                )}
                            </ConfigurableFormRenderer>
                        </ParentProvider>
                    </ConditionalWrap>

                </div>
            </SidebarContainer>
        </div>
    );
};
