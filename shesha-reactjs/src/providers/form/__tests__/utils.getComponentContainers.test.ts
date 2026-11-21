import { getFormSettingsFormMarkup } from '@/components/formDesigner/formSettings';
import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { IToolboxComponent, IToolboxComponents } from '@/interfaces';
import { isDefined } from '@/utils/nullables';
import { unsafeGetValueByPropertyName } from '@/utils/object';
import { getComponentDefinitions } from '../defaults/toolboxComponents';
import {
  FormMarkupWithSettings,
  getEmptyFlatMarkup,
  IComponentsContainer,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  isComponentsContainer,
  isConfigurableFormComponent,
  ROOT_COMPONENT_KEY,
} from '../models';
import { componentsTreeToFlatStructure, getComponentContainers } from '../utils';
import * as nestedContainers from './custom-containers.json';

// --- Copy of the flattening code as it was before getComponentContainers was extracted (parity check only) ---

const legacyGetSubContainers = (component: IConfigurableFormComponent, componentRegistration: IToolboxComponent | undefined): IComponentsContainer[] => {
  const customContainerNames = componentRegistration?.customContainerNames || [];
  let subContainers: IComponentsContainer[] = [];
  customContainerNames.forEach((containerName) => {
    const containerValue = unsafeGetValueByPropertyName(component, containerName);
    const containers = isDefined(containerValue)
      ? Array.isArray(containerValue)
        ? containerValue.every((c) => isComponentsContainer(c))
          ? containerValue
          : containerValue.every((c) => isConfigurableFormComponent(c))
            ? [{ id: component.id, components: containerValue }]
            : undefined
        : isComponentsContainer(containerValue)
          ? [containerValue]
          : undefined
      : undefined;
    if (containers) subContainers = [...subContainers, ...containers];
  });
  const standardComponents = unsafeGetValueByPropertyName(component, "components");
  if (isDefined(standardComponents))
    subContainers.push({ id: component.id, components: standardComponents as IConfigurableFormComponent[] });
  return subContainers;
};

const legacyComponentsTreeToFlatStructure = (toolboxComponents: IToolboxComponents, components: IConfigurableFormComponent[]): IFlatComponentsStructure => {
  const result: IFlatComponentsStructure = getEmptyFlatMarkup();

  const processComponent = (component: IConfigurableFormComponent, parentId: string): void => {
    result.parents[component.id] = parentId;
    result.allComponents[component.id] = { ...component, parentId };

    const level = result.componentRelations[parentId] ?? [];
    level.push(component.id);
    result.componentRelations[parentId] = level;

    if (component.type) {
      const componentRegistration = toolboxComponents[component.type];
      if (isDefined(componentRegistration)) {
        legacyGetSubContainers(component, componentRegistration).forEach((subContainer) => {
          if (isDefined(subContainer.components)) {
            subContainer.components.forEach((c) => {
              processComponent(c, subContainer.id);
            });
          }
        });
      }

      if (componentRegistration?.customContainerNames) {
        componentRegistration.customContainerNames.forEach((containerName) => {
          const containerData = unsafeGetValueByPropertyName(component, containerName);
          if (Array.isArray(containerData)) {
            containerData.forEach((item: unknown) => {
              if (isDefined(item) && typeof item === 'object') {
                Object.keys(item).forEach((key) => {
                  const prop = (item as Record<string, unknown>)[key];
                  if (isComponentsContainer(prop)) {
                    if (!isDefined(result.parents[prop.id]))
                      result.parents[prop.id] = component.id;
                    prop.components.forEach((c) => {
                      processComponent(c, prop.id);
                    });
                  }
                });
              }
            });
          }
        });
      }
    }
  };

  components.forEach((component) => {
    processComponent(component, ROOT_COMPONENT_KEY);
  });
  return result;
};

// --- Fixtures ---

const componentDefinitions = getComponentDefinitions();
const toolboxComponents: IToolboxComponents = Object.fromEntries(componentDefinitions);
const fbf = makeFormBuliderFactory(componentDefinitions);

