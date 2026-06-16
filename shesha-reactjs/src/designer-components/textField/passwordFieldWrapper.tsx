import React, { FC, PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'antd';

interface TooltipState {
  open: boolean;
  title: string;
}

interface Props {
  className?: string;
}

export const PasswordFieldWrapper: FC<PropsWithChildren<Props>> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipState, setTooltipState] = useState<TooltipState>({ open: false, title: '' });

  useEffect((): (() => void) => {
    const container = containerRef.current;
    if (!container) return (): void => undefined;

    let resizeObserver: ResizeObserver | null = null;

    const attachResizeObserver = (): void => {
      if (resizeObserver) return;
      const input = container.querySelector<HTMLElement>('.ant-input-affix-wrapper');
      if (!input) return;

      resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]): void => {
        for (const entry of entries) {
          const width = entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width;
          container.style.setProperty('--sha-password-input-width', `${width}px`);
        }
      });
      resizeObserver.observe(input);
      container.style.setProperty('--sha-password-input-width', `${input.getBoundingClientRect().width}px`);
    };

    const mutationObserver = new MutationObserver(attachResizeObserver);
    mutationObserver.observe(container, { childList: true, subtree: true });
    attachResizeObserver();

    return (): void => {
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, []);

  const showTooltip = useCallback((title: string): void => {
    setTooltipState((prev) => (prev.open && prev.title === title ? prev : { open: true, title }));
  }, []);

  const hideTooltip = useCallback((): void => {
    setTooltipState((prev) => (prev.open ? { ...prev, open: false } : prev));
  }, []);

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!(e.target instanceof HTMLElement)) {
      hideTooltip();
      return;
    }
    const errorEl = e.target.closest<HTMLElement>('.ant-form-item-explain-error');
    if (errorEl && errorEl.scrollWidth > errorEl.clientWidth) {
      showTooltip(errorEl.textContent);
    } else {
      hideTooltip();
    }
  };

  return (
    <Tooltip
      title={tooltipState.title}
      open={tooltipState.open}
      placement="bottom"
      destroyOnHidden
    >
      <div
        ref={containerRef}
        className={className}
        onMouseOver={handleMouseOver}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
    </Tooltip>
  );
};
