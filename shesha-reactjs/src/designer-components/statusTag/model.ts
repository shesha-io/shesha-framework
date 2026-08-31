import { IConfigurableFormComponent, IInputStyles, ValueOrCodeEvaluator } from '@/providers/form/models';
import { IDropdownProps, ILabelValue, TagVariant } from '@/components/dropdown/model';
import { ComponentDefinition } from '@/interfaces';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { IStatusMappings } from '@/components/statusTag';

/**
 * Runtime plumbing supplied by the Factory rather than configured on the form: the emotion class,
 * the handlers from `getComponentEvents`, and the style model handed to the read-only renderer.
 * They are not settings, so they stay out of the component model.
 */
type StatusTagRuntimeProps = 'className' | 'popupClassName' | 'events' | 'selectRef' | 'styleValue';

/**
 * Properties the status tag deliberately does not expose.
 *
 * The spec builds this component as a specialised drop-down: it *displays* a status rather than
 * capturing one, so the settings that only make sense for an editable field are dropped. Removing
 * them from the model — not just from the settings form — is what keeps the two in step, since a
 * property left on the model with no input is a setting that can still be set by a migration or a
 * hand-edited form and then silently ignored.
 *
 * - `placeholder`, `allowClear`, `onChange` — editing affordances; the tag has no edit state.
 * - `bindingFormat`, `valueFormat`, `incomeCustomJs`/`outcomeCustomJs` — a status tag always
 *   resolves the item value in order to find its colour, so there is nothing to choose.
 * - `displayStyle` — a status tag is always rendered as a tag; "Plain text" would make it a label.
 * - `tag`, `tagStyle` — the drop-down's *second*, nested style set for the tags inside its box. The
 *   status tag has one style set and it already describes the tag, so a nested one would be a second
 *   place to configure the same visible thing.
 */
type RemovedDropdownProps =
  'placeholder' | 'allowClear' | 'onChange' | 'bindingFormat' | 'valueFormat' |
  'incomeCustomJs' | 'outcomeCustomJs' | 'displayStyle' | 'tag' | 'tagStyle';

export interface IStatusTagComponentProps
  extends Omit<IDropdownProps, 'style' | 'readOnly' | 'value' | 'values' | RemovedDropdownProps | StatusTagRuntimeProps>,
  IConfigurableFormComponent,
  IInputStyles {
  /**
   * A fixed status shown when the bound property has no value.
   *
   * Carried over from the legacy Value Source = "manual", which pinned the tag to one status instead
   * of reading the bound property. There is no settings input for it — it exists so a migrated form
   * keeps rendering the status it was configured with rather than going blank.
   */
  value?: number | string | undefined;

  /**
   * The statuses, when the Data source is Values.
   *
   * Widened to `ValueOrCodeEvaluator` because this property ships as a JS setting (see
   * `defaultValuesSetting`): the designer stores either the rows from the inline editor or a
   * code-mode setting, and the framework evaluates the latter into the rows before the component
   * reads it. Declaring both shapes is what lets `initModel` seed the script without a cast.
   */
  values?: ValueOrCodeEvaluator<ILabelValue<number | string>[]> | undefined;
}

/**
 * The pre-refactor shape.
 *
 * The old status tag drove its colours from a hand-written JSON `mappings` object and a pair of
 * `override`/`color` expressions rather than from a reference list. Those properties are gone from
 * the component model, but forms saved against them still carry the values, so the migrator steps
 * that read them are typed against this instead.
 */
export interface IStatusTagComponentPropsV0 extends IConfigurableFormComponent, IInputStyles {
  mappings?: string | undefined;
  valueSource?: 'form' | 'manual' | undefined;
  override?: string | undefined;
  value?: number | string | undefined;
  color?: string | undefined;
  /**
   * Properties of the new model that the mappings migration has to read before writing.
   *
   * `referenceListId` decides whether that step may claim the data source, and the other three are
   * only defaulted where the form has not set them — so all four have to be readable off the shape
   * the step receives, even though they belong to the model it produces.
   */
  referenceListId?: IReferenceListIdentifier | undefined;
  showItemName?: boolean | undefined;
  showIcon?: boolean | undefined;
  tagVariant?: TagVariant | undefined;
}

/** The parsed form of the legacy `mappings` JSON, used when converting it to `values`. */
export type LegacyStatusMappings = IStatusMappings;

export type StatusTagComponentDefinition = ComponentDefinition<'statusTag', IStatusTagComponentProps>;
