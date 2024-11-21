import { ComponentPropertiesTitle } from '../componentPropertiesTitle';
import ParentProvider from '@/providers/parentProvider';
import React, { FC } from 'react';
import Toolbox from '../toolbox';
import { ConfigurableFormRenderer, SidebarContainer } from '@/components';
import { DebugPanel } from '../debugPanel';
import { MetadataProvider, useCanvas, useForm } from '@/providers';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useStyles } from '../styles/styles';
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import ConditionalWrap from '@/components/conditionalWrapper';

export interface IDesignerMainAreaProps {

}

export const DesignerMainArea: FC<IDesignerMainAreaProps> = () => {
    const { isDebug, readOnly } = useFormDesignerState();
    const { form, formMode, formSettings } = useForm();
    const { designerWidth, zoom } = useCanvas();
    const { styles } = useStyles();

    return (
        <div className={styles.mainArea} style={{
            borderTop: '1px solid #d3d3d3',
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
                        <div className={styles.mainArea}>
                            {children}
                        </div>
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
