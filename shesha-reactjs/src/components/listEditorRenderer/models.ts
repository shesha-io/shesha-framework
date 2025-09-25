import { ReactNode } from "react";

export interface ISidebarProps {
  width?: number;

  /**
   * The title
   */
  title: ReactNode;

  /**
   * The content
   */
  content: ReactNode | (() => ReactNode);

  className?: string;
}
