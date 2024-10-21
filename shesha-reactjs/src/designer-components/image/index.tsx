import { IFormItem, IToolboxComponent } from '@/interfaces';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { FileImageOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { evaluateValue, getStyle, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import React, { CSSProperties } from 'react';
import {
  migrateCustomFunctions,
  migratePropertyName,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { StoredFileProvider, useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { ImageField, ImageSourceType } from './image';
import ConditionalWrap from '@/components/conditionalWrapper';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeUndefinedProps } from '@/utils/object';
import { useTheme } from 'antd-style';


export interface IImageStyleProps {
  height?: number | string;
  width?: number | string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'scale-down' | 'none';
  objectPosition?: string;
  filter?: string;
  borderSize?: number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  stylingBox?: string;
  opacity?: number;
  style?: string;
}
export interface IImageProps extends IConfigurableFormComponent, IFormItem, IImageStyleProps {
  url?: string;
  storedFileId?: string;
  base64?: string;
  dataSource?: ImageSourceType;
  ownerType?: string;
  ownerId?: string;
  fileCategory?: string;
  allowPreview?: boolean;
  allowedFileTypes?: string[];
  alt?: string;
}

const settingsForm = settingsFormJson as FormMarkup;

const ImageComponent: IToolboxComponent<IImageProps> = {
  type: 'image',
  name: 'Image',
  icon: <FileImageOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { formSettings } = useForm();
    const { globalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();
    const ownerId = evaluateValue(model.ownerId, { data, globalState });
    const theme = useTheme();

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      objectFit: model.objectFit,
      objectPosition: model.objectPosition,
      filter: model.filter,
      borderWidth: model.borderSize || 0,
      borderRadius: model.borderRadius,
      borderStyle: model.borderType || 'solid',
      borderColor: model.borderColor || theme.colorBorder,
      opacity: model.opacity,
      ...stylingBoxAsCSS
    });
    const jsStyle = getStyle(model.style, data);
    const finalStyle = removeUndefinedProps({...jsStyle, ...additionalStyles});
  
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const base64 = model.base64 || value;

          const readonly = model?.readOnly || model.dataSource === 'base64' && Boolean(model.base64);

          const val = model.dataSource === 'storedFile' 
            ? model.storedFileId || value?.id || value 
            : model.dataSource === 'base64'
              ? base64 
              : model.url || value;

          const fileProvider = child => {
            return (
              <StoredFileProvider 
                value={val}
                onChange={onChange}
                fileId={val}
                baseUrl={backendUrl}
                ownerId={Boolean(ownerId) ? ownerId : Boolean(data?.id) ? data?.id : ''}
                ownerType={
                  Boolean(model.ownerType) ? model.ownerType : Boolean(formSettings?.modelType) ? formSettings?.modelType : ''
                }
                fileCategory={model.fileCategory}
                propertyName={!model.context ? model.propertyName : null}
                //uploadMode={model.useSync ? 'sync' : 'async'}
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
              allowedFileTypes={model?.allowedFileTypes}
              height={model.height}
              width={model.width}
              imageSource={model.dataSource}
              styles={finalStyle}
              value={val}
              readOnly={readonly}
              onChange={onChange}
              allowPreview={model?.allowPreview}
              alt={model?.alt}
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
        url: Boolean(prev.url) ? {_mode: 'code', _code: prev.url} : null,
        storedFileId: Boolean(prev.storedFileId) ? {_mode: 'code', _code: prev.storedFileId} : null,
      } as any;
    })
    .add<IImageProps>(3, (prev) => ({...migrateFormApi.properties(prev)}))
    .add<IImageProps>(4, (prev) => ({...prev, dataSource: prev.dataSource as any === 'storedFileId' ? 'storedFile' : prev.dataSource}))
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

      return { ...prev, desktop: {...styles}, tablet: {...styles}, mobile: {...styles} };
    })
  ,
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default ImageComponent;


