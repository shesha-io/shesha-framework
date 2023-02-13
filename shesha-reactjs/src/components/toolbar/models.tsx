import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { ReactNode } from 'react';
import { IToolbarButton } from '../../providers/toolbarConfigurator/models';

export interface IToolbarButtonItem extends Omit<IToolbarButton, 'id' | 'icon'> {
  id?: string;

  className?: string;

  title: ReactNode;

  icon?: ReactNode | string;

  onClick?: (args: any) => void;

  hide?: boolean;

  disabled?: boolean;

  render?: () => ReactNode;
  /**
   * @deprecated - use tooltip instead
   */
  tooltipName?: string;

  tooltip?: string;
}

export interface IToolbarProps {
  /** The items to display as buttons */
  items: IToolbarButtonItem[];

  /** The class name */
  className?: string;

  /** The form id */
  formId?: string;

  /** The button size  */
  btnSize?: SizeType;
}
