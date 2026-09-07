import { BaseComponentApi, IBaseContainerStyles, ICommonStyles, BaseInputComponentApi, ICommonInputComponentStyles, ICommonInputStyles, IBaseComponentStyles, ICommonComponentStyles } from "@/componentsApi/componentApi";
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

const getBaseContainerStyleObject = (args: IUpdateApiArgs): IBaseContainerStyles => {
  const { componentApi, apiModel, setApiStyles } = args;

  const style = {} as ICommonStyles;
  componentApi.createOrUpdateApiProperty(style, { name: 'background', getter: () => apiModel.background, setter: (value) => updateApiModel(setApiStyles, { background: value as IBackgroundValue }) });
  componentApi.createOrUpdateApiProperty(style, { name: 'border', getter: () => apiModel.border, setter: (value) => updateApiModel(setApiStyles, { border: value as IBorderValue }) });
  componentApi.createOrUpdateApiProperty(style, { name: 'shadow', getter: () => apiModel.shadow, setter: (value) => updateApiModel(setApiStyles, { shadow: value as IShadowValue }) });
  componentApi.createOrUpdateApiProperty(style, { name: 'styleBox', getter: () => apiModel.stylingBoxJson, setter: (value) => updateApiModel(setApiStyles, { stylingBoxJson: value as StyleBoxValue }) });
  return style;
};

const getCommonComponentStyleObject = (args: IUpdateApiArgs): ICommonStyles => {
  const { componentApi, apiModel, setApiStyles } = args;

  const style = getBaseContainerStyleObject(args) as ICommonStyles;
  componentApi.createOrUpdateApiProperty(style, { name: 'font', getter: () => apiModel.font, setter: (value) => updateApiModel(setApiStyles, { font: value as IFontValue }) });

  return style;
};

const getBaseContainerStyleProperties = (args: IUpdateApiArgs): ComponentApiProperty<IBaseComponentStyles> => {
  const style = getBaseContainerStyleObject(args);
  return { name: 'styles', getter: () => style };
};

const getCommonComponentStyleProperties = (args: IUpdateApiArgs): ComponentApiProperty<ICommonComponentStyles> => {
  const style = getCommonComponentStyleObject(args);
  return { name: 'styles', getter: () => style };
};

const getInputComponentStyleProperties = (args: IUpdateApiArgs): ComponentApiProperty<ICommonInputComponentStyles> => {
  const { componentApi, apiModel, setApiStyles } = args;

  const editor = getCommonComponentStyleObject(args);

  const wrapper = {} as ICommonInputStyles['wrapper'];
  componentApi.createOrUpdateApiProperty(wrapper, { name: 'styleBox', getter: () => apiModel.stylingBoxJson, setter: (value) => updateApiModel(setApiStyles, { stylingBoxJson: value as StyleBoxValue }) });

  const style: ICommonInputStyles = { editor, wrapper };
  componentApi.createOrUpdateApiProperty(style, { name: 'editor', getter: () => editor });
  componentApi.createOrUpdateApiProperty(style, { name: 'wrapper', getter: () => wrapper });

  return { name: 'styles', getter: () => style };
};

export const updateApi = (args: IUpdateApiArgs): void => {
  const { componentApi, shaForm, model, apiModel, toolboxComponent, setApiModel } = args;

  if (isNullOrWhiteSpace(model.componentName))
    return;

  const propertyName = model.propertyName ?? "";
  const baseApi = {
    id: model.id,
    componentName: model.componentName,
    componentModel: model,
    level: 1,
    isInput: toolboxComponent?.isInput ?? false,
  };

  // common Api
  const commonApi: IComponentApiDescription<BaseComponentApi> = {
    ...baseApi,
    typeDefinition: { typeName: 'BaseComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
    api: {
      componentName: model.componentName,
      context: model.context,
      propertyName: propertyName,
    },
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
  componentApi.updateApi<BaseComponentApi>(commonApi);

  // input styles

  if (toolboxComponent?.styleGroup === 'common-containers') {
    const styleApi: IComponentApiDescription<IBaseComponentStyles> = {
      ...baseApi,
      typeDefinition: { typeName: 'CommonContainerComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
      properties: [getBaseContainerStyleProperties(args)],
    };
    componentApi.updateApi<IBaseComponentStyles>(styleApi);
  }

  if (toolboxComponent?.styleGroup === 'common') {
    const styleApi: IComponentApiDescription<ICommonComponentStyles> = {
      ...baseApi,
      typeDefinition: { typeName: 'CommonComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
      properties: [getCommonComponentStyleProperties(args)],
    };
    componentApi.updateApi<ICommonComponentStyles>(styleApi);
  }

  // input common Api
  if (toolboxComponent?.isInput === true) {
    const inputApi: IComponentApiDescription<BaseInputComponentApi> = {
      ...baseApi,
      typeDefinition: { typeName: 'BaseInputComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
      api: {
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
      },
      properties: [
        { name: 'required', getter: () => apiModel.validate?.required === true, setter: (v) => updateApiModel(setApiModel, { validate: { required: v } }) },
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
      ],
    };
    componentApi.updateApi<BaseInputComponentApi>(inputApi);

    if (toolboxComponent.styleGroup === 'inputs') {
      const styleApi: IComponentApiDescription<ICommonInputComponentStyles> = {
        ...baseApi,
        typeDefinition: { typeName: 'CommonInputComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [getInputComponentStyleProperties(args)],
      };
      componentApi.updateApi<ICommonInputComponentStyles>(styleApi);
    }
  }
};
