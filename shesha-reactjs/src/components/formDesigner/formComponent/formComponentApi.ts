import { AnyComponentStyles, BaseComponentApi, CommonComponentApi, IComponentStyle, InputComponentApi, InputComponentStyles, InputStyles } from "@/componentsApi/componentApi";
import { IBackgroundValue, IBorderValue, IFontValue, IShadowValue } from "@/designer-components/_settings/utils";
import { IShaFormInstance } from "@/providers/form/store/interfaces";
import { EditMode, IConfigurableFormComponent, IStyleValue, StyleBoxValue } from "@/providers";
import { ComponentApiProperty, IComponentApi, IComponentApiDescription } from "@/providers/componentApi/model";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { deepMergeValues, getValueByPropertyName, removeUndefinedProps, setValueByPropertyName } from "@/utils/object";
import { IToolboxComponent, ValidateErrorEntity } from "@/interfaces";
import { isNonEmptyArray } from "@/utils/array";

import apiCode from "../../../componentsApi/componentApi.ts?raw";

export interface IDisabledAndReadOnly {
  disabled: boolean | undefined;
  readOnly: boolean | undefined;
}

export const getDisabledAndReadOnly = (mode: Exclude<EditMode, 'inherited'>): IDisabledAndReadOnly =>
  mode === false
    ? { disabled: true, readOnly: false }
    : mode === true
      ? { disabled: false, readOnly: false }
      : mode === 'editable'
        ? { disabled: false, readOnly: false }
        : mode === 'readOnly'
          ? { disabled: false, readOnly: true }
          : { disabled: true, readOnly: false };

export const updateApiModel = <T extends object>(func: (f: (prev: T) => T) => void, value: Partial<T>): void => {
  func((prev) => removeUndefinedProps(deepMergeValues(prev, value)) as T);
};

export interface IUpdateApiArgs {
  componentApi: IComponentApi;
  shaForm: IShaFormInstance;
  model: IConfigurableFormComponent;
  apiModel: Partial<IConfigurableFormComponent>;
  toolboxComponent: IToolboxComponent | undefined;
  setApiModel: (f: (prev: Partial<IConfigurableFormComponent>) => Partial<IConfigurableFormComponent>) => void;
  setApiStyles: (f: (prev: Partial<IStyleValue>) => Partial<IStyleValue>) => void;
}

const getCommonStyleProperties = (args: IUpdateApiArgs): ComponentApiProperty<CommonComponentApi> => {
  const { componentApi, apiModel, setApiStyles } = args;

  const style = {} as IComponentStyle;
  componentApi.createOrUpdateApiProperty(style, { name: 'font', getter: () => apiModel.font, setter: (value) => updateApiModel(setApiStyles, { font: value as IFontValue }) });
  componentApi.createOrUpdateApiProperty(style, { name: 'background', getter: () => apiModel.background, setter: (value) => updateApiModel(setApiStyles, { background: value as IBackgroundValue }) });
  componentApi.createOrUpdateApiProperty(style, { name: 'border', getter: () => apiModel.border, setter: (value) => updateApiModel(setApiStyles, { border: value as IBorderValue }) });
  componentApi.createOrUpdateApiProperty(style, { name: 'shadow', getter: () => apiModel.shadow, setter: (value) => updateApiModel(setApiStyles, { shadow: value as IShadowValue }) });
  componentApi.createOrUpdateApiProperty(style, { name: 'styleBox', getter: () => apiModel.stylingBoxJson, setter: (value) => updateApiModel(setApiStyles, { stylingBoxJson: value as StyleBoxValue }) });

  return { name: 'styles', getter: () => style };
};

const getInputStyleProperties = (args: IUpdateApiArgs): ComponentApiProperty<InputComponentStyles> => {
  const { componentApi, apiModel, setApiStyles } = args;

  const editor = {} as InputStyles['editor'];
  componentApi.createOrUpdateApiProperty(editor, { name: 'font', getter: () => apiModel.font, setter: (value) => updateApiModel(setApiStyles, { font: value as IFontValue }) });
  componentApi.createOrUpdateApiProperty(editor, { name: 'background', getter: () => apiModel.background, setter: (value) => updateApiModel(setApiStyles, { background: value as IBackgroundValue }) });
  componentApi.createOrUpdateApiProperty(editor, { name: 'border', getter: () => apiModel.border, setter: (value) => updateApiModel(setApiStyles, { border: value as IBorderValue }) });
  componentApi.createOrUpdateApiProperty(editor, { name: 'shadow', getter: () => apiModel.shadow, setter: (value) => updateApiModel(setApiStyles, { shadow: value as IShadowValue }) });
  componentApi.createOrUpdateApiProperty(editor, { name: 'styleBox', getter: () => apiModel.stylingBoxJson, setter: (value) => updateApiModel(setApiStyles, { stylingBoxJson: value as StyleBoxValue }) });

  const wrapper = {} as InputStyles['wrapper'];
  componentApi.createOrUpdateApiProperty(wrapper, { name: 'styleBox', getter: () => apiModel.stylingBoxJson, setter: (value) => updateApiModel(setApiStyles, { stylingBoxJson: value as StyleBoxValue }) });

  const style: InputStyles = { editor, wrapper };
  componentApi.createOrUpdateApiProperty(style, { name: 'editor', getter: () => editor });
  componentApi.createOrUpdateApiProperty(style, { name: 'wrapper', getter: () => wrapper });

  return { name: 'styles', getter: () => style };
};

