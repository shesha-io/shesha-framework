import { IConfigurableFormComponent, IInputStyles, ValueOrCodeEvaluator } from '@/providers/form/models';
import { IDropdownProps, ILabelValue, TagVariant } from '@/components/dropdown/model';
import { ComponentDefinition } from '@/interfaces';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { IStatusMappings } from '@/components/statusTag';

/** Supplied by the Factory, not configured on the form. */
type StatusTagRuntimeProps = 'className' | 'popupClassName' | 'events' | 'selectRef' | 'styleValue';

/**
 * Dropped from the model, not just the settings form, so they cannot be set by a migration or a
 * hand-edited form and then silently ignored. The tag has no edit state, always renders as a tag,
 * and has a single style set.
 */
type RemovedDropdownProps =
  'placeholder' | 'allowClear' | 'onChange' | 'bindingFormat' | 'valueFormat' |
  'incomeCustomJs' | 'outcomeCustomJs' | 'displayStyle' | 'tag' | 'tagStyle';

export interface IStatusTagComponentProps
  extends Omit<IDropdownProps, 'style' | 'readOnly' | 'value' | 'values' | RemovedDropdownProps | StatusTagRuntimeProps>,
  IConfigurableFormComponent,
  IInputStyles {
  /** Legacy Value Source = "manual". No settings input; kept so migrated forms still render. */
  value?: number | string | undefined;

  /** Ships as a JS setting, so the stored value is either the rows or the unevaluated setting. */
  values?: ValueOrCodeEvaluator<ILabelValue<number | string>[]> | undefined;
}

/** The pre-refactor shape, for the migrator steps that read it. */
export interface IStatusTagComponentPropsV0 extends IConfigurableFormComponent, IInputStyles {
  mappings?: string | undefined;
  valueSource?: 'form' | 'manual' | undefined;
  override?: string | undefined;
  value?: number | string | undefined;
  color?: string | undefined;
  /** New-model properties the mappings migration reads before writing. */
  referenceListId?: IReferenceListIdentifier | undefined;
  showItemName?: boolean | undefined;
  showIcon?: boolean | undefined;
  tagVariant?: TagVariant | undefined;
}

/** The parsed form of the legacy `mappings` JSON, used when converting it to `values`. */
export type LegacyStatusMappings = IStatusMappings;

export type StatusTagComponentDefinition = ComponentDefinition<'statusTag', IStatusTagComponentProps>;
