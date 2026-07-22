import { IButtonComponentProps } from '@/designer-components/button/interfaces';

/**
 * Props interface for Advanced Filter Button components.
 * Extends IButtonComponentProps but overrides buttonType to include custom 'ghost' type.
 */
export interface IAdvancedFilterButtonComponentProps extends Omit<IButtonComponentProps, 'buttonType'> {
  buttonType: 'primary' | 'default' | 'dashed' | 'text' | 'ghost' | 'link';
}
