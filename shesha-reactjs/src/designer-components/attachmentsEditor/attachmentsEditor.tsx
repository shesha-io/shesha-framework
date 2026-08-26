import { FolderAddOutlined } from '@ant-design/icons';
import { CSSProperties, useEffect, useMemo } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { DataTypes } from '@/interfaces';
import { IInputStyles, IStyleValue, useForm, useFormData } from '@/providers';
import {
  evaluateString,
  executeScriptSync,
  useAvailableConstantsData,
} from '@/providers/form/utils';
import { AttachmentsEditorProvider } from '@/providers/storedFiles';
import { getSettings } from './settingsForm';
import {
  migrateCustomFunctions,
  migrateHiddenToVisible,
  migratePropertyName,
  migrateReadOnly,
  migrateStylingBoxToJson,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { GHOST_PAYLOAD_KEY } from '@/utils/form';
import { containerDefaultStyles, defaultStyles, downloadedFileDefaultStyles, thumbnailDefaultStyles } from './utils';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { AdvancedFormats } from '@/interfaces/dataTypes';
import { FILE_EVENTS_WITHOUT_CHANGE, getComponentEvents } from '../_common/events';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { getIdOrUndefined } from '@/utils/entity';
import CustomFile from '@/components/customFile';
import { OnFileDownloaded, OnFileListChanged } from '@/providers/storedFiles/models';
import { StoredFileModel } from '@/utils/storedFile/models';
import { AttachmentsEditorComponentDefinition, IAttachmentsEditorDeviceStyles, IAttachmentsEditorProps } from './interfaces';
import { swapContainerAndThumbnailStyles } from './migrations/migrate-style-sets';
import { useStyles } from './styles';
import { useActualContextExecution } from '@/hooks';
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { FileListApi, StoredFileApiModel } from '../../componentsApi/componentApi';

import apiCode from "../../componentsApi/componentApi.ts?raw";

export type { LayoutType, ListType, IAttachmentsEditorDeviceStyles, IAttachmentsEditorProps } from './interfaces';

/** Keeps the events wrapper out of the layout; see the note at its use site. */
const DISPLAY_CONTENTS: CSSProperties = { display: 'contents' };

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
  existingContainer: Partial<IStyleValue>,
  defaultContainer: IStyleValue,
): Partial<IStyleValue> => {
  return {
    stylingBox: isNotNullOrWhiteSpace(props.stylingBox)
      ? props.stylingBox
      : typeof (existingContainer.stylingBox) === "string" && isNotNullOrWhiteSpace(existingContainer.stylingBox)
        ? existingContainer.stylingBox
        : defaultContainer.stylingBox,
    style: isNotNullOrWhiteSpace(props.style)
      ? props.style
      : isNotNullOrWhiteSpace(props.containerStyle)
        ? props.containerStyle
        : isNotNullOrWhiteSpace(existingContainer.style)
          ? existingContainer.style
          : defaultContainer.style,
    dimensions: {
      ...(existingContainer.dimensions || defaultContainer.dimensions),
      width: isNotNullOrWhiteSpace(props.width)
        ? props.width
        : isDefined(existingContainer.dimensions?.width)
          ? existingContainer.dimensions.width
          : 'auto',
      height: isNotNullOrWhiteSpace(props.height)
        ? props.height
        : isDefined(existingContainer.dimensions?.height)
          ? existingContainer.dimensions.height
          : 'auto',
      maxWidth: isNotNullOrWhiteSpace(props.maxWidth)
        ? props.maxWidth
        : isDefined(existingContainer.dimensions?.maxWidth)
          ? existingContainer.dimensions.maxWidth
          : 'auto',
      maxHeight: isNotNullOrWhiteSpace(props.maxHeight)
        ? props.maxHeight
        : isDefined(existingContainer.dimensions?.maxHeight)
          ? existingContainer.dimensions.maxHeight
          : '140px',
      minWidth: isNotNullOrWhiteSpace(props.minWidth)
        ? props.minWidth
        : isDefined(existingContainer.dimensions?.minWidth)
          ? existingContainer.dimensions.minWidth
          : '0px',
      minHeight: isNotNullOrWhiteSpace(props.minHeight)
        ? props.minHeight
        : isDefined(existingContainer.dimensions?.minHeight)
          ? existingContainer.dimensions.minHeight
          : '0px',
    },
  };
};

