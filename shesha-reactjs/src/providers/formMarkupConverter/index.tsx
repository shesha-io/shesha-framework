import React, { FC, ReactNode, useMemo } from 'react';
import { useFormDesignerComponents } from '../form/hooks';
import { FormRawMarkup, IFlatComponentsStructure, IFormSettings } from '../form/models';
import { convertFormMarkupToFlatStructure } from '../form/utils';

export interface IFormMarkupConverterProps {
  markup: FormRawMarkup;
  formSettings: IFormSettings;
  children: (
    flatStructure: IFlatComponentsStructure,
    onChange: (flatStructure: IFlatComponentsStructure) => void
  ) => ReactNode;
}

const FormMarkupConverter: FC<IFormMarkupConverterProps> = ({ children, markup, formSettings }) => {
  const designerComponents = useFormDesignerComponents();

  const flatComponents = useMemo<IFlatComponentsStructure>(() => {
    return convertFormMarkupToFlatStructure(markup, formSettings, designerComponents);
  }, [markup, formSettings, designerComponents]);

  const onChange = (_value: IFlatComponentsStructure): void => {
    // nop
  };

  return <>{children(flatComponents, onChange)}</>;
};

export { FormMarkupConverter };
