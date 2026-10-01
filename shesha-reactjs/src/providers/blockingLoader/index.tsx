import { FC, PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { BlockingLoaderInstance, BlockingLoaderLevel, IBlockingLoader } from './instance';
import { isDefined } from '@/utils';
import { BlockingLoaderOverlay } from './loaderOverlay';
import { useConfigurableAction } from '../configurableActionsDispatcher';

const noOpsInstance: IBlockingLoader = {
  loaders: [],
  getActiveLoader: () => undefined,
  showLoader: () => ({
    updateMessage: () => { /* no-op */ },
    block: () => { /* no-op */ },
    unblock: () => { /* no-op */ },
    close: () => { /* no-op */ },
  }),
  hideLoaders: () => { /* no-op */ },
};

const BlockingLoaderContext = createContext<IBlockingLoader>(noOpsInstance);
const FormLoaderContext = createContext<IBlockingLoader>(noOpsInstance);
const ComponentLoaderContext = createContext<IBlockingLoader>(noOpsInstance);

export const useBlockingLoader = (level: BlockingLoaderLevel): IBlockingLoader => {
  const context = useContext(level === 'page'
    ? BlockingLoaderContext
    : level === 'form'
      ? FormLoaderContext
      : ComponentLoaderContext);
  return context;
};

export interface BlockingLoaderProviderProps {
  level: BlockingLoaderLevel;
}

export const useBlockingLoaderActions = (level: BlockingLoaderLevel, owner: string, ownerUid: string): void => {
  const instance = useBlockingLoader(level);

  useConfigurableAction({
    name: `Show loader`,
    description: `Show loader`,
    owner: owner,
    ownerUid: ownerUid,
    hasArguments: true,
    argumentsFormMarkup: ({ fbf }) => fbf('root')
      .addSettingsInput({ inputType: 'textField', propertyName: 'message', label: 'Message', validate: { required: true } })
      .addSettingsInput({ inputType: 'switch', propertyName: 'block', label: 'Block' })
      .toJson(),
    executer: (arg: { message: string; block?: boolean | undefined }) => {
      instance.showLoader(arg.message, arg.block ?? false);
      return Promise.resolve();
    },
  });

  useConfigurableAction({
    name: `Hide all loaders`,
    description: `Hide all loaders`,
    owner: owner,
    ownerUid: ownerUid,
    hasArguments: true,
    executer: () => {
      instance.hideLoaders();
      return Promise.resolve();
    },
  });
};

export const BlockingLoaderProvider: FC<PropsWithChildren<BlockingLoaderProviderProps>> = ({ children, level }) => {
  const [, forceRefresh] = useState({});
  const [instance] = useState<IBlockingLoader>(() => new BlockingLoaderInstance(() => forceRefresh({})));

  const Context = useMemo(() => level === 'page'
    ? BlockingLoaderContext
    : level === 'form'
      ? FormLoaderContext
      : ComponentLoaderContext,
  [level]);

  const loader = instance.getActiveLoader();
  return (
    <div style={{ position: 'relative' }}>
      <Context.Provider value={instance}>
        {children}
        {isDefined(loader) && <BlockingLoaderOverlay message={loader.message} isBlocking={loader.isBlocking} />}
      </Context.Provider>
    </div>
  );
};
