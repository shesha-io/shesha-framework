import { getComponentDefinitions } from '../defaults/toolboxComponents';
import { IFlatComponentsStructure } from '../models';
import { componentsTreeToFlatStructure, getComponentsFromMarkup } from '../utils';
import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { IToolboxComponents } from '@/interfaces';

type ComponentError = {
  type: string;
  errors: string[];
};
describe('component settings', () => {
  const componentDefinitions = getComponentDefinitions();
  const designerComponents: IToolboxComponents = Object.fromEntries(getComponentDefinitions());
  const fbf = makeFormBuliderFactory(componentDefinitions);

  it('should not contain duplicate ids', () => {
    const errors: ComponentError[] = [];

    const hasLoops = (id: string, flatStructure: IFlatComponentsStructure): boolean => {
      let parentId = flatStructure.parents[id];
      while (!isNullOrWhiteSpace(parentId) && parentId !== id) {
        parentId = flatStructure.parents[parentId];
      }
      return parentId === id ? true : false;
    };

    componentDefinitions.forEach((def) => {
      if (!isDefined(def.settingsFormMarkup))
        return;

      const componentErrors: string[] = [];
      const settingsFormMarkup = typeof def.settingsFormMarkup === 'function'
        ? def.settingsFormMarkup({ fbf, removeStyleRouter: true })
        : def.settingsFormMarkup;

      const components = getComponentsFromMarkup(settingsFormMarkup);
      const flatStructure = componentsTreeToFlatStructure(designerComponents, components);

      for (const key in flatStructure.allComponents) {
        if (flatStructure.allComponents.hasOwnProperty(key)) {
          if (hasLoops(key, flatStructure)) {
            componentErrors.push(`ID '${key}' is duplicated in markup`);
          }
        }
      }
      if (componentErrors.length > 0)
        errors.push({ type: def.type, errors: componentErrors });
    });

    if (errors.length > 0) {
      console.error("Found errors in component settings forms markup", errors);
    }
    expect(errors.length).toBe(0);
  });
});
