import { ConfigurableFormRenderer } from '@/components/configurableForm/configurableFormRenderer';
import { ConditionalMetadataProvider, useShaFormInstance } from '@/providers';
import { useFormDesigner, useFormDesignerFormMode, useFormDesignerReadOnly, useFormDesignerSettings, useFormDesignerSettingsPanelElement } from '@/providers/formDesigner';
import { FC, useCallback, useEffect } from 'react';
import { useStyles } from '../styles/styles';

export const DesignerCanvas: FC = () => {
  const { styles } = useStyles();
  const { antdForm } = useShaFormInstance();
  const formSettings = useFormDesignerSettings();
  const formMode = useFormDesignerFormMode();
  const readOnly = useFormDesignerReadOnly();
  const { deleteSelectedComponent } = useFormDesigner();
  const settingsPanelElement = useFormDesignerSettingsPanelElement();


  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (readOnly || formMode !== 'designer' || event.repeat) return;

    const isDelete = event.key === 'Delete';
    const isBackspace = event.key === 'Backspace';
    if (!isDelete && !isBackspace) return;

    // Ignore if user is typing in an input, textarea, or contenteditable element
    const target = event.target as HTMLElement;
    const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    if (isEditing) return;

    // Ignore if focus is inside the properties/settings panel
    if (settingsPanelElement && settingsPanelElement.contains(target))
      return;

    if (deleteSelectedComponent()) event.preventDefault();
  }, [readOnly, formMode, settingsPanelElement, deleteSelectedComponent]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <ConditionalMetadataProvider modelType={formSettings.modelType}>
      <ConfigurableFormRenderer form={antdForm} className={formMode === 'designer' ? styles.designerWorkArea : undefined}>
      </ConfigurableFormRenderer>
    </ConditionalMetadataProvider>
  );
};