export const updateApi = (args: IUpdateApiArgs): void => {
  const { componentApi, shaForm, model, apiModel, toolboxComponent, setApiModel } = args;

  if (isNullOrWhiteSpace(model.componentName))
    return;

  const propertyName = model.propertyName ?? "";
  // common Api
  const commonApi: IComponentApiDescription<InputComponentApi & AnyComponentStyles> = {
    id: model.id,
    componentName: model.componentName,
    componentModel: model,
    level: 1,
    isInput: toolboxComponent?.isInput ?? false,
    api: {
      componentName: model.componentName,
      context: model.context,
      propertyName: propertyName,
    },
    typeDefinition: { typeName: 'CommonComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
    skipUpdateTypeDefinitionIfExists: true,
    properties: [
      // component properties
      // use model.hidden because it's already filtered by some other means (eg permissions)
      { name: 'visible',
        // use Visible as actual configuration value
        getter: () => model.hidden !== true && apiModel.hidden !== true,
        // use hidden as value that will be send to the component; ToDo: AS - review visible|hidden properties.
        setter: (value) => updateApiModel(setApiModel, { hidden: model.hidden === true ? model.hidden : !value }),
      } as ComponentApiProperty<BaseComponentApi>,
      { name: 'interactionMode',
        getter: () => isDefined(apiModel.editMode) ? apiModel.editMode as EditMode : model.editMode as EditMode | undefined,
        setter: (value) => setApiModel((prev) => {
          const editMode = typeof value === 'boolean' ? value ? 'editable' : 'readOnly' : value;
          return { ...prev, editMode, readOnly: editMode === 'readOnly' ? true : editMode === 'inherited' ? prev.readOnly : false };
        }),
      } as ComponentApiProperty<BaseComponentApi>,
    ],
  };

  switch (toolboxComponent?.styleGroup) {
    case 'inputs':
      commonApi.properties?.push(getInputStyleProperties(args));
      break;
    case 'common':
      commonApi.properties?.push(getCommonStyleProperties(args));
      break;
  }

  // input common Api
  if (toolboxComponent?.isInput === true) {
    commonApi.api = {
      ...commonApi.api,
      isValid: () => !isNullOrWhiteSpace(propertyName)
        ? shaForm.antdForm.validateFields([propertyName], { validateOnly: true })
          .then(() => true).catch(() => false)
        : Promise.resolve(true),
      getErrors: () => !isNullOrWhiteSpace(propertyName)
        ? shaForm.antdForm.validateFields([propertyName], { validateOnly: true })
          .then(() => []).catch((e: ValidateErrorEntity) => isNonEmptyArray(e.errorFields) ? e.errorFields[0].errors : [])
        : Promise.resolve([]),
      reset: () => !isNullOrWhiteSpace(propertyName)
        ? shaForm.antdForm.resetFields([propertyName])
        : undefined,
    } as InputComponentApi;
    commonApi.typeDefinition = { typeName: 'InputComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] };

    commonApi.properties = [
      ...(commonApi.properties ?? []),
      ...[
        { name: 'required', getter: () => apiModel.validate?.required, setter: (v) => updateApiModel(setApiModel, { validate: { required: v } }) },
        {
          name: 'value',
          getter: () => !isNullOrWhiteSpace(propertyName)
            ? getValueByPropertyName(shaForm.formData as Record<string, unknown>, propertyName)
            : undefined,
          setter: (value) => {
            if (!isNullOrWhiteSpace(propertyName))
              shaForm.setFieldsValue(setValueByPropertyName({}, propertyName, value));
          },
        },
      ] as ComponentApiProperty<InputComponentApi>[],
    ];
  }

  componentApi.updateApi<InputComponentApi & AnyComponentStyles>(commonApi);
};
