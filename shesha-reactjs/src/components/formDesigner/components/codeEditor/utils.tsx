import { ICodeTreeLevel } from "components/codeEditor/utils";
import { IModelMetadata, IPropertyMetadata } from "interfaces/metadata";
import { IDataContextDescriptor } from "providers/dataContextManager/models";
import { IMetadataDispatcherFullinstance } from "providers/metadataDispatcher/contexts";
import { toCamelCase } from "utils/string";

export const getFormDataMetadata = (dispatcher: IMetadataDispatcherFullinstance, metadata: IModelMetadata) => {
    if (!Boolean(metadata)) return null;

    const propsToLevel = (disp: IMetadataDispatcherFullinstance, properties: IPropertyMetadata[]): ICodeTreeLevel => {
      const result: ICodeTreeLevel = {};
      properties?.forEach((p) => {
        const path = toCamelCase(p.path);
        result[path] = {
            value: path,
            caption: p.label,
            loaded: true,
        };
        if (p.dataType === 'entity' && !!p.entityType && dispatcher) {
          result[path].loaded = false;
          result[path].childRefresh = (resolve: (data: ICodeTreeLevel) => void) => {
            dispatcher.getMetadata({modelType: p.entityType})
              .then(res => {
                const m = propsToLevel(disp, res.properties);
                result[path].loaded = true;
                result[path].childs = m;
                resolve(m);
              });
          };
        }

        if (p.properties?.length > 0)
            result[path].childs = propsToLevel(disp, p.properties);
      });
      return result;
    };

    const metaTree: ICodeTreeLevel = {
      data: {
        value: 'data',
        caption: metadata.name,
        loaded: true,
        childs: propsToLevel(dispatcher, metadata.properties),
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
          const p = obj[key];

          let childs = p && typeof p === 'object'
            ? propsToLevel(p)
            : undefined;

          const fs = Object.getOwnPropertyNames(p).filter((f => {
            return typeof p[f] === 'function';
          }));

          if (fs?.length > 0) {
            const funcs: ICodeTreeLevel = {};
            fs.forEach(f => {
              funcs[f] = {
                value: f,
                caption: f,
                loaded: true
              };
            });
            childs = childs ? {...childs, ...funcs} : {...funcs};
          }

          result[key] = {
            value: key,
            caption: key,
            loaded: true,
            childs
          };
        }
      return result;
    };

    const funcToLevel = (): ICodeTreeLevel => {
      const result: ICodeTreeLevel = {};
      result.setFieldValue = {
        value: 'setFieldValue',
        caption: 'setFieldValue',
        loaded: true,
      };
      return result;
    };

    const apiToLevel = (context: IDataContextDescriptor): ICodeTreeLevel => {
      if (!context.api)
        return undefined;

      const fs = Object.getOwnPropertyNames(context.api).filter((f => {
        return typeof context.api[f] === 'function';
      }));

      let childs: ICodeTreeLevel = undefined;
      if (fs?.length > 0) {
        childs = {};
        fs.forEach(f => {
          childs[f] = {
            value: f,
            caption: f,
            loaded: true
          };
        });
      }

      const result: ICodeTreeLevel = {};
      result.api = {
        value: 'api',
        caption: 'Context API',
        loaded: true,
        childs
      };
      return result;
    };

    const ctxToLevel = (contexts: IDataContextDescriptor[]): ICodeTreeLevel => {
      const result: ICodeTreeLevel = {};
      contexts.forEach((item) => 
          result[item.name] = {
            value: item.name,
            caption: item.description,
            loaded: true,
            childs: {...propsToLevel(item.getData()), ...funcToLevel(), ...apiToLevel(item)}
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