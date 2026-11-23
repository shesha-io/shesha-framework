import { IContainerComponentProps } from '@/designer-components/container/interfaces';
import { defaultStyles as containerDefaultStyles } from '@/designer-components/container/data';
import { IConfigurableFormComponent, IStyleValue } from '@/providers/form/models';
import { createHeaderTitle, HEADER_LAYOUT_NAME } from './utils';

/** Style of a header's layout row: the title on the left, the extra area on the right. */
export const getHeaderLayoutStyles = (): IStyleValue => containerDefaultStyles({
  display: 'flex', direction: 'horizontal', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', gap: '8',
} as IContainerComponentProps);

/** Style of a header's extra area: the components after the title, in a row. */
export const getExtraAreaStyles = (): IStyleValue => containerDefaultStyles({
  display: 'flex', direction: 'horizontal', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '8',
} as IContainerComponentProps);

interface IHeaderContainer {
  id: string;
  components: IConfigurableFormComponent[];
}

/**
 * A card's or panel's header as the designer creates it (see `migrateCardHeaderLayout`, `migrateV9toV10`):
 * a layout row holding the header title and an empty extra area. Used by the theme preview, so its ids are
 * fixed, derived from `idPrefix`.
 */
export const createHeaderModel = (idPrefix: string, titleName: string, title: string): IHeaderContainer => {
  const headerId = `${idPrefix}-header`;
  const layoutId = `${idPrefix}-header-layout`;
  const extraAreaId = `${idPrefix}-header-extra`;
  const layoutStyles = getHeaderLayoutStyles();
  const extraAreaStyles = getExtraAreaStyles();

  const extraArea = {
    id: extraAreaId,
    type: 'container',
    propertyName: `${idPrefix}ExtraArea`,
    componentName: `${idPrefix}ExtraArea`,
    label: 'Extra Area',
    parentId: layoutId,
    hidden: false,
    components: [],
    desktop: { ...extraAreaStyles },
    tablet: { ...extraAreaStyles },
    mobile: { ...extraAreaStyles },
    version: 'latest',
  } as IContainerComponentProps;

  const layout = {
    id: layoutId,
    type: 'container',
    propertyName: HEADER_LAYOUT_NAME,
    componentName: HEADER_LAYOUT_NAME,
    label: 'Header Layout',
    parentId: headerId,
    hidden: false,
    components: [createHeaderTitle({ id: `${idPrefix}-header-title`, parentId: layoutId, name: titleName, content: title }), extraArea],
    desktop: { ...layoutStyles },
    tablet: { ...layoutStyles },
    mobile: { ...layoutStyles },
    version: 'latest',
  } as IContainerComponentProps;

  return { id: headerId, components: [layout as IConfigurableFormComponent] };
};
