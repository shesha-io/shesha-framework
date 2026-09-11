import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IFontValue } from '@/designer-components/_settings/utils';
import { ICommonContainerProps } from '../container/interfaces';

export interface ICustomLayoutComponentProps extends IConfigurableFormComponent, Omit<ICommonContainerProps, 'style'> {
  className?: string | undefined;
  wrapperStyle?: string | undefined;
  /** Typography of the section heading. Separate from `font` so it is not inherited by children. */
  headingFont?: IFontValue | undefined;
  components: IConfigurableFormComponent[]; // Only important for fluent API
}

export type CustomLayoutComponentDefinition = ComponentDefinition<"customLayout", ICustomLayoutComponentProps> & {
  /** Static empty array to prevent unnecessary re-renders when isDynamic is false */
  emptyComponents?: [];
};
