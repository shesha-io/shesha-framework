import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { FileImageOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { evaluateValueAsString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import React, { ReactElement } from 'react';
import {
  migrateCustomFunctions,
  migratePropertyName,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { StoredFileProvider } from '@/providers';
import { ImageField } from './image';
import ConditionalWrap from '@/components/conditionalWrapper';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeUndefinedProps } from '@/utils/object';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';
import { useTheme } from 'antd-style';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { IImageProps, IImageStyleProps } from './interfaces';

const settingsForm = settingsFormJson as FormMarkup;

const ImageComponent: IToolboxComponent<IImageProps> = {
  type: 'image',
  name: 'Image',
  icon: <FileImageOutlined />,
  isInput: true,
  isOutput: true,
  calculateModel: (model, allData) => ({
    ownerId: evaluateValueAsString(model.ownerId, allData),
    dataId: (allData.data as { Id: string })?.Id, // TODO: review and remove
    formModelType: allData.form.formSettings?.modelType,
  }),
  Factory: ({ model, calculatedModel }) => {
    const theme = useTheme();

    const finalStyles = removeUndefinedProps({
      ...model.allStyles.jsStyle,
      objectFit: model.objectFit,
      objectPosition: model.objectPosition,
      filter: `${model.filter ? `${model.filter}(${model.filterIntensity || 0}${model.filter === 'blur' ? 'px' : model.filter === 'hue-rotate' ? 'deg' : '%'})` : 'none'}`,
      borderWidth: model.borderSize || 0,
      borderRadius: model.borderRadius,
      borderStyle: model.borderType || 'solid',
      borderColor: model.borderColor || theme.colorBorder,
      opacity: model.opacity,
      ...model.allStyles.borderStyles,
      ...model.allStyles.shadowStyles,
      ...model.allStyles.stylingBoxAsCSS,
    });

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const uploadedFileUrl = model.base64 || value;

          const readonly = model.readOnly || (model.dataSource === 'base64' && Boolean(model.base64));

          const val = model.dataSource === 'storedFile'
            ? model.storedFileId || value?.id || value
            : model.dataSource === 'base64'
              ? uploadedFileUrl
              : model.url || value;

          const fileProvider = (child): ReactElement => {
            return (
              <StoredFileProvider
                value={val}
                onChange={onChange}
                fileId={val}
                ownerId={Boolean(calculatedModel.ownerId) ? calculatedModel.ownerId : Boolean(calculatedModel.dataId) ? calculatedModel.dataId : ''}
                ownerType={!isEntityTypeIdEmpty(model.ownerType) ? model.ownerType : !isEntityTypeIdEmpty(calculatedModel.formModelType) ? calculatedModel.formModelType : ''}
                fileCategory={model.fileCategory}
                propertyName={!model.context ? model.propertyName : null}
                // uploadMode={model.useSync ? 'sync' : 'async'}
              >
                {child}
              </StoredFileProvider>
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
        url: Boolean(prev.url) ? { _mode: 'code', _code: prev.url } : null,
        storedFileId: Boolean(prev.storedFileId) ? { _mode: 'code', _code: prev.storedFileId } : null,
        border: { radiusType: 'all', borderType: 'all', border: { all: { width: 0, style: 'solid', color: '#d9d9d9' } } },
      } as any;
    })
    .add<IImageProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<IImageProps>(4, (prev) => ({ ...prev, dataSource: prev.dataSource as any === 'storedFileId' ? 'storedFile' : prev.dataSource }))
    .add<IImageProps>(5, (prev) => {
      const styles: IImageStyleProps = {
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


