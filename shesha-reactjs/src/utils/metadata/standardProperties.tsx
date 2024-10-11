import { TypeDefinition } from '@/interfaces/metadata';
import { messageApiDefinition } from "@/providers/sourceFileManager/api-utils/message";
import { httpApiDefinition } from "@/providers/sourceFileManager/api-utils/http";
import { MetadataBuilderAction } from '@/utils/metadata/metadataBuilder';
import { globalStateApiDefinition } from '@/providers/sourceFileManager/api-utils/globalState';
import { formApiDefinition } from '@/providers/sourceFileManager/api-utils/form';
import { queryStringValuesDefinition } from '@/providers/sourceFileManager/api-utils/queryString';
import { metadataSourceCode, metadataBuilderSourceCode } from '@/publicJsApis';

export const SheshaConstants = {
  http: "shesha:http",
  message: "shesha:message",
  moment: "shesha:moment",
  globalState: "shesha:globalState",
  setGlobalState: "shesha:setGlobalState",
  selectedRow: "shesha:selectedRow",
  contexts: "shesha:contexts",
  pageContext: "shesha:pageContext",
  form: "shesha:form",
  formData: "shesha:formData",
  application: "shesha:application",
  query: "shesha:query",
  metadataBuilder: "shesha:metadataBuilder",
  constantsBuilder: "shesha:constantsBuilder",
};

export const registerHttpAction: MetadataBuilderAction = (builder, name = "http") => {
  builder.addCustom(name, "axios instance used to make http requests", () => {
    const definition: TypeDefinition = {
      typeName: 'HttpClientApi',
      files: [{ content: httpApiDefinition, fileName: 'apis/http.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerMessageAction: MetadataBuilderAction = (builder, name = "message") => {
  builder.addCustom(name, "API for displaying toast messages", () => {
    const definition: TypeDefinition = {
      typeName: 'MessageApi',
      files: [{ content: messageApiDefinition, fileName: 'apis/message.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerMomentAction: MetadataBuilderAction = (builder, name = "moment") => {
  builder.addCustom(name, "The moment.js object", () => {
    return fetch("https://unpkg.com/moment@2.25.3/ts3.1-typings/moment.d.ts", { mode: 'no-cors' })
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
  });
};

export const registerGlobalStateAction: MetadataBuilderAction = (builder, name = "globalState") => {
  builder.addCustom(name, "The global state of the application", () => {
    const definition: TypeDefinition = {
      typeName: 'GlobalStateType',
      files: [{ content: globalStateApiDefinition, fileName: 'apis/globalState.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerSetGlobalStateAction: MetadataBuilderAction = (builder, name = "setGlobalState") => {
  builder.addCustom(name, "Setting the global state of the application", () => {
    const definition: TypeDefinition = {
      typeName: 'SetGlobalStateType',
      files: [{ content: globalStateApiDefinition, fileName: 'apis/globalState.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerSelectedRowAction: MetadataBuilderAction = (builder, name = "selectedRow") => {
  builder.addCustom(name, "Selected row of nearest table (null if not available)", () => {
    const definition: TypeDefinition = {
      typeName: 'any',
      files: [],
    };
    return Promise.resolve(definition);
  });
};

export const registerContextsAction: MetadataBuilderAction = (builder, name = "contexts") => {
  builder.addCustom(name, "Contexts data", () => {
    const definition: TypeDefinition = {
      typeName: 'any',
      files: [],
    };
    return Promise.resolve(definition);
  });
};

export const registerPageContextAction: MetadataBuilderAction = (builder, name = "pageContext") => {
  builder.addCustom(name, "Contexts data of current page", () => {
    const definition: TypeDefinition = {
      typeName: 'any',
      files: [],
    };
    return Promise.resolve(definition);
  });
};

export const registerFormAction: MetadataBuilderAction = (builder, name = "form") => {
  builder.addCustom(name, "Form instance API", () => {
    const definition: TypeDefinition = {
      typeName: 'FormApi',
      files: [{ content: formApiDefinition, fileName: 'apis/form.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerQueryAction: MetadataBuilderAction = (builder, name = "query") => {
  builder.addCustom(name, "Query string values", () => {
    const definition: TypeDefinition = {
      typeName: 'ParsedQs',
      files: [{ content: queryStringValuesDefinition, fileName: 'apis/queryString.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerMetadataBuilderAction: MetadataBuilderAction = (builder, name = "metadataBuilder") => {
  builder.addCustom(name, "Metadata builder", () => {
    const definition: TypeDefinition = {
      typeName: 'IMetadataBuilder',
      files: [
        { content: metadataBuilderSourceCode, fileName: 'apis/metadataBuilder.d.ts' },
        { content: metadataSourceCode, fileName: 'apis/metadata.d.ts' }
      ],
    };
    return Promise.resolve(definition);
  });
};

export const registerConstantsBuilderAction: MetadataBuilderAction = (builder, name = "constantsBuilder") => {
  builder.addCustom(name, "Constants Builder", () => {
    const definition: TypeDefinition = {
      typeName: 'IObjectMetadataBuilder',
      files: [
        { content: metadataBuilderSourceCode, fileName: 'apis/metadataBuilder.d.ts' },
        { content: metadataSourceCode, fileName: 'apis/metadata.d.ts' }
      ],
    };
    return Promise.resolve(definition);
  });
};