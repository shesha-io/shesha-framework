import { ICodeTreeLevel } from "@/components/codeEditor/utils";
import { IModelMetadata, IPropertyMetadata, isEntityReferencePropertyMetadata } from "@/interfaces/metadata";
import { IDataContextDescriptor } from "@/providers/dataContextManager/models";
import { IMetadataDispatcherFullinstance } from "@/providers/metadataDispatcher/contexts";
import { toCamelCase } from "@/utils/string";

export const getFormDataMetadata = (dispatcher: IMetadataDispatcherFullinstance, metadata: Promise<IModelMetadata>) => {
    if (!Boolean(metadata)) return null;

    const propsToLevel = (properties: IPropertyMetadata[]): ICodeTreeLevel => {
      const result: ICodeTreeLevel = {};
      if (properties && Array.isArray(properties))
        properties.forEach((p) => {
          const path = toCamelCase(p.path);
          result[path] = {
              value: path,
              caption: p.label,
              loaded: true,
          };
          if (isEntityReferencePropertyMetadata(p) && !!p.entityType && dispatcher) {
            result[path].loaded = false;
            result[path].childRefresh = (resolve: (data: ICodeTreeLevel) => void) => {
              dispatcher.getMetadata({ dataType: null, modelType: p.entityType })
                .then(res => {
                  const m = propsToLevel(res.properties);
                  result[path].loaded = true;
                  result[path].childs = m;
                  resolve(m);
                });
            };
          }

          if (p.properties?.length > 0)
              result[path].childs = propsToLevel(p.properties);
        });
      return result;
    };

    const metaTree: ICodeTreeLevel = {
      data: {
        value: 'data',
        caption: 'data',
        loaded: false,
      }
    };

    metadata.then(res => {
      if (!!res) {
        const m = propsToLevel(res.properties);
        metaTree.data.loaded = true;
        metaTree.data.childs = m;
        metaTree.data.caption = res.name;
      }
    });

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

          const fs = p && typeof p === 'object' 
            ? Object.getOwnPropertyNames(p)?.filter((f => {
              return typeof p[f] === 'function';
            }))
            : undefined;

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
      const api = context?.getApi();
      if (!api)
        return undefined;

      const fs = Object.getOwnPropertyNames(api).filter((f => {
        return typeof api[f] === 'function';
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