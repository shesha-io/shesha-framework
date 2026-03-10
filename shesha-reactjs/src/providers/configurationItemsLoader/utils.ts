import { ConfigurableItemIdentifier, FormMarkupWithSettings, IFormDto, IReferenceListIdentifier, isConfigurableItemFullName, isConfigurableItemRawId } from '@/interfaces';
import { getFormFullName } from '@/utils/form';
import { FormIdentifier } from '../form/models';
import { FormConfigurationDto } from './models';

export const getConfigurationNotFoundMessage = (configurationType: string, configurationId: ConfigurableItemIdentifier): string => {
  if (isConfigurableItemRawId(configurationId)) return `${configurationType} with id='${configurationId}' not found`;

  if (isConfigurableItemFullName(configurationId)) return `${configurationType} '${getFormFullName(configurationId.module, configurationId.name)}' not found`;

  return `${configurationType} not found`;
};

export const getFormNotFoundMessage = (formId: FormIdentifier): string => getConfigurationNotFoundMessage("Form", formId);
export const getReferenceListNotFoundMessage = (refListId?: IReferenceListIdentifier): string => getConfigurationNotFoundMessage("Reference list", refListId);

export const getConfigurationForbiddenMessage = (configurationType: string, configurationId: ConfigurableItemIdentifier): string => {
  if (isConfigurableItemRawId(configurationId)) return `You are not authorized to access the ${configurationType} with id='${configurationId}'`;

  if (isConfigurableItemFullName(configurationId)) return `You are not authorized to access the ${configurationType} '${getFormFullName(configurationId.module, configurationId.name)}'`;

  return `${configurationType} not found`;
};

export const getFormForbiddenMessage = (formId: FormIdentifier): string => getConfigurationForbiddenMessage("form", formId);

const getMarkupFromResponse = (data: FormConfigurationDto): FormMarkupWithSettings | null => {
  const markupJson = data.markup;
  return markupJson ? (JSON.parse(markupJson) as FormMarkupWithSettings) : null;
};

export const convertFormConfigurationDto2FormDto = (dto: FormConfigurationDto, readOnly: boolean): IFormDto => {
  const markupWithSettings = getMarkupFromResponse(dto);

  const result: IFormDto = {
    id: dto.id,
    name: dto.name,
    module: dto.module,
    label: dto.label,
    description: dto.description,
    modelType: dto.modelType,
    markup: markupWithSettings?.components ?? null,
    settings: markupWithSettings?.formSettings ?? null,
    access: dto.access,
    permissions: dto.permissions,
    readOnly: readOnly,
  };

  if (result.settings) {
    // there can be string for some old forms
    const rawAccess = result.settings.access ?? dto.access;
    let normalizedAccess: number;
    if (typeof rawAccess === 'string') {
      const parsed = parseInt(rawAccess, 10);
      normalizedAccess = Number.isNaN(parsed) ? 3 : parsed;
    } else if (typeof rawAccess === 'number') {
      normalizedAccess = rawAccess;
    } else {
      normalizedAccess = 3;
    }
    result.settings.access = normalizedAccess;
    result.settings.permissions = result.settings.permissions ?? dto.permissions;
  }

  return result;
};
