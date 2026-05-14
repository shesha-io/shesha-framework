import { ReactNode } from 'react';

export interface IToolbarItem {
  id?: string;
  className?: string;
  title: ReactNode;
  icon?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  hide?: boolean;
  disabled?: boolean;
  render?: () => ReactNode;
  tooltip?: string;
}
