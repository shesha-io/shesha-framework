import { IComponentApiDescription } from "./model";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import { IConfigurableFormComponent } from "@/providers";

import apiCode from "../../componentsApi/componentApi.ts?raw";
import { useComponentApiProvider } from "./provider";
import { useEffect } from "react";

export interface ComponentApiArgs<TApi extends object> extends Partial<Omit<IComponentApiDescription<TApi>, 'id' | 'componentName' | 'componentModel'>> {
  model: IConfigurableFormComponent;
  typeName: string;
}

export const useComponentApi = <TApi extends object>(args: ComponentApiArgs<TApi>, dependencies?: unknown[]): void => {
  const componentApi = useComponentApiProvider();
  useEffect(() => {
    componentApi?.updateApi<TApi>({
      id: args.model.id,
      componentName: args.model.componentName ?? "",
      level: args.level ?? 3,
      typeDefinition: args.typeDefinition ?? { typeName: args.typeName, files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
      api: args.api,
      properties: args.properties,
    });
  // accurate manage dependencies
  // args.typeDefinition is not a dependency because should be configured only once per component
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.level, args.model.componentName, args.model.id, args.typeName, componentApi, ...(dependencies ?? [])]);
  useEffectOnce(() => () => componentApi?.removeApi(args.model.id));
};
