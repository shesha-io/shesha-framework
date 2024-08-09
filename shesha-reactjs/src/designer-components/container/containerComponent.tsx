import { GroupOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { ICommonContainerProps, IContainerComponentProps, IToolboxComponent } from '@/interfaces';
import { getStyle, getLayoutStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { ComponentsContainer, ValidationErrors } from '@/components';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { CSSProperties } from 'styled-components';
import { toSizeCssProp } from '@/utils/form';

const ContainerComponent: IToolboxComponent<IContainerComponentProps> = {
  type: 'container',
  name: 'Container',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const [ fileUrl, setFileUrl] = useState(null);

    useEffect(() => {
      if (model.backgroundDataSource === 'storedFileId' && model.backgroundStoredFileId) {
        fetch(`${backendUrl}/api/StoredFile/Download?id=${model.backgroundStoredFileId}`,
          {headers: {...httpHeaders, "Content-Type": "application/octet-stream"}})
          .then((response) => {
            return response.blob();
          })
          .then((blob) => {
            setFileUrl(URL.createObjectURL(blob));
          });
      }
    }, [model.backgroundStoredFileId]);

    if (model.backgroundDataSource === 'storedFileId' && model.backgroundStoredFileId && !isValidGuid(model.backgroundStoredFileId)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

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

    const widthStyles: CSSProperties = {
      width: toSizeCssProp(model.width),
      minWidth: toSizeCssProp(model.minWidth),
      maxWidth: toSizeCssProp(model.maxWidth),
      overflow: model?.overflow,
    };

    const heightStyles: CSSProperties = {
      height: toSizeCssProp(model.height),
      minHeight: toSizeCssProp(model.minHeight),
      maxHeight: toSizeCssProp(model.maxHeight),
    };

    const borderStyles: CSSProperties = {
      borderWidth: toSizeCssProp(model.borderWidth),
      borderColor: model.borderColor,
      borderStyle: model.borderStyle,
      borderRadius: toSizeCssProp(model.borderRadius),
    };

    const val = model.backgroundDataSource === 'storedFileId'
      ? fileUrl
      : model.backgroundDataSource === 'base64'
        ? (model.backgroundBase64?.indexOf('data:image/png;base64,') > -1 ? model.backgroundBase64 : `data:image/png;base64,${model.backgroundBase64}`)
        : model.backgroundDataSource === 'url'
          ? model.backgroundUrl
          : '';

    const backgroundStyles: CSSProperties = model?.backgroundType === 'image' && val
      ? { backgroundImage: `url(${val})`, backgroundSize: model?.backgroundCover, backgroundRepeat: model?.backgroundRepeat }
      : model?.backgroundType === 'color'
        ? { background: model?.backgroundColor }
        : {};

    return (
      <ParentProvider model={model}>
        <ComponentsContainer
          containerId={model.id}
          className={model.className}
          wrapperStyle={getLayoutStyle({ ...model, style: model?.wrapperStyle }, { data: formData, globalState })}
          style={{
            ...widthStyles,
            ...heightStyles,
            ...borderStyles,
            ...backgroundStyles,
            ...getStyle(model?.style, formData)
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
        display: prev['display'] /* ?? 'block'*/,
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
  ,
};

export default ContainerComponent;