const component = (value: { id: string; type: string } & Record<string, unknown>): IConfigurableFormComponent => value as unknown as IConfigurableFormComponent;
const definition = (value: Partial<IToolboxComponent>): IToolboxComponent => value as IToolboxComponent;

const markupComponents = (markup: unknown): IConfigurableFormComponent[] => {
  if (Array.isArray(markup))
    return markup as IConfigurableFormComponent[];
  const components = isDefined(markup) && typeof markup === 'object' ? unsafeGetValueByPropertyName(markup, 'components') : undefined;
  return Array.isArray(components) ? components as IConfigurableFormComponent[] : [];
};

describe('getComponentContainers()', () => {
  it('lists tab panes with their positions', () => {
    const tabs = component({
      id: 'tabs1',
      type: 'tabs',
      tabs: [
        { id: 'pane-a', key: 'a', title: 'Details', components: [{ id: 't1', type: 'textField' }] },
        { id: 'pane-b', key: 'b', title: 'Address', components: [] },
      ],
    });

    const containers = getComponentContainers(tabs, definition({ customContainerNames: ['tabs'] }));

    expect(containers.map((c) => [c.id, c.propertyName, c.index, c.isNested])).toEqual([
      ['pane-a', 'tabs', 0, false],
      ['pane-b', 'tabs', 1, false],
    ]);
  });

  it("uses the component's own id for its `components`", () => {
    const container = component({ id: 'c1', type: 'container', components: [{ id: 't1', type: 'textField' }] });

    const containers = getComponentContainers(container, definition({}));

    expect(containers.map((c) => [c.id, c.propertyName, c.isNested])).toEqual([['c1', 'components', false]]);
  });

  it('finds containers nested in array items and remembers the item that holds them', () => {
    const wizard = component({
      id: 'w1',
      type: 'wizard',
      steps: [{ id: 'step-1', title: 'One', components: [], stepFooter: { id: 'footer-1', components: [] } }],
    });

    const containers = getComponentContainers(wizard, definition({ customContainerNames: ['steps'] }));

    expect(containers.map((c) => [c.id, c.propertyName, c.index, c.isNested, c.parentContainerId])).toEqual([
      ['step-1', 'steps', 0, false, undefined],
      ['footer-1', 'stepFooter', undefined, true, 'step-1'],
    ]);
  });

  it('returns nothing for unknown component types', () => {
    expect(getComponentContainers(component({ id: 'x', type: 'unknown', components: [] }), undefined)).toEqual([]);
  });
});

describe('componentsTreeToFlatStructure() after extracting getComponentContainers', () => {
  it('matches the previous output for the nested containers fixture', () => {
    const components = (nestedContainers as FormMarkupWithSettings).components;
    expect(componentsTreeToFlatStructure(toolboxComponents, components)).toEqual(legacyComponentsTreeToFlatStructure(toolboxComponents, components));
  });

  it('matches the previous output for the form settings form', () => {
    const components = markupComponents(getFormSettingsFormMarkup({ fbf, removeStyleRouter: true }));
    expect(components.length).toBeGreaterThan(0);
    expect(componentsTreeToFlatStructure(toolboxComponents, components)).toEqual(legacyComponentsTreeToFlatStructure(toolboxComponents, components));
  });

  it('matches the previous output for every component settings form', () => {
    componentDefinitions.forEach((toolboxComponent, type) => {
      const markup = typeof toolboxComponent.settingsFormMarkup === 'function'
        ? toolboxComponent.settingsFormMarkup({ fbf, removeStyleRouter: true })
        : toolboxComponent.settingsFormMarkup;
      if (!isDefined(markup))
        return;
      const components = markupComponents(markup);
      expect(componentsTreeToFlatStructure(toolboxComponents, components), type).toEqual(legacyComponentsTreeToFlatStructure(toolboxComponents, components));
    });
  });
});
