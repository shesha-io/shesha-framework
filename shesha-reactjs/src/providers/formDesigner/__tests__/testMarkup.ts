import { IToolboxComponents } from '@/interfaces';
import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';
import type { FormDesignerComponentGetter } from '@/providers/form/hooks';
import { IConfigurableFormComponent, IFlatComponentsStructure } from '@/providers/form/models';
import { componentsTreeToFlatStructure } from '@/providers/form/utils';

/** A component for tests: an id and a type, plus whatever settings the test needs */
export type TestComponent = { id: string; type: string } & Record<string, unknown>;

export const testComponent = (value: TestComponent): IConfigurableFormComponent => value as unknown as IConfigurableFormComponent;

let definitions: IToolboxComponents | undefined;

/** The real component definitions, as the designer sees them */
const getTestDefinitions = (): IToolboxComponents => {
  definitions ??= Object.fromEntries(getComponentDefinitions());
  return definitions;
};

export const getTestDefinition: FormDesignerComponentGetter = (type) => getTestDefinitions()[type];

/** Flattens a component tree the same way a form is loaded */
export const buildTestMarkup = (components: TestComponent[]): IFlatComponentsStructure =>
  componentsTreeToFlatStructure(getTestDefinitions(), components.map(testComponent));

/**
 * What the flat markup looks like after a Tabs, Wizard or Columns component has been edited in the designer:
 * `updateComponent` adds its panes to allComponents (with an empty type) and lists them under the owner's id.
 */
export const simulateEditedPanes = (markup: IFlatComponentsStructure, ownerId: string, paneIds: string[]): IFlatComponentsStructure => {
  const allComponents = { ...markup.allComponents };
  paneIds.forEach((id) => {
    allComponents[id] = testComponent({ id, type: '', propertyName: '', isDynamic: false });
  });
  return {
    ...markup,
    allComponents,
    componentRelations: { ...markup.componentRelations, [ownerId]: [...paneIds] },
  };
};

/** The form most designer and Layers tests use */
export const sampleForm = (): TestComponent[] => [
  {
    id: 'tabs1',
    type: 'tabs',
    componentName: 'mainTabs',
    label: 'Main tabs',
    tabs: [
      {
        id: 'pane-a',
        key: 'a',
        title: 'Details',
        components: [
          { id: 'email', type: 'textField', label: 'Email', propertyName: 'email', componentName: 'txtEmail' },
          { id: 'phone', type: 'textField', label: 'Phone', propertyName: 'phone' },
        ],
      },
      { id: 'pane-b', key: 'b', title: 'Address', components: [] },
    ],
  },
  { id: 'panel', type: 'container', label: 'Panel', components: [{ id: 'city', type: 'textField', label: 'City', propertyName: 'address.city' }] },
  { id: 'link1', type: 'link', label: 'Link', components: [{ id: 'linkText', type: 'textField', label: 'Link text' }] },
  { id: 'save', type: 'button', label: 'Save', componentName: 'btnSave' },
];