// Helper function to migrate font properties
const migrateFontProperties = (
  props: LegacyStyleProps,
  existingFont: IStyleValue['font'],
): IStyleValue['font'] => {
  // Define valid text alignment values based on what AlignSetting accepts
  const validAlignValues = ['left', 'center', 'right'] as const;
  type ValidAlign = typeof validAlignValues[number];

  const normalizeAlign = (align: string | undefined): ValidAlign => {
    if (isNotNullOrWhiteSpace(align) && validAlignValues.includes(align as ValidAlign)) {
      return align as ValidAlign;
    }
    return 'left'; // Default fallback
  };

  return {
    ...existingFont,
    size: isDefined(props.fontSize) ? props.fontSize : existingFont?.size,
    color: isNotNullOrWhiteSpace(props.fontColor) ? props.fontColor : existingFont?.color,
    weight: isNotNullOrWhiteSpace(props.fontWeight) ? props.fontWeight : existingFont?.weight,
    type: isNotNullOrWhiteSpace(props.fontFamily) ? props.fontFamily : existingFont?.type,
    align: normalizeAlign(props.fontAlign ?? existingFont?.align),
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

const AttachmentsEditor: AttachmentsEditorComponentDefinition = {
  allowInherit: true,
  type: 'attachmentsEditor',
  isInput: true,
  name: 'File list',
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.advanced && dataFormat === AdvancedFormats.fileList,
  icon: <FolderAddOutlined />,
  Factory: ({ model, apiContext }) => {
    const form = useForm();
    const { data } = useFormData();
    const executionContext = useAvailableConstantsData();
    /* Resolve the template against the DataContext model (application/page/form/contexts) rather
       than the deprecated GlobalState. The context bag still exposes `globalState`, so an existing
       `{{globalState.x}}` owner template keeps resolving. */
    const ownerId = evaluateString(model.ownerId, executionContext);
    const resolvedOwnerId = isNotNullOrWhiteSpace(ownerId) ? ownerId : getIdOrUndefined(data) ?? "";

    // Both non-editable modes stop the user mutating the attachment list: read-only shows the files
    // as a plain, still-downloadable list, and disabled greys the whole control out. Anything that
    // would change the list has to be suppressed in both, so they are combined into one flag here
    // and `disabled` is passed on separately for the greying.
    const isDisabled = model.disabled === true;
    const enabled = model.readOnly !== true && !isDisabled;

    /* The framework evaluates only the root `model.style` into `model.styleCss`; the two nested
       Custom style scripts are not executed for us, so a nested panel would otherwise save a value
       that never renders. */
    const thumbnailStyleCss = useActualContextExecution<CSSProperties>(model.thumbnail?.style, undefined, {});
    const downloadedFileStyleCss = useActualContextExecution<CSSProperties>(model.downloadedFileStyles?.style, undefined, {});

    const { styles } = useStyles({ ...model, thumbnailStyleCss, downloadedFileStyleCss });

    /* Both are device-scoped (see IAttachmentsEditorDeviceStyles). The framework merges the active
       device's style set onto the root before the Factory runs, so the value on `model` is already
       the device one — but the root declaration it resolves through is the deprecated pre-migration
       property. Reading via the device-styles view says which of the two is meant, and keeps the
       deprecated declaration reserved for migration 20, its only remaining reader. */
    const { styleDownloadedFiles = false, downloadedIcon } = model as IAttachmentsEditorDeviceStyles;


    /* The renderer marks a downloaded file by colour, and reads that colour off a plain
       CSSProperties object. Compose it from the Font panel with the evaluated Custom style last, so
       Custom wins — the same precedence the other style sets use. Only emitted when the feature is
       on; otherwise the renderer falls back to its own default. */
    const downloadedFileCss = useMemo<CSSProperties | undefined>(
      () => styleDownloadedFiles
        ? {
          ...(isNotNullOrWhiteSpace(model.downloadedFileStyles?.font?.color)
            ? { color: model.downloadedFileStyles.font.color }
            : {}),
          ...downloadedFileStyleCss,
        }
        : undefined,
      [styleDownloadedFiles, model.downloadedFileStyles?.font, downloadedFileStyleCss],
    );

    const componentApi = useComponentApi();
    useEffect(() => {
      componentApi?.updateApi<FileListApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'FileListApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [
          { name: 'allowAdd', getter: () => enabled && model.allowAdd },
          { name: 'allowDelete', getter: () => enabled && model.allowDelete },
          { name: 'allowReplace', getter: () => enabled && model.allowReplace },
          { name: 'allowRename', getter: () => enabled && model.allowRename },
          {
            name: 'allowedFileTypes',
            getter: () => model.allowedFileTypes,
            setter: (value: string[] | undefined) => apiContext?.updateApiModel({ allowedFileTypes: value }),
          },
          /* Override the framework's generic `value` property, which every isInput component gets at
             level 1. Its setter writes to `propertyName` — for this component the GHOST_PAYLOAD_KEY
             placeholder that `removeGhostKeys` strips before save — so assigning would appear to
             work and then be discarded. The files belong to the storage provider, so the setter is
             explicitly replaced with one that warns rather than omitted: omitting it would fall back
             to the level-1 setter (see createOrUpdateApiProperty) and change nothing. */
          {
            name: 'value',
            getter: () => {
              const files = (data as Record<string, unknown> | undefined)?.[`${GHOST_PAYLOAD_KEY}_${model.id}`] as StoredFileModel[] | undefined;
              /* The public model is narrower than the internal one (which carries upload-time fields
                 like `uid`, `status` and `temporary`), so map rather than cast. */
              return files?.map((file): StoredFileApiModel => ({
                id: file.id ?? file.uid,
                name: file.name,
                size: file.size ?? 0,
                type: file.type ?? '',
                url: file.url ?? undefined,
              }));
            },
            setter: () => console.warn(
              `'${model.componentName ?? 'File list'}': value is read-only. Files are managed by the storage provider — add or remove them through the component.`,
            ),
          },
        ],
        // The list has no focusable control of its own — files are added through the antd Upload
        // trigger — so no `focus` is registered rather than one that would do nothing.
        api: {},
      });
    }, [
      apiContext, componentApi, data, enabled, model.allowAdd, model.allowDelete, model.allowRename,
      model.allowReplace, model.allowedFileTypes, model.componentName, model.id,
    ]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

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
        {(value, onChange, _, ctx) => {
          const onFileListChanged: OnFileListChanged = (fileList, isUserAction = false): void => {
            onChange(fileList);
            // Only execute custom script if this is a user action (upload/delete)
            if (isUserAction && isNotNullOrWhiteSpace(model.onChangeCustom)) {
              ctx?.handleEvent(undefined, { value: fileList }, model.onChangeCustom);
            }
          };

          const onDownload: OnFileDownloaded = (fileList, isUserAction = false): void => {
            onChange(fileList);
            // Only execute custom script if this is a user action (download)
            if (isUserAction && isNotNullOrWhiteSpace(model.onDownload)) executeScript(model.onDownload, fileList);
          };

          /* onChange is bound above instead: it also has to update the component's value, which
             getComponentEvents does not do. */
          const listEvents = getComponentEvents<StoredFileModel[]>(
            model, FILE_EVENTS_WITHOUT_CHANGE, ctx, value ?? undefined, DataTypes.array,
          );
          return (
            <AttachmentsEditorProvider
              name={model.componentName}
              ownerId={resolvedOwnerId}
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
              <div style={DISPLAY_CONTENTS} {...listEvents}>
                <CustomFile
                  isStub={form.formMode === 'designer'}
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
                  disabled={isDisabled}
                  allowAdd={enabled && model.allowAdd}
                  allowDelete={enabled && model.allowDelete}
                  allowReplace={enabled && model.allowReplace}
                  allowRename={enabled && model.allowRename}
                  allowViewHistory={model.allowViewHistory}
                  thumbnail={model.thumbnail}
                  thumbnailStyleCss={thumbnailStyleCss}
                  /* The four popups are portalled to the body, so no descendant selector from the
                     field can reach them — each needs its class handed over explicitly. */
                  classNames={{
                    actionsPopover: styles.actionsPopover,
                    historyPopover: styles.historyPopover,
                    confirmPopover: styles.confirmPopover,
                    previewMask: styles.previewMask,
                  }}
                  enableStyleOnReadonly={model.enableStyleOnReadonly}
                  ownerId={resolvedOwnerId}
                  downloadedFileStyles={downloadedFileCss}
                  styleDownloadedFiles={styleDownloadedFiles}
                  downloadedIcon={styleDownloadedFiles ? downloadedIcon : undefined}
                />
              </div>
            </AttachmentsEditorProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,

  linkToModelMetadata: (model, metadata) => ({
    ...model,
    filesCategory: metadata.path,
  }),
  getDefaultStyles: () => defaultStyles(),
  // remove field from the payload even if propertyName is provided
  getFieldsToFetch: () => [],
  previewConfiguration: {
    type: 'attachmentsEditor',
    id: 'attachmentsEditor',
    propertyName: 'fileListAppearance',
    label: 'File List Label',
    version: 'latest',
    listType: 'thumbnail',
    allowAdd: true,
    allowDelete: true,
    allowReplace: true,
    allowRename: true,
    allowViewHistory: true,
    ownerId: '',
    ownerType: '',
  },
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
    .add<IAttachmentsEditorProps>(7, (prev, context) => context.isNew === true
      ? prev
      : { ...prev, desktop: { ...defaultStyles(), container: containerDefaultStyles() }, mobile: { ...defaultStyles() }, tablet: { ...defaultStyles() } })
    .add<IAttachmentsEditorProps>(8, (prev) => ({ ...prev, downloadZip: prev.downloadZip ?? false, propertyName: prev.propertyName ?? '', onChangeCustom: prev.onFileChanged }))
    .add<IAttachmentsEditorProps>(9, (prev, context) => context.isNew === true
      ? prev
      : {
        ...prev,
        desktop: {
          ...defaultStyles(),
          container: {
            ...containerDefaultStyles(),
            stylingBox: isNotNullOrWhiteSpace(prev.stylingBox) ? prev.stylingBox : '{}',
            style: prev.style ?? '',
          },
        },
        mobile: {
          ...defaultStyles(),
          container: {
            ...containerDefaultStyles(),
            stylingBox: isNotNullOrWhiteSpace(prev.stylingBox) ? prev.stylingBox : '{}',
            style: prev.style ?? '',
          },
        },
        tablet: {
          ...defaultStyles(),
          container: {
            ...containerDefaultStyles(),
            stylingBox: isNotNullOrWhiteSpace(prev.stylingBox) ? prev.stylingBox : '{}',
            style: prev.style ?? '',
          },
        },
      })
    .add<IAttachmentsEditorProps>(10, (prev) => ({ ...prev, downloadZip: prev.downloadZip ?? false, propertyName: prev.propertyName ?? '' }))
    .add<IAttachmentsEditorProps>(11, (prev) => ({ ...prev, propertyName: prev.propertyName ?? '', onChangeCustom: prev.onFileChanged }))
    .add<IAttachmentsEditorProps>(12, (prev, context) => context.isNew === true
      ? prev
      : {
        ...prev, desktop: { ...prev.desktop, downloadedFileStyles: { ...downloadedFileDefaultStyles() } },
        mobile: { ...prev.mobile, downloadedFileStyles: { ...downloadedFileDefaultStyles() } },
        tablet: { ...prev.tablet, downloadedFileStyles: { ...downloadedFileDefaultStyles() } },
      })
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

        const existingContainer = (result[device] as IInputStyles).container ?? { ...containerDefaultsCache };
        const existingFont = result[device].font ?? { ...defaultStylesCache.font };

        const containerUpdates = migrateContainerProperties(prev, existingContainer, containerDefaultsCache);
        const fontUpdates = migrateFontProperties(prev, existingFont);

        (result[device] as IInputStyles).container = { ...existingContainer, ...containerUpdates };
        result[device].font = fontUpdates;
      });

      // Clean up legacy properties
      removeLegacyProperties(result);

      return result;
    })
    .add<IAttachmentsEditorProps>(14, (prev, context) => ({ ...prev, downloadZip: context.isNew ?? false ? false : prev.downloadZip }))
    .add<IAttachmentsEditorProps>(15, (prev) => ({
      ...prev,
      desktop: {
        ...prev.desktop,
        filesLayout: prev.desktop?.filesLayout ?? prev.filesLayout ?? 'horizontal',
        gap: prev.desktop?.gap ?? prev.gap ?? 8,
      },
      mobile: {
        ...prev.mobile,
        filesLayout: prev.mobile?.filesLayout ?? prev.filesLayout ?? 'horizontal',
        gap: prev.mobile?.gap ?? prev.gap ?? 8,
      },
      tablet: {
        ...prev.tablet,
        filesLayout: prev.tablet?.filesLayout ?? prev.filesLayout ?? 'horizontal',
        gap: prev.tablet?.gap ?? prev.gap ?? 8,
      },
    }))
    /* Freeze the appearance of every already-saved component by baking the real defaults into all
       three device models, so a later change to `defaultStyles()` cannot shift how an existing form
       renders. A newly dropped component skips this and inherits from metadata instead. */
    .add<IAttachmentsEditorProps>(16, (prev, context) => {
      return context.isNew === true
        ? prev
        : { ...migratePrevStyles(prev, defaultStyles()) };
    })
    .add<IAttachmentsEditorProps>(17, (prev) => {
      return swapContainerAndThumbnailStyles(prev);
    })
    .add<IAttachmentsEditorProps>(18, (prev) => {
      const withThumbnail = (device: IAttachmentsEditorDeviceStyles | undefined): IAttachmentsEditorDeviceStyles | undefined =>
        isDefined(device)
          ? { ...device, thumbnail: { ...thumbnailDefaultStyles(), ...device.thumbnail } }
          : device;

      return {
        ...prev,
        desktop: withThumbnail(prev.desktop),
        tablet: withThumbnail(prev.tablet),
        mobile: withThumbnail(prev.mobile),
      };
    })
  /* Rename-only step: runs for new and old alike, and carries the permissions that used to live on
       the Security tab onto the Visible / Interaction Mode settings. */
    .add<IAttachmentsEditorProps>(19, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev))))
    .add<IAttachmentsEditorProps>(20, (prev) => {
      const withDownloadedFlags = (device: IAttachmentsEditorDeviceStyles | undefined): IAttachmentsEditorDeviceStyles | undefined =>
        isDefined(device)
          ? {
            ...device,
            styleDownloadedFiles: device.styleDownloadedFiles ?? prev.styleDownloadedFiles ?? false,
            downloadedIcon: device.downloadedIcon ?? prev.downloadedIcon ?? 'CheckCircleOutlined',
          }
          : device;

      return {
        ...prev,
        desktop: withDownloadedFlags(prev.desktop),
        tablet: withDownloadedFlags(prev.tablet),
        mobile: withDownloadedFlags(prev.mobile),
      };
    }),
};

export default AttachmentsEditor;
