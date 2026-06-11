import { ReactNode } from "react";

export interface ISidebarProps {
  width?: number | undefined;

  /**
   * The title
   */
  title?: ReactNode | undefined;

  /**
   * The content
   */
  content?: ReactNode | (() => ReactNode) | undefined;

  className?: string | undefined;
}
