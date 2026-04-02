import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { useDynamicActionsDispatcher } from '@/providers/index';
import { FC, useEffect } from 'react';
import { IDynamicActionsContext } from '../contexts';
import { IResolvedDynamicItem } from './utils';

interface SingleDynamicItemEvaluatorProps {
  item: IResolvedDynamicItem;
  onEvaluated: (response: ButtonGroupItemProps[]) => void;
}

const EMPTY_ITEMS: ButtonGroupItemProps[] = [];
const DEFAULT_DYNAMIC_EVALUATOR: IDynamicActionsContext = {
  id: "unknown",
  name: "unknown",
  hasArguments: false,
  useEvaluator: () => EMPTY_ITEMS, // note: it's important to use constant to prevent infinite re-calculation ([] !== [])
};

export const getDynamicItemKey = (item: IResolvedDynamicItem): string => {
  const { providerUid } = item.dynamicItemsConfiguration ?? {};
  return `${item.id}:${providerUid}`;
};

/**
 * Pseudo-component with no UI, is used as a proxy for evaluation of the dynamic items
 */

export const SingleDynamicItemEvaluator: FC<SingleDynamicItemEvaluatorProps> = ({ item, onEvaluated }) => {
  const dispatcher = useDynamicActionsDispatcher();

  const { providerUid, settings } = item.dynamicItemsConfiguration ?? {};
  const providers = dispatcher.getProviders();
  const provider = providerUid ? providers[providerUid] : undefined;
  const actionsContext = provider ? provider.contextValue : DEFAULT_DYNAMIC_EVALUATOR;

  // call a hook
  const evaluatedItems = actionsContext.useEvaluator({
    item,
    settings: settings,
  });

  useEffect(() => {
    if (item.resolvedItems !== evaluatedItems) {
      item.resolvedItems = evaluatedItems;
      item.isResolved = true;
      onEvaluated(evaluatedItems);
    }
  }, [evaluatedItems, item, item.resolvedItems, onEvaluated]);

  return null;
};
