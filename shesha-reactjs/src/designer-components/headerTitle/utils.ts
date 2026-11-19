import { IConfigurableFormComponent, IFlatComponentsStructure, isConfigurableFormComponent } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';
import { HEADER_TITLE_TYPE, IHeaderTitleComponentProps } from './models';

/** Name of the row in a card's or panel's header that holds the title and the extra area. */
export const HEADER_LAYOUT_NAME = 'headerLayout';

interface IHeaderTitleArgs {
  id: string;
  parentId: string;
  name: string;
  content: unknown;
}

/** A header title for a card's or panel's header layout. */
export const createHeaderTitle = ({ id, parentId, name, content }: IHeaderTitleArgs): IHeaderTitleComponentProps => ({
  id,
  type: HEADER_TITLE_TYPE,
  propertyName: name,
  componentName: name,
  parentId,
  hidden: false,
  // A plain string or a JS setting: both are kept as they are.
  content: content as string | undefined,
});

/**
 * The header title replacing a Text title: its content, name and visibility, without the Text's styles -
 * the title's font now comes from the header.
 */
export const textToHeaderTitle = (text: IConfigurableFormComponent & { content?: unknown }): IHeaderTitleComponentProps => ({
  ...createHeaderTitle({ id: text.id, parentId: text.parentId ?? '', name: text.componentName ?? text.propertyName ?? text.id, content: text.content }),
  hidden: text.hidden,
  ...(isDefined(text.visible) ? { visible: text.visible } : {}),
  ...(isDefined(text.visiblePermissions) ? { visiblePermissions: text.visiblePermissions } : {}),
});

type WithComponents = IConfigurableFormComponent & { components?: IConfigurableFormComponent[] | undefined };
interface IHeaderContainer {
  id: string;
  components?: IConfigurableFormComponent[] | undefined;
}

/**
 * Replaces the Text title named `titleName` in a header's layout row with a header title, in the flat
 * structure and in the header's own tree. Returns the header unchanged when it has no such title.
 */
export const replaceTextHeaderTitle = <T extends IHeaderContainer>(header: T | undefined, flatStructure: IFlatComponentsStructure, titleName: string): T | undefined => {
  if (!isDefined(header)) return header;

  const isLayout = (c: unknown): c is WithComponents => isConfigurableFormComponent(c) && c.type === 'container' && c.componentName === HEADER_LAYOUT_NAME;
  const isTextTitle = (c: unknown): c is IConfigurableFormComponent => isConfigurableFormComponent(c) && c.type === 'text' && c.componentName === titleName;

  // Flat structure (designer / stored markup).
  const layoutIds = (flatStructure.componentRelations[header.id] ?? []).filter((id) => isLayout(flatStructure.allComponents[id]));
  layoutIds.forEach((layoutId) => {
    (flatStructure.componentRelations[layoutId] ?? []).forEach((id) => {
      const component = flatStructure.allComponents[id];
      if (isTextTitle(component))
        flatStructure.allComponents[id] = textToHeaderTitle(component);
    });
  });

  // Tree.
  if (!isDefined(header.components)) return header;
  let changed = false;
  const components = header.components.map((c) => {
    if (!isLayout(c) || !isDefined(c.components)) return c;
    return {
      ...c,
      components: c.components.map((child) => {
        if (!isTextTitle(child)) return child;
        changed = true;
        return textToHeaderTitle(child);
      }),
    };
  });
  return changed ? { ...header, components } : header;
};
