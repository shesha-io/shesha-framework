import { FolderAddOutlined } from '@ant-design/icons';
import React from 'react';
import { IconType } from '@/components/shaIcon';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { DataTypes, IToolboxComponent } from '@/interfaces';
import { IStyleType, useForm, useFormData, useGlobalState } from '@/providers';
import { FormIdentifier, IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import {
  evaluateValueAsString,
  executeScriptSync,
  useAvailableConstantsData,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import { AttachmentsEditorProvider } from '@/providers/storedFiles';
import { getSettings } from './settings';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { GHOST_PAYLOAD_KEY } from '@/utils/form';
import { containerDefaultStyles, defaultStyles, downloadedFileDefaultStyles } from './utils';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { AdvancedFormats } from '@/interfaces/dataTypes';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { getIdOrUndefined } from '@/utils/entity';
import CustomFile from '@/components/customFile';
import { OnFileDownloaded, OnFileListChanged } from '@/providers/storedFiles/models';
import { StoredFileModel } from '@/utils/storedFile/models';

export type layoutType = 'vertical' | 'horizontal' | 'grid';
export type listType = 'text' | 'thumbnail';

const DEVICE_TYPES = ['desktop', 'mobile', 'tablet'] as const;
type DeviceType = typeof DEVICE_TYPES[number];

// Legacy properties from v0.43 that need migration
type LegacyStyleProps = Partial<{
  // Legacy container properties
  stylingBox: string;
  style: string;
  width: string;
  height: string;
  maxWidth: string;
  maxHeight: string;
  minWidth: string;
  minHeight: string;
  containerStyle: string;
  containerClass: string;
  // Legacy font properties
  fontSize: number;
  fontColor: string;
  fontWeight: string;
  fontFamily: string;
  fontAlign: string;
}>;

// Helper function to check if an object has legacy styling properties
const hasLegacyStyleProperties = (props: IAttachmentsEditorProps): props is LegacyStyleProps & IAttachmentsEditorProps => {
  const legacyContainerProps = [
    'stylingBox', 'style', 'width', 'height', 'maxWidth', 'maxHeight',
    'minWidth', 'minHeight', 'containerStyle', 'containerClass',
  ] as const;

  const legacyFontProps = [
    'fontSize', 'fontColor', 'fontWeight', 'fontFamily', 'fontAlign',
  ] as const;

  return legacyContainerProps.some((prop) => prop in props && props[prop as keyof IAttachmentsEditorProps] !== undefined) ||
    legacyFontProps.some((prop) => prop in props && props[prop as keyof IAttachmentsEditorProps] !== undefined);
};

// Helper function to migrate container-related properties
const migrateContainerProperties = (
  props: LegacyStyleProps,
  existingContainer: Partial<IStyleType>,
  defaultContainer: IStyleType,
): Partial<IStyleType> => {
  return {
    stylingBox: props.stylingBox || existingContainer.stylingBox || defaultContainer.stylingBox,
    style: props.style || props.containerStyle || existingContainer.style || defaultContainer.style,
    dimensions: {
      ...(existingContainer.dimensions || defaultContainer.dimensions),
      width: props.width || existingContainer.dimensions?.width || 'auto',
      height: props.height || existingContainer.dimensions?.height || 'auto',
      maxWidth: props.maxWidth || existingContainer.dimensions?.maxWidth || 'auto',
      maxHeight: props.maxHeight || existingContainer.dimensions?.maxHeight || '140px',
      minWidth: props.minWidth || existingContainer.dimensions?.minWidth || '0px',
      minHeight: props.minHeight || existingContainer.dimensions?.minHeight || '0px',
    },
  };
};

// Helper function to migrate font properties
const migrateFontProperties = (
  props: LegacyStyleProps,
  existingFont: IStyleType['font'],
): IStyleType['font'] => {
  // Define valid text alignment values based on what AlignSetting accepts
  const validAlignValues = ['left', 'center', 'right'] as const;
  type ValidAlign = typeof validAlignValues[number];

  const normalizeAlign = (align: string | undefined): ValidAlign => {
    if (align && validAlignValues.includes(align as ValidAlign)) {
      return align as ValidAlign;
    }
    return 'left'; // Default fallback
  };

  return {
    ...existingFont,
    size: props.fontSize || existingFont?.size,
    color: props.fontColor || existingFont?.color,
    weight: props.fontWeight || existingFont?.weight,
    type: props.fontFamily || existingFont?.type,
    align: normalizeAlign(props.fontAlign || existingFont?.align),
  };
};

// Helper function to remove legacy properties from the result object
const removeLegacyProperties = (result: Record<string, unknown>): void => {
  const legacyProps = [
    'stylingBox', 'style', 'width', 'height', 'maxWidth', 'maxHeight',
    'minWidth', 'minHeight', 'containerStyle', 'containerClass',
    'fontSize', 'fontColor', 'fontWeight', 'fontFamily', 'fontAlign',
  ];

  legacyProps.forEach((prop) => {
    delete result[prop];
  });
};

export interface IAttachmentsEditorProps extends IConfigurableFormComponent, IInputStyles {
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  filesCategory?: string | undefined;
  allowedFileTypes?: string[] | undefined;
  ownerName?: string | undefined;
  allowAdd: boolean;
  allowDelete: boolean;
  allowReplace: boolean;
  allowRename: boolean;
  allowViewHistory: boolean;
  customActions?: ButtonGroupItemProps[] | undefined;
  customContent?: boolean | undefined;
  extraFormId?: FormIdentifier | undefined;
  isDynamic?: boolean | undefined;
  isDragger?: boolean | undefined;
  maxHeight?: string | undefined;
  onFileChanged?: string | undefined;
  onDownload?: string | undefined;
  downloadZip?: boolean | undefined;
  filesLayout?: layoutType | undefined;
  listType: listType;
  thumbnailWidth?: string | undefined;
  thumbnailHeight?: string | undefined;
  borderRadius?: number | undefined;
  hideFileName?: boolean | undefined;
  container?: IStyleType | undefined;
  downloadedFileStyles?: IStyleType | undefined;
  styleDownloadedFiles?: boolean | undefined;
  downloadedIcon?: IconType | undefined;
}

const AttachmentsEditor: IToolboxComponent<IAttachmentsEditorProps> = {
  type: 'attachmentsEditor',
  isInput: true,
  name: 'File list',
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.advanced && dataFormat === AdvancedFormats.fileList,
  icon: <FolderAddOutlined />,
  Factory: ({ model }) => {
    const form = useForm();
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const executionContext = useAvailableConstantsData();
    const ownerId = evaluateValueAsString(`${model.ownerId}`, { data: data, globalState });
    const enabled = !model.readOnly;

    const {
      fullStyle: downloadedFileFullStyle,
    } = useFormComponentStyles(model.downloadedFileStyles ?? downloadedFileDefaultStyles());

    const executeScript = (script: string, value: unknown): void => {
      executeScriptSync(script, {
        value,
        ...executionContext,
      });
    };

    const hasExtraContent = Boolean(model.customContent);

    return (
      // Add GHOST_PAYLOAD_KEY to remove field from the payload
      // File list uses propertyName only for support Required feature
      <ConfigurableFormItem<StoredFileModel[]>
        model={{ ...model, propertyName: `${GHOST_PAYLOAD_KEY}_${model.id}` }}
        autoAlignLabel={false}
      >
        {(value, onChange) => {
          const onFileListChanged: OnFileListChanged = (fileList, isUserAction = false): void => {
            onChange(fileList);
            // Only execute custom script if this is a user action (upload/delete)
            if (isUserAction && model.onChangeCustom) executeScript(model.onChangeCustom, fileList);
          };

          const onDownload: OnFileDownloaded = (fileList, isUserAction = false): void => {
            onChange(fileList);
            // Only execute custom script if this is a user action (download)
            if (isUserAction && model.onDownload) executeScript(model.onDownload, fileList);
          };

          return (
            <AttachmentsEditorProvider
              name={model.componentName}
              ownerId={!isNullOrWhiteSpace(model.ownerId) ? ownerId ?? "" : getIdOrUndefined(data) ?? ""}
              ownerType={!isEntityTypeIdEmpty(model.ownerType)
                ? model.ownerType
                : !isEntityTypeIdEmpty(form.formSettings?.modelType)
                  ? form.formSettings.modelType
                  : ''}
              ownerName={model.ownerName}
              filesCategory={model.filesCategory}
              // used for requered field validation
              onChange={onFileListChanged}
              onDownload={onDownload}
              value={value ?? undefined}
            >
              <CustomFile
                isStub={form.formMode === 'designer'}
                disabled={model.readOnly}
                customActions={model.customActions}
                allowedFileTypes={model.allowedFileTypes}
                maxHeight={model.maxHeight}
                isDragger={model.isDragger}
                downloadZip={model.downloadZip}
                filesLayout={model.filesLayout}
                hasExtraContent={hasExtraContent}
                isDynamic={model.isDynamic}
                extraFormId={model.extraFormId}
                {...model}
                allowAdd={enabled && model.allowAdd}
                allowDelete={enabled && model.allowDelete}
                allowReplace={enabled && model.allowReplace}
                allowRename={enabled && model.allowRename}
                allowViewHistory={model.allowViewHistory}
                container={model.container}
                enableStyleOnReadonly={model.enableStyleOnReadonly}
                ownerId={ownerId}
                downloadedFileStyles={model.styleDownloadedFiles ? downloadedFileFullStyle : {}}
                downloadedIcon={model.styleDownloadedFiles ? model.downloadedIcon : undefined}
              />
            </AttachmentsEditorProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  linkToModelMetadata: (model, metadata) => ({
    ...model,
    filesCategory: metadata.path,
  }),
  // remove field from the payload even if propertyName is provided
  getFieldsToFetch: () => [],
  migrator: (m) => m
    .add<IAttachmentsEditorProps>(0, (prev) => {
      return {
        ...prev,
        allowAdd: true,
        allowDelete: true,
        allowReplace: true,
        allowRename: true,
        allowViewHistory: true,
        customActions: [],
        isDragger: false,
        ownerId: '',
        ownerType: '',
        ownerName: '',
        listType: 'text',
        filesLayout: 'horizontal',
        hideFileName: true,
        editMode: 'inherited',
      } satisfies IAttachmentsEditorProps;
    })
    .add<IAttachmentsEditorProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAttachmentsEditorProps>(2, (prev) => migrateVisibility(prev))
    .add<IAttachmentsEditorProps>(3, (prev) => migrateReadOnly(prev))
    .add<IAttachmentsEditorProps>(4, (prev) => ({ ...prev, downloadZip: true }))
    .add<IAttachmentsEditorProps>(5, (prev) => ({
      ...migrateFormApi.eventsAndProperties(prev),
      onFileChanged: migrateFormApi.withoutFormData(prev.onFileChanged),
    }))
    .add<IAttachmentsEditorProps>(6, (prev) => ({ ...prev, listType: isNullOrWhiteSpace(prev.listType) ? 'text' : prev.listType, filesLayout: prev.filesLayout ?? 'horizontal' }))
    .add<IAttachmentsEditorProps>(7, (prev) => ({ ...prev, desktop: { ...defaultStyles(), container: containerDefaultStyles() }, mobile: { ...defaultStyles() }, tablet: { ...defaultStyles() } }))
    .add<IAttachmentsEditorProps>(8, (prev) => ({ ...prev, downloadZip: prev.downloadZip || false, propertyName: prev.propertyName ?? '', onChangeCustom: prev.onFileChanged }))
    .add<IAttachmentsEditorProps>(9, (prev) => ({
      ...prev,
      desktop: {
        ...defaultStyles(),
        container: {
          ...containerDefaultStyles(),
          stylingBox: prev.stylingBox || '{}',
          style: prev.style || '',
        },
      },
      mobile: {
        ...defaultStyles(),
        container: {
          ...containerDefaultStyles(),
          stylingBox: prev.stylingBox || '{}',
          style: prev.style || '',
        },
      },
      tablet: {
        ...defaultStyles(),
        container: {
          ...containerDefaultStyles(),
          stylingBox: prev.stylingBox || '{}',
          style: prev.style || '',
        },
      },
    }))
    .add<IAttachmentsEditorProps>(10, (prev) => ({ ...prev, downloadZip: prev.downloadZip || false, propertyName: prev.propertyName ?? '' }))
    .add<IAttachmentsEditorProps>(11, (prev) => ({ ...prev, propertyName: prev.propertyName ?? '', onChangeCustom: prev.onFileChanged }))
    .add<IAttachmentsEditorProps>(12, (prev) => ({
      ...prev, desktop: { ...prev.desktop, downloadedFileStyles: { ...downloadedFileDefaultStyles() } },
      mobile: { ...prev.mobile, downloadedFileStyles: { ...downloadedFileDefaultStyles() } },
      tablet: { ...prev.tablet, downloadedFileStyles: { ...downloadedFileDefaultStyles() } },
    }))
    .add<IAttachmentsEditorProps>(13, (prev: IAttachmentsEditorProps) => {
      // Handle components with root-level styling properties from legacy imports
      // This covers v0.43 imports that have styling properties at root level instead of device-specific structure
      if (!hasLegacyStyleProperties(prev)) return prev;

      const result = { ...prev };

      // Cache default styles to avoid repeated function calls
      const defaultStylesCache = defaultStyles();
      const containerDefaultsCache = containerDefaultStyles();

      // Apply migrations to all device types without clobbering existing overrides
      DEVICE_TYPES.forEach((device: DeviceType) => {
        if (!result[device]) {
          result[device] = { ...defaultStylesCache };
        }

        const existingContainer = result[device].container ?? { ...containerDefaultsCache };
        const existingFont = result[device].font ?? { ...defaultStylesCache.font };

        const containerUpdates = migrateContainerProperties(prev, existingContainer, containerDefaultsCache);
        const fontUpdates = migrateFontProperties(prev, existingFont);

        result[device].container = { ...existingContainer, ...containerUpdates };
        result[device].font = fontUpdates;
      });

      // Clean up legacy properties
      removeLegacyProperties(result);

      return result;
    })
    .add<IAttachmentsEditorProps>(14, (prev, context) => ({ ...prev, downloadZip: context.isNew ? false : prev.downloadZip })),
};

export default AttachmentsEditor;
