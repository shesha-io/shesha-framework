import { FormIdentifier } from "@/interfaces";
import { IShowModalActionArguments } from "../configurable-actions/dialog-arguments";
import { IKeyValue } from "@/interfaces/keyValue";
import { ButtonGroupItemProps } from "@/providers/buttonGroupConfigurator";
import { ModalFooterButtons } from "../models";
import { extractJsFieldFromKeyValue } from "@/designer-components/_common-migrations/keyValueUtils";

export interface IShowModalActionArgumentsV0 {
  modalTitle: string;
  formId: FormIdentifier;
  formMode?: 'edit' | 'readonly';
  additionalProperties?: IKeyValue[];
  modalWidth?: number | string;
  customWidth?: number;
  widthUnits?: '%' | 'px';
  buttons?: ButtonGroupItemProps[];
  footerButtons?: ModalFooterButtons;
  showModalFooter?: boolean;
  /**
   * What http verb to use when submitting the form. Used in conjunction with `showModalFooter`
   */
  submitHttpVerb?: 'POST' | 'PUT';
}

const makeEvaluatorFromItems = (items: IKeyValue[]): string => {
  if (!items)
    return undefined;

  let propsList = "    return {\r\n";
  items.forEach((item) => {
    if (item.key) {
      const value = extractJsFieldFromKeyValue(item.value?.trim());
      const currentPropLine = `        ${item.key}: ${value},\r\n`;
      propsList += currentPropLine;
    }
  });

  propsList += "    };";

  return propsList;
};

export const migrateToV0 = (prev: IShowModalActionArgumentsV0): IShowModalActionArguments => {
  const { modalWidth, formMode, additionalProperties, submitHttpVerb, ...restProps } = prev;
  return {
    ...restProps,
    modalWidth: modalWidth || "60%",
    formMode: formMode || "edit",
    formArguments: makeEvaluatorFromItems(additionalProperties),
  };
};
