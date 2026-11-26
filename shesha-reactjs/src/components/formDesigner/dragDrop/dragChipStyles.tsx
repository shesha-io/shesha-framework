import { createGlobalStyle } from '@/styles';
import { DRAG_CHIP_INVALID_ATTR, DRAG_CHIP_WARNING_ATTR, dragChipClassNames } from './models';

const { host, chip, content, error } = dragChipClassNames;

/**
 * Theme styles of the drag chip. The chip is added to the end of the page while dragging, outside the designer's own
 * styles, so its styles are global. Rendered once by the designer's main area.
 */
export const DragChipGlobalStyles = createGlobalStyle`
  .${host} {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10001;
    pointer-events: none;
    will-change: transform;
  }
  .${chip} {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 4px 10px;
    border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
    border-radius: ${({ theme }) => theme.borderRadius}px;
    background: ${({ theme }) => theme.colorBgElevated};
    box-shadow: ${({ theme }) => theme.boxShadowSecondary};
    color: ${({ theme }) => theme.colorText};
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: ${({ theme }) => theme.fontSize}px;
    font-weight: 500;
    line-height: 20px;
    white-space: nowrap;
  }
  .${chip}[${DRAG_CHIP_INVALID_ATTR}] {
    border-color: ${({ theme }) => theme.colorError};
  }
  .${chip}[${DRAG_CHIP_WARNING_ATTR}] {
    border-color: ${({ theme }) => theme.colorWarning};
  }
  .${content} {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .${error} {
    max-width: 280px;
    color: ${({ theme }) => theme.colorError};
    font-size: ${({ theme }) => theme.fontSizeSM}px;
    font-weight: 400;
    line-height: 18px;
    /* one message per line */
    white-space: pre-line;
  }
  .${chip}[${DRAG_CHIP_WARNING_ATTR}] .${error} {
    color: ${({ theme }) => theme.colorWarningText};
  }
`;
