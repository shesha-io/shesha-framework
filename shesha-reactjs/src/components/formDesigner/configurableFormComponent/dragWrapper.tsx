import { FC, PropsWithChildren, useMemo, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { ShaForm } from '@/providers/form';
import { Tooltip } from 'antd';
import { useFormDesigner, useFormDesignerSelectedComponentId, useFormDesignerIsDebug } from '@/providers/formDesigner';
import { FunctionOutlined } from '@ant-design/icons';
import { isDefined } from '@/utils';

interface IDragWrapperProps {
  componentId: string;
  readOnly?: boolean | undefined;
  className?: string | undefined;
}

/** Marks the wrapper element so nested wrappers can work out which one of them is the innermost under the cursor. */
const DRAG_WRAPPER_MARKER = 'data-sha-drag-wrapper';
/** Width of the anchor, which is what keeps the tooltip clear of the cursor it sits next to. */
const CURSOR_GAP = 14;

export const DragWrapper: FC<PropsWithChildren<IDragWrapperProps>> = (props) => {
  const selectedComponentId = useFormDesignerSelectedComponentId();
  const isDebug = useFormDesignerIsDebug();
  const { setSelectedComponent } = useFormDesigner();
  /**
   * Viewport position the tooltip is pinned to, or `null` while the component is not hovered. Pinned to the
   * cursor rather than to the component, whose right edge can be a whole canvas away for a container.
   */
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  const componentModel = ShaForm.useComponentModel(props.componentId);

  const tooltip = useMemo(() => (
    <div>
      {isDebug && (
        <div>
          <strong>Id:</strong> {componentModel.id}
        </div>
      )}
      <div>
        <strong>Type:</strong> {componentModel.type}
      </div>
      {Boolean(componentModel.propertyName) && (
        <div>
          <strong>Property name: </strong>
          {typeof (componentModel.propertyName) === 'string' ? componentModel.propertyName : ''}
          {typeof (componentModel.propertyName) === 'object' && <FunctionOutlined />}
        </div>
      )}
      {Boolean(componentModel.componentName) && (
        <div><strong>Component name: </strong>{componentModel.componentName}</div>
      )}
    </div>
  ), [componentModel.componentName, componentModel.id, componentModel.propertyName, componentModel.type, isDebug]);

  const onClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();

    if (selectedComponentId !== props.componentId)
      setSelectedComponent(
        props.componentId,
      );
  };

  // Wrappers nest (a container's wrapper contains its children's wrappers), so only the innermost one under the
  // cursor shows its tooltip. That decision is made explicitly instead of by stopping propagation: ancestors must
  // still receive these events, otherwise their tooltips never get the chance to close.
  const onMouseOver = (event: React.MouseEvent<HTMLElement>): void => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(`[${DRAG_WRAPPER_MARKER}]`) !== event.currentTarget) {
      setAnchor(null);
      return;
    }
    const shaComponent = target.closest('.sha-component-drag-handle');
    if (!isDefined(shaComponent)) return;
    const rect = shaComponent.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + 5;

    // pinned to where the cursor entered, so it doesn't hop as the cursor crosses inner elements
    setAnchor((prev) => prev ?? { x, y });
  };

  const onMouseOut = (event: React.MouseEvent<HTMLElement>): void => {
    // moves between elements inside this wrapper are not a leave - closing on those flickers the tooltip
    const nextTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
    if (nextTarget !== null && event.currentTarget.contains(nextTarget)) return;

    setAnchor(null);
  };

  return (
    <div
      {...{ [DRAG_WRAPPER_MARKER]: true }}
      className={props.className}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {props.children}

      {anchor !== null && createPortal(
        // Portalled into the body so the canvas' CSS `zoom` scales neither these viewport coordinates nor
        // the overlay (see the theme provider's getPopupContainer). `pointerEvents: none` keeps the overlay
        // out of hit-testing - otherwise reaching it counts as leaving the component and the tooltip flickers.
        <Tooltip open title={tooltip} placement="top" styles={{ root: { pointerEvents: 'none' } }}>
          <span
            data-testid="drag-wrapper-tooltip-anchor"
            style={{
              position: 'fixed',
              left: anchor.x,
              top: anchor.y,
              width: CURSOR_GAP,
              height: 1,
              pointerEvents: 'none',
            }}
          />
        </Tooltip>,
        document.body,
      )}
    </div>
  );
};

export default DragWrapper;
