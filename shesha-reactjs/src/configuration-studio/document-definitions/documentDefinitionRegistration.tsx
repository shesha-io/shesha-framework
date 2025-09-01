import { useConfigurationStudioDocumentDefinitions } from '../cs/hooks';
import { DocumentDefinition } from '../models';

export interface IDocumentDefinitionRegistrationProps {
    definitions: DocumentDefinition[];
}

export const DocumentDefinitionRegistration = (props: IDocumentDefinitionRegistrationProps) => {
    useConfigurationStudioDocumentDefinitions(props.definitions);
    return null;
};
