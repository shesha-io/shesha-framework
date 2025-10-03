import { ConfigurableItemIdentifier, IReferenceListIdentifier, isConfigurableItemFullName, isConfigurableItemRawId } from '@/interfaces';
import { getFormFullName } from '@/utils/form';
import { FormIdentifier } from '../form/models';

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
