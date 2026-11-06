import { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

/** Attribute on a designer component's wrapper holding the component type, used to name it while it is dragged. */
export const COMPONENT_TYPE_ATTR = 'data-sha-component-type';

/** Offset of the cursor from the chip's top-left corner. */
const CURSOR_OFFSET = { x: 14, y: 14 };
/** Room around the chip so its shadow is part of the drag image. */
const HOST_PADDING = 8;

const CHIP_STYLE: Partial<CSSStyleDeclaration> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  background: '#fff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  color: 'rgba(0, 0, 0, 0.88)',
  fontSize: '13px',
  fontWeight: '500',
  lineHeight: '20px',
  whiteSpace: 'nowrap',
};

/**
 * Shows `chip` as the drag image instead of the browser's snapshot of the dragged element. The browser captures the
 * image during `dragstart`, so the chip only has to exist for that moment.
 */
const showChip = (dataTransfer: DataTransfer | null, fill: (chip: HTMLDivElement) => (() => void) | void): void => {
  if (!dataTransfer || typeof dataTransfer.setDragImage !== 'function') return;

  const host = document.createElement('div');
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '-10000px',
    padding: `${HOST_PADDING}px`,
    pointerEvents: 'none',
    fontFamily: 'inherit',
  });
  const chip = document.createElement('div');
  Object.assign(chip.style, CHIP_STYLE);
  host.appendChild(chip);
  document.body.appendChild(host);

  const cleanup = fill(chip);
  dataTransfer.setDragImage(host, CURSOR_OFFSET.x + HOST_PADDING, CURSOR_OFFSET.y + HOST_PADDING);

  setTimeout(() => {
    cleanup?.();
    host.remove();
  }, 0);
};

/** Drag image for a component already on the canvas: its toolbox icon and name. */
export const setComponentDragImage = (dataTransfer: DataTransfer | null, icon: ReactNode, name: string): void => {
  showChip(dataTransfer, (chip) => {
    const root = createRoot(chip);
    flushSync(() => {
      root.render(<>{icon}<span>{name}</span></>);
    });
    return () => root.unmount();
  });
};

/** Drag image for a toolbox or data source item: a copy of the item's own icon and title. */
export const setItemDragImage = (dataTransfer: DataTransfer | null, item: HTMLElement): void => {
  showChip(dataTransfer, (chip) => {
    // toolbox items wrap their icon and title in a single element, data source items hold them directly
    const content = item.childElementCount === 1 && item.firstElementChild ? item.firstElementChild : item;
    Array.from(content.childNodes).forEach((node) => chip.appendChild(node.cloneNode(true)));
    // the toolbox info icon only makes sense next to the toolbox item
    chip.querySelectorAll('.anticon-info-circle').forEach((icon) => icon.remove());
  });
};
