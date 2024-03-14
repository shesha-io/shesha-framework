import { useMemo, useState } from "react";
import { MetadataBuilder } from "./metadataBuilder";
import { DataTypes, IObjectMetadata } from "@/interfaces";
import { FormFullName, useMetadata, useMetadataDispatcher } from "@/providers";
import { IModelMetadata, IPropertyMetadata, TypeDefinition, isEntityMetadata, isPropertiesArray } from "@/interfaces/metadata";
import { messageApiDefinition } from "@/providers/sourceFileManager/api-utils/message";
import { httpApiDefinition } from "@/providers/sourceFileManager/api-utils/http";
import { formApiDefinition } from "@/providers/sourceFileManager/api-utils/form";
import { globalStateApiDefinition } from "@/providers/sourceFileManager/api-utils/globalState";
import { useFormPersister } from "@/providers/formPersisterProvider";
import { SheshaCommonContexts } from "@/providers/dataContextManager/models";
import { useDataContextManager } from "@/providers/dataContextManager";

export interface AvailableConstantsArgs {
    formMetadata?: IModelMetadata;
    formId?: FormFullName;
    addGlobalConstants?: boolean;
}

export const useGlobalConstants = (): IPropertyMetadata[] => {
    const { getDataContext } = useDataContextManager();

    const [appContext] = useState<IPropertyMetadata>(() => {
        const appContext = getDataContext(SheshaCommonContexts.ApplicationContext);
        if (!appContext?.metadata?.properties)
            return undefined;

        return {
            path: SheshaCommonContexts.ApplicationContext,
            label: 'Application API',
            dataType: DataTypes.object,
            properties: appContext?.metadata?.properties,
        };
    });

    return [appContext];
};

export const useAvailableConstants = ({ formMetadata, formId, addGlobalConstants }: AvailableConstantsArgs): IObjectMetadata => {
    const { getMetadata } = useMetadataDispatcher();
    const globalProps = useGlobalConstants();

    const response = useMemo<IObjectMetadata>(() => {
        const metaBuilder = new MetadataBuilder();

        if (formId) {
            // add form model definition
            metaBuilder.addCustom("data", "Form values", ({ typeDefinitionBuilder }) => {
                const baseTypeGetter = formMetadata && isEntityMetadata(formMetadata)
                    ? getMetadata({ dataType: DataTypes.entityReference, modelType: formMetadata.entityType })
                        .then(meta => {
                            return isEntityMetadata(meta)
                                ? typeDefinitionBuilder.getEntityType({ name: meta.entityType, module: meta.entityModule })
                                : Promise.resolve(null);
                        })
                    : Promise.resolve(null);

                return baseTypeGetter.then(response => {
                    const commentBlock = `/**
 * Model of the ${formId.module}/${formId.name} form
 */`;
                    const modelDefinition = response
                        ? `import { ${response.typeName} } from '${response.filePath}';

${commentBlock}
export interface FormModel extends ${response.typeName} {
    [key: string]: any;
}`
                        : `${commentBlock}
export interface FormModel {
    [key: string]: any;
}`;
                    return typeDefinitionBuilder.makeFormType(formId, modelDefinition);
                });
            });
        };

        metaBuilder
            .addCustom("form", "Form instance API", () => {
                const definition: TypeDefinition = {
                    typeName: 'FormApi',
                    files: [{ content: formApiDefinition, fileName: 'apis/form.ts' }],
                };
                return Promise.resolve(definition);
            })
            .addCustom("formMode", "The form mode", () => {
                const definition: TypeDefinition = {
                    typeName: 'FormMode',
                    files: [{ content: formApiDefinition, fileName: 'apis/form.ts' }],
                };
                return Promise.resolve(definition);
            })
            .addCustom("message", "API for displaying toast messages", () => {
                const definition: TypeDefinition = {
                    typeName: 'MessageApi',
                    files: [{ content: messageApiDefinition, fileName: 'apis/message.ts' }],
                };
                return Promise.resolve(definition);
            })
            .addCustom("http", "axios instance used to make http requests", () => {
                const definition: TypeDefinition = {
                    typeName: 'HttpClientApi',
                    files: [{ content: httpApiDefinition, fileName: 'apis/http.ts' }],
                };
                return Promise.resolve(definition);
            })
            .addCustom("moment", "The moment.js object", () => {
                return fetch("https://unpkg.com/moment@2.25.3/ts3.1-typings/moment.d.ts")
                    .then(response => {
                        return response.text();
                    })
                    .then(response => {
                        const momentWrapper = `import moment from 'apis/moment';\r\ntype MomentApi = typeof moment;\r\nexport { MomentApi };`;
                        const definition: TypeDefinition = {
                            typeName: 'MomentApi',
                            files: [
                                { content: momentWrapper, fileName: 'apis/momentApi.ts' },
                                { content: response, fileName: 'apis/moment.d.ts' },
                            ],
                        };
                        return definition;
                    })
                    .catch(error => {
                        console.error("Failed to fetch moment.d.ts", error);
                        throw error;
                    });
            })
            .addCustom("globalState", "The global state of the application", () => {
                const definition: TypeDefinition = {
                    typeName: 'GlobalStateType',
                    files: [{ content: globalStateApiDefinition, fileName: 'apis/globalState.ts' }],
                };
                return Promise.resolve(definition);
            })
            .addCustom("setGlobalState", "Setting the global state of the application", () => {
                const definition: TypeDefinition = {
                    typeName: 'SetGlobalStateType',
                    files: [{ content: globalStateApiDefinition, fileName: 'apis/globalState.ts' }],
                };
                return Promise.resolve(definition);
            })
            .addCustom("selectedRow", "Selected row of nearest table (null if not available)", () => {
                const definition: TypeDefinition = {
                    typeName: 'any',
                    files: [],
                };
                return Promise.resolve(definition);
            })
            .addCustom("contexts", "Contexts data", () => {
                const definition: TypeDefinition = {
                    typeName: 'any',
                    files: [],
                };
                return Promise.resolve(definition);
            })
            .addGlobalConstants();
        const meta = metaBuilder.build();

        if (addGlobalConstants && globalProps && isPropertiesArray(meta.properties)) {
            meta.properties.push(...globalProps);
        }

        return meta;
    }, [formMetadata, formId, addGlobalConstants, globalProps]);

    return response;
};

export const useAvailableConstantsStandard = (): IObjectMetadata => {
    const meta = useMetadata(false);
    const { formProps } = useFormPersister(false) ?? {};
    const availableConstants = useAvailableConstants({
        formMetadata: meta?.metadata,
        formId: formProps ? { name: formProps.name, module: formProps.module } : undefined,
        addGlobalConstants: true,
    });
    return availableConstants;
};