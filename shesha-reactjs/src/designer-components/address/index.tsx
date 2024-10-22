import { HomeOutlined } from '@ant-design/icons';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import React, { useEffect, useMemo, useState } from 'react';
import { FormMarkup, IToolboxComponent } from '@/interfaces';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import AutoCompletePlacesControl from './control';
import { IAddressCompomentProps } from './models';
import settingsFormJson from './settingsForm.json';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItemWrapper from '@/components/readOnlyDisplayFormItem/wrapper';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { useSheshaApplication } from '@/providers';
import { getSizeStyle } from '../styleDimensions/utils';
import { getBorderStyle } from '../styleBorder/utils';
import { getFontStyle } from '../styleFont/utils';
import { getShadowStyle } from '../styleShadow/utils';
import { getBackgroundStyle } from '../styleBackground/utils';

const settingsForm = settingsFormJson as FormMarkup;

const AddressCompoment: IToolboxComponent<IAddressCompomentProps> = {
  type: 'address',
  name: 'Address',
  isInput: true,
  isOutput: true,
  icon: <HomeOutlined />,
  Factory: ({ model }) => {

    const { backendUrl, httpHeaders } = useSheshaApplication();

    const { dimensions, border, font, shadow, background } = model?.styles || {};

    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border), [border]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    useEffect(() => {

      const fetchStyles = async () => {

        const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
          ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
            { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
            .then((response) => {
              return response.blob();
            })
            .then((blob) => {
              return URL.createObjectURL(blob);
            }) : '';

        const style = await getBackgroundStyle(background, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          return (
            <ReadOnlyDisplayFormItemWrapper value={value} readOnly={model.readOnly}>
              <AutoCompletePlacesControl cssStyles={{ ...dimensionsStyles, ...borderStyles, ...fontStyles, ...backgroundStyles, ...shadowStyles }} {...model} value={value} onChange={onChange} />
            </ReadOnlyDisplayFormItemWrapper>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  // settingsFormFactory: (props) => (<AddressSettingsForm {...props} />),
  migrator: (m) => m
    .add<IAddressCompomentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAddressCompomentProps>(1, (prev) => migrateVisibility(prev))
    .add<IAddressCompomentProps>(2, (prev) => migrateReadOnly(prev))
    .add<IAddressCompomentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IAddressCompomentProps>(4, (prev) => ({ ...prev, onSelectCustom: migrateFormApi.withoutFormData(prev.onSelectCustom) }))
  ,
};

export default AddressCompoment;
