import { ComponentDefinition } from '@/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { IBackgroundValue } from '../_settings/utils/background/interfaces';
import { IBorderValue } from '../_settings/utils/border/interfaces';
import { IShadowValue } from '../_settings/utils/shadow/interfaces';

/** The shape the component had before the standards refactor — the migrator's input type. */
export interface INotesComponentPropsV1 extends IConfigurableFormComponent, IInputStyles {
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  savePlacement?: 'left' | 'right' | undefined;
  autoSize?: boolean | undefined;
  allowDelete?: boolean | undefined;
  allowEdit?: boolean | undefined;
  category?: string | undefined;
  showCharCount?: boolean | undefined;
  minLength?: number | undefined;
  maxLength?: number | undefined;
  onCreateAction?: string | undefined;
  onUpdateAction?: string | undefined;
  onDeleteAction?: string | undefined;
}

export interface INotesComponentProps extends IConfigurableFormComponent, IInputStyles {
  ownerId: string;
  /** Undefined until it is configured or inherited from the entity metadata. */
  ownerType?: string | IEntityTypeIdentifier | undefined;
  /** Places the Save button on the left or the right of the editor */
  savePlacement?: 'left' | 'right' | undefined;
  autoSize?: boolean | undefined;
  allowDelete?: boolean | undefined;
  allowEdit?: boolean | undefined;
  category?: string | undefined;
  showCharCount?: boolean | undefined;
  minLength?: number | undefined;
  maxLength?: number | undefined;
  /** Custom scripts, kept under their historical names so existing forms keep working */
  onCreateAction?: string | undefined;
  onUpdateAction?: string | undefined;
  onDeleteAction?: string | undefined;
  border?: IBorderValue | undefined;
  background?: IBackgroundValue | undefined;
  shadow?: IShadowValue | undefined;
}

export type NotesComponentDefinition = ComponentDefinition<'notes', INotesComponentProps>;
