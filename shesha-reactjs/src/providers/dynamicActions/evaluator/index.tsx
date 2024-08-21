import { ButtonGroupItemProps, IButtonGroupItemBase, IDynamicItem, isDynamicItem, isGroup } from '@/providers/buttonGroupConfigurator/models';
import { useDynamicActionsDispatcher } from '@/providers/index';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE, IDynamicActionsContext } from '../contexts';

export interface IDynamicActionsEvaluatorProps {
    items: ButtonGroupItemProps[];
    children: (items: ButtonGroupItemProps[]) => React.ReactElement;
}

const isResolvedDynamicItem = (item: IButtonGroupItemBase): item is IResolvedDynamicItem => {
    if (!isDynamicItem(item))
        return false;
    const typed = item as IResolvedDynamicItem;
    return typeof (typed.isResolved) === 'boolean' && Array.isArray(typed.resolvedItems);
};

const getItemsWithResolved = (items: ButtonGroupItemProps[]): ButtonGroupItemProps[] => {
    const result: ButtonGroupItemProps[] = [];

    items.forEach(item => {
        if (isDynamicItem(item)) {
            if (isResolvedDynamicItem(item) && item.isResolved)
                result.push(...item.resolvedItems);
        } else
            if (isGroup(item)) {
                result.push({ ...item, childItems: getItemsWithResolved(item.childItems) });
            } else
                result.push(item);
    });

    return result;
};

const getItemsLevel = (items: ButtonGroupItemProps[], onDynamicItem: (dynamicItem: IResolvedDynamicItem) => void): ButtonGroupItemProps[] => {
    const result = items.map(item => {
        if (isDynamicItem(item)) {
            if (isResolvedDynamicItem(item)) {
                return item;
            } else {
                // TODO: start promise, on success - fill resolvedItems and fire recalculation of main list
                // TODO: return lists of all promises to be able to cancel loading. it can be used for triggering of recalculations
                const dynamicItem: IResolvedDynamicItem = {
                    ...item,
                    isResolved: false,
                    resolvedItems: [],
                };
                onDynamicItem(dynamicItem);
                return dynamicItem;
            }
        } else
            if (isGroup(item)) {
                return { ...item, childItems: item.childItems ? getItemsLevel(item.childItems, onDynamicItem) : null };
            } else
                return item;
    });

    return result;
};

interface SingleDynamicItemEvaluatorProps {
    item: IResolvedDynamicItem;
    onEvaluated: (response: ButtonGroupItemProps[]) => void;
}

const EMPTY_ITEMS = [];
const DEFAULT_DYNAMIC_EVALUATOR: IDynamicActionsContext = {
    ...DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE,
    useEvaluator: () => (EMPTY_ITEMS), // note: it's important to use constant to prevent infinite re-calculation ([] !== [])
};

/**
 * Pseudo-component with no UI, is used as a proxy for evaluation of the dynamic items
 */
const SingleDynamicItemEvaluator: FC<SingleDynamicItemEvaluatorProps> = ({ item, onEvaluated }) => {
    const dispatcher = useDynamicActionsDispatcher();

    const { providerUid } = item?.dynamicItemsConfiguration ?? {};
    const providers = dispatcher.getProviders();
    const provider = providerUid
        ? providers[providerUid]
        : undefined;
    const actionsContext = provider 
        ? provider.contextValue 
        : DEFAULT_DYNAMIC_EVALUATOR;

    // call a hook
    const evaluatedItems = actionsContext.useEvaluator({
        item,
        settings: item?.dynamicItemsConfiguration?.settings
    });

    useEffect(() => {
        item.resolvedItems = evaluatedItems;
        item.isResolved = true;
        onEvaluated(evaluatedItems);
    }, [evaluatedItems]);

    return null;
};

interface IResolvedDynamicItem extends IDynamicItem {
    isResolved: boolean;
    resolvedItems: ButtonGroupItemProps[];
}

interface DynamicItemsEvaluationStore {
    dynamicItems: IResolvedDynamicItem[];
    items: ButtonGroupItemProps[];
}
export const DynamicActionsEvaluator: FC<IDynamicActionsEvaluatorProps> = ({ items, children }) => {
    const [numResolved, setNumResolved] = useState(0);

    const evaluation = useMemo<DynamicItemsEvaluationStore>(() => {
        const dynamicItems: IResolvedDynamicItem[] = [];
        const preparedItems = getItemsLevel(items,
            (dynamicItem) => {
                dynamicItems.push(dynamicItem);
            }
        );
        return {
            dynamicItems,
            items: preparedItems,
        };
    }, [items]);

    // build a resulting tree that includes all resolved items but excludes non resolved ones
    const finalItems = useMemo(() => {
        return getItemsWithResolved(evaluation.items);
    }, [evaluation.items, numResolved]);


    const onDynamicItemEvaluated = () => {
        setNumResolved(prev => prev + 1);
    };

    return (
        <>
            {evaluation.dynamicItems.map(item => (<SingleDynamicItemEvaluator item={item} onEvaluated={onDynamicItemEvaluated} key={item.id} />))}
            {children(finalItems)}
        </>
    );
};