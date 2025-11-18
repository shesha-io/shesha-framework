import { ConfigurableFormRenderer, SidebarContainer } from '@/components';
import ConditionalWrap from '@/components/conditionalWrapper';
import { DataContextProvider, MetadataProvider, useDataContextManager, useShaFormInstance } from '@/providers';
import { useFormDesignerFormMode, useFormDesignerIsDebug, useFormDesignerReadOnly, useFormDesignerSettings } from '@/providers/formDesigner';
import ParentProvider from '@/providers/parentProvider';
import React, { FC, useMemo, useEffect, useState, useCallback } from 'react';
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import { ComponentPropertiesTitle } from '../componentPropertiesTitle';
import { DebugPanel } from '../debugPanel';
import { useStyles } from '../styles/styles';
import Toolbox from '../toolbox';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';
import { IViewType } from '@/providers/canvas/contexts';
import { calculateAutoZoom, DEFAULT_OPTIONS, defaultDesignerWidth, usePinchZoom } from '@/providers/canvas/utils';
import { useCanvas, useLocalStorage, SIDEBAR_COLLAPSE } from '@/index';

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

  const noPageContext = !Boolean(useDataContextManager().getPageContext());

  // Zoom functionality
  const canZoom = true;
  const { zoom, setCanvasZoom, setViewType, designerWidth, autoZoom, configTreePanelSize } = useCanvas();
  const [isSidebarCollapsed] = useLocalStorage(SIDEBAR_COLLAPSE, false);
  const [currentSizes, setCurrentSizes] = useState([0, 0, 0]);
  const [windowSize, setWindowSize] = useState({ width: designerWidth });

  const handleZoomChange = useCallback((newZoom: number) => {
    if (!canZoom) return;
    setCanvasZoom(newZoom);
  }, [setCanvasZoom, canZoom]);

  const canvasRef = usePinchZoom(
    handleZoomChange,
    zoom,
    DEFAULT_OPTIONS.minZoom,
    DEFAULT_OPTIONS.maxZoom,
    autoZoom,
  );

  // Set the view type on mount
  useEffect(() => {
    setViewType(viewType);
  }, [viewType, setViewType]);

  // Track window resize
  useEffect(() => {
    const handleResize = (): void => {
      setWindowSize({ width: (window?.innerWidth ?? parseInt(defaultDesignerWidth, 10)) + 'px' });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-zoom calculation
  useEffect(() => {
    if (canZoom) {
      if (autoZoom) {
        const newZoom = calculateAutoZoom({
          currentZoom: zoom,
          designerWidth,
          sizes: currentSizes,
          configTreePanelSize: configTreePanelSize,
          viewType: viewType,
          isSidebarCollapsed: isSidebarCollapsed,
        });
        if (newZoom !== zoom) {
          setCanvasZoom(newZoom);
        }
      }
    }
  }, [canZoom, autoZoom, windowSize.width, designerWidth, currentSizes, configTreePanelSize, setCanvasZoom, viewType, isSidebarCollapsed, zoom]);

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
            onDragSizesChange={(sizes: number[]) => setCurrentSizes(sizes)}
          >
            <div  style={
              formMode === 'designer' && canZoom ? {
                width: autoZoom ? "100%" : designerWidth,
                zoom: `${zoom}%`,
              } : {}
            } ref={canvasRef}>
            {children}
            </div>
          </SidebarContainer>
        )}
      >
        <ConditionalWrap
          condition={Boolean(formSettings?.modelType)}
          wrap={(children) => (<MetadataProvider modelType={formSettings?.modelType}>{children}</MetadataProvider>)}
        >
          {/* Use special format of parent properties to avoid adding form context */}
          <ParentProvider model={null} formMode="designer" name="designer" isScope addContext={false}>
            {/* pageContext has added only to customize the designed form. It is not used as a data context.*/}
            {/* formContext has added only to customize the designed form. It is not used as a data context.*/}
            <ConditionalWrap
              condition={noPageContext}
              wrap={(children) => (
                <DataContextProvider
                  id="designerPageContext"
                  description="Designer Page context"
                  name={SheshaCommonContexts.PageContext}
                  type="page"
                  webStorageType="sessionStorage"
                >
                  <DataContextProvider
                    id="designerFormContext"
                    description="Designer Form context"
                    name={SheshaCommonContexts.FormContext}
                    type="form"
                    webStorageType="sessionStorage"
                  >
                    {children}
                  </DataContextProvider>
                </DataContextProvider>
              )}
            >
              <ConfigurableFormRenderer form={form} className={formMode === 'designer' ? styles.designerWorkArea : undefined}>
                {isDebug && (
                  <DebugPanel />
                )}
              </ConfigurableFormRenderer>
            </ConditionalWrap>
          </ParentProvider>
        </ConditionalWrap>

      </ConditionalWrap>
    </div>
  );
};
