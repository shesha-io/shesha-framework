import { TypeDefinition } from '@/interfaces/metadata';
import { messageApiDefinition } from "@/providers/sourceFileManager/api-utils/message";
import { httpApiDefinition } from "@/providers/sourceFileManager/api-utils/http";
import { MetadataBuilderAction } from '@/utils/metadata/metadataBuilder';
import { globalStateApiDefinition } from '@/providers/sourceFileManager/api-utils/globalState';
import { formApiDefinition } from '@/providers/sourceFileManager/api-utils/form';

export const SheshaConstants = {
  http: "shesha:http",
  message: "shesha:message",
  moment: "shesha:moment",
  globalState: "shesha:globalState",
  setGlobalState: "shesha:setGlobalState",
  selectedRow: "shesha:selectedRow",
  contexts: "shesha:contexts",
  formContext: "shesha:formContext",
  form: "shesha:form",
  formMode: "shesha:formMode",
};

export const registerHttpAction: MetadataBuilderAction = (builder) => {
  builder.addCustom("http", "axios instance used to make http requests", () => {
    const definition: TypeDefinition = {
      typeName: 'HttpClientApi',
      files: [{ content: httpApiDefinition, fileName: 'apis/http.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerMessageAction: MetadataBuilderAction = (builder) => {
  builder.addCustom("message", "API for displaying toast messages", () => {
    const definition: TypeDefinition = {
      typeName: 'MessageApi',
      files: [{ content: messageApiDefinition, fileName: 'apis/message.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerMomentAction: MetadataBuilderAction = (builder) => {
  builder.addCustom("moment", "The moment.js object", () => {
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
  });
};

export const registerGlobalStateAction: MetadataBuilderAction = (builder) => {
  builder.addCustom("globalState", "The global state of the application", () => {
    const definition: TypeDefinition = {
      typeName: 'GlobalStateType',
      files: [{ content: globalStateApiDefinition, fileName: 'apis/globalState.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerSetGlobalStateAction: MetadataBuilderAction = (builder) => {
  builder.addCustom("setGlobalState", "Setting the global state of the application", () => {
    const definition: TypeDefinition = {
      typeName: 'SetGlobalStateType',
      files: [{ content: globalStateApiDefinition, fileName: 'apis/globalState.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerSelectedRowAction: MetadataBuilderAction = (builder) => {
  builder.addCustom("selectedRow", "Selected row of nearest table (null if not available)", () => {
    const definition: TypeDefinition = {
      typeName: 'any',
      files: [],
    };
    return Promise.resolve(definition);
  });
};

export const registerContextsAction: MetadataBuilderAction = (builder) => {
  builder.addCustom("contexts", "Contexts data", () => {
    const definition: TypeDefinition = {
      typeName: 'any',
      files: [],
    };
    return Promise.resolve(definition);
  });
};

export const registerFormContextAction: MetadataBuilderAction = (builder) => {
  builder.addCustom("formContext", "Contexts data of current form", () => {
    const definition: TypeDefinition = {
      typeName: 'any',
      files: [],
    };
    return Promise.resolve(definition);
  });
};

export const registerFormAction: MetadataBuilderAction = (builder) => {
  builder.addCustom("form", "Form instance API", () => {
    const definition: TypeDefinition = {
      typeName: 'FormApi',
      files: [{ content: formApiDefinition, fileName: 'apis/form.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerFormModeAction: MetadataBuilderAction = (builder) => {
  builder.addCustom("formMode", "The form mode", () => {
    const definition: TypeDefinition = {
      typeName: 'FormMode',
      files: [{ content: formApiDefinition, fileName: 'apis/form.ts' }],
    };
    return Promise.resolve(definition);
  });
};