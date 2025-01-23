import { GroupOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ICommonContainerProps, IContainerComponentProps, IToolboxComponent } from '@/interfaces';
import { getStyle, getLayoutStyle, validateConfigurableComponentSettings, pickStyleFromModel } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { ComponentsContainer, ValidationErrors } from '@/components';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './data';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { removeUndefinedProps } from '@/utils/object';
import { getPositionStyle } from '../_settings/utils/position/utils';

const ContainerComponent: IToolboxComponent<IContainerComponentProps> = {
  type: 'container',
  isInput: false,
  name: 'Container',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();
    const data = model;

    const { backendUrl, httpHeaders } = useSheshaApplication();

    const dimensions = model?.dimensions;
    const border = model?.border;
    const shadow = model?.shadow;
    const background = model?.background;
    const position = model?.position;
    const jsStyle = getStyle(model.style, data);

    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);
    const positionstyle = useMemo(() => getPositionStyle(position), [position]);

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

        const bgStyle = getBackgroundStyle(background, jsStyle, storedImageUrl);

        setBackgroundStyles((prevStyles) => {
          if (JSON.stringify(prevStyles) !== JSON.stringify(bgStyle)) {
            return bgStyle;
          }
          return prevStyles;
        });
      };

      fetchStyles();
    }, [background, backendUrl, httpHeaders, jsStyle]);

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...backgroundStyles,
      ...shadowStyles,
    });


    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(model?.font?.weight?.split(' - ')[0]) || 400 });

    if (model.hidden) return null;

    const flexAndGridStyles: ICommonContainerProps = {
      display: model?.display,
      flexDirection: model?.flexDirection,
      direction: model?.direction,
      justifyContent: model?.justifyContent,
      alignItems: model?.alignItems,
      alignSelf: model?.alignSelf,
      justifyItems: model?.justifyItems,
      textJustify: model?.textJustify,
      justifySelf: model?.justifySelf,
      noDefaultStyling: model?.noDefaultStyling,
      gridColumnsCount: model?.gridColumnsCount,
      flexWrap: model?.flexWrap,
      gap: model?.gap,
    };

    return (
      <ParentProvider model={model}>
        <ComponentsContainer
          containerId={model.id}
          className={model.className}
          wrapperStyle={{
            ...positionstyle,
            ...getLayoutStyle({ ...model, style: model?.wrapperStyle }, { data: formData, globalState }),
            ...finalStyle,
            ...positionstyle,
          }}
          style={{
            ...getStyle(model?.style, formData),
          }}
          dynamicComponents={model?.isDynamic ? model?.components : []}
          {...flexAndGridStyles}
        />
      </ParentProvider>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) =>
    m
      .add<IContainerComponentProps>(0, (prev) => ({
        ...prev,
        direction: prev['direction'] ?? 'vertical',
        justifyContent: prev['justifyContent'] ?? 'left',
        display: prev['display'] ?? 'block',
        flexWrap: prev['flexWrap'] ?? 'wrap',
        components: prev['components'] ?? [],
      }))
      .add<IContainerComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IContainerComponentProps>(2, (prev) => migrateVisibility(prev))
      .add<IContainerComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IContainerComponentProps>(4, (prev) => (
        {
          ...prev,
          backgroundDataSource: prev.backgroundDataSource ?? prev['dataSource'],
          backgroundBase64: prev.backgroundBase64 ?? prev['base64'],
          backgroundStoredFileId: prev.backgroundStoredFileId ?? prev['storedFileId'],
        }))
      .add<IContainerComponentProps>(5, (prev) => {
        const styles = {
          style: prev.style,
          wrapperStyle: prev.wrapperStyle,
          className: prev.className,
          stylingBox: prev.stylingBox,
          width: prev.width,
          height: prev.height,
          minWidth: prev.minWidth,
          minHeight: prev.minHeight,
          maxHeight: prev.maxHeight,
          maxWidth: prev.maxWidth,
          shadowStyle: 'none'
        };
        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<IContainerComponentProps>(6, (prev) => {
        const flexAndGridStyles = {
          display: prev?.display,
          flexDirection: prev?.flexDirection,
          direction: prev?.direction,
          justifyContent: prev?.justifyContent,
          alignItems: prev?.alignItems,
          alignSelf: prev?.alignSelf,
          justifySelf: prev?.justifySelf,
          justifyItems: prev?.justifyItems,
          textJustify: prev?.textJustify,
          noDefaultStyling: prev?.noDefaultStyling,
          gridColumnsCount: prev?.gridColumnsCount,
          flexWrap: prev?.flexWrap,
          gap: prev?.gap
        };

        return {
          ...migratePrevStyles({
            ...prev, desktop: { ...prev.desktop, ...flexAndGridStyles },
            tablet: { ...prev.tablet, ...flexAndGridStyles }, mobile: { ...prev.mobile, ...flexAndGridStyles }
          },
            { ...defaultStyles(prev) })
        };
      })
};

export default ContainerComponent;
