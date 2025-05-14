import { FileSearchOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces';
import { IInputStyles, useForm, useSheshaApplication } from '@/providers';
import { IRefListStatusPropsV0 } from './migrations/models';
import { IRefListStatusProps } from './models';
import { getStyle, pickStyleFromModel, useAvailableConstantsData } from '@/providers/form/utils';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { RefListStatus } from '@/components/refListStatus/index';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settings';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { getDimensionsStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { removeUndefinedProps } from '@/utils/object';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';

const RefListStatusComponent: IToolboxComponent<IRefListStatusProps> = {
  type: 'refListStatus',
  isInput: false,
  isOutput: true,
  name: 'Reference list status',
  icon: <FileSearchOutlined />,
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData();
    const { formMode } = useForm();
    const { solidBackground = true, referenceListId, showReflistName = true } = model;


    const localStyle = getStyle(model.style, allData.data);
    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const background = model?.background;

    const { backendUrl, httpHeaders } = useSheshaApplication();
    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, localStyle), [border, localStyle]);
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

        const style = getBackgroundStyle(background, localStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders, localStyle]);


    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);


    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles,
      ...localStyle
    });

    const style = removeUndefinedProps({ ...additionalStyles, justifyContent: model?.font?.align, fontWeight: Number(model?.font?.weight?.split(' - ')[0]) || 400 });

    if (model?.hidden && formMode !== 'designer') return null;

    if (formMode === 'designer' && !referenceListId) {
      return (
        <Alert
          showIcon
          message="ReflistStatus configuration is incomplete"
          description="Please make sure that you've select a reference list."
          type="warning"
        />
      );
    }

    return (
      <ConfigurableFormItem model={{ ...model }}>
        {(value) => {
          return (
            <RefListStatus
              value={value}
              referenceListId={model.referenceListId}
              showIcon={model.showIcon}
              showReflistName={showReflistName}
              solidBackground={solidBackground}
              style={style} />
          );
        }}
      </ConfigurableFormItem>
    );
  },

  initModel: (model) => {
    const customModel: IRefListStatusProps = {
      ...model,
      hideLabel: true
    };
    return customModel;
  },
  migrator: (m) => m
    .add<IRefListStatusPropsV0>(0, (prev) => {
      const result: IRefListStatusPropsV0 = {
        ...prev,
        name: prev['name'],
        module: '',
        nameSpace: '',
      };
      return result;
    })
    .add<IRefListStatusProps>(1, (prev) => {
      const { module, nameSpace, ...restProps } = prev;
      const result: IRefListStatusProps = {
        ...restProps,
        referenceListId: nameSpace
          ? { module: module, name: nameSpace /* note the property was named wrong initially */ }
          : null,
      };
      return result;
    })
    .add<IRefListStatusProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IRefListStatusProps>(3, (prev) => migrateVisibility(prev))
    .add<IRefListStatusProps>(4, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IRefListStatusProps>(5, (prev) => {
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
    .add<IRefListStatusProps>(6, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
  ,
  settingsFormMarkup: data => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  linkToModelMetadata: (model, metadata): IRefListStatusProps => {
    return {
      ...model,
      referenceListId: {
        module: metadata.referenceListModule,
        name: metadata.referenceListName,
      },
    };
  },
};

export default RefListStatusComponent;
