import React, { FC, PropsWithChildren, useEffect, useRef } from 'react';

interface Props {
  className?: string;
}

export const PasswordFieldWrapper: FC<PropsWithChildren<Props>> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeObserver: ResizeObserver | null = null;

    const attachResizeObserver = (): void => {
      if (resizeObserver) return;
      const input = container.querySelector<HTMLElement>('.ant-input-affix-wrapper');
      if (!input) return;

      resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]): void => {
        for (const entry of entries) {
          const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
          container.style.setProperty('--sha-password-input-width', `${width}px`);
        }
      });
      resizeObserver.observe(input);

      container.style.setProperty('--sha-password-input-width', `${input.getBoundingClientRect().width}px`);
    };

    const mutationObserver = new MutationObserver(attachResizeObserver);
    mutationObserver.observe(container, { childList: true, subtree: true });
    attachResizeObserver();

    return () => {
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
