import React, { FC, useMemo } from 'react';
import { IConfigurableFormComponent } from '@/interfaces/formDesigner';
import { IPropertyMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { ShaForm, useForm } from '@/providers/form';
import { createComponentModelForDataProperty, upgradeComponent } from '@/providers/form/utils';
import { camelcaseDotNotation } from '@/utils/string';
import { useFormDesignerComponentGroups } from '@/providers/form/hooks';
import { useMetadataOrUndefined } from '@/providers/metadata';
import DynamicContainer from './dynamicContainer';
import { isConfigurableFormComponent } from '@/providers/form/models';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export type DynamicViewProps = IConfigurableFormComponent;

export const DynamicView: FC<DynamicViewProps> = (model) => {
  const currentMeta = useMetadataOrUndefined()?.metadata;

  const { formSettings } = useForm();
  const { allComponents, componentRelations } = ShaForm.useMarkup();
  const toolboxComponentGroups = useFormDesignerComponentGroups();

  const staticComponents = useMemo<IConfigurableFormComponent[]>(() => {
    const result: IConfigurableFormComponent[] = [];
    for (const componentId in allComponents) {
      if (allComponents.hasOwnProperty(componentId) && isConfigurableFormComponent(allComponents[componentId])) {
        result.push(allComponents[componentId]);
      }
    }
    return result;
  }, [allComponents]);

  const staticComponentBindings = useMemo(() => {
    const names: string[] = [];
    staticComponents.forEach((c) => {
      if (!isNullOrWhiteSpace(c.propertyName))
        names.push(camelcaseDotNotation(c.propertyName));
    });
    return names;
  }, [staticComponents]);

  const propsToRender = useMemo<IPropertyMetadata[]>(() => {
    if (!currentMeta)
      return [];
    const propertiesToMap = (isPropertiesArray(currentMeta.properties) ? currentMeta.properties : []).filter((property) => property.isVisible && !property.isFrameworkRelated && !staticComponentBindings.includes(camelcaseDotNotation(property.path)));
    return propertiesToMap;
  }, [currentMeta, staticComponentBindings]);

  const dynamicComponents = useMemo(() => {
    const components = propsToRender.map((prop) => {
      const component = createComponentModelForDataProperty(toolboxComponentGroups, prop,
        (fc, tc) => {
          return upgradeComponent(fc, tc, formSettings, {
            allComponents: allComponents,
            componentRelations: componentRelations,
          }, true);
        },
      );

      if (component)
        component.isDynamic = true;
      return component;
    }).filter(isDefined);
    return components;
  }, [allComponents, componentRelations, formSettings, propsToRender, toolboxComponentGroups]);

  if (model.hidden) return null;

  return (
    <DynamicContainer components={dynamicComponents} />
  );
};

export default DynamicView;
