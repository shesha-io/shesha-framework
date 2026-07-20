import { ITableRowData } from "@/providers/dataTable/interfaces";
import { isNullOrWhiteSpace } from "@/utils/nullables";
import { DisplayValueFunc, ISelectOption, KayValueFunc, OutcomeValueFunc } from "./models";
import React from "react";
import DOMPurify from 'dompurify';

export const rowToOption = (row: ITableRowData,
  outcomeValueFunc: OutcomeValueFunc,
  keyValueFunc: KayValueFunc,
  displayValueFunc: DisplayValueFunc,
  index: React.Key): ISelectOption => {
  const value = outcomeValueFunc(row);
  const key = keyValueFunc(value);
  const rawLabel = displayValueFunc(row);
  const label = isNullOrWhiteSpace(rawLabel) || typeof rawLabel === 'object'
    ? ''
    : String(rawLabel);

  return {
    value: String(key),
    key: index,
    label: label,
    data: row,
    labelRender: () => <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(label) }} />,
  } satisfies ISelectOption;
};
