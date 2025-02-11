import { ConfigurableFormRenderer, SidebarContainer } from '@/components';
import ConditionalWrap from '@/components/conditionalWrapper';
import { MetadataProvider, useCanvas, useForm } from '@/providers';
import { useFormDesignerActions, useFormDesignerState } from '@/providers/formDesigner';
import ParentProvider from '@/providers/parentProvider';
import React, { FC, useEffect, useState } from 'react';
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import { ComponentPropertiesTitle } from '../componentPropertiesTitle';
import { DebugPanel } from '../debugPanel';
import { useStyles } from '../styles/styles';
import Toolbox from '../toolbox';

export interface IDesignerMainAreaProps {

}

export const DesignerMainArea: FC<IDesignerMainAreaProps> = () => {
    const { isDebug, readOnly } = useFormDesignerState();
    const { setSelectedComponent } = useFormDesignerActions();
    const { selectedComponentId  } = useFormDesignerState();
    const { form, formMode, formSettings } = useForm();
    const { designerWidth, zoom } = useCanvas();
    const { styles } = useStyles();
    const [previousSelectedComponentId, setPreviousSelectedComponentId] = useState<string | null>(null);

    useEffect(() => {
        if (formMode !== 'designer') {
            if (selectedComponentId) setPreviousSelectedComponentId(selectedComponentId);
            setSelectedComponent(null);
        } else {
            if (previousSelectedComponentId) setSelectedComponent(previousSelectedComponentId);
        }
    }, [formMode]);

    return (
        <div className={styles.mainArea} style={{
            borderTop: '1px solid #d3d3d3',
            ...(formMode !== 'designer' && {
                maxHeight: '85vh',
                overflow: 'auto',
            })
        }}>
            <ConditionalWrap
                condition={formMode === 'designer'}
                wrap={(children) => (
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
                        {children}
                    </SidebarContainer>
                )}
            >
                <div style={{ width: designerWidth, zoom: `${zoom}%`, overflow: 'auto', margin: '0 auto' }}>
                    <ConditionalWrap
                        condition={Boolean(formSettings?.modelType)}
                        wrap={(children) => (<MetadataProvider modelType={formSettings?.modelType}>{children}</MetadataProvider>)}
                    >
                        <ParentProvider model={{}} formMode='designer'>
                            <ConfigurableFormRenderer form={form} className={formMode === 'designer' ? styles.designerWorkArea : undefined}  >
                                {isDebug && (
                                    <DebugPanel formData={form.getFieldValue([])} />
                                )}
                            </ConfigurableFormRenderer>
                        </ParentProvider>
                    </ConditionalWrap>

                </div>
            </ConditionalWrap>
        </div>
    );
};
