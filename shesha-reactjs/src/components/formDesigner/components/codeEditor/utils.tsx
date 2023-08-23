import { ICodeTreeLevel } from "components/codeEditor/utils";
import { IModelMetadata, IPropertyMetadata } from "interfaces/metadata";
import { IDataContextDescriptor } from "providers/dataContextManager/models";

export const getFormDataMetadata = (metadata: IModelMetadata) => {
    if (!Boolean(metadata)) return null;

    const propsToLevel = (properties: IPropertyMetadata[]): ICodeTreeLevel => {
      const result: ICodeTreeLevel = {};
      properties?.forEach((p) => {
        result[p.path] = {
            value: p.path,
            caption: p.label,
            loaded: true,
        };
        if (p.properties?.length > 0)
            result[p.path].childs = propsToLevel(p.properties);
      });
      return result;
    };

    const metaTree: ICodeTreeLevel = {
      data: {
        value: 'data',
        caption: metadata.name,
        loaded: true,
        childs: propsToLevel(metadata.properties),
      },
    };
    return metaTree;
};

export const getContextMetadata = (ctx: IDataContextDescriptor[]) => {
    if (!Boolean(ctx)) return null;

    const propsToLevel = (obj: any): ICodeTreeLevel => {
      const result: ICodeTreeLevel = {};
      for (let key in obj) 
        if (Object.hasOwn(obj, key)) {
          result[key] = {
            value: key,
            caption: key,
            loaded: true,
            childs: obj[key] && typeof obj[key] === 'object'
              ? propsToLevel(obj[key])
              : undefined
          };
        }
      return result;
    };

    const ctxToLevel = (contexts: IDataContextDescriptor[]): ICodeTreeLevel => {
      const result: ICodeTreeLevel = {};
      contexts.forEach((item) => 
          result[item.name] = {
            value: item.name,
            caption: item.description,
            loaded: true,
            childs: {...propsToLevel(item.getData())}
          }
      );
      return result;
    };

    const ctxTree: ICodeTreeLevel = {
      contexts: {
        value: 'contexts',
        caption: 'Context manager',
        loaded: true,
        childs: ctxToLevel(ctx),
      },
    };
    return ctxTree;
};