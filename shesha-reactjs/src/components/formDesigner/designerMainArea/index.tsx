import ConditionalWrap from '@/components/conditionalWrapper';
import { ConditionalMetadataProvider, useShaFormInstance } from '@/providers';
import { useFormDesigner, useFormDesignerFormMode, useFormDesignerReadOnly, useFormDesignerSettings, useFormDesignerSettingsPanelElement } from '@/providers/formDesigner';
import { FC, useMemo, useEffect, useCallback, CSSProperties } from 'react';
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import { ComponentPropertiesTitle } from '../componentPropertiesTitle';
import { useStyles } from '../styles/styles';
import Toolbox from '../toolbox';
import { IViewType } from '@/providers/canvas/contexts';
import { SidebarContainer } from '@/components/sidebarContainer';
import { ConfigurableFormRenderer } from '@/components/configurableForm/configurableFormRenderer';
import { CANVAS_VH_VAR } from '@/providers/canvas/options';

const PREVIEW_BORDER_WIDTH = '1px';

/**
 * Height the preview pane stands in for. Preview shows the form as it would sit on a real page,
 * under the app's own chrome (navbar and the like), so it gets the viewport less an allowance for
 * that rather than the whole window.
 */
const PREVIEW_VIEWPORT_HEIGHT = '85vh';

/**
 * What a component sized to the full preview viewport may actually occupy. The pane is laid out
 * border-box, so its top border eats into the cap above - a `100vh` component sized to the cap
 * itself would overflow by exactly that one pixel, which is a scrollbar all the same.
 */
const PREVIEW_CONTENT_HEIGHT = `calc(${PREVIEW_VIEWPORT_HEIGHT} - ${PREVIEW_BORDER_WIDTH})`;

const rightSidebarProps = {
  title: () => <ComponentPropertiesTitle />,
  content: () => <ComponentPropertiesPanel />,
  placeholder: 'Properties',
};

export const DesignerMainArea: FC<{ viewType?: IViewType }> = ({ viewType = 'configStudio' }) => {
  const readOnly = useFormDesignerReadOnly();
  const formSettings = useFormDesignerSettings();
  const formMode = useFormDesignerFormMode();
  const { antdForm } = useShaFormInstance();
  const { styles } = useStyles();
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

  const leftSidebarProps = useMemo(() =>
    readOnly
      ? undefined
      : { title: 'Builder Components', content: () => <Toolbox />, placeholder: 'Builder Components' },
  [readOnly]);

  return (
    <div
      className={styles.mainArea}
      style={{
        borderTop: PREVIEW_BORDER_WIDTH + ' solid #d3d3d3',
        // Take the height the designer shell now has, and floor the flex minimum so the canvas
        // scrolls inside its pane rather than stretching this open. Designer mode only: preview
        // keeps sizing to its content under the cap below.
        ...(formMode === 'designer' && {
          flex: '1 1 auto',
          minHeight: 0,
        }),
        ...(formMode !== 'designer' && {
          maxHeight: PREVIEW_VIEWPORT_HEIGHT,
          overflow: 'auto',
          // Preview has no canvas of its own (SidebarContainer is only wrapped in designer mode), so
          // `100vh` would otherwise mean the whole browser window - taller than this pane by the
          // very chrome the pane is capped to allow for, and so always a scrollbar. Publishing the
          // unit here makes `100vh` mean this pane, the viewport the preview actually stands in for.
          [CANVAS_VH_VAR]: `calc(${PREVIEW_CONTENT_HEIGHT} / 100)`,
        } as CSSProperties),
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
        <ConditionalMetadataProvider modelType={formSettings.modelType}>
          <ConfigurableFormRenderer form={antdForm} className={formMode === 'designer' ? styles.designerWorkArea : undefined}>
          </ConfigurableFormRenderer>
        </ConditionalMetadataProvider>
      </ConditionalWrap>
    </div>
  );
};
