import { ReactNode } from "react";

export type SidebarPanelPosition = 'left' | 'right';

export interface ISidebarProps {
  /**
   * Whether it's open or not
   */
  open?: boolean | undefined;
  /**
   * Whether it's open or not by default. Is used for non-controlled mode
   */
  defaultOpen?: boolean | undefined;

  width?: number | undefined;

  /**
   * The title
   */
  title?: ReactNode | (() => ReactNode) | undefined;

  /**
   * The content
   */
  content?: ReactNode | (() => ReactNode) | undefined;

  /**
   * What should happen when the sidebar opens
   */
  onOpen?: () => void | undefined;

  /**
   * What should happen when the sidebar closes
   */
  onClose?: () => void | undefined;

  placeholder?: string | undefined;

  className?: string | undefined;

  /**
   * Whether there should no be padding
   */
  noPadding?: boolean | undefined;
}
