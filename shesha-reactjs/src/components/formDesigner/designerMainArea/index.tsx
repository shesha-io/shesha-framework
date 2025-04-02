import { ConfigurableFormRenderer, SidebarContainer } from '@/components';
import ConditionalWrap from '@/components/conditionalWrapper';
import { DataContextProvider, MetadataProvider, useCanvas, useForm } from '@/providers';
import { useFormDesignerActions, useFormDesignerState } from '@/providers/formDesigner';
import ParentProvider from '@/providers/parentProvider';
import React, { FC, useEffect } from 'react';
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import { ComponentPropertiesTitle } from '../componentPropertiesTitle';
import { DebugPanel } from '../debugPanel';
import { useStyles } from '../styles/styles';
import Toolbox from '../toolbox';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';

export interface IDesignerMainAreaProps {

}

export const DesignerMainArea: FC<IDesignerMainAreaProps> = () => {
    const { isDebug, readOnly } = useFormDesignerState();
    const { setSelectedComponent } = useFormDesignerActions();
    const { form, formMode, formSettings } = useForm();
    const { designerWidth, zoom } = useCanvas();
    const { styles } = useStyles();

    useEffect(() => {
        if (formMode !== 'designer') {
            setSelectedComponent(null);
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
                        <ParentProvider model={null} formMode='designer'>
                            <DataContextProvider id={SheshaCommonContexts.FormContext} name={SheshaCommonContexts.FormContext} type={'form'} 
                                description='Form designer'
                            >
                                <ConfigurableFormRenderer form={form} className={formMode === 'designer' ? styles.designerWorkArea : undefined}  >
                                    {isDebug && (
                                        <DebugPanel formData={form.getFieldValue([])} />
                                    )}
                                </ConfigurableFormRenderer>
                            </DataContextProvider>
                        </ParentProvider>
                    </ConditionalWrap>

                </div>
            </ConditionalWrap>
        </div>
    );
};
