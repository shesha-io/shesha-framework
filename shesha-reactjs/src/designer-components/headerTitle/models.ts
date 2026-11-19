import { IConfigurableFormComponent } from '@/providers/form/models';

export const HEADER_TITLE_TYPE = 'headerTitle';

/**
 * Title in the header of a layout component (card, panel). Unlike a Text component it has no styles or
 * theme defaults of its own: it takes its font from the header it sits in (the component's Header Style
 * over the Layout Components theme's Header Defaults), so the header decides how its title looks.
 */
export interface IHeaderTitleComponentProps extends IConfigurableFormComponent {
  /** The title: plain text, a mustache template or a JS setting. */
  content?: string | undefined;
}
