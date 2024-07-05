import { GroupOutlined } from '@ant-design/icons';
import React from 'react';
import { ICommonContainerProps, IContainerComponentProps, IToolboxComponent } from '@/interfaces';
import { getStyle, getLayoutStyle, validateConfigurableComponentSettings, evaluateValue } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { StoredFileProvider, useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { ComponentsContainer } from '@/components';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import ConditionalWrap from '@/components/conditionalWrapper';

const ContainerComponent: IToolboxComponent<IContainerComponentProps> = {
  type: 'container',
  name: 'Container',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { data: formData, data } = useFormData();
    const { globalState } = useGlobalState();
    const { formSettings } = useForm();
    const { backendUrl } = useSheshaApplication();
    const ownerId = evaluateValue(model.ownerId, { data, globalState });

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

    let val;
    if (model?.dataSource === "storedFileId") {
      val = model?.storedFileId;
    } else if (model?.dataSource === "base64") {
      val = model?.base64;
    } else if (model?.dataSource === "url") {
      val = model?.backgroundUrl;
    }

    const fileProvider = child => {
      return (
        <StoredFileProvider
          value={val}
          fileId={val}
          baseUrl={backendUrl}
          ownerId={Boolean(ownerId) ? ownerId : Boolean(data?.id) ? data?.id : ''}
          ownerType={
            Boolean(model.ownerType) ? model.ownerType : Boolean(formSettings?.modelType) ? formSettings?.modelType : ''
          }
          fileCategory={model.fileCategory}
          propertyName={!model.context ? model.propertyName : null}
        >
          {child}
        </StoredFileProvider>
      );
    };

    return (
      <ParentProvider model={model}>
        <ConditionalWrap
          condition={model.dataSource === 'storedFileId'}
          wrap={fileProvider}
        >
          <ComponentsContainer
            containerId={model.id}
            {...flexAndGridStyles}
            className={model.className}
            wrapperStyle={getLayoutStyle({ ...model, style: model?.wrapperStyle }, { data: formData, globalState })}
            style={{
              ...getStyle(model?.style, formData),
              background: model?.backgroundType === 'image' ? `url(${val})` : model?.backgroundColor,
              backgroundSize: model?.backgroundCover,
              backgroundRepeat: model?.backgroundCover
            }}
            dynamicComponents={model?.isDynamic ? model?.components : []}
          />
        </ConditionalWrap>
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
  ,
};

export default ContainerComponent;
