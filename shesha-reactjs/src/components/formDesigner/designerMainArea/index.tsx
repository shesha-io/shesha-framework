import ConditionalWrap from '@/components/conditionalWrapper';
import { MetadataProvider, useShaFormInstance } from '@/providers';
import { useFormDesigner, useFormDesignerFormMode, useFormDesignerIsDebug, useFormDesignerMarkup, useFormDesignerReadOnly, useFormDesignerSelectedComponent, useFormDesignerSettings } from '@/providers/formDesigner';
import React, { FC, useMemo, useEffect, useCallback } from 'react';
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import { ComponentPropertiesTitle } from '../componentPropertiesTitle';
import { DebugPanel } from '../debugPanel';
import { useStyles } from '../styles/styles';
import Toolbox from '../toolbox';
import { IViewType } from '@/providers/canvas/contexts';
import { SidebarContainer } from '@/components/sidebarContainer';
import { ConfigurableFormRenderer } from '@/components/configurableForm/configurableFormRenderer';

const rightSidebarProps = {
  title: () => <ComponentPropertiesTitle />,
  content: () => <ComponentPropertiesPanel />,
  placeholder: 'Properties',
};

export const DesignerMainArea: FC<{ viewType?: IViewType }> = ({ viewType = 'configStudio' }) => {
  const isDebug = useFormDesignerIsDebug();
  const readOnly = useFormDesignerReadOnly();
  const formSettings = useFormDesignerSettings();
  const formMode = useFormDesignerFormMode();
  const shaForm = useShaFormInstance();
  const { antdForm: form } = shaForm;
  const { styles } = useStyles();
  const { deleteComponent, settingsPanelElement } = useFormDesigner();
  const component = useFormDesignerSelectedComponent();

  const showMarkup = false;
  const markup = useFormDesignerMarkup();

  const selectedComponentId = component?.id;

  useEffect(() => {
    if (shaForm) {
      shaForm.applyMarkupAsync({
        formFlatMarkup: shaForm.flatStructure,
        formSettings: formSettings,
      });
    }
  }, [formSettings, shaForm]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (readOnly || formMode !== 'designer' || event.repeat) return;

    const isDelete = event.key === 'Delete';
    const isBackspace = event.key === 'Backspace';

    if (!isDelete && !isBackspace) return;

    // Ignore if user is typing in an input, textarea, or contenteditable element
    const target = event.target as HTMLElement;
    const isEditing =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    if (isEditing) return;

    // Ignore if focus is inside the properties/settings panel
    if (settingsPanelElement && settingsPanelElement.contains(target)) {
      return;
    }

    if (selectedComponentId) {
      event.preventDefault();
      deleteComponent({ componentId: selectedComponentId });
    }
  }, [readOnly, formMode, selectedComponentId, deleteComponent, settingsPanelElement]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
            viewType={viewType}
          >
            {children}
          </SidebarContainer>
        )}
      >
        <ConditionalWrap
          condition={Boolean(formSettings?.modelType)}
          wrap={(children) => (<MetadataProvider modelType={formSettings?.modelType}>{children}</MetadataProvider>)}
        >
          {showMarkup && <textarea readOnly value={JSON.stringify(markup, null, 2)} /> /* ToDo: AS - remove after inheritance implementation */}
          <ConfigurableFormRenderer form={form} className={formMode === 'designer' ? styles.designerWorkArea : undefined}>
            {isDebug && (
              <DebugPanel />
            )}
          </ConfigurableFormRenderer>
        </ConditionalWrap>
      </ConditionalWrap>
    </div>
  );
};
