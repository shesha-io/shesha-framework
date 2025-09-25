import { ReactNode } from "react";

export type SidebarPanelPosition = 'left' | 'right';

export interface ISidebarProps {
  /**
   * Whether it's open or not
   */
  open?: boolean;
  /**
   * Whether it's open or not by default. Is used for non-controlled mode
   */
  defaultOpen?: boolean;

  width?: number;

  /**
   * The title
   */
  title: ReactNode | (() => ReactNode);

  /**
   * The content
   */
  content: ReactNode | (() => ReactNode);

  /**
   * What should happen when the sidebar opens
   */
  onOpen?: () => void;

  /**
   * What should happen when the sidebar closes
   */
  onClose?: () => void;

  placeholder?: string;

  className?: string;

  /**
   * Whether there should no be padding
   */
  noPadding?: boolean;
}
