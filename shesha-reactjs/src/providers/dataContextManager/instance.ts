import { ConfigurableFormInstance } from "../form/contexts";
import { DataContextTopLevels, RootContexts } from "./index";
import { DataContextType, IDataContextFull } from "../dataContextProvider/contexts";
import { IRegisterDataContextPayload, IDataContextDescriptor, IDataContextDictionary, IDataContextManagerFullInstance, SHESHA_ROOT_DATA_CONTEXT_MANAGER, IDataContextsData } from "./models";
import { isDefined } from "@/utils/nullables";
import { isEqual } from "lodash";

export class DataContextManagerInstance implements IDataContextManagerFullInstance {
  id: string;

  lastUpdate: number;

  parent?: IDataContextManagerFullInstance | undefined;

  private contexts: IDataContextDictionary;

  private managers: IDataContextManagerFullInstance[];

  formInstance?: ConfigurableFormInstance | undefined;

  private forceUpdate?: ((data?: unknown) => void) | undefined;

  constructor(id: string, parent?: IDataContextManagerFullInstance) {
    this.id = id;
    this.lastUpdate = Date.now();
    this.parent = parent;

    this.contexts = {};
    this.managers = [];
    this.formInstance = undefined;
  }

  updateForceUpdate = (forceUpdate: ((data?: unknown) => void) | undefined): void => {
    this.forceUpdate = forceUpdate;
  };

  onChangeContextData = (data?: unknown): void => {
    this.forceUpdate?.(data);

    // ToDo: AS - check if we need to update parent DataContextManager
    // parent?.onChangeContextData();
    this.managers.forEach((x) => x.onChangeContextData(data));
  };

  updatePageFormInstance = (form: ConfigurableFormInstance): void => {
    this.formInstance = form;
    this.forceUpdate?.();
  };

  getPageFormInstance = (): ConfigurableFormInstance | undefined => {
    return this.formInstance;
  };

  registerDataManagerOnce = (payload: IDataContextManagerFullInstance): void => {
    if (!this.managers.find((x) => x.id === payload.id)) {
      this.managers.push(payload);
      // this.forceUpdate?.();
    }
  };

  unregisterDataManager = (payload: IDataContextManagerFullInstance): void => {
    const manager = this.managers.find((x) => x.id === payload.id);
    if (manager) {
      this.managers.splice(this.managers.indexOf(manager), 1);
      this.forceUpdate?.(`Unregister DataManager ${payload.id}`);
    }
  };

  registerDataContextOnce = (payload: IRegisterDataContextPayload): void => {
    if (!this.contexts[payload.id]) {
      const ctx = { ...payload };
      delete ctx.initialData;
      this.contexts[payload.id] = { ...ctx };
      // this.forceUpdate?.();

      if (payload.type === DataContextTopLevels.Root)
        RootContexts.push(payload.id);
    }
  };

  unregisterDataContext = (payload: IRegisterDataContextPayload): void => {
    if (!!this.contexts[payload.id])
      delete this.contexts[payload.id];

    this.forceUpdate?.(`Unregister DataContext ${payload.id}: ${payload.name}`);

    if (payload.type === DataContextTopLevels.Root) {
      const idx = RootContexts.indexOf(payload.id);
      if (idx !== -1)
        RootContexts.splice(idx, 1);
    }
  };

  getLocalDataContexts = (topId?: string): IDataContextDescriptor[] => {
    const ctxs: IDataContextDescriptor[] = [];

    const dataContexts: IDataContextDescriptor[] = [];
    for (let key in this.contexts)
      if (Object.hasOwn(this.contexts, key))
        dataContexts.push(this.contexts[key] as IDataContextDescriptor);

    if (!topId)
      return dataContexts.filter((x) => x.type === DataContextTopLevels.Root);

    if (topId === DataContextTopLevels.All)
      return [...dataContexts];

    if (topId === DataContextTopLevels.Full) {
      const res = [...dataContexts];
      this.managers.forEach((manager) => {
        manager.getLocalDataContexts(DataContextTopLevels.Full).forEach((x) => res.push(x));
      });
      return res;
    }

    let c = dataContexts.find((x) => x.uid === topId || x.id === topId);
    while (isDefined(c)) {
      ctxs.push(c);
      const { parentUid } = c;
      c = dataContexts.find((x) => x.uid === parentUid);
      if (c && c.uid === c.parentUid) {
        console.error(`The hierarchy of this.contexts is broken, id === parentId: ${c.id} {${c.name}: ${c.description}}`);
        c = undefined;
      }
    }
    return ctxs;
  };

  isRoot = (): boolean => {
    return this.id === SHESHA_ROOT_DATA_CONTEXT_MANAGER || !isDefined(this.parent);
  };

  getRoot = (): IDataContextManagerFullInstance | undefined => {
    return this.isRoot()
      ? this
      : isDefined(this.parent)
        ? this.parent.getRoot()
        : undefined;
  };

  getParent = (): IDataContextManagerFullInstance | undefined => {
    return this.parent;
  };

  getDataContexts = (topId?: string): IDataContextDescriptor[] => {
    const ctxs = this.getLocalDataContexts(topId);
    if (this.isRoot())
      return ctxs;
    return ctxs.concat(this.parent?.getDataContexts(DataContextTopLevels.All) ?? []);
  };

  getNearestDataContext = (topId: string, type: DataContextType): IDataContextDescriptor | undefined => {
    const dataContexts = this.getDataContexts(topId);
    return dataContexts.find((x) => x.type === type);
  };

  getPageContext = (): IDataContextDescriptor | undefined => {
    return this.getNearestDataContext(DataContextTopLevels.All, 'page');
  };

  getDataContext = (contextId: string): IDataContextDescriptor | undefined => {
    if (!contextId)
      return undefined;

    const dc = this.getLocalDataContexts('all').find((x) => x.uid === contextId || x.id === contextId);
    return dc ? dc : this.parent?.getDataContext(contextId);
  };

  getDataContextData = (contextId: string): IDataContextFull | undefined => {
    if (!contextId)
      return undefined;

    return this.getDataContext(contextId)?.getFull();
  };


  getLocalDataContextsData = (topId?: string, data?: IDataContextsData): IDataContextsData => {
    const res: IDataContextsData = data ?? { lastUpdate: this.lastUpdate, refreshContext: this.onChangeContextData };
    this.getDataContexts(topId).forEach((item) => {
      if (res[item.name] === undefined) {
        res[item.name] = item.getFull();
      }
    });

    return res;
  };

  getDataContextsData = (topId?: string, data?: IDataContextsData): IDataContextsData => {
    const res = this.getLocalDataContextsData(topId, data);
    if (this.isRoot())
      return res;
    this.parent?.getDataContextsData('all', res);
    return res;
  };

  onChangeContext = (payload: IDataContextDescriptor): void => {
    const existingContext = this.contexts[payload.id];
    if (isDefined(existingContext)) {
      const newCtx: IDataContextDescriptor = {
        ...payload,
        metadata: payload.metadata ?? existingContext.metadata,
      };
      const changed = !isEqual(existingContext, newCtx);
      if (changed) {
        this.contexts[payload.id] = newCtx;
      }
    }
  };
};
