import { SettingsMigrationContext } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
import { IConfigurableFormComponent, isConfigurableFormComponent, IStyleValue } from "@/providers/form/models";
import { IContainerComponentProps } from "@/designer-components/container/interfaces";
import { ITextComponentProps } from "@/designer-components/text/models";
import { defaultStyles as containerDefaultStyles } from "@/designer-components/container/data";
import { isDefined } from "@/utils/nullables";
import { ICardComponentProps } from "../interfaces";
import { legacyHeadingFont } from "../utils";

/** Latest versions of the components created here, so they are not migrated again as legacy ones. */
const CONTAINER_VERSION = 9;
const TEXT_VERSION = 8;

export const CARD_HEADER_LAYOUT_NAME = 'headerLayout';

/**
 * Turns the card's heading into a configurable header, as a panel's (see the panel's `migrateV9toV10`):
 * the header container holds a `headerLayout` row with the heading as a Text component on the left and
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

  const extraAreaStyles = containerDefaultStyles({
    display: 'flex', direction: 'horizontal', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '8',
  } as IContainerComponentProps);
  const headerLayoutStyles = containerDefaultStyles({
    display: 'flex', direction: 'horizontal', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', gap: '8',
  } as IContainerComponentProps);

  // The components already in the header: from the flat structure (designer / stored markup), else the tree.
  const existingIds = flatStructure.componentRelations[headerId] ?? header?.components?.map((c) => c.id) ?? [];
  const existingComponents = existingIds
    .map((id) => flatStructure.allComponents[id] ?? header?.components?.find((c) => c.id === id))
    .filter(isDefined)
    .map((c) => ({ ...c, parentId: extraAreaId }));

  // The heading keeps its value as-is: a plain string or a JS setting (Text content supports both).
  const labelText = {
    id: labelTextId,
    type: 'text',
    propertyName: 'cardLabel',
    componentName: 'cardLabel',
    labelAlign: 'right',
    parentId: headerLayoutId,
    hidden: false,
    isDynamic: false,
    content: (prev.label ?? '') as string,
    contentType: 'default',
    copyable: false,
    delete: false,
    italic: false,
    underline: false,
    level: 0,
    // antd's card title look: the heading font used to come from antd, not from the Text defaults.
    desktop: { font: legacyHeadingFont(), dimensions: { width: 'max-content' } } as IStyleValue,
    version: TEXT_VERSION,
  } as ITextComponentProps;

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
