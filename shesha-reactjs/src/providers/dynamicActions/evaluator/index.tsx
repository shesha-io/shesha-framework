import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import React, { FC, useMemo, useState } from 'react';
import { getDynamicActionsItemsLevel, getItemsWithResolved, IDynamicItemsEvaluationStore, IResolvedDynamicItem } from './utils';
import { getDynamicItemKey, SingleDynamicItemEvaluator } from './singleDynamicItemEvaluator';

export interface IDynamicActionsEvaluatorProps {
  items: ButtonGroupItemProps[];
  children: (items: ButtonGroupItemProps[]) => React.ReactElement;
}

export const DynamicActionsEvaluator: FC<IDynamicActionsEvaluatorProps> = ({ items, children }) => {
  const evaluation = useMemo<IDynamicItemsEvaluationStore>(() => {
    const dynamicItems: IResolvedDynamicItem[] = [];
    const preparedItems = getDynamicActionsItemsLevel(items,
      (dynamicItem) => {
        dynamicItems.push(dynamicItem);
      },
    );

    return {
      dynamicItems,
      items: preparedItems,
    };
  }, [items]);

  const [evaluatedItems, setEvaluatedItems] = useState<ButtonGroupItemProps[]>(evaluation.items);

  // build a resulting tree that includes all resolved items but excludes non resolved ones
  const finalItems = useMemo(() => {
    return getItemsWithResolved(evaluatedItems);
  }, [evaluatedItems]);


  const onDynamicItemEvaluated = (): void => {
    // trigger recalculation of finalItems manually
    setEvaluatedItems([...evaluation.items]);
  };

  return (
    <>
      {evaluation.dynamicItems.map((item) => (<SingleDynamicItemEvaluator item={item} onEvaluated={onDynamicItemEvaluated} key={getDynamicItemKey(item)} />))}
      {children(finalItems)}
    </>
  );
};
