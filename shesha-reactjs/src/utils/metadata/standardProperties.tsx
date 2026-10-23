import { TypeDefinition } from '@/interfaces/metadata';
import { MetadataBuilderAction } from '@/utils/metadata/metadataBuilder';
import { metadataSourceCode, metadataBuilderSourceCode, CODE, queryStringCode, pageCode, storageCode } from '@/publicJsApis/apis';

export const SheshaConstants = {
  user: "shesha:user",
  actions: "shesha:actions",
  utils: "shesha:utils",
  http: "shesha:http",
  message: "shesha:message",
  loader: "shesha:loader",
  modal: "shesha:modal",
  fileSaver: "shesha:fileSaver",
  moment: "shesha:moment",
  globalState: "shesha:globalState",
  setGlobalState: "shesha:setGlobalState",
  selectedRow: "shesha:selectedRow",
  contexts: "shesha:contexts",
  components: "shesha:components",
  page: "shesha:page",
  pageContext: "shesha:pageContext",
  form: "shesha:form",
  formData: "shesha:formData",
  application: "shesha:application",
  query: "shesha:query",
  metadataBuilder: "shesha:metadataBuilder",
  constantsBuilder: "shesha:constantsBuilder",
  webStorage: "shesha:webStorage",
};

export const registerPageAction: MetadataBuilderAction = (builder, name = "page") => {
  builder.addCustom(name, "Api of current page", () => {
    const definition: TypeDefinition = {
      typeName: 'PageApi',
      files: [{ content: pageCode, fileName: 'apis/page.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerWebStorageAction: MetadataBuilderAction = (builder, name = "storage") => {
  builder.addCustom(name, "Api of Storage data", () => {
    const definition: TypeDefinition = {
      typeName: 'Storage',
      files: [{ content: storageCode, fileName: 'apis/storageApi.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerQueryAction: MetadataBuilderAction = (builder, name = "query") => {
  builder.addCustom(name, "Query string values", () => {
    const definition: TypeDefinition = {
      typeName: 'ParsedQs',
      files: [{ content: queryStringCode, fileName: 'apis/queryString.ts' }],
    };
    return Promise.resolve(definition);
  });
};

export const registerMetadataBuilderAction: MetadataBuilderAction = (builder, name = "metadataBuilder") => {
  builder.addCustom(name, "Metadata builder", () => {
    const definition: TypeDefinition = {
      typeName: 'IMetadataBuilder',
      files: [
        { content: metadataBuilderSourceCode, fileName: CODE.METADATA_BUILDER_PATH },
        { content: metadataSourceCode, fileName: CODE.METADATA_PATH },
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
        { content: metadataSourceCode, fileName: 'apis/metadata.d.ts' },
      ],
    };
    return Promise.resolve(definition);
  });
};
