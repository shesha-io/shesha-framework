import { ConfigurableFormRenderer, SidebarContainer } from '@/components';
import ConditionalWrap from '@/components/conditionalWrapper';
import { DataContextProvider, MetadataProvider, useShaFormInstance } from '@/providers';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import ParentProvider from '@/providers/parentProvider';
import React, { FC, useMemo, useEffect } from 'react';
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import { ComponentPropertiesTitle } from '../componentPropertiesTitle';
import { DebugPanel } from '../debugPanel';
import { useStyles } from '../styles/styles';
import Toolbox from '../toolbox';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';


export interface IDesignerMainAreaProps {
    renderSource?: "modal" | "designer-page";
}

const rightSidebarProps = {
  title: () => <ComponentPropertiesTitle />,
  content: () => <ComponentPropertiesPanel />,
  placeholder: 'Properties',
};

export const DesignerMainArea: FC<IDesignerMainAreaProps> = ({ renderSource }) => {
    const isDebug = useFormDesignerStateSelector(state => state.isDebug);
    const readOnly = useFormDesignerStateSelector(state => state.readOnly);
    const formSettings = useFormDesignerStateSelector(state => state.formSettings);
    const formMode = useFormDesignerStateSelector(state => state.formMode);
    const { antdForm: form } = useShaFormInstance();
    const shaForm = useShaFormInstance();
    const { styles } = useStyles();

    useEffect(()=>{
        if(shaForm) {
            shaForm.applyMarkupAsync({
                formFlatMarkup: shaForm.flatStructure,
                formSettings: formSettings,
            });
        }
    },[formSettings, shaForm]);

    const leftSidebarProps = useMemo(() => 
      readOnly ? null : { title: 'Builder Components', content: () => <Toolbox />, placeholder: 'Builder Components' }
    , [readOnly]);

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
                        leftSidebarProps={leftSidebarProps}
                        rightSidebarProps={rightSidebarProps}
                        renderSource={renderSource}
                        canZoom={true}
                    >
                        {children}
                    </SidebarContainer>
                )}
            >
                    <ConditionalWrap
                        condition={Boolean(formSettings?.modelType)}
                        wrap={(children) => (<MetadataProvider modelType={formSettings?.modelType}>{children}</MetadataProvider>)}
                    >
                        <ParentProvider model={null} formMode='designer'>
                            <DataContextProvider id={SheshaCommonContexts.FormContext} name={SheshaCommonContexts.FormContext} type={'form'} 
                                description='Form designer'
                            >
                                <div>
                                    <ConfigurableFormRenderer form={form} className={formMode === 'designer' ? styles.designerWorkArea : undefined}  >
                                    {isDebug && (
                                        <DebugPanel />
                                    )}
                                </ConfigurableFormRenderer>
                                </div>
                                
                            </DataContextProvider>
                        </ParentProvider>
                    </ConditionalWrap>
                   
            </ConditionalWrap>
        </div>
    );
};