import { FormIdentifier } from "@/interfaces";
import { IShowModalActionArguments } from "../configurable-actions/show-dialog-arguments";
import { IKeyValue } from "@/interfaces/keyValue";
import { ButtonGroupItemProps } from "@/providers/buttonGroupConfigurator";
import { ModalFooterButtons } from "../models";

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

interface DotNotation {
    owner: string;
    restPath: string;
}

const unquoteMustache = (value: string, quoteNumber: number): string | undefined => {
    const regex = new RegExp(`^{{${quoteNumber}}([^{]+[^}]+)}{${quoteNumber}}$`);
    const match = value?.match(regex);
    return match && match.length === 2
        ? match[1]
        : undefined;
};

const extractMustache = (value: string): string | undefined => unquoteMustache(value, 2) ?? unquoteMustache(value, 3);

const splitDotNotation = (value: string): DotNotation | undefined => {
    const firstDot = value.indexOf('.');
    return firstDot > -1
        ? { owner: value.substring(0, firstDot), restPath: value.substring(firstDot + 1) }
        : undefined;
};

const knownOwners = ['data', 'selectedRow', 'form'];
const valuesToUnwrap = ['true', 'false'];
const extractValue = (value: string): string => {
    const mustacheExpression = extractMustache(value);
    if (mustacheExpression) {
        const dotNotation = splitDotNotation(mustacheExpression);
        if (dotNotation) {
            return knownOwners.includes(dotNotation.owner)
                ? `${dotNotation.owner}.${dotNotation.restPath}`
                : `application.utils.evaluateString("${value}")`; // TODO: pass context
        }
    }

    const normalized = value?.toLowerCase();
    return valuesToUnwrap.includes(normalized)
        ? normalized
        : `"${value}"`;
};
const makeEvaluatorFromItems = (items: IKeyValue[]): string => {
    if (!items)
        return undefined;

    let propsList = "    return {\r\n";
    items.forEach(item => {
        if (item.key) {
            const value = extractValue(item.value?.trim());
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
        modalWidth: modalWidth || "40%",
        formMode: formMode || "edit",
        formArguments: makeEvaluatorFromItems(additionalProperties),
    };
};