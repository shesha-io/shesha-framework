import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { FileImageOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { evaluateValueAsString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import React, { ReactElement, ReactNode } from 'react';
import {
  migrateCustomFunctions,
  migratePropertyName,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { FileUploadProvider, IInputStyles } from '@/providers';
import { ImageField } from './image';
import ConditionalWrap from '@/components/conditionalWrapper';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getFirstNonEmptyStringPropertyOrUndefined, removeUndefinedProps } from '@/utils/object';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';
import { useTheme } from 'antd-style';
import { IImageProps } from './interfaces';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

const settingsForm = settingsFormJson as FormMarkup;

type ImageValueType = string | {
  id: string;
};

const getFileIdFromValue = (value: ImageValueType | null | undefined): string | undefined => (
  isDefined(value)
    ? typeof value === 'string' ? value : value.id
    : undefined
);

type ImageComponentCalculatedModel = {
  ownerId: string | undefined;
  dataId: string | undefined;
  formModelType: string | IEntityTypeIdentifier | undefined;
};

const ImageComponent: IToolboxComponent<IImageProps, ImageComponentCalculatedModel> = {
  type: 'image',
  name: 'Image',
  icon: <FileImageOutlined />,
  isInput: true,
  isOutput: true,
  preserveDimensionsInDesigner: true,
  calculateModel: (model, allData) => ({
    ownerId: model.ownerId ? evaluateValueAsString(model.ownerId, allData) : undefined,
    dataId: allData.data ? (allData.data as { Id: string }).Id : undefined, // TODO: review and remove
    formModelType: allData.form?.formSettings?.modelType,
  }),
  Factory: ({ model, calculatedModel }) => {
    const theme = useTheme();

    const finalStyles = removeUndefinedProps({
      ...model.allStyles?.jsStyle,
      objectFit: model.objectFit,
      objectPosition: model.objectPosition,
      filter: `${model.filter ? `${model.filter}(${model.filterIntensity || 0}${model.filter === 'blur' ? 'px' : model.filter === 'hue-rotate' ? 'deg' : '%'})` : 'none'}`,
      borderWidth: model.borderSize || 0,
      borderRadius: model.borderRadius,
      borderStyle: model.borderType || 'solid',
      borderColor: model.borderColor || theme.colorBorder,
      opacity: model.opacity,
      ...model.allStyles?.dimensionsStyles,
      ...model.allStyles?.borderStyles,
      ...model.allStyles?.shadowStyles,
      ...model.allStyles?.stylingBoxAsCSS,
    });

    return (
      <ConfigurableFormItem<ImageValueType> model={model}>
        {(value, onChange) => {
          const uploadedFileUrl = !isNullOrWhiteSpace(model.base64)
            ? model.base64
            : typeof (value) === "string"
              ? value
              : undefined;

          const readonly = model.readOnly || (model.dataSource === 'base64' && Boolean(model.base64));

          const val = model.dataSource === 'storedFile'
            ? model.storedFileId ?? getFileIdFromValue(value)
            : model.dataSource === 'base64'
              ? uploadedFileUrl
              : model.url ?? (typeof (value) === "string" ? value : undefined);

          const fileProvider = (child: ReactNode): ReactElement => {
            const ownerId = getFirstNonEmptyStringPropertyOrUndefined(calculatedModel ?? {}, ["ownerId", "dataId"]);
            const ownerType = !isEntityTypeIdEmpty(model.ownerType)
              ? model.ownerType
              : getFirstNonEmptyStringPropertyOrUndefined(calculatedModel ?? {}, ["formModelType"]) ?? "";
            return (
              <FileUploadProvider
                value={val}
                onChange={(newValue) => {
                  const convertedValue = isDefined(newValue) && typeof newValue === 'string'
                    ? newValue
                    : null;
                  onChange(convertedValue);
                }}
                ownerId={ownerId}
                ownerType={ownerType}
                propertyName={!model.context ? model.propertyName : undefined}
              >
                {child}
              </FileUploadProvider>
            );
          };

          return (
            <ConditionalWrap
              condition={model.dataSource === 'storedFile'}
              wrap={fileProvider}
            >
              <ImageField
                allowedFileTypes={model.allowedFileTypes}
                imageSource={model.dataSource}
                styles={finalStyles}
                value={val}
                readOnly={readonly}
                onChange={onChange}
                allowPreview={model.allowPreview}
                alt={model.alt}
              />
            </ConditionalWrap>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    const customModel: IImageProps = {
      ...model,
    };
    return customModel;
  },
  migrator: (m) => m
    .add<IImageProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev) as IImageProps))
    .add<IImageProps>(1, (prev) => migrateVisibility(prev))
    .add<IImageProps>(2, (prev) => {
      return {
        ...prev,
        hideLabel: true,
        editMode: 'inherited',
        url: typeof (prev.url) === "string" && !isNullOrWhiteSpace(prev.url)
          ? { _mode: 'code', _code: prev.url }
          : undefined,
        storedFileId: typeof (prev.storedFileId) === "string" && !isNullOrWhiteSpace(prev.storedFileId)
          ? { _mode: 'code', _code: prev.storedFileId }
          : undefined,
        border: { radiusType: 'all', borderType: 'all', border: { all: { width: 0, style: 'solid', color: '#d9d9d9' } } },
      };
    })
    .add<IImageProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<IImageProps>(4, (prev) => ({ ...prev, dataSource: prev.dataSource as string === 'storedFileId' ? 'storedFile' : prev.dataSource }))
    .add<IImageProps>(5, (prev) => {
      const styles: IInputStyles = {
        width: prev.width,
        height: prev.height,
        borderSize: prev.borderSize,
        borderRadius: prev.borderRadius,
        borderColor: prev.borderColor,
        stylingBox: prev.stylingBox,
        style: prev.style,
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IImageProps>(6, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev)) })),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default ImageComponent;

