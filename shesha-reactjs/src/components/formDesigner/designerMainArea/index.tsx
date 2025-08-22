import { ConfigurableFormRenderer, SidebarContainer } from '@/components';
import ConditionalWrap from '@/components/conditionalWrapper';
import { DataContextProvider, MetadataProvider, useCanvas, useShaFormInstance } from '@/providers';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import ParentProvider from '@/providers/parentProvider';
import React, { FC, useMemo } from 'react';
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import { ComponentPropertiesTitle } from '../componentPropertiesTitle';
import { DebugPanel } from '../debugPanel';
import { useStyles } from '../styles/styles';
import Toolbox from '../toolbox';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';
import { Button, Space, Tooltip } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';

export interface IDesignerMainAreaProps {
}

const rightSidebarProps = {
  title: () => <ComponentPropertiesTitle />,
  content: () => <ComponentPropertiesPanel />,
  placeholder: 'Properties',
};

export const DesignerMainArea: FC<IDesignerMainAreaProps> = () => {
    const isDebug = useFormDesignerStateSelector(state => state.isDebug);
    const readOnly = useFormDesignerStateSelector(state => state.readOnly);
    const formSettings = useFormDesignerStateSelector(state => state.formSettings);
    const formMode = useFormDesignerStateSelector(state => state.formMode);
    const { antdForm: form } = useShaFormInstance();
    const { zoom, setCanvasZoom } = useCanvas();
    const { styles } = useStyles();

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
                    >
                        {children}
                    </SidebarContainer>
                )}
            >
                <div style={{ width: 'calc(100vw - 55px - 16px)', background: 'teal', zoom: `${zoom}%`, overflow: 'auto', margin: '0 auto' }}>
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
                    <div>
                    <Space style={{position: 'fixed', bottom: 50}}>
                        <Tooltip title={`${zoom}%`}><Button icon={<MinusOutlined/>} title='Zoom out' onClick={()=> setCanvasZoom(zoom - 5)}/></Tooltip>
                        <Tooltip title={`${zoom}%`}><Button icon={<PlusOutlined/>} title='Zoom in' onClick={()=> setCanvasZoom(zoom + 5)}/></Tooltip>
                    </Space>
                    </div>
                </div>
            </ConditionalWrap>
        </div>
    );
};