import { FormIdentifier } from "@/interfaces";
import { IShowModalActionArguments } from "../configurable-actions/dialog-arguments";
import { IKeyValue } from "@/interfaces/keyValue";
import { ButtonGroupItemProps } from "@/providers/buttonGroupConfigurator";
import { ModalFooterButtons } from "../models";
import { extractJsFieldFromKeyValue } from "@/designer-components/_common-migrations/keyValueUtils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";

export interface IShowModalActionArgumentsV0 {
  modalTitle: string;
  formId: FormIdentifier | undefined;
  formMode?: 'edit' | 'readonly' | undefined;
  additionalProperties?: IKeyValue[] | undefined;
  modalWidth?: number | string | undefined;
  customWidth?: number | undefined;
  widthUnits?: '%' | 'px' | undefined;
  buttons?: ButtonGroupItemProps[] | undefined;
  footerButtons?: ModalFooterButtons | undefined;
  showModalFooter?: boolean | undefined;
  /**
   * What http verb to use when submitting the form. Used in conjunction with `showModalFooter`
   */
  submitHttpVerb?: 'POST' | 'PUT' | undefined;
}

const makeEvaluatorFromItems = (items: IKeyValue[]): string => {
  let propsList = "    return {\r\n";
  items.forEach((item) => {
    if (item.key) {
      const value = extractJsFieldFromKeyValue(!isNullOrWhiteSpace(item.value) ? item.value.trim() : "");
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
    formArguments: isDefined(additionalProperties) ? makeEvaluatorFromItems(additionalProperties) : undefined,
  };
};
