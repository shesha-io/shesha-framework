import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { customDropDownEventHandler, isValidGuid } from '@/components/formDesigner/components/utils';
import { DataTypes } from '@/interfaces/dataTypes';
import { DownSquareOutlined } from '@ant-design/icons';
import { IInputStyles } from '@/providers/form/models';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { getStyle, pickStyleFromModel, useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IDropdownComponentProps } from './model';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { Dropdown } from '@/components/dropdown/dropdown';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { removeUndefinedProps } from '@/utils/object';
import { ValidationErrors } from '@/components';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { useSheshaApplication } from '@/providers';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from '../textField/utils';


const DropdownComponent: IToolboxComponent<IDropdownComponentProps> = {
  type: 'dropdown',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Dropdown',
  icon: <DownSquareOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.referenceListItem,
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData();

    const localStyle = getStyle(model.style, allData.data);
    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const background = model?.background;

    const { backendUrl, httpHeaders } = useSheshaApplication();
    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, localStyle), [border]);
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

        const style = await getBackgroundStyle(background, localStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const initialValue = model?.defaultValue ? { initialValue: model.defaultValue } : {};

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);


    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles
    });
    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(model?.font?.weight?.split(' - ')[0]) || 400 });

    return (
      <ConfigurableFormItem model={model} {...initialValue}>
        {(value, onChange) => {
          const customEvent = customDropDownEventHandler(model, allData);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0], args[1]);
            if (typeof onChange === 'function')
              onChange(...args);
          };

          return <Dropdown
            {...model}
            style={{
              ...finalStyle, ...localStyle
            }}
            {...customEvent}
            value={value}
            size={model?.size}
            hideBorder={model?.border?.hideBorder}
            onChange={onChangeInternal}
          />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IDropdownComponentProps>(0, (prev) => ({
      ...prev,
      dataSourceType: prev['dataSourceType'] ?? 'values',
      useRawValues: prev['useRawValues'] ?? false,
    }))
    .add<IDropdownComponentProps>(1, (prev) => {
      return {
        ...prev,
        referenceListId: getLegacyReferenceListIdentifier(prev.referenceListNamespace, prev.referenceListName),
      };
    })
    .add<IDropdownComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDropdownComponentProps>(3, (prev) => migrateVisibility(prev))
    .add<IDropdownComponentProps>(4, (prev) => migrateReadOnly(prev))
    .add<IDropdownComponentProps>(5, (prev, context) => ({
      ...prev,
      valueFormat: prev.valueFormat ??
        context.isNew
        ? 'simple'
        : prev['useRawValue'] === true
          ? 'simple'
          : 'listItem',
    }))
    .add<IDropdownComponentProps>(6, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IDropdownComponentProps>(7, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        stylingBox: prev.stylingBox,
        style: prev.style,
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IDropdownComponentProps>(8, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        width: prev.width,
        height: prev.height,
        hideBorder: prev.hideBorder,
        borderSize: prev.borderSize,
        borderRadius: prev.borderRadius,
        borderColor: prev.borderColor,
        fontSize: prev.fontSize,
        fontColor: prev.fontColor,
        backgroundColor: prev.backgroundColor,
        stylingBox: prev.stylingBox,
      };
      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IDropdownComponentProps>(9, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
  ,
  linkToModelMetadata: (model, metadata): IDropdownComponentProps => {
    const isSingleRefList = metadata.dataType === DataTypes.referenceListItem;
    const isMultipleRefList = metadata.dataType === 'array' && metadata.dataFormat === 'reference-list-item';

    return {
      ...model,
      dataSourceType: isSingleRefList || isMultipleRefList ? 'referenceList' : 'values',
      referenceListId: {
        module: metadata.referenceListModule,
        name: metadata.referenceListName,
      },
      mode: isMultipleRefList ? 'multiple' : 'single',
      valueFormat: 'simple',
    };
  },
};

export default DropdownComponent;