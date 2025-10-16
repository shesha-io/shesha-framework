import { isEntityMetadata } from '@/interfaces/metadata';
import { useMetadata } from '@/providers';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { DynamicItemsEvaluationHook, DynamicRenderingHoc } from '@/providers/dynamicActionsDispatcher/models';
import React, { PropsWithChildren, useMemo, FC } from 'react';

import { DynamicActionsProvider } from '../index';
import { wrapDisplayName } from '@/utils/react';

const ReportTestItems: ButtonGroupItemProps[] = [
  { id: 'r1', name: 'btn1', label: 'report item 1', itemType: 'item', itemSubType: 'button', sortOrder: 0 },
  { id: 'r2', name: 'btn2', label: 'report item 2', itemType: 'item', itemSubType: 'button', sortOrder: 1 },
  { id: 'r3', name: 'btn3', label: 'report item 3', itemType: 'item', itemSubType: 'button', sortOrder: 2 },
];

const useReportingActions: DynamicItemsEvaluationHook = (args) => {
  const { metadata } = useMetadata(false) ?? {};

  const operations = useMemo<ButtonGroupItemProps[]>(() => {
    if (!isEntityMetadata(metadata))
      return [];

    return ReportTestItems;
  }, [args.item, metadata]);

  return operations;
};

const reportingActionsHoc: DynamicRenderingHoc = (WrappedComponent) => {
  return wrapDisplayName((props) => {
    const testItems = useMemo<ButtonGroupItemProps[]>(() => {
      return ReportTestItems;
    }, []);

    return (<WrappedComponent {...props} items={testItems} hocType="report" />);
  }, "reportingActionsHoc");
};

export const ReportingActions: FC<PropsWithChildren> = ({ children }) => {
  return (
    <DynamicActionsProvider
      id="reports"
      name="Reports"
      renderingHoc={reportingActionsHoc}
      useEvaluator={useReportingActions}
    >
      {children}
    </DynamicActionsProvider>
  );
};
