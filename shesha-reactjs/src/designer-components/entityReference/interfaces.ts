import { IEntityReferenceProps } from '@/components/entityReference';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IStyleValue } from '@/providers/form/models';

export type IActionParameters = [{ key: string; value: string }];

/**
 * Entity reference component properties.
 *
 * `style` is omitted from `IEntityReferenceProps` because the designer model carries the *script*
 * for the Custom style (a string) while the underlying control takes the evaluated `CSSProperties`;
 * the evaluated value reaches the model as `styleCss` (see `IStyleValue`).
 */
export interface IEntityReferenceControlProps extends Omit<IEntityReferenceProps, 'style'>, IConfigurableFormComponent, IStyleValue {
  /** @deprecated Use iconName instead */
  icon?: string;
}

export type EntityReferenceComponentDefinition = ComponentDefinition<'entityReference', IEntityReferenceControlProps>;
