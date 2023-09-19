import React, { FC, ReactNode, useMemo } from 'react';
import { useFormDesignerComponents } from '../form/hooks';
import { FormRawMarkup, IFlatComponentsStructure, IFormSettings } from '../form/models';
import { componentsTreeToFlatStructure, getComponentsFromMarkup, upgradeComponents } from '../form/utils';

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
    const components = getComponentsFromMarkup(markup);
    const newFlatComponents = componentsTreeToFlatStructure(designerComponents, components);

    // migrate components to last version
    upgradeComponents(designerComponents, formSettings, newFlatComponents);

    return newFlatComponents;
  }, [markup]);

  const onChange = (_value: IFlatComponentsStructure) => {
    console.log('CONVERTER onChange');
  };

  return <>{children(flatComponents, onChange)}</>;
};

export { FormMarkupConverter };
