import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { IDropdownProps } from '@/components/dropdown/model';
import { ComponentDefinition } from '@/interfaces';
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
  extends Omit<IDropdownProps, 'style' | 'readOnly' | 'value' | RemovedDropdownProps | StatusTagRuntimeProps>,
  IConfigurableFormComponent,
  IInputStyles {
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
}

/** The parsed form of the legacy `mappings` JSON, used when converting it to `values`. */
export type LegacyStatusMappings = IStatusMappings;

export type StatusTagComponentDefinition = ComponentDefinition<'statusTag', IStatusTagComponentProps>;
