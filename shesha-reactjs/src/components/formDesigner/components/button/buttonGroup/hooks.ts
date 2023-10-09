import { useDynamicActionsDispatcher } from "index";
import { ButtonGroupItemProps, IButtonGroupItemBase, IDynamicItem, isDynamicItem, isGroup } from "providers/buttonGroupConfigurator/models";
import { IDynamicActionsDispatcherFullInstance } from "providers/dynamicActionsDispatcher/contexts";
import { useMemo, useRef, useState } from "react";


export interface UseButtonItemsArgs {
    items: ButtonGroupItemProps[];
}
export const useButtonItems = ({ items }: UseButtonItemsArgs): ButtonGroupItemProps[] => {
    const dispatcher = useDynamicActionsDispatcher(false);
    if (!dispatcher)
        return items;

    const [numResolved, setNumResolved] = useState(0);

    const promisesRef = useRef<Promise<DynamicNodeResolveResponse>[]>([]);
    const promises = promisesRef.current;

    // build internal tree with promises
    const internalData = useMemo(() => {
        console.log('LOG: calculate internalData', items);
        // todo: use signals to cancell resolving
        promisesRef.current = [];

        return getItemsLevel(items,
            (promise) => {
                promises.push(promise);
                promise.then((response) => {
                    console.log('LOG: promise resolved', response);

                    setNumResolved(prev => prev + 1);
                });
            },
            dispatcher
        );
    }, [items, items.length]);

    // build a resulting tree that includes all resolved items but excludes non resolved ones
    const result = useMemo(() => {
        console.log('LOG: calculate result', { items, internalData, numResolved });
        return getItemsWithResolved(internalData);
    }, [internalData, numResolved]);

    return result;
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

interface DynamicNodeResolveResponse {

}
const getItemsLevel = (items: ButtonGroupItemProps[], onPromiseCreated: (promise: Promise<DynamicNodeResolveResponse>) => void, /*allPromises: Promise<DynamicNodeResolveResponse>[],*/ dispatcher: IDynamicActionsDispatcherFullInstance): ButtonGroupItemProps[] => {
    const result = items.map(item => {
        if (isDynamicItem(item)) {
            if (isResolvedDynamicItem(item)) {
                return item;
            } else {
                // todo: start promise, on success - fill resolvedItems and fire recalculation of main list
                // todo: return lists of all promises to be able to cancel loading. it can be used for triggering of recalculations
                const dynamicItem: IResolvedDynamicItem = {
                    ...item,
                    isResolved: false,
                    resolvedItems: [],
                };
                if (item.dynamicItemsConfiguration?.providerUid) {
                    const providers = dispatcher.getProviders();
                    const provider = providers[item.dynamicItemsConfiguration.providerUid]?.contextValue;
                    if (provider) {
                        // todo: fetch items and add a promise to the list
                        const promise = new Promise<DynamicNodeResolveResponse>((resolve, _reject) => {
                            provider.evaluator(/* pass settings and context */).then(items => {
                                // call provider!
                                dynamicItem.resolvedItems = items;
                                dynamicItem.isResolved = true;
                                resolve({});
                            });
                        });
                        onPromiseCreated(promise);
                    }
                }

                return dynamicItem;
            }
        } else
            if (isGroup(item)) {
                return { ...item, childItems: item.childItems ? getItemsLevel(item.childItems, onPromiseCreated, dispatcher) : null };
            } else
                return item;
    });

    return result;
};

interface IResolvedDynamicItem extends IDynamicItem {
    isResolved: boolean;
    resolvedItems: ButtonGroupItemProps[];
}

const isResolvedDynamicItem = (item: IButtonGroupItemBase): item is IResolvedDynamicItem => {
    if (!isDynamicItem(item))
        return false;
    const typed = item as IResolvedDynamicItem;
    return typeof (typed.isResolved) === 'boolean' && Array.isArray(typed.resolvedItems);
};
