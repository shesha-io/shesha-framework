'use client';

import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ReactElement } from 'react-markdown/lib/react-markdown';

/**
 * Custom hook that creates a portal component for a given container
 * @param container - The DOM element to portal into (defaults to document.body)
 * @returns A Portal component that renders children into the specified container
 */
export function usePortal(container: HTMLElement | null): FC<PropsWithChildren> {
  const [targetContainer, setTargetContainer] = useState<HTMLElement>(container || document.body);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Update if container prop changes
    setTargetContainer(container || document.body);
  }, [container]);

  /**
   * Portal component that renders children into the target container
   */
  const Portal: FC<PropsWithChildren> = ({ children }): ReactElement => {
    if (!portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.setAttribute('data-portal', 'true');
    }

    useEffect(() => {
      if (!portalRef.current) return undefined;

      const containerToUse = targetContainer;
      containerToUse.appendChild(portalRef.current);

      return () => {
        if (portalRef.current) {
          containerToUse.removeChild(portalRef.current);
        }
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetContainer]);

    return createPortal(children, portalRef.current);
  };

  return Portal;
}
