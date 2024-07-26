import { GroupOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ICommonContainerProps, IContainerComponentProps, IToolboxComponent } from '@/interfaces';
import { getStyle, getLayoutStyle, validateConfigurableComponentSettings, evaluateValue } from '@/providers/form/utils';
import ContaineSettingsForm from './settingsForm';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { StoredFileProvider, useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { ComponentsContainer, ValidationErrors } from '@/components';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import ConditionalWrap from '@/components/conditionalWrapper';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { getBorderStyle } from '../styleBorder/components/border/utils';
import { getBackgroundStyle } from '../styleBackground/components/background/utils';
import { getSizeStyle } from '../styleDimensions/components/size/utils';

const ContainerComponent: IToolboxComponent<IContainerComponentProps> = {
  type: 'container',
  name: 'Container',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { data: formData, data } = useFormData();
    const { globalState } = useGlobalState();
    const { formSettings } = useForm();
    const { backendUrl } = useSheshaApplication();
    const ownerId = evaluateValue(model?.background?.storedFile?.ownerId, { data, globalState });

    console.log("CONTAINER COMPONENT", model);
    const sizeStyles = useMemo(() => getSizeStyle(model?.dimensions), [model.dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(model?.border), [model.border, formData]);
    const [backgroundStyles, setBackgroundStyles] = useState({});

    useEffect(() => {
      const fetchStyles = async () => {
        getBackgroundStyle(model?.background).then((style) => {
          setBackgroundStyles(style);
        });
      };
      fetchStyles();
    }, [model.background]);

    if (model?.background?.backgroundType === 'storedFile' && model?.background?.storedFile && !isValidGuid(model?.background?.storedFile.id)) {
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

    let val;
    if (model?.background?.backgroundType === "storedFile") {
      val = model?.background.storedFile.id;
    }
    const fileProvider = (child) => {
      return (
        <StoredFileProvider
          value={val}
          fileId={val}
          baseUrl={backendUrl}
          ownerId={Boolean(ownerId) ? ownerId : Boolean(data?.id) ? data?.id : ''}
          ownerType={
            Boolean(model.background.storedFile.ownerType) ? model.background.storedFile.ownerType : Boolean(formSettings?.modelType) ? formSettings?.modelType : ''
          }
          fileCategory={model.background.storedFile.fileCategory}
          propertyName={!model.context ? model.propertyName : null}
        >
          {child}
        </StoredFileProvider>
      );
    };


    return (
      <ParentProvider model={model}>
        <ConditionalWrap
          condition={model?.background?.backgroundType === 'storedFile'}
          wrap={fileProvider}
        >
          <ComponentsContainer
            containerId={model.id}
            {...flexAndGridStyles}
            {...backgroundStyles}
            className={model.className}
            {...model}
            wrapperStyle={{
              ...getLayoutStyle({ ...model, style: model?.wrapperStyle }, { data: formData, globalState }),
              ...backgroundStyles,
              ...borderStyles,
              ...sizeStyles,
            }}
            style={{
              ...getStyle(model?.style, formData)
            }}
            dynamicComponents={model?.isDynamic ? model?.components : []}
          />
        </ConditionalWrap>
      </ParentProvider>
    );
  },
  settingsFormFactory: (props) => <ContaineSettingsForm {...props} />,
  migrator: (m) =>
    m
      .add<IContainerComponentProps>(0, (prev) => ({
        ...prev,
        direction: prev['direction'] ?? 'vertical',
        justifyContent: prev['justifyContent'] ?? 'left',
        display: prev['display'],
        flexWrap: prev['flexWrap'] ?? 'wrap',
        components: prev['components'] ?? [],
      }))
      .add<IContainerComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IContainerComponentProps>(2, (prev) => migrateVisibility(prev))
      .add<IContainerComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
  ,
};

export default ContainerComponent;
