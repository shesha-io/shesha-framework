import { GroupOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { IContainerComponentProps, IToolboxComponent } from '@/interfaces';
import { getStyle, getLayoutStyle, validateConfigurableComponentSettings, pickStyleFromModel } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { ComponentsContainer, ValidationErrors } from '@/components';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './data';
import { getDimensionsStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { removeUndefinedProps } from '@/utils/object';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { addPx } from '@/utils/style';

const ContainerComponent: IToolboxComponent<IContainerComponentProps> = {
  type: 'container',
  isInput: false,
  name: 'Container',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();
    const { backendUrl, httpHeaders } = useSheshaApplication();

    const dimensions = model?.dimensions;
    const border = model?.border;
    const shadow = model?.shadow;
    const background = model?.background;
    const jsStyle = getStyle(model.style, model);

    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
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
      ...dimensionsStyles,
      ...borderStyles,
      ...backgroundStyles,
      ...shadowStyles,
    });

    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(model?.font?.weight?.split(' - ')[0]) || 400 });

    if (model.hidden) return null;

    const flexAndGridStyles = {
      display: model.display,
      flexDirection: model.flexDirection,
      direction: model.direction,
      justifyContent: model.justifyContent,
      alignItems: model.alignItems,
      alignSelf: model.alignSelf,
      justifyItems: model.justifyItems,
      textJustify: model.textJustify,
      justifySelf: model.justifySelf,
      noDefaultStyling: model.noDefaultStyling,
      gridColumnsCount: model.gridColumnsCount,
      flexWrap: model.flexWrap,
      gap: addPx(model.gap),
    };
    
    return (
      <ParentProvider model={model}>
        <ComponentsContainer
          containerId={model.id}
          wrapperStyle={{
            ...stylingBoxAsCSS,
            ...finalStyle,
            overflow: model.overflow,
            ...getLayoutStyle({ ...model, style: model?.wrapperStyle }, { data: formData, globalState })
          }}
          style={{
            ...getStyle(model?.style, formData),
            ...dimensionsStyles,
            ...flexAndGridStyles as any
          }}
          noDefaultStyling={model.noDefaultStyling}
          className={model.className}
          dynamicComponents={model?.isDynamic ? model?.components : []}
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
        display: prev['display'] /* ?? 'block'*/,
        flexWrap: prev['flexWrap'] ?? 'wrap',
        components: prev['components'] ?? [],
        editMode: 'inherited',
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
          maxWidth: prev.maxWidth
        };
        const showAdvanced = prev.showAdvanced ?? false;
        return { ...prev, showAdvanced: showAdvanced, desktop: { ...styles, showAdvanced }, tablet: { ...styles, showAdvanced }, mobile: { ...styles, showAdvanced } };
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
          gap: prev?.gap || 8
        };

        return {
          ...prev, desktop: { ...prev.desktop, ...flexAndGridStyles },
          tablet: { ...prev.tablet, ...flexAndGridStyles }, mobile: { ...prev.mobile, ...flexAndGridStyles }
        };
      })
      .add<IContainerComponentProps>(7, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev)) })),
};

export default ContainerComponent;