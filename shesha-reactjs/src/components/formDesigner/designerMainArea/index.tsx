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

const rightSidebarProps = {
  title: () => <ComponentPropertiesTitle />,
  content: () => <ComponentPropertiesPanel />,
  placeholder: 'Properties',
};

export const DesignerMainArea: FC = () => {
  const isDebug = useFormDesignerStateSelector((state) => state.isDebug);
  const readOnly = useFormDesignerStateSelector((state) => state.readOnly);
  const formSettings = useFormDesignerStateSelector((state) => state.formSettings);
  const formMode = useFormDesignerStateSelector((state) => state.formMode);
  const shaForm = useShaFormInstance();
  const { antdForm: form } = shaForm;
  const { styles } = useStyles();

  useEffect(() => {
    if (shaForm) {
      shaForm.applyMarkupAsync({
        formFlatMarkup: shaForm.flatStructure,
        formSettings: formSettings,
      });
    }
  }, [formSettings, shaForm]);

  const leftSidebarProps = useMemo(() =>
    readOnly ? null : { title: 'Builder Components', content: () => <Toolbox />, placeholder: 'Builder Components' },
  [readOnly]);

  return (
    <div
      className={styles.mainArea}
      style={{
        borderTop: '1px solid #d3d3d3',
        ...(formMode !== 'designer' && {
          maxHeight: '85vh',
          overflow: 'auto',
        }),
      }}
    >
      <ConditionalWrap
        condition={formMode === 'designer'}
        wrap={(children) => (
          <SidebarContainer
            leftSidebarProps={leftSidebarProps}
            rightSidebarProps={rightSidebarProps}
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
          <ParentProvider model={null} formMode="designer">
            {/* pageContext has added only to customize the designed form. It is not used as a data context.*/}
            <DataContextProvider id="pageContext" name="pageContext" type="page" webStorageType="sessionStorage">
              <DataContextProvider
                id="designerFormContext"
                name={SheshaCommonContexts.FormContext}
                type="form"
                webStorageType="sessionStorage"
                description="Form designer"
              >
                <ConfigurableFormRenderer form={form} className={formMode === 'designer' ? styles.designerWorkArea : undefined}>
                  {isDebug && (
                    <DebugPanel />
                  )}
                </ConfigurableFormRenderer>

              </DataContextProvider>
            </DataContextProvider>
          </ParentProvider>
        </ConditionalWrap>

      </ConditionalWrap>
    </div>
  );
};
