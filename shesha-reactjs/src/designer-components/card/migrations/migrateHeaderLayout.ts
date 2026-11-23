import { SettingsMigrationContext } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
import { IConfigurableFormComponent, isConfigurableFormComponent } from "@/providers/form/models";
import { IContainerComponentProps } from "@/designer-components/container/interfaces";
import { createHeaderTitle, HEADER_LAYOUT_NAME } from "@/designer-components/headerTitle/utils";
import { getExtraAreaStyles, getHeaderLayoutStyles } from "@/designer-components/headerTitle/layout";
import { isDefined } from "@/utils/nullables";
import { ICardComponentProps } from "../interfaces";

/** Latest version of the containers created here, so they are not migrated again as legacy ones. */
const CONTAINER_VERSION = 9;

export const CARD_HEADER_LAYOUT_NAME = HEADER_LAYOUT_NAME;

/**
 * Turns the card's heading into a configurable header, as a panel's (see the panel's `migrateV9toV10`):
 * the header container holds a `headerLayout` row with the heading as a header title on the left and
 * the components previously in the header (antd's `extra`) in an `extraArea` on the right.
 */
export const migrateCardHeaderLayout = (prev: ICardComponentProps, context: SettingsMigrationContext): ICardComponentProps => {
  const { flatStructure } = context;
  const header = prev.header;

  const alreadyMigrated = header?.components?.some((c) => c.type === 'container' && c.componentName === CARD_HEADER_LAYOUT_NAME) === true ||
    (isDefined(header) && (flatStructure.componentRelations[header.id] ?? []).some((id) => {
      const component = flatStructure.allComponents[id];
      return isConfigurableFormComponent(component) && component.componentName === CARD_HEADER_LAYOUT_NAME;
    }));
  if (alreadyMigrated) return prev;

  const headerId = header?.id ?? nanoid();
  const headerLayoutId = nanoid();
  const labelTextId = nanoid();
  const extraAreaId = nanoid();

  const extraAreaStyles = getExtraAreaStyles();
  const headerLayoutStyles = getHeaderLayoutStyles();

  // The components already in the header: from the flat structure (designer / stored markup), else the tree.
  const existingIds = flatStructure.componentRelations[headerId] ?? header?.components?.map((c) => c.id) ?? [];
  const existingComponents = existingIds
    .map((id) => flatStructure.allComponents[id] ?? header?.components?.find((c) => c.id === id))
    .filter(isDefined)
    .map((c) => ({ ...c, parentId: extraAreaId }));

  // The heading keeps its value as-is (a plain string or a JS setting). It is a header title, not a Text:
  // its font is the header's (Header Style over the theme's Header Defaults), not the theme's Text defaults.
  const labelText = createHeaderTitle({ id: labelTextId, parentId: headerLayoutId, name: 'cardLabel', content: prev.label ?? '' });

  const extraArea = {
    id: extraAreaId,
    type: 'container',
    propertyName: 'extraArea',
    componentName: 'extraArea',
    label: 'Extra Area',
    labelAlign: 'right',
    parentId: headerLayoutId,
    hidden: false,
    isDynamic: false,
    components: existingComponents,
    desktop: { ...extraAreaStyles },
    tablet: { ...extraAreaStyles },
    mobile: { ...extraAreaStyles },
    version: CONTAINER_VERSION,
  } as IContainerComponentProps;

  const headerLayout = {
    id: headerLayoutId,
    type: 'container',
    propertyName: CARD_HEADER_LAYOUT_NAME,
    componentName: CARD_HEADER_LAYOUT_NAME,
    label: 'Header Layout',
    labelAlign: 'right',
    parentId: headerId,
    hidden: false,
    isDynamic: false,
    components: [labelText, extraArea],
    desktop: { ...headerLayoutStyles },
    tablet: { ...headerLayoutStyles },
    mobile: { ...headerLayoutStyles },
    version: CONTAINER_VERSION,
  } as IContainerComponentProps;

  flatStructure.allComponents[labelTextId] = labelText as IConfigurableFormComponent;
  flatStructure.allComponents[extraAreaId] = extraArea as IConfigurableFormComponent;
  flatStructure.allComponents[headerLayoutId] = headerLayout as IConfigurableFormComponent;
  flatStructure.componentRelations[headerId] = [headerLayoutId];
  flatStructure.componentRelations[headerLayoutId] = [labelTextId, extraAreaId];
  flatStructure.componentRelations[labelTextId] = [];
  flatStructure.componentRelations[extraAreaId] = existingComponents.map((c) => c.id);
  existingComponents.forEach((c) => {
    flatStructure.allComponents[c.id] = c;
  });
  // Some callers pass a structure without the parents map.
  const parents = flatStructure.parents as Record<string, string> | undefined;
  if (isDefined(parents)) {
    parents[headerLayoutId] = headerId;
    parents[labelTextId] = headerLayoutId;
    parents[extraAreaId] = headerLayoutId;
    existingComponents.forEach((c) => {
      parents[c.id] = extraAreaId;
    });
  }

  return { ...prev, header: { id: headerId, components: [headerLayout] } };
};
