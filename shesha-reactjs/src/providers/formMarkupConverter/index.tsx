import React, { FC, ReactNode, useMemo } from 'react';
import { useFormDesignerComponents } from '../form/hooks';
import { FormRawMarkup, IFlatComponentsStructure, IFormSettings } from '../form/models';
import { componentsTreeToFlatStructure, getComponentsFromMarkup, upgradeComponents } from '../form/utils';
import { nanoid } from 'nanoid/non-secure';
import { updateSettingsComponents } from '@/designer-components/_settings/utils';

export interface IFormMarkupConverterProps {
  markup: FormRawMarkup;
  formSettings: IFormSettings;
  children: (
    flatStructure: IFlatComponentsStructure,
    onChange: (flatStructure: IFlatComponentsStructure) => void
  ) => ReactNode;
}

const FormMarkupConverter: FC<IFormMarkupConverterProps> = ({ children, markup, formSettings: formSettings }) => {
  const designerComponents = useFormDesignerComponents();

  const flatComponents = useMemo<IFlatComponentsStructure>(() => {
      let components = getComponentsFromMarkup(markup);
      if (formSettings.isSettingsForm)
          components = updateSettingsComponents(designerComponents, components);
      const newFlatComponents = componentsTreeToFlatStructure(designerComponents, components);
      
      // migrate components to last version
      upgradeComponents(designerComponents, formSettings, newFlatComponents);
      
      newFlatComponents['id'] = nanoid();
      return newFlatComponents;
  }, [markup]);

  const onChange = (_value: IFlatComponentsStructure) => {
    console.log('CONVERTER onChange');
  };

  return <>{children(flatComponents, onChange)}</>;
};

export { FormMarkupConverter };
